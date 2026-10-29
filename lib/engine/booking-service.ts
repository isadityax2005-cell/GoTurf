// ============================================================================
// GoTurf Booking & Hold Engine (Phase 5 + Stateless Signed Token Hardening)
// Handles:
// 1. Atomic 10-minute temporary holds with concurrency race protection.
// 2. Stateless HMAC-SHA256 signed hold/booking tokens for serverless reliability.
// 3. 50-request parallel collision defense (only 1 winner).
// 4. Lazy hold expiration and explicit hold release.
// 5. Booking cancellation and refund policy calculation.
// ============================================================================

import crypto from 'crypto';
import type { Booking } from '@/types/database';

const BOOKING_TOKEN_PREFIX = 'gt_bk';
const DEFAULT_DEV_TOKEN_SECRET = 'goturf-local-dev-booking-token-hmac-secret-2026';

export function getBookingTokenSecret(): string {
  const configured =
    process.env.GOTURF_BOOKING_TOKEN_SECRET?.trim() ||
    process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.RAZORPAY_KEY_SECRET?.trim();

  return configured || DEFAULT_DEV_TOKEN_SECRET;
}

interface SignedBookingPayload {
  v: 1;
  jti: string;
  booking: Booking;
}

export interface TokenVerificationResult {
  valid: boolean;
  code?: 'INVALID_TOKEN' | 'TAMPERED_TOKEN';
  error?: string;
  jti?: string;
  booking?: Booking;
}

// Track booking JTI -> in-memory Booking reference and revoked/cancelled JTIs
const bookingJtiMap = new Map<string, string>();

function signTokenInput(input: string, secret = getBookingTokenSecret()): string {
  return crypto.createHmac('sha256', secret).update(input).digest('hex');
}

