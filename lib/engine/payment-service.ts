// ============================================================================
// GoTurf Payment Service Engine (Phase 6)
// Handles:
// 1. Server-Authoritative Order Creation (Price locked on server).
// 2. Cryptographic HMAC-SHA256 Webhook Signature Verification.
// 3. Webhook Idempotency (raw_event_id deduplication).
// 4. Post-Expiry Late Payment Arbitration (Auto-claim vs Auto-refund).
// 5. Automated Refunds & Cancellation Policy Enforcement.
// ============================================================================

import crypto from 'crypto';
import type { Payment, Refund, Booking } from '@/types/database';
import {
  getAllBookingsForTesting,
  createTemporaryHold,
  expireStaleHolds,
} from '@/lib/engine/booking-service';

export const PLATFORM_FEE_PAISE = 4500; // ₹45 in paise (₹38.14 base + ₹6.86 GST @ 18%)

// In-memory payment ledger
let paymentsList: Payment[] = [];
let refundsList: Refund[] = [];
const processedWebhookEventIds = new Set<string>();

// Mock/Default Webhook secret (Can be overridden by env variable RAZORPAY_WEBHOOK_SECRET)
export const DEFAULT_WEBHOOK_SECRET = 'goturf_live_webhook_secret_mumbai_2026';

export function getWebhookSecret(): string {
  return process.env.RAZORPAY_WEBHOOK_SECRET || DEFAULT_WEBHOOK_SECRET;
}

// ----------------------------------------------------------------------------
// 1. Create Server-Authoritative Payment Order
// ----------------------------------------------------------------------------
export interface CreateOrderParams {
  holdId: string;
  playerId?: string;
}

export interface CreateOrderResult {
  success: boolean;
  order?: {
    orderId: string;
    bookingId: string;
    amountPaise: number;
    currency: string;
    courtPricePaise: number;
    platformFeePaise: number;
    keyId: string;
  };
  error?: string;
  code?: 'HOLD_NOT_FOUND' | 'HOLD_EXPIRED' | 'ALREADY_PAID';
}

