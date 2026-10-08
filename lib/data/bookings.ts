// ============================================================================
// GoTurf Booking & Block Data Layer (Phase 4)
// Stores player bookings, active holds, and owner blocks
// ============================================================================

import type { Booking } from '@/types/database';

// In-memory demo store pre-seeded with sample reservations for Bandra Court 1
const BOOKINGS_STORE: Booking[] = [
  // 1 Confirmed Player Booking for Tomorrow 18:00 to 19:00 UTC (sample)
  {
    id: 'demo-booking-1',
    court_id: '40000000-0000-0000-0000-000000000001',
    player_id: '20000000-0000-0000-0000-000000000005',
    booking_type: 'player',
    start_at: '2026-10-15T12:30:00Z', // 18:00 IST
    end_at: '2026-10-15T13:30:00Z',   // 19:00 IST
    status: 'confirmed',
    hold_expires_at: null,
    price_paise: 180000,
    cancel_reason: null,
    notes: 'Karan Verma 8v8 Match',
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
  },
  // 1 Owner Offline Block for Maintenance / Coaching
  {
    id: 'demo-block-1',
    court_id: '40000000-0000-0000-0000-000000000001',
    player_id: null,
    booking_type: 'owner_block',
    start_at: '2026-10-15T14:30:00Z', // 20:00 IST
    end_at: '2026-10-15T15:30:00Z',   // 21:00 IST
    status: 'confirmed',
    hold_expires_at: null,
    price_paise: 0,
    cancel_reason: null,
    notes: 'Phone Booking: Ramesh coaching batch',
    created_at: '2026-10-08T00:00:00Z',
    updated_at: '2026-10-08T00:00:00Z',
  },
];

export function getActiveBookingsForCourt(courtId: string): Booking[] {
  return BOOKINGS_STORE.filter(
    (b) => b.court_id === courtId && (b.status === 'confirmed' || b.status === 'held')
  );
}

export function createOwnerBlock(params: {
  courtId: string;
  startAt: string;
  endAt: string;
  notes: string;
}): Booking {
  const block: Booking = {
    id: `owner-block-${Date.now()}`,
    court_id: params.courtId,
    player_id: null,
    booking_type: 'owner_block',
    start_at: params.startAt,
    end_at: params.endAt,
    status: 'confirmed',
    hold_expires_at: null,
    price_paise: 0,
    cancel_reason: null,
    notes: params.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  BOOKINGS_STORE.push(block);
  return block;
}

export function removeOwnerBlock(blockId: string): boolean {
  const index = BOOKINGS_STORE.findIndex((b) => b.id === blockId);
  if (index !== -1 && BOOKINGS_STORE[index].booking_type === 'owner_block') {
    BOOKINGS_STORE.splice(index, 1);
    return true;
  }
  return false;
}
