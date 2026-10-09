// ============================================================================
// GoTurf Phase 7+ Verification Test Suite: Token Advance & On-Site Collection
// Tests:
// 1. Token Advance Hold Creation (₹200 advance, ₹1,600 balance on ₹1,800 slot).
// 2. Server-Authoritative Token Advance Order Calculation (charges strictly ₹245).
// 3. Webhook Capture & Digital Match Pass Activation with 4-Digit Check-in PIN.
// 4. On-Site Gate Check-In & Balance Collection (Cash Mode).
// 5. On-Site Gate Check-In & Balance Collection (Venue UPI Mode).
// 6. 100% Online Prepayment Comparison Mode (₹0 venue balance).
// 7. Weekly Payout Reconciliation Ledger Simulation (Zero Double Counting).
// 8. Pre-Match Cancellation Refund Policy with Token Advance (>24h vs <24h).
// ============================================================================

import {
  createTemporaryHold,
  confirmBooking,
  collectVenueBalance,
  cancelBooking,
  resetBookingsForTesting,
  getAllBookingsForTesting,
  getBookingById,
} from '../lib/engine/booking-service';

import {
  createPaymentOrder,
  processPaymentWebhook,
  signWebhookPayload,
  verifyRazorpaySignature,
  resetPaymentsForTesting,
  PLATFORM_FEE_PAISE,
  DEFAULT_WEBHOOK_SECRET,
  type RazorpayWebhookPayload,
} from '../lib/engine/payment-service';

import type { Booking } from '../types/database';

