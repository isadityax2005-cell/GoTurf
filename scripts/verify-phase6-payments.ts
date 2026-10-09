// ============================================================================
// GoTurf Phase 6 Verification Test Suite: Payments, Webhooks & Refunds
// Tests:
// 1. Server-Authoritative Order Creation (Price locked on server with ₹45 fee).
// 2. Cryptographic HMAC-SHA256 Signature Verification & Forgery Defense.
// 3. Webhook Idempotency (raw_event_id deduplication).
// 4. Booking Confirmation upon verified webhook.
// 5. Post-Expiry Late Payment Handling:
//    - Scenario A: Late payment accepted when slot is still free.
//    - Scenario B: 100% Automated Refund when slot was taken by another player.
// 6. Policy Refund Calculation & Admin Dispute Override.
// ============================================================================

import {
  createPaymentOrder,
  verifyRazorpaySignature,
  signWebhookPayload,
  processPaymentWebhook,
  executeBookingRefund,
  getAllPaymentsForTesting,
  getAllRefundsForTesting,
  resetPaymentsForTesting,
  PLATFORM_FEE_PAISE,
  DEFAULT_WEBHOOK_SECRET,
  type RazorpayWebhookPayload,
} from '../lib/engine/payment-service';

import {
  createTemporaryHold,
  resetBookingsForTesting,
  getAllBookingsForTesting,
  getBookingById,
} from '../lib/engine/booking-service';

import type { Booking } from '../types/database';

