// ============================================================================
// GoTurf Booking & Hold Engine (Phase 5)
// Handles:
// 1. Atomic 10-minute temporary holds with concurrency race protection.
// 2. 50-request parallel collision defense (only 1 winner).
// 3. Lazy hold expiration and explicit hold release.
// 4. Booking cancellation and refund policy calculation.
// ============================================================================

import type { Booking, BookingStatus } from '@/types/database';
import { getActiveBookingsForCourt } from '@/lib/data/bookings';

// In-memory active bookings store for the application
let activeBookingsList: Booking[] = [
  // Pre-seeded confirmed match for tomorrow 18:00 IST
  {
    id: 'booking-preseeded-1',
    court_id: '40000000-0000-0000-0000-000000000001',
    player_id: '20000000-0000-0000-0000-000000000005',
    booking_type: 'player',
    start_at: '2026-10-15T12:30:00Z',
    end_at: '2026-10-15T13:30:00Z',
    status: 'confirmed',
    hold_expires_at: null,
    price_paise: 180000,
    cancel_reason: null,
    notes: 'Karan Verma 8v8 Box Cricket',
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
  },
];

// Mutex / Concurrency lock to guarantee atomic slot reservation under high parallel load
let isProcessingHold = false;
const holdQueue: (() => void)[] = [];

function acquireLock(): Promise<void> {
  return new Promise((resolve) => {
    if (!isProcessingHold) {
      isProcessingHold = true;
      resolve();
    } else {
      holdQueue.push(resolve);
    }
  });
}

function releaseLock() {
  if (holdQueue.length > 0) {
    const next = holdQueue.shift()!;
    next();
  } else {
    isProcessingHold = false;
  }
}

// 1. Expire stale holds lazily
export function expireStaleHolds(now = new Date()): number {
  let expiredCount = 0;
  for (const b of activeBookingsList) {
    if (b.status === 'held' && b.hold_expires_at) {
      const expiresAt = new Date(b.hold_expires_at).getTime();
      if (expiresAt <= now.getTime()) {
        b.status = 'expired';
        expiredCount++;
      }
    }
  }
  return expiredCount;
}

export interface CreateHoldParams {
  courtId: string;
  playerId: string;
  startAtUTC: string;
  endAtUTC: string;
  pricePaise: number;
  notes?: string;
  holdMinutes?: number;
  now?: Date;
  paymentMode?: 'full_online' | 'token_advance';
  advanceAmountPaise?: number;
}

export interface CreateHoldResult {
  success: boolean;
  booking?: Booking;
  error?: string;
  code?: 'SLOT_TAKEN' | 'INVALID_TIME' | 'PAST_SLOT';
}