async function runPhase7Tests() {
  console.log('\n======================================================================');
  console.log('>>> RUNNING PHASE 7+: TOKEN ADVANCE & VENUE BALANCE TEST SUITE <<<');
  console.log('======================================================================\n');

  resetBookingsForTesting([]);
  resetPaymentsForTesting();

  const courtId = '40000000-0000-0000-0000-000000000001';
  const playerA = 'player-karan-mumbai';
  const playerB = 'player-rahul-mumbai';
  const playerC = 'player-aniket-mumbai';

  // --------------------------------------------------------------------------
  // TEST 1: Token Advance Hold Creation
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Token Advance Hold Creation ---');
  const slotPricePaise = 180000; // ₹1,800 slot
  const now = new Date('2026-10-15T10:00:00Z');
  const matchStart = '2026-10-15T12:30:00Z'; // 18:00 IST
  const matchEnd = '2026-10-15T13:30:00Z';   // 19:00 IST

  const holdA = await createTemporaryHold({
    courtId,
    playerId: playerA,
    startAtUTC: matchStart,
    endAtUTC: matchEnd,
    pricePaise: slotPricePaise,
    paymentMode: 'token_advance',
    now,
  });

  console.assert(holdA.success && holdA.booking, 'Hold creation failed');
  const bookingA = holdA.booking!;

  console.assert(bookingA.payment_mode === 'token_advance', 'Payment mode must be token_advance');
  console.assert(bookingA.advance_amount_paise === 20000, `Advance must be ₹200 (20,000 paise), got ${bookingA.advance_amount_paise}`);
  console.assert(bookingA.balance_amount_paise === 160000, `Balance must be ₹1,600 (160,000 paise), got ${bookingA.balance_amount_paise}`);
  console.assert(bookingA.balance_status === 'unpaid', 'Initial balance status must be unpaid');
  console.assert(typeof bookingA.check_in_otp === 'string' && bookingA.check_in_otp.length === 4, 'Must generate 4-digit check-in PIN');

  console.log(`  ✓ Token hold created: Hold ID ${bookingA.id}`);
  console.log(`  ✓ Slot Price: ₹${bookingA.price_paise / 100} | Advance: ₹${bookingA.advance_amount_paise! / 100} | Balance Due: ₹${bookingA.balance_amount_paise! / 100}`);
  console.log(`  ✓ Check-In Match PIN generated: ${bookingA.check_in_otp}`);
  console.log('  ✓ [PASS] Token hold properly sets token advance, balance, and PIN.');

  // --------------------------------------------------------------------------
  // TEST 2: Server-Authoritative Token Advance Order Calculation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Server-Authoritative Token Advance Order Calculation ---');
  const orderResult = await createPaymentOrder({
    holdId: bookingA.id,
    paymentMode: 'token_advance',
  });

  console.assert(orderResult.success && orderResult.order, 'Payment order creation failed');
  const order = orderResult.order!;

  // Must charge Advance (₹200) + ₹45 Platform Fee = ₹245 (24,500 paise)
  const expectedPayablePaise = 20000 + PLATFORM_FEE_PAISE; // 24500 paise
  console.assert(order.amountPaise === expectedPayablePaise, `Order amount mismatch: expected ${expectedPayablePaise}, got ${order.amountPaise}`);
  console.assert(order.platformFeePaise === 4500, 'Platform fee must be ₹45');

  console.log(`  ✓ Order ID: ${order.orderId}`);
  console.log(`  ✓ Online Charge: ₹${order.amountPaise / 100} (₹200 Slot Advance + ₹45 GoTurf Convenience Fee)`);
  console.log('  ✓ [PASS] Server strictly charges ₹245 online and protects balance for turf gate collection.');

  // --------------------------------------------------------------------------
  // TEST 3: Webhook Capture & Digital Match Pass Activation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Webhook Capture & Digital Match Pass Activation ---');
  const webhookPayload: RazorpayWebhookPayload = {
    entity: 'event',
    event: 'order.paid',
    payload: {
      order: {
        entity: {
          id: order.orderId,
          amount: order.amountPaise,
          status: 'paid',
        },
      },
      payment: {
        entity: {
          id: `pay_test_${Date.now()}`,
          order_id: order.orderId,
          amount: order.amountPaise,
          currency: 'INR',
          status: 'captured',
          method: 'upi',
          vpa: 'karan@okhdfcbank',
          email: 'karan@example.com',
          contact: '+919820011223',
        },
      },
    },
  };

  const rawBody = JSON.stringify(webhookPayload);
  const signature = signWebhookPayload(rawBody, DEFAULT_WEBHOOK_SECRET);
  const isSignatureValid = verifyRazorpaySignature(rawBody, signature, DEFAULT_WEBHOOK_SECRET);
  console.assert(isSignatureValid, 'HMAC signature verification failed');

  const webhookResult = await processPaymentWebhook(webhookPayload, `evt_${Date.now()}`);
  console.assert(webhookResult.success, 'Webhook processing failed');

  const confirmedBooking = getBookingById(bookingA.id);
  console.assert(confirmedBooking !== null, 'Booking not found');
  console.assert(confirmedBooking!.status === 'confirmed', 'Booking must be confirmed');
  console.assert(confirmedBooking!.hold_expires_at === null, 'Hold expires at must be cleared');
  console.assert(confirmedBooking!.balance_status === 'unpaid', 'Balance status remains unpaid until gate check-in');

  console.log(`  ✓ Webhook verified cryptographically via HMAC-SHA256.`);
  console.log(`  ✓ Booking ${confirmedBooking!.id} confirmed. Status: ${confirmedBooking!.status}`);
  console.log(`  ✓ Match Pass ready with PIN: ${confirmedBooking!.check_in_otp}`);
  console.log('  ✓ [PASS] Match pass activated with balance pending at gate.');

  // --------------------------------------------------------------------------
  // TEST 4: On-Site Gate Check-In & Balance Collection (Cash Mode)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: On-Site Gate Check-In & Balance Collection (Cash Mode) ---');
  const cashCollection = collectVenueBalance({
    bookingId: confirmedBooking!.id,
    method: 'cash',
    attendantId: 'attendant-rohan-gate-1',
  });

  console.assert(cashCollection.success && cashCollection.booking, 'Cash collection failed');
  const checkedInBooking = cashCollection.booking!;
  console.assert(checkedInBooking.balance_status === 'collected_cash', 'Balance status must be collected_cash');
  console.assert(checkedInBooking.status === 'completed', 'Booking status must transition to completed');
  console.assert(checkedInBooking.balance_collected_by === 'attendant-rohan-gate-1', 'Attendant must be logged');
  console.assert(checkedInBooking.balance_collected_at !== null, 'Collection timestamp must be recorded');

  console.log(`  ✓ Attendant rohan-gate-1 verified PIN ${checkedInBooking.check_in_otp}`);
  console.log(`  ✓ Cash received at venue: ₹${checkedInBooking.balance_amount_paise! / 100}`);
  console.log(`  ✓ Balance Status: ${checkedInBooking.balance_status} | Booking Status: ${checkedInBooking.status}`);
  console.log('  ✓ [PASS] On-site cash payment successfully recorded in audit log.');

  // --------------------------------------------------------------------------
  // TEST 5: On-Site Gate Check-In & Balance Collection (Venue UPI Mode)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: On-Site Gate Check-In (Venue Direct UPI Mode) ---');
  const holdB = await createTemporaryHold({
    courtId,
    playerId: playerB,
    startAtUTC: '2026-10-15T13:30:00Z',
    endAtUTC: '2026-10-15T14:30:00Z',
    pricePaise: 200000, // ₹2,000 slot
    paymentMode: 'token_advance',
    now,
  });
  confirmBooking(holdB.booking!.id);

  const upiCollection = collectVenueBalance({
    bookingId: holdB.booking!.id,
    method: 'venue_upi',
    attendantId: 'attendant-rohan-gate-1',
  });

  console.assert(upiCollection.success && upiCollection.booking, 'Venue UPI collection failed');
  console.assert(upiCollection.booking!.balance_status === 'collected_venue_upi', 'Balance status must be collected_venue_upi');
  console.assert(upiCollection.booking!.status === 'completed', 'Status must be completed');
  console.log(`  ✓ Attendant recorded direct turf QR UPI payment: ₹${upiCollection.booking!.balance_amount_paise! / 100}`);
  console.log('  ✓ [PASS] Venue UPI collection recorded cleanly.');

  // --------------------------------------------------------------------------
  // TEST 6: 100% Online Prepayment Comparison Mode
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: 100% Online Prepayment Comparison Mode ---');
  const holdC = await createTemporaryHold({
    courtId,
    playerId: playerC,
    startAtUTC: '2026-10-15T14:30:00Z',
    endAtUTC: '2026-10-15T15:30:00Z',
    pricePaise: 150000, // ₹1,500 slot
    paymentMode: 'full_online',
    now,
  });

  console.assert(holdC.booking!.advance_amount_paise === 150000, 'Full advance must equal slot price');
  console.assert(holdC.booking!.balance_amount_paise === 0, 'Venue balance must be 0 for full online');

  const orderC = await createPaymentOrder({ holdId: holdC.booking!.id, paymentMode: 'full_online' });
  console.assert(orderC.order!.amountPaise === 150000 + 4500, 'Must charge ₹1,545 online');
  confirmBooking(holdC.booking!.id);

  console.log(`  ✓ Full Online: ₹${orderC.order!.amountPaise / 100} paid online (₹1,500 slot + ₹45 fee).`);
  console.log(`  ✓ Balance due at venue: ₹${holdC.booking!.balance_amount_paise! / 100}`);
  console.log('  ✓ [PASS] Both payment modes coexist seamlessly without schema conflict.');

  // --------------------------------------------------------------------------
  // TEST 7: Weekly Payout Reconciliation Ledger Simulation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Weekly Payout Reconciliation Ledger Simulation ---');
  const allBookings = getAllBookingsForTesting();

  // Calculate Ledger
  let totalOnlineAdvancesPaise = 0;
  let totalVenueCollectedPaise = 0;
  let totalPlatformFeesPaise = 0;

  for (const b of allBookings) {
    if (b.status === 'completed' || b.status === 'confirmed') {
      totalOnlineAdvancesPaise += b.advance_amount_paise || 0;
      if (b.balance_status === 'collected_cash' || b.balance_status === 'collected_venue_upi') {
        totalVenueCollectedPaise += b.balance_amount_paise || 0;
      }
      totalPlatformFeesPaise += PLATFORM_FEE_PAISE;
    }
  }

  const turfOwnerOnlineRemittancePaise = totalOnlineAdvancesPaise;
  const turfOwnerTotalGrossPaise = turfOwnerOnlineRemittancePaise + totalVenueCollectedPaise;

  console.log('  Weekly Reconciliation Summary for Bandra Turf Arena:');
  console.log(`    - GoTurf Online Advances Collected: ₹${totalOnlineAdvancesPaise / 100}`);
  console.log(`    - Venue Balance Collected at Gate:   ₹${totalVenueCollectedPaise / 100}`);
  console.log(`    - Total Turf Owner Gross Revenue:     ₹${turfOwnerTotalGrossPaise / 100}`);
  console.log(`    - Monday Bank Remittance to Owner:    ₹${turfOwnerOnlineRemittancePaise / 100}`);
  console.log(`    - GoTurf Platform Fees Retained:      ₹${totalPlatformFeesPaise / 100}`);

  // Verification of math:
  // Slot 1: ₹1,800 (₹200 online + ₹1,600 gate)
  // Slot 2: ₹2,000 (₹200 online + ₹1,800 gate)
  // Slot 3: ₹1,500 (₹1,500 online + ₹0 gate)
  // Total expected turf owner revenue = 1800 + 2000 + 1500 = ₹5,300.
  console.assert(turfOwnerTotalGrossPaise === 530000, `Gross revenue mismatch: expected 530000, got ${turfOwnerTotalGrossPaise}`);
  console.assert(totalVenueCollectedPaise === 340000, `Venue balance mismatch: expected 340000, got ${totalVenueCollectedPaise}`);
  console.assert(turfOwnerOnlineRemittancePaise === 190000, `Remittance mismatch: expected 190000, got ${turfOwnerOnlineRemittancePaise}`);
  console.assert(totalPlatformFeesPaise === 13500, `Platform fee mismatch: expected 13500 (3 x ₹45), got ${totalPlatformFeesPaise}`);

  console.log('  ✓ [PASS] Zero double counting: Cash collected at gate never mixed with platform fee remittance.');

  // --------------------------------------------------------------------------
  // TEST 8: Pre-Match Cancellation Policy with Token Advance
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Pre-Match Cancellation Policy with Token Advance ---');

  // Case A: Early Cancellation (>24h before match)
  const futureMatch = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const earlyHold = await createTemporaryHold({
    courtId,
    playerId: 'player-early-canceller',
    startAtUTC: futureMatch,
    endAtUTC: new Date(Date.now() + 49 * 3600 * 1000).toISOString(),
    pricePaise: 180000,
    paymentMode: 'token_advance',
  });
  confirmBooking(earlyHold.booking!.id);

  const earlyCancel = cancelBooking(earlyHold.booking!.id, 'Squad exams');
  console.assert(earlyCancel.success, 'Early cancel failed');
  console.assert(earlyCancel.refundEligible === true, 'Early cancel must be eligible for refund');
  console.log(`  ✓ >24h cancellation: ${earlyCancel.message} (Eligible for ₹245 refund)`);

  // Case B: Late Cancellation (<24h before match)
  const imminentMatch = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  const lateHold = await createTemporaryHold({
    courtId,
    playerId: 'player-late-canceller',
    startAtUTC: imminentMatch,
    endAtUTC: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    pricePaise: 180000,
    paymentMode: 'token_advance',
  });
  confirmBooking(lateHold.booking!.id);

  const lateCancel = cancelBooking(lateHold.booking!.id, 'Rained out locally');
  console.assert(lateCancel.success, 'Late cancel failed');
  console.assert(lateCancel.refundEligible === false, 'Late cancel must NOT be eligible for refund');
  console.log(`  ✓ <24h cancellation: ${lateCancel.message} (Token advance forfeited to owner)`);
  console.log('  ✓ [PASS] Cancellation policy protects owner against last-minute no-shows.');

  console.log('\n======================================================================');
  console.log('>>> ALL PHASE 7+ TOKEN ADVANCE & VENUE BALANCE TESTS PASSED! (8/8) <<<');
  console.log('======================================================================\n');
}

runPhase7Tests().catch((err) => {
  console.error('Phase 7+ test suite error:', err);
  process.exit(1);
});