export async function createPaymentOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const bookings = getAllBookingsForTesting();
  expireStaleHolds();

  const booking = bookings.find((b) => b.id === params.holdId);
  if (!booking) {
    return { success: false, error: 'Booking hold not found', code: 'HOLD_NOT_FOUND' };
  }

  if (booking.status === 'confirmed') {
    return { success: false, error: 'Booking is already confirmed and paid', code: 'ALREADY_PAID' };
  }

  if (booking.status === 'expired') {
    return { success: false, error: 'Slot hold has expired. Please pick the slot again.', code: 'HOLD_EXPIRED' };
  }

  // Server authoritatively calculates amount: Court price + ₹45 Platform Fee
  const courtPricePaise = booking.price_paise;
  const totalAmountPaise = courtPricePaise + PLATFORM_FEE_PAISE;

  const orderId = `order_rzp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_GoTurfMumbaiKey';

  const now = new Date().toISOString();
  const payment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    booking_id: booking.id,
    provider_order_id: orderId,
    provider_payment_id: null,
    status: 'created',
    amount_paise: totalAmountPaise,
    raw_event_id: null,
    created_at: now,
    updated_at: now,
  };

  paymentsList.push(payment);

  return {
    success: true,
    order: {
      orderId,
      bookingId: booking.id,
      amountPaise: totalAmountPaise,
      currency: 'INR',
      courtPricePaise,
      platformFeePaise: PLATFORM_FEE_PAISE,
      keyId,
    },
  };
}

// ----------------------------------------------------------------------------
// 2. Cryptographic HMAC-SHA256 Signature Verification
// ----------------------------------------------------------------------------
export function verifyRazorpaySignature(
  payloadString: string,
  receivedSignature: string,
  secret = getWebhookSecret()
): boolean {
  if (!receivedSignature || !payloadString) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(receivedSignature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}

// Helper to generate a valid signature (useful for automated testing and test simulator)
export function signWebhookPayload(payloadString: string, secret = getWebhookSecret()): string {
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

// ----------------------------------------------------------------------------
// 3. Process Webhook with Idempotency & Post-Expiry Collision Handling
// ----------------------------------------------------------------------------
export interface RazorpayWebhookPayload {
  entity: string;
  account_id?: string;
  event: string;
  event_id?: string; // Standard raw event ID for idempotency
  contains?: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number; // in paise
        currency: string;
        status: string;
        method?: string;
        email?: string;
        contact?: string;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
  created_at?: number;
}

export interface WebhookProcessResult {
  success: boolean;
  duplicate?: boolean;
  outcome: 'confirmed' | 'late_claimed' | 'auto_refunded' | 'ignored' | 'error';
  bookingId?: string;
  paymentId?: string;
  refundId?: string;
  message: string;
}

export async function processPaymentWebhook(
  webhookBody: RazorpayWebhookPayload,
  eventIdOverride?: string
): Promise<WebhookProcessResult> {
  const eventId = eventIdOverride || webhookBody.event_id || `evt_${webhookBody.payload.payment?.entity.id || Date.now()}`;

  // Idempotency check: Have we processed this webhook event already?
  if (processedWebhookEventIds.has(eventId)) {
    return {
      success: true,
      duplicate: true,
      outcome: 'ignored',
      message: `Event ${eventId} already processed (idempotent duplicate skipped)`,
    };
  }

  // We are interested in successful payment events
  const eventName = webhookBody.event;
  if (eventName !== 'order.paid' && eventName !== 'payment.captured') {
    return {
      success: true,
      outcome: 'ignored',
      message: `Event ${eventName} ignored (only payment.captured / order.paid handled)`,
    };
  }

  const paymentEntity = webhookBody.payload.payment?.entity;
  const orderEntity = webhookBody.payload.order?.entity;
  const orderId = paymentEntity?.order_id || orderEntity?.id;

  if (!orderId) {
    return {
      success: false,
      outcome: 'error',
      message: 'Missing order_id in webhook payload',
    };
  }

  // Locate the internal payment record
  const payment = paymentsList.find((p) => p.provider_order_id === orderId);
  if (!payment) {
    return {
      success: false,
      outcome: 'error',
      message: `No payment record found for order ${orderId}`,
    };
  }

  const bookings = getAllBookingsForTesting();
  const booking = bookings.find((b) => b.id === payment.booking_id);
  if (!booking) {
    return {
      success: false,
      outcome: 'error',
      message: `No booking found for payment ${payment.id}`,
    };
  }

  const now = new Date();
  const providerPaymentId = paymentEntity?.id || `pay_rzp_${Date.now()}`;

  // Check if booking is still in valid 'held' state
  if (booking.status === 'held') {
    // Normal Happy Path: Hold was active
    booking.status = 'confirmed';
    booking.hold_expires_at = null;
    booking.updated_at = now.toISOString();

    payment.status = 'captured';
    payment.provider_payment_id = providerPaymentId;
    payment.raw_event_id = eventId;
    payment.updated_at = now.toISOString();

    processedWebhookEventIds.add(eventId);

    return {
      success: true,
      outcome: 'confirmed',
      bookingId: booking.id,
      paymentId: payment.id,
      message: 'Payment verified and booking confirmed successfully',
    };
  }

  // Late Payment Handling (Payment arrived after hold expired)
  if (booking.status === 'expired') {
    // Check if the slot is still free or if another player claimed it
    const startMs = new Date(booking.start_at).getTime();
    const endMs = new Date(booking.end_at).getTime();

    const isSlotTaken = bookings.some((b) => {
      if (b.id === booking.id) return false;
      if (b.court_id !== booking.court_id) return false;
      if (b.status !== 'confirmed' && b.status !== 'held') return false;

      const bStart = new Date(b.start_at).getTime();
      const bEnd = new Date(b.end_at).getTime();
      return startMs < bEnd && endMs > bStart;
    });

    if (!isSlotTaken) {
      // Scenario A: Slot is still unbooked -> Auto-claim and confirm!
      booking.status = 'confirmed';
      booking.hold_expires_at = null;
      booking.notes = (booking.notes ? `${booking.notes} - ` : '') + 'Late payment accepted: slot claimed';
      booking.updated_at = now.toISOString();

      payment.status = 'captured';
      payment.provider_payment_id = providerPaymentId;
      payment.raw_event_id = eventId;
      payment.updated_at = now.toISOString();

      processedWebhookEventIds.add(eventId);

      return {
        success: true,
        outcome: 'late_claimed',
        bookingId: booking.id,
        paymentId: payment.id,
        message: 'Late payment accepted: slot was still free and successfully claimed',
      };
    } else {
      // Scenario B: Another player took the slot during payment -> AUTO-REFUND!
      payment.status = 'refunded';
      payment.provider_payment_id = providerPaymentId;
      payment.raw_event_id = eventId;
      payment.updated_at = now.toISOString();

      booking.status = 'expired';
      booking.cancel_reason = 'Slot taken by another player before payment completion; full refund initiated';
      booking.updated_at = now.toISOString();

      const refund: Refund = {
        id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        payment_id: payment.id,
        provider_refund_id: `rfnd_rzp_${Date.now()}`,
        amount_paise: payment.amount_paise,
        status: 'processed',
        reason: 'Post-expiry collision: slot was claimed by another player before payment completion',
        created_at: now.toISOString(),
      };
      refundsList.push(refund);

      processedWebhookEventIds.add(eventId);

      return {
        success: true,
        outcome: 'auto_refunded',
        bookingId: booking.id,
        paymentId: payment.id,
        refundId: refund.id,
        message: 'Post-expiry collision detected: Slot was taken; 100% automated refund processed',
      };
    }
  }

  // Already confirmed earlier
  if (booking.status === 'confirmed') {
    processedWebhookEventIds.add(eventId);
    return {
      success: true,
      duplicate: true,
      outcome: 'confirmed',
      message: 'Booking was already confirmed',
    };
  }

  return {
    success: false,
    outcome: 'error',
    message: `Unhandled booking status: ${booking.status}`,
  };
}

// ----------------------------------------------------------------------------
// 4. Booking Cancellation & Refund Execution
// ----------------------------------------------------------------------------
export interface ExecuteRefundParams {
  bookingId: string;
  reason: string;
  adminOverride?: boolean;
}

export function executeBookingRefund(params: ExecuteRefundParams): {
  success: boolean;
  refundEligible: boolean;
  refund?: Refund;
  message: string;
} {
  const bookings = getAllBookingsForTesting();
  const booking = bookings.find((b) => b.id === params.bookingId);

  if (!booking) {
    return { success: false, refundEligible: false, message: 'Booking not found' };
  }

  const now = new Date();
  const matchStart = new Date(booking.start_at);
  const hoursRemaining = (matchStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Eligible if > 24 hours before match, or if admin explicitly overrides
  const refundEligible = hoursRemaining >= 24 || Boolean(params.adminOverride);

  const payment = paymentsList.find((p) => p.booking_id === booking.id && p.status === 'captured');

  if (!refundEligible) {
    booking.status = 'cancelled';
    booking.cancel_reason = params.reason;
    booking.updated_at = now.toISOString();

    return {
      success: true,
      refundEligible: false,
      message: 'Booking cancelled. Inside 24h window, no refund per venue policy.',
    };
  }

  booking.status = 'cancelled';
  booking.cancel_reason = params.reason;
  booking.updated_at = now.toISOString();

  let refundRecord: Refund | undefined;
  if (payment) {
    payment.status = 'refunded';
    payment.updated_at = now.toISOString();

    refundRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      payment_id: payment.id,
      provider_refund_id: `rfnd_rzp_${Date.now()}`,
      amount_paise: payment.amount_paise,
      status: 'processed',
      reason: params.reason,
      created_at: now.toISOString(),
    };
    refundsList.push(refundRecord);
  }

  return {
    success: true,
    refundEligible: true,
    refund: refundRecord,
    message: 'Booking cancelled and 100% refund initiated to source payment method.',
  };
}

// ----------------------------------------------------------------------------
// 5. Test Fixtures & Utilities
// ----------------------------------------------------------------------------
export function getAllPaymentsForTesting(): Payment[] {
  return paymentsList;
}

export function getAllRefundsForTesting(): Refund[] {
  return refundsList;
}

export function resetPaymentsForTesting() {
  paymentsList = [];
  refundsList = [];
  processedWebhookEventIds.clear();
}