// 2. Concurrency-Safe Hold Creation (The Bouncer)
export async function createTemporaryHold(params: CreateHoldParams): Promise<CreateHoldResult> {
  await acquireLock();

  try {
    const now = params.now || new Date();
    expireStaleHolds(now);

    const startMs = new Date(params.startAtUTC).getTime();
    const endMs = new Date(params.endAtUTC).getTime();

    if (endMs <= now.getTime()) {
      return { success: false, error: 'Cannot book a slot in the past', code: 'PAST_SLOT' };
    }

    if (startMs >= endMs) {
      return { success: false, error: 'Invalid time range', code: 'INVALID_TIME' };
    }

    // Check for collisions against all active (confirmed or held) records
    for (const b of activeBookingsList) {
      if (b.court_id !== params.courtId) continue;
      if (b.status !== 'confirmed' && b.status !== 'held') continue;

      const bStart = new Date(b.start_at).getTime();
      const bEnd = new Date(b.end_at).getTime();

      // PostgreSQL tstzrange '[)' overlap condition
      if (startMs < bEnd && endMs > bStart) {
        return {
          success: false,
          error: 'Slot just taken! Please pick another slot.',
          code: 'SLOT_TAKEN',
        };
      }
    }

    const holdMinutes = params.holdMinutes || 10;
    const expiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000).toISOString();

    const paymentMode = params.paymentMode || 'token_advance';
    let advancePaise = params.advanceAmountPaise;
    let balancePaise = 0;

    if (paymentMode === 'token_advance') {
      // Default to ₹200 (20,000 paise) token advance or customized amount
      advancePaise = advancePaise !== undefined ? advancePaise : 20000;
      balancePaise = Math.max(0, params.pricePaise - advancePaise);
    } else {
      advancePaise = params.pricePaise;
      balancePaise = 0;
    }

    const checkInOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newHold: Booking = {
      id: `hold-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      court_id: params.courtId,
      player_id: params.playerId,
      booking_type: 'player',
      start_at: params.startAtUTC,
      end_at: params.endAtUTC,
      status: 'held',
      hold_expires_at: expiresAt,
      price_paise: params.pricePaise,
      payment_mode: paymentMode,
      advance_amount_paise: advancePaise,
      balance_amount_paise: balancePaise,
      balance_status: 'unpaid',
      balance_collected_at: null,
      balance_collected_by: null,
      check_in_otp: checkInOtp,
      cancel_reason: null,
      notes: params.notes || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    activeBookingsList.push(newHold);
    return { success: true, booking: newHold };
  } finally {
    releaseLock();
  }
}


// 3. Explicit Hold Release (When user clicks "Release Slot" or abandons checkout)
export function releaseHold(holdId: string): boolean {
  const index = activeBookingsList.findIndex((b) => b.id === holdId && b.status === 'held');
  if (index !== -1) {
    activeBookingsList[index].status = 'expired';
    return true;
  }
  return false;
}

// 4. Confirm a held booking (Called upon payment webhook verification in Phase 6)
export function confirmBooking(holdId: string): Booking | null {
  const booking = activeBookingsList.find((b) => b.id === holdId && b.status === 'held');
  if (booking) {
    booking.status = 'confirmed';
    booking.hold_expires_at = null;
    booking.updated_at = new Date().toISOString();
    return booking;
  }
  return null;
}

// 4.b Get booking or hold by ID
export function getBookingById(id: string): Booking | null {
  expireStaleHolds();
  return activeBookingsList.find((b) => b.id === id) || null;
}

// 4.c Collect remaining balance at venue (Cash / Venue UPI)
export function collectVenueBalance(params: {
  bookingId: string;
  method: 'cash' | 'venue_upi';
  attendantId?: string;
}): { success: boolean; booking?: Booking; error?: string } {
  const booking = activeBookingsList.find((b) => b.id === params.bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  if (booking.status !== 'confirmed') {
    return { success: false, error: `Cannot collect balance on booking with status: ${booking.status}` };
  }

  const now = new Date().toISOString();
  booking.balance_status = params.method === 'cash' ? 'collected_cash' : 'collected_venue_upi';
  booking.balance_collected_at = now;
  booking.balance_collected_by = params.attendantId || 'attendant-gate-01';
  booking.status = 'completed';
  booking.updated_at = now;

  return { success: true, booking };
}


// 5. Get User Bookings (Player Booking History)
export function getUserBookings(playerId: string): Booking[] {
  return activeBookingsList.filter((b) => b.player_id === playerId);
}

// 5.b Get Bookings for Court (Owner Venue Schedule)
export function getBookingsForCourt(courtId: string): Booking[] {
  return activeBookingsList.filter((b) => b.court_id === courtId);
}

// 6. Cancel a booking
export function cancelBooking(bookingId: string, reason: string): { success: boolean; refundEligible: boolean; message: string } {
  const booking = activeBookingsList.find((b) => b.id === bookingId);
  if (!booking) {
    return { success: false, refundEligible: false, message: 'Booking not found' };
  }

  if (booking.status === 'cancelled') {
    return { success: false, refundEligible: false, message: 'Booking is already cancelled' };
  }

  const now = new Date();
  const matchStart = new Date(booking.start_at);
  const hoursRemaining = (matchStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Cancellation policy rule: Free refund if >= 24h before match
  const refundEligible = hoursRemaining >= 24;

  booking.status = 'cancelled';
  booking.cancel_reason = reason;
  booking.updated_at = now.toISOString();

  return {
    success: true,
    refundEligible,
    message: refundEligible
      ? 'Booking cancelled. Full refund will be processed per turf policy.'
      : 'Booking cancelled. Inside 24h window, no refund per turf policy.',
  };
}

export function getAllBookingsForTesting(): Booking[] {
  return activeBookingsList;
}

export function resetBookingsForTesting(list?: Booking[]) {
  activeBookingsList = list || [];
}