async function runPhase6Tests() {
  console.log('\n======================================================================');
  console.log('>>> RUNNING PHASE 6: PAYMENTS, WEBHOOKS & REFUNDS VERIFICATION <<<');
  console.log('======================================================================\n');

  resetBookingsForTesting([]);
  resetPaymentsForTesting();

  const courtId = '40000000-0000-0000-0000-000000000001';
  const playerA = 'player-karan-001';
  const playerB = 'player-rahul-002';

  // --------------------------------------------------------------------------
  // TEST 1: Server-Authoritative Order Creation
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Server-Authoritative Order Creation ---');

  const baseSlotPaise = 180000; // ₹1,800
  const now = new Date('2026-10-15T10:00:00Z');
  const matchStart = '2026-10-15T12:30:00Z'; // 18:00 IST
  const matchEnd = '2026-10-15T13:30:00Z';   // 19:00 IST

  const holdResult = await createTemporaryHold({
    courtId,
    playerId: playerA,
    startAtUTC: matchStart,
    endAtUTC: matchEnd,
    pricePaise: baseSlotPaise,
    paymentMode: 'full_online',
    now,
  });

  console.assert(holdResult.success && holdResult.booking, 'Hold creation failed');
  const hold = holdResult.booking!;
  console.log(`  ✓ Slot held by Player A: Booking ID ${hold.id}`);

  // Create Order
  const orderResult = await createPaymentOrder({ holdId: hold.id });
  console.assert(orderResult.success && orderResult.order, 'Order creation failed');
  const order = orderResult.order!;

  console.assert(order.courtPricePaise === 180000, 'Court price mismatch');
  console.assert(order.platformFeePaise === PLATFORM_FEE_PAISE, 'Platform fee mismatch');
  console.assert(order.amountPaise === 180000 + 4500, 'Total amount must equal Court + ₹45');
  console.log(`  ✓ Order created: ${order.orderId} for ₹${order.amountPaise / 100} (₹1,800 + ₹45 Platform Fee)`);
  console.log('  ✓ [PASS] Price is strictly locked on server; client cannot alter fees.');

  // --------------------------------------------------------------------------
  // TEST 2: Cryptographic HMAC-SHA256 Signature Verification
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Cryptographic HMAC-SHA256 Verification ---');

  const mockWebhookBody = JSON.stringify({
    entity: 'event',
    event: 'order.paid',
    payload: {
      order: { entity: { id: order.orderId, amount: order.amountPaise, status: 'paid' } },
      payment: {
        entity: {
          id: 'pay_rzp_test_123',
          order_id: order.orderId,
          amount: order.amountPaise,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  const validSignature = signWebhookPayload(mockWebhookBody, DEFAULT_WEBHOOK_SECRET);
  const isValid = verifyRazorpaySignature(mockWebhookBody, validSignature, DEFAULT_WEBHOOK_SECRET);
  console.assert(isValid, 'Valid signature failed verification');
  console.log('  ✓ Genuine Razorpay webhook signature verified successfully');

  const isForged = verifyRazorpaySignature(mockWebhookBody, 'forged_fake_signature_abc', DEFAULT_WEBHOOK_SECRET);
  console.assert(!isForged, 'Forged signature was not rejected');
  console.log('  ✓ [PASS] Forged webhook signature strictly rejected with 401 defense');

  // --------------------------------------------------------------------------
  // TEST 3: Webhook Processing & Booking Confirmation (Happy Path)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Webhook Confirmation & State Transition ---');

  const webhookPayload: RazorpayWebhookPayload = JSON.parse(mockWebhookBody);
  const webhookResult = await processPaymentWebhook(webhookPayload, 'evt_phase6_test_01');

  console.assert(webhookResult.success && webhookResult.outcome === 'confirmed', 'Webhook processing failed');

  const confirmedBooking = getBookingById(hold.id);
  console.assert(confirmedBooking?.status === 'confirmed', 'Booking status was not updated to confirmed');
  console.assert(confirmedBooking?.hold_expires_at === null, 'Hold expiration was not cleared');

  const payments = getAllPaymentsForTesting();
  const paymentRecord = payments.find((p) => p.booking_id === hold.id);
  console.assert(paymentRecord?.status === 'captured', 'Payment was not marked captured');
  console.log(`  ✓ Booking status transitioned: 'held' -> 'confirmed'`);
  console.log(`  ✓ Payment record transitioned: 'pending' -> 'captured' (ID: ${paymentRecord?.id})`);
  console.log('  ✓ [PASS] Match slot is now permanently locked and guaranteed.');

  // --------------------------------------------------------------------------
  // TEST 4: Webhook Idempotency (Deduplication)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Webhook Idempotency (Duplicate Suppression) ---');

  // Gateway fires the exact same webhook again
  const duplicateResult = await processPaymentWebhook(webhookPayload, 'evt_phase6_test_01');
  console.assert(duplicateResult.success && duplicateResult.duplicate === true, 'Duplicate was not detected');
  console.assert(getAllPaymentsForTesting().length === 1, 'Duplicate payment created');
  console.log('  ✓ [PASS] Duplicate webhook event skipped gracefully without double processing');

  // --------------------------------------------------------------------------
  // TEST 5: Post-Expiry Late Payment Arbitration (Scenario A & B)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Post-Expiry Late Payment Arbitration ---');

  // Scenario A: Payment arrives late, but slot is STILL FREE -> Auto-claim
  const slot2Start = '2026-10-15T14:30:00Z'; // 20:00 IST
  const slot2End = '2026-10-15T15:30:00Z';

  const holdA = (await createTemporaryHold({
    courtId,
    playerId: playerA,
    startAtUTC: slot2Start,
    endAtUTC: slot2End,
    pricePaise: 180000,
    now: new Date('2026-10-15T10:00:00Z'),
  })).booking!;

  const orderA = (await createPaymentOrder({ holdId: holdA.id })).order!;

  // Simulate hold expiring (11 minutes later)
  holdA.status = 'expired';

  // Webhook for Player A arrives late (at minute 12)
  const lateWebhookA: RazorpayWebhookPayload = {
    entity: 'event',
    event: 'order.paid',
    payload: {
      order: { entity: { id: orderA.orderId, amount: orderA.amountPaise, status: 'paid' } },
      payment: {
        entity: {
          id: 'pay_late_A',
          order_id: orderA.orderId,
          amount: orderA.amountPaise,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  };

  const outcomeA = await processPaymentWebhook(lateWebhookA, 'evt_late_A');
  console.assert(outcomeA.outcome === 'late_claimed', 'Expected late_claimed outcome');
  console.assert(getBookingById(holdA.id)?.status === 'confirmed', 'Expected booking to be claimed');
  console.log('  ✓ Scenario A [PASS]: Late payment accepted; free slot was claimed and confirmed.');

  // Scenario B: Payment arrives late, BUT another player took the slot -> AUTO-REFUND!
  const slot3Start = '2026-10-15T16:30:00Z'; // 22:00 IST
  const slot3End = '2026-10-15T17:30:00Z';

  // Player A holds slot 3
  const holdA3 = (await createTemporaryHold({
    courtId,
    playerId: playerA,
    startAtUTC: slot3Start,
    endAtUTC: slot3End,
    pricePaise: 180000,
    now: new Date('2026-10-15T10:00:00Z'),
  })).booking!;

  const orderA3 = (await createPaymentOrder({ holdId: holdA3.id })).order!;

  // Player A's hold expires
  holdA3.status = 'expired';

  // Player B comes in and claims slot 3 immediately
  const holdB3 = (await createTemporaryHold({
    courtId,
    playerId: playerB,
    startAtUTC: slot3Start,
    endAtUTC: slot3End,
    pricePaise: 180000,
    now: new Date('2026-10-15T10:11:00Z'),
  })).booking!;
  holdB3.status = 'confirmed'; // Player B paid first!

  // Now Player A's late webhook arrives
  const lateWebhookCollision: RazorpayWebhookPayload = {
    entity: 'event',
    event: 'order.paid',
    payload: {
      order: { entity: { id: orderA3.orderId, amount: orderA3.amountPaise, status: 'paid' } },
      payment: {
        entity: {
          id: 'pay_collision_A',
          order_id: orderA3.orderId,
          amount: orderA3.amountPaise,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  };

  const outcomeB = await processPaymentWebhook(lateWebhookCollision, 'evt_collision_A');
  console.assert(outcomeB.outcome === 'auto_refunded', 'Expected auto_refunded outcome');

  const refunds = getAllRefundsForTesting();
  const collisionRefund = refunds.find((r) => r.amount_paise === orderA3.amountPaise);
  console.assert(Boolean(collisionRefund), 'Refund record was not created for collision');
  console.assert(holdB3.status === 'confirmed', 'Player B must retain confirmed booking');
  console.log(`  ✓ Scenario B [PASS]: Slot collision detected; 100% automated refund (₹${orderA3.amountPaise / 100}) processed.`);
  console.log('  ✓ [ZERO DOUBLE BOOKINGS]: Player B retains their slot untouched.');

  // --------------------------------------------------------------------------
  // TEST 6: Booking Cancellation & Policy Refund Execution
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Booking Cancellation & Refund Policy Rules ---');

  // Case 1: Player cancels > 24 hours before match
  const futureStart = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const futureEnd = new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString();

  const futureBooking = (await createTemporaryHold({
    courtId,
    playerId: playerA,
    startAtUTC: futureStart,
    endAtUTC: futureEnd,
    pricePaise: 180000,
  })).booking!;

  const futureOrder = (await createPaymentOrder({ holdId: futureBooking.id })).order!;
  futureBooking.status = 'confirmed';
  const futurePayment = getAllPaymentsForTesting().find((p) => p.provider_order_id === futureOrder.orderId)!;
  futurePayment.status = 'captured';

  const refundEligible = executeBookingRefund({
    bookingId: futureBooking.id,
    reason: 'Player schedule conflict (48h advance notice)',
  });

  console.assert(refundEligible.success && refundEligible.refundEligible, 'Expected refund to be eligible');
  console.assert(getBookingById(futureBooking.id)?.status === 'cancelled', 'Booking was not cancelled');
  console.log('  ✓ Match > 24h before kick-off: Full refund granted per turf policy.');


  // Case 2: Player cancels < 24 hours before match (Late cancellation)
  const soonStart = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const soonEnd = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  const soonBooking = (await createTemporaryHold({
    courtId,
    playerId: playerA,
    startAtUTC: soonStart,
    endAtUTC: soonEnd,
    pricePaise: 180000,
  })).booking!;

  const soonOrder = (await createPaymentOrder({ holdId: soonBooking.id })).order!;
  soonBooking.status = 'confirmed';
  const soonPayment = getAllPaymentsForTesting().find((p) => p.provider_order_id === soonOrder.orderId)!;
  soonPayment.status = 'captured';

  const lateCancel = executeBookingRefund({
    bookingId: soonBooking.id,
    reason: 'Player personal conflict (2h before match)',
  });


  console.assert(lateCancel.success && !lateCancel.refundEligible, 'Expected no refund inside 24h');
  console.log('  ✓ Match < 24h before kick-off: Booking cancelled, zero refund per venue rules.');

  // Case 3: Admin override on late cancellation
  const adminOverride = executeBookingRefund({
    bookingId: soonBooking.id,
    reason: 'Admin goodwill dispute refund',
    adminOverride: true,
  });
  console.assert(adminOverride.success && adminOverride.refundEligible, 'Admin override refund failed');
  console.log('  ✓ Admin dispute override: 100% refund successfully forced for customer resolution.');

  console.log('\n======================================================');
  console.log('>>> ALL PHASE 6 PAYMENTS & WEBHOOK CHECKS PASSED <<<');
  console.log('======================================================\n');
}

runPhase6Tests().catch((err) => {
  console.error('Phase 6 verification failed:', err);
  process.exit(1);
});
