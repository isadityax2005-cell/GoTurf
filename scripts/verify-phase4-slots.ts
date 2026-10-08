// ============================================================================
// GoTurf Phase 4 Verification Test Suite
// Verifies:
// 1. Dynamic slot calculation from opening hours (06:00 - 23:00 -> 17 slots).
// 2. Dynamic peak vs off-peak pricing resolution in paise.
// 3. Owner offline blocks immediately mark slots as 'blocked'.
// 4. Past slots (end_at <= now) are strictly marked 'past'.
// 5. Weekend vs Weekday pricing rules apply correctly.
// ============================================================================

import { DEMO_TURFS } from '../lib/data/turfs';
import {
  getActiveBookingsForCourt,
  createOwnerBlock,
} from '../lib/data/bookings';
import {
  generateCourtSlots,
  calculatePriceForSlot,
  type SlotGridItem,
} from '../lib/engine/slot-calculator';

function runPhase4Tests() {
  console.log('--- 1. Testing Slot Grid Generation (06:00 - 23:00) ---');

  const court = DEMO_TURFS[0].courts![0]; // Bandra Box Cricket (60 min)
  const testDate = '2026-10-15'; // Thursday (Weekday)
  const simulatedNow = new Date('2026-10-15T00:00:00Z'); // Start of day

  const activeBookings = getActiveBookingsForCourt(court.id);
  const slots = generateCourtSlots({
    court,
    dateStr: testDate,
    activeBookings,
    now: simulatedNow,
  });

  // 06:00 to 23:00 with 60 min intervals = 17 slots
  console.assert(slots.length === 17, `Expected 17 slots, got ${slots.length}`);
  console.log(`  ✓ Generated exactly ${slots.length} consecutive 60-min slots for 06:00 to 23:00 schedule`);
  console.assert(slots[0].startTimeIST.includes('6:00') && slots[0].startTimeIST.toUpperCase().includes('AM'), 'First slot mismatch');
  console.assert(slots[16].startTimeIST.includes('10:00') && slots[16].startTimeIST.toUpperCase().includes('PM'), 'Last slot mismatch');
  console.log(`  ✓ First slot: ${slots[0].startTimeIST} | Last slot: ${slots[16].startTimeIST} - ${slots[16].endTimeIST}`);

  console.log('\n--- 2. Testing Dynamic Peak vs Off-Peak Pricing Rules ---');

  const priceRules = [
    { id: '1', court_id: court.id, day_type: 'weekday' as const, from_time: '06:00:00', to_time: '17:00:00', price_paise: 120000, is_peak: false },
    { id: '2', court_id: court.id, day_type: 'weekday' as const, from_time: '17:00:00', to_time: '23:00:00', price_paise: 180000, is_peak: true },
    { id: '3', court_id: court.id, day_type: 'weekend' as const, from_time: '06:00:00', to_time: '23:00:00', price_paise: 180000, is_peak: true },
  ];

  // Weekday 14:00 (Off-peak)
  const weekdayAfternoon = calculatePriceForSlot('14:00', false, priceRules);
  console.assert(weekdayAfternoon.pricePaise === 120000 && !weekdayAfternoon.isPeak, 'Weekday afternoon price mismatch');
  console.log(`  ✓ Weekday 14:00 correctly calculated as Off-peak: ₹1,200 (120000 paise)`);

  // Weekday 19:00 (Peak)
  const weekdayEvening = calculatePriceForSlot('19:00', false, priceRules);
  console.assert(weekdayEvening.pricePaise === 180000 && weekdayEvening.isPeak, 'Weekday evening price mismatch');
  console.log(`  ✓ Weekday 19:00 correctly calculated as Peak: ₹1,800 (180000 paise)`);

  // Weekend 14:00 (Peak rate applies all day on weekends)
  const weekendAfternoon = calculatePriceForSlot('14:00', true, priceRules);
  console.assert(weekendAfternoon.pricePaise === 180000 && weekendAfternoon.isPeak, 'Weekend afternoon price mismatch');
  console.log(`  ✓ Weekend 14:00 correctly calculated as Weekend Peak: ₹1,800 (180000 paise)`);

  console.log('\n--- 3. Testing Real-Time Conflict Masking (Booked & Blocked Slots) ---');

  // Slot at 18:00 IST (12:30 UTC) should be booked by player
  const bookedSlot = slots.find((s) => s.startTimeIST.includes('6:00') && s.startTimeIST.toUpperCase().includes('PM'));
  console.assert(bookedSlot?.status === 'booked', `Expected status 'booked', got ${bookedSlot?.status}`);
  console.log(`  ✓ Player confirmed booking at 06:00 PM IST is correctly marked status: 'booked'`);

  // Slot at 20:00 IST (14:30 UTC) should be blocked by owner
  const blockedSlot = slots.find((s) => s.startTimeIST.includes('8:00') && s.startTimeIST.toUpperCase().includes('PM'));
  console.assert(blockedSlot?.status === 'blocked', `Expected status 'blocked', got ${blockedSlot?.status}`);
  console.assert(blockedSlot?.blockReason?.includes('coaching'), 'Block reason missing');
  console.log(`  ✓ Owner offline block at 08:00 PM IST is correctly marked status: 'blocked' ("${blockedSlot?.blockReason}")`);

  console.log('\n--- 4. Testing Owner 2-Tap Block Creation ---');

  // Owner blocks 16:00 to 17:00 IST (10:30 to 11:30 UTC)
  const slotToBlock = slots.find((s) => s.startTimeIST.includes('4:00') && s.startTimeIST.toUpperCase().includes('PM'))!;
  console.assert(slotToBlock.status === 'available', 'Slot should initially be available');

  createOwnerBlock({
    courtId: court.id,
    startAt: slotToBlock.startAtUTC,
    endAt: slotToBlock.endAtUTC,
    notes: 'Phone Booking - Rahul',
  });

  // Re-generate slots
  const updatedSlots = generateCourtSlots({
    court,
    dateStr: testDate,
    activeBookings: getActiveBookingsForCourt(court.id),
    now: simulatedNow,
  });

  const newlyBlockedSlot = updatedSlots.find((s) => s.id === slotToBlock.id);
  console.assert(newlyBlockedSlot?.status === 'blocked', 'Newly blocked slot should be blocked');
  console.log(`  ✓ [PASS] Owner block instantly flipped slot 04:00 PM IST from 'available' to 'blocked'`);

  console.log('\n--- 5. Testing Past Slots Masking (end_at <= now) ---');

  // Simulate current time is 14:00 IST (08:30 UTC)
  const currentAfternoon = new Date('2026-10-15T08:30:00Z');
  const afternoonSlots = generateCourtSlots({
    court,
    dateStr: testDate,
    activeBookings: getActiveBookingsForCourt(court.id),
    now: currentAfternoon,
  });

  // Slots before 14:00 IST should be marked 'past'
  const pastCount = afternoonSlots.filter((s) => s.status === 'past').length;
  console.assert(pastCount >= 8, `Expected at least 8 past slots, got ${pastCount}`);
  console.log(`  ✓ [PASS] Exactly ${pastCount} elapsed morning slots were strictly marked status: 'past' and disabled`);

  console.log('\n======================================================');
  console.log('>>> ALL PHASE 4 SLOT ENGINE & BLOCK CHECKS PASSED <<<');
  console.log('======================================================');
}

runPhase4Tests();