function timingSafeHexEqual(expectedHex: string, receivedHex: string): boolean {
  try {
    const a = Buffer.from(expectedHex, 'utf8');
    const b = Buffer.from(receivedHex, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function extractJtiFromBooking(bookingOrId: Booking | string): string {
  const id = typeof bookingOrId === 'string' ? bookingOrId : bookingOrId.id;
  const mapped = bookingJtiMap.get(id);
  if (mapped) return mapped;

  if (id.startsWith(`${BOOKING_TOKEN_PREFIX}.`)) {
    const parts = id.split('.');
    if (parts.length === 3) {
      try {
        const parsed = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Partial<SignedBookingPayload>;
        if (typeof parsed.jti === 'string' && parsed.jti.length > 0) {
          return parsed.jti;
        }
      } catch {
        // ignore
      }
    }
  }
  return id;
}

export function encodeSignedBookingToken(booking: Booking, explicitJti?: string): string {
  const jti = explicitJti || extractJtiFromBooking(booking);
  const canonicalBooking: Booking = {
    ...booking,
    id: jti,
  };
  const payloadObj: SignedBookingPayload = {
    v: 1,
    jti,
    booking: canonicalBooking,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const signingInput = `${BOOKING_TOKEN_PREFIX}.${payloadB64}`;
  const signature = signTokenInput(signingInput);
  const token = `${signingInput}.${signature}`;
  bookingJtiMap.set(token, jti);
  bookingJtiMap.set(jti, jti);
  return token;
}

export function decodeAndVerifyBookingToken(token: string): TokenVerificationResult {
  if (!token || typeof token !== 'string' || !token.startsWith(`${BOOKING_TOKEN_PREFIX}.`)) {
    return {
      valid: false,
      code: 'INVALID_TOKEN',
      error: 'Invalid booking token format.',
    };
  }

  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1] || !parts[2]) {
    return {
      valid: false,
      code: 'INVALID_TOKEN',
      error: 'Malformed booking token.',
    };
  }

  const [, payloadB64, receivedSignature] = parts;
  const signingInput = `${BOOKING_TOKEN_PREFIX}.${payloadB64}`;
  const expectedSignature = signTokenInput(signingInput);

  if (!timingSafeHexEqual(expectedSignature, receivedSignature)) {
    return {
      valid: false,
      code: 'TAMPERED_TOKEN',
      error: 'Booking token signature verification failed.',
    };
  }

  try {
    const decodedJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed = JSON.parse(decodedJson) as Partial<SignedBookingPayload>;

    if (
      parsed.v !== 1 ||
      typeof parsed.jti !== 'string' ||
      !parsed.jti ||
      !parsed.booking ||
      typeof parsed.booking.court_id !== 'string' ||
      typeof parsed.booking.start_at !== 'string' ||
      typeof parsed.booking.end_at !== 'string' ||
      typeof parsed.booking.status !== 'string' ||
      typeof parsed.booking.price_paise !== 'number'
    ) {
      return {
        valid: false,
        code: 'INVALID_TOKEN',
        error: 'Booking token payload is incomplete or invalid.',
      };
    }

    const hydrated: Booking = {
      ...parsed.booking,
      id: token,
    };
    bookingJtiMap.set(token, parsed.jti);
    bookingJtiMap.set(parsed.jti, parsed.jti);

    return {
      valid: true,
      jti: parsed.jti,
      booking: hydrated,
    };
  } catch {
    return {
      valid: false,
      code: 'INVALID_TOKEN',
      error: 'Unable to decode booking token payload.',
    };
  }
}

// In-memory active bookings store for the application
let activeBookingsList: Booking[] = [
  // Pre-seeded confirmed match for sample date 18:00 IST
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

function findInMemoryBookingByJti(jti: string): Booking | undefined {
  return activeBookingsList.find((b) => extractJtiFromBooking(b) === jti || b.id === jti);
}

// Hydrate a verified booking snapshot into the local store if not already present
export function hydrateBookingFromSnapshot(snapshot: Booking, now = new Date()): Booking {
  const jti = extractJtiFromBooking(snapshot);
  const existing = findInMemoryBookingByJti(jti);

  if (existing) {
    // If incoming snapshot carries a progressed terminal/confirmed status from another serverless worker, sync it
    if (existing.status === 'held' && snapshot.status !== 'held') {
      existing.status = snapshot.status;
      existing.hold_expires_at = snapshot.hold_expires_at;
      existing.cancel_reason = snapshot.cancel_reason;
      existing.balance_status = snapshot.balance_status;
      existing.balance_collected_at = snapshot.balance_collected_at;
      existing.balance_collected_by = snapshot.balance_collected_by;
      existing.updated_at = snapshot.updated_at;
    }
    if (snapshot.payment_mode) {
      existing.payment_mode = snapshot.payment_mode;
      existing.advance_amount_paise = snapshot.advance_amount_paise;
      existing.balance_amount_paise = snapshot.balance_amount_paise;
    }
    expireStaleHolds(now);
    return existing;
  }

  const copy: Booking = { ...snapshot };
  if (copy.status === 'held' && copy.hold_expires_at) {
    const expiresAtMs = new Date(copy.hold_expires_at).getTime();
    if (expiresAtMs <= now.getTime()) {
      copy.status = 'expired';
    }
  }
  bookingJtiMap.set(copy.id, jti);
  activeBookingsList.push(copy);
  return copy;
}

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
  holdToken?: string;
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

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return { success: false, error: 'Invalid time range', code: 'INVALID_TIME' };
    }

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
    const durationMs = endMs - startMs;
    const durationHours = Math.max(1, Math.round(durationMs / (3600 * 1000)));

    let advancePaise = params.advanceAmountPaise;
    let balancePaise = 0;

    if (paymentMode === 'token_advance') {
      // Default to ₹200 (20,000 paise) per hour token advance or customized amount
      const defaultAdvance = 20000 * durationHours;
      advancePaise = advancePaise !== undefined ? advancePaise : defaultAdvance;
      balancePaise = Math.max(0, params.pricePaise - advancePaise);
    } else {
      advancePaise = params.pricePaise;
      balancePaise = 0;
    }

    const checkInOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const jti = `hold-${now.getTime()}-${crypto.randomBytes(4).toString('hex')}`;

    const draftHold: Booking = {
      id: jti,
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

    const signedHoldToken = encodeSignedBookingToken(draftHold, jti);
    const newHold: Booking = {
      ...draftHold,
      id: signedHoldToken,
    };
    bookingJtiMap.set(signedHoldToken, jti);

    activeBookingsList.push(newHold);
    return { success: true, booking: newHold, holdToken: signedHoldToken };
  } finally {
    releaseLock();
  }
}

// Inspect a booking ID or signed token with strict cryptographic validation
export function inspectBookingToken(
  idOrToken: string,
  now = new Date()
): {
  valid: boolean;
  expired?: boolean;
  code?: 'INVALID_TOKEN' | 'TAMPERED_TOKEN' | 'NOT_FOUND' | 'HOLD_EXPIRED';
  error?: string;
  booking?: Booking;
  bookingToken?: string;
} {
  if (!idOrToken || typeof idOrToken !== 'string' || idOrToken.trim().length === 0) {
    return { valid: false, code: 'INVALID_TOKEN', error: 'Missing booking or hold token.' };
  }

  const trimmed = idOrToken.trim();
  expireStaleHolds(now);

  if (trimmed.startsWith(`${BOOKING_TOKEN_PREFIX}.`)) {
    const decoded = decodeAndVerifyBookingToken(trimmed);
    if (!decoded.valid || !decoded.booking || !decoded.jti) {
      return {
        valid: false,
        code: decoded.code || 'INVALID_TOKEN',
        error: decoded.error || 'Invalid or tampered booking token.',
      };
    }

    const hydrated = hydrateBookingFromSnapshot(decoded.booking, now);
    const isExpired = hydrated.status === 'expired';
    return {
      valid: true,
      expired: isExpired,
      code: isExpired ? 'HOLD_EXPIRED' : undefined,
      booking: hydrated,
      bookingToken: encodeSignedBookingToken(hydrated, decoded.jti),
    };
  }

  // Only allow non-prefixed lookup if an exact pre-seeded/test ID exists in memory
  const directMatch = activeBookingsList.find((b) => b.id === trimmed);
  if (!directMatch) {
    return {
      valid: false,
      code: 'INVALID_TOKEN',
      error: 'Invalid, unrecognized, or tampered hold token.',
    };
  }

  const isExpired = directMatch.status === 'expired';
  return {
    valid: true,
    expired: isExpired,
    code: isExpired ? 'HOLD_EXPIRED' : undefined,
    booking: directMatch,
    bookingToken: encodeSignedBookingToken(directMatch),
  };
}

// 3. Explicit Hold Release (When user clicks "Release Slot" or abandons checkout)
export function releaseHold(holdId: string, now = new Date()): boolean {
  const inspected = inspectBookingToken(holdId, now);
  if (!inspected.valid || !inspected.booking) {
    return false;
  }

  if (inspected.booking.status === 'held') {
    inspected.booking.status = 'expired';
    inspected.booking.updated_at = now.toISOString();
    return true;
  }
  return false;
}

// 4. Confirm a held booking (Called upon payment webhook verification in Phase 6)
export function confirmBooking(holdId: string, now = new Date()): Booking | null {
  const inspected = inspectBookingToken(holdId, now);
  if (!inspected.valid || !inspected.booking) {
    return null;
  }

  const booking = inspected.booking;
  if (booking.status === 'held') {
    booking.status = 'confirmed';
    booking.hold_expires_at = null;
    booking.updated_at = now.toISOString();
    return booking;
  }
  return null;
}

// 4.b Get booking or hold by ID or signed stateless token
export function getBookingById(id: string, now = new Date()): Booking | null {
  const inspected = inspectBookingToken(id, now);
  if (!inspected.valid || !inspected.booking) {
    return null;
  }
  return inspected.booking;
}

// 4.c Collect remaining balance at venue (Cash / Venue UPI)
export function collectVenueBalance(params: {
  bookingId: string;
  method: 'cash' | 'venue_upi';
  attendantId?: string;
}): { success: boolean; booking?: Booking; bookingToken?: string; error?: string } {
  const booking = getBookingById(params.bookingId);
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

  return {
    success: true,
    booking,
    bookingToken: encodeSignedBookingToken(booking),
  };
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
export function cancelBooking(
  bookingId: string,
  reason: string,
  now = new Date()
): { success: boolean; refundEligible: boolean; message: string; booking?: Booking; bookingToken?: string } {
  const booking = getBookingById(bookingId, now);
  if (!booking) {
    return { success: false, refundEligible: false, message: 'Booking not found' };
  }

  if (booking.status === 'cancelled') {
    return { success: false, refundEligible: false, message: 'Booking is already cancelled' };
  }

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
    booking,
    bookingToken: encodeSignedBookingToken(booking),
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
  bookingJtiMap.clear();
}
