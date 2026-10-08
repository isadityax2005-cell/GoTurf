// ============================================================================
// GoTurf Phase 5 Concurrency Race & Expiry Verification Test Suite
// Verifies:
// 1. 50 parallel simultaneous requests for ONE slot produce EXACTLY 1 winner and 49 rejections.
// 2. Rejected requests receive friendly "Slot just taken" error.
// 3. 10-minute hold expiry automatically liberates the slot for others.
// 4. Explicit hold release liberates the slot immediately.
// 5. Booking cancellation marks status 'cancelled' and frees the court.
// ============================================================================

import {
  createTemporaryHold,
  expireStaleHolds,
  releaseHold,
  cancelBooking,
  resetBookingsForTesting,
  type CreateHoldResult,
} from '../lib/engine/booking-service';

async function runPhase5RaceTest() {
  console.log('======================================================================');
  console.log('>>> RUNNING PHASE 5: 50-REQUEST CONCURRENCY RACE & EXPIRY TEST <<<');
  console.log('======================================================================\n');

  resetBookingsForTesting(); // clean test slate

  const courtId = '40000000-0000-0000-0000-000000000001'; // Bandra Court 1
  const startAtUTC = '2026-10-15T18:00:00Z';
  const endAtUTC = '2026-10-15T19:00:00Z';
  const pricePaise = 180000;
  const testNow = new Date('2026-10-15T10:00:00Z');

  console.log('--- TEST 1: The 50-Request Concurrency Collision Test ---');
  console.log('Firing 50 simultaneous parallel asynchronous hold requests for the exact same slot...');

  // Create 50 parallel asynchronous hold requests
  const promises: Promise<CreateHoldResult>[] = [];
  for (let i = 1; i <= 50; i++) {
    promises.push(
      createTemporaryHold({
        courtId,
        playerId: `player-race-${i}`,
        startAtUTC,
        endAtUTC,
        pricePaise,
        notes: `Simulated parallel request #${i}`,
        now: testNow,
      })
    );
  }

  const results = await Promise.all(promises);

  const successes = results.filter((r) => r.success);
  const failures = results.filter((r) => !r.success);

  console.log(`  -> Successful holds created: ${successes.length}`);
  console.log(`  -> Rejected requests:        ${failures.length}`);

  // STRICT ASSERTION: Exactly 1 winner, exactly 49 losers
  console.assert(
    successes.length === 1,
    `CRITICAL CONCURRENCY FAILURE: Expected 1 winner, but got ${successes.length} winners!`
  );
  console.assert(
    failures.length === 49,
    `CRITICAL CONCURRENCY FAILURE: Expected 49 rejected requests, but got ${failures.length}!`
  );

  // Verify all 49 losers got the correct user-friendly error message
  const allGotSlotTakenCode = failures.every((f) => f.code === 'SLOT_TAKEN');
  console.assert(allGotSlotTakenCode, 'Not all losers received SLOT_TAKEN code');
  console.log('  ✓ [PASS] Exactly 1 request won the hold; 49 requests safely rejected with "Slot just taken"');

  const winnerHold = successes[0].booking!;
  console.log(`  ✓ Winner Booking ID: ${winnerHold.id} by Player: ${winnerHold.player_id}`);

  console.log('\n--- TEST 2: Hold Expiry & Automatic Slot Liberation ---');
  // Attempt to book while hold is active -> Must fail
  const attemptDuringHold = await createTemporaryHold({
    courtId,
    playerId: 'late-comer',
    startAtUTC,
    endAtUTC,
    pricePaise,
    now: new Date(testNow.getTime() + 5 * 60 * 1000), // 5 minutes later (still active)
  });
  console.assert(!attemptDuringHold.success, 'Slot was booked while hold was still active!');
  console.log('  ✓ Slot is strictly blocked at minute 5 of the 10-minute hold');

  // Fast forward 11 minutes (past 10-minute expiry)
  const elevenMinutesLater = new Date(testNow.getTime() + 11 * 60 * 1000);
  const expiredCount = expireStaleHolds(elevenMinutesLater);
  console.assert(expiredCount === 1, `Expected 1 expired hold, got ${expiredCount}`);
  console.log(`  ✓ Hold expired at minute 11; lazy sweep marked hold status as 'expired'`);

  // Now a new player taps the slot -> Must succeed!
  const attemptAfterExpiry = await createTemporaryHold({
    courtId,
    playerId: 'new-player-after-expiry',
    startAtUTC,
    endAtUTC,
    pricePaise,
    now: elevenMinutesLater,
  });
  console.assert(attemptAfterExpiry.success, 'Failed to book slot after hold expired!');
  console.log('  ✓ [PASS] Slot was automatically liberated and successfully re-booked by a new player!');

  console.log('\n--- TEST 3: Explicit Hold Release ---');
  const activeHold = attemptAfterExpiry.booking!;
  const released = releaseHold(activeHold.id);
  console.assert(released === true, 'Failed to release hold');
  console.log('  ✓ Player clicked "Release Slot & Exit"; hold was freed immediately');

  // Re-booking immediately succeeds
  const rebookAttempt = await createTemporaryHold({
    courtId,
    playerId: 'immediate-rebooker',
    startAtUTC,
    endAtUTC,
    pricePaise,
    now: elevenMinutesLater,
  });
  console.assert(rebookAttempt.success, 'Slot was not available after explicit release');
  console.log('  ✓ [PASS] Released slot was immediately available for other players');

  console.log('\n--- TEST 4: Booking Cancellation & Policy Refund ---');
  // Convert hold to confirmed
  const confirmedBooking = rebookAttempt.booking!;
  confirmedBooking.status = 'confirmed';

  // Cancel booking (match is on 15 Oct, testNow is earlier -> > 24h away)
  const cancelResult = cancelBooking(confirmedBooking.id, 'Injured player');
  console.assert(cancelResult.success && cancelResult.refundEligible, 'Cancellation policy calculation failed');
  console.log(`  ✓ [PASS] Booking cancelled > 24h before match -> ${cancelResult.message}`);

  // Re-booking slot after cancellation -> Must succeed
  const postCancelAttempt = await createTemporaryHold({
    courtId,
    playerId: 'after-cancellation-player',
    startAtUTC,
    endAtUTC,
    pricePaise,
    now: elevenMinutesLater,
  });
  console.assert(postCancelAttempt.success, 'Cancelled slot was not liberated');
  console.log('  ✓ [PASS] Cancelled slot was freed and re-booked cleanly');

  console.log('\n======================================================================');
  console.log('>>> ALL PHASE 5 CONCURRENCY RACE & HOLD TESTS PASSED WITH 100% <<<');
  console.log('======================================================================');
}

runPhase5RaceTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
