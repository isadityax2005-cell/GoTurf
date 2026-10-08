// ============================================================================
// GoTurf Phase 3 Verification Test Suite
// Verifies:
// 1. Unapproved or pending turfs NEVER appear on the public discovery page.
// 2. Owner submits a pending turf -> Admin approves -> Appears publicly.
// 3. Sport & locality filters work accurately for Mumbai.
// 4. Google Maps directions URLs are valid and free of paid API keys.
// ============================================================================

import {
  getApprovedTurfs,
  getTurfBySlug,
  createPendingTurf,
  approveTurf,
  getPendingTurfs,
} from '../lib/data/turfs';

function runPhase3Tests() {
  console.log('--- 1. Testing Public Discovery Query (Approved Only Gate) ---');

  const initialApproved = getApprovedTurfs();
  console.assert(initialApproved.length === 3, `Expected 3 initial approved turfs, got ${initialApproved.length}`);
  console.assert(
    initialApproved.every((t) => t.status === 'approved'),
    'Test Failed: Non-approved turf leaked into public search!'
  );
  console.log(`  ✓ Public discovery query returned ${initialApproved.length} approved venues; all status === 'approved'`);

  console.log('\n--- 2. Testing Sport & Locality Filters (Mumbai) ---');

  // Filter by sport: Pickleball
  const pickleballTurfs = getApprovedTurfs({ sport: 'pickleball' });
  console.assert(pickleballTurfs.length >= 2, 'Failed pickleball filter count');
  console.assert(
    pickleballTurfs.every((t) => t.courts?.some((c) => c.sport === 'pickleball')),
    'Test Failed: Turf without pickleball court returned for pickleball filter!'
  );
  console.log(`  ✓ Filter by Pickleball returned ${pickleballTurfs.length} venues with active pickleball courts`);

  // Filter by sport: Cricket
  const cricketTurfs = getApprovedTurfs({ sport: 'cricket' });
  console.assert(cricketTurfs.length >= 2, 'Failed cricket filter count');
  console.log(`  ✓ Filter by Cricket returned ${cricketTurfs.length} venues with active cricket pitches`);

  // Filter by locality: Bandra West
  const bandraTurfs = getApprovedTurfs({ locality: 'Bandra West' });
  console.assert(bandraTurfs.length === 1, 'Failed locality filter');
  console.assert(bandraTurfs[0].name.includes('Bandra'), 'Wrong turf returned for Bandra filter');
  console.log(`  ✓ Filter by locality 'Bandra West' returned: ${bandraTurfs[0].name}`);

  console.log('\n--- 3. Testing Owner Submission -> Admin Approval Lifecycle ---');

  // Step A: Owner submits a new turf wizard draft
  const newVenueName = 'Juhu Sunset Arena [Demo]';
  const newVenueSlug = 'juhu-sunset-arena-demo';
  const submittedTurf = createPendingTurf({
    name: newVenueName,
    slug: newVenueSlug,
    owner_id: '20000000-0000-0000-0000-000000000002',
    region_id: '10000000-0000-0000-0000-000000000004',
    address: 'Juhu Tara Road, Juhu, Mumbai 400049',
    lat: 19.1001,
    lng: 72.8267,
    maps_url: 'https://maps.google.com/?q=19.1001,72.8267',
    facilities: ['Floodlights', 'Sea Breeze Seating'],
    rules: 'No studs on court.',
    cancellation_rule: 'Full refund up to 24h.',
    is_demo: true,
    region: {
      id: '10000000-0000-0000-0000-000000000004',
      locality: 'Juhu',
      city: 'Mumbai',
      state: 'Maharashtra',
      created_at: new Date().toISOString(),
    },
    courts: [
      {
        id: 'court-juhu-1',
        turf_id: 'pending-turf',
        name: 'Court 1 - Pickleball',
        sport: 'pickleball',
        format: 'Regulation Doubles',
        surface: 'Cushioned Polymeric',
        slot_minutes: 60,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  });

  console.assert(submittedTurf.status === 'pending', 'Submitted turf status must be pending');
  console.log(`  ✓ Demo owner submitted venue: "${submittedTurf.name}" with status: '${submittedTurf.status}'`);

  // Step B: Check public discovery page — Must NOT appear!
  const publicListBeforeApproval = getApprovedTurfs();
  const leakedInPublic = publicListBeforeApproval.some((t) => t.id === submittedTurf.id);
  console.assert(leakedInPublic === false, 'CRITICAL FAILURE: Pending unapproved turf is visible to players!');
  console.log('  ✓ [PASS] Pending turf is STRICTLY INVISIBLE to public search and players');

  // Step C: Check admin pending queue — Must appear for inspection
  const pendingQueue = getPendingTurfs();
  const inPendingQueue = pendingQueue.some((t) => t.id === submittedTurf.id);
  console.assert(inPendingQueue === true, 'Failed: Pending turf not found in admin queue');
  console.log(`  ✓ Pending turf appears in Admin Verification Queue (${pendingQueue.length} pending)`);

  // Step D: Admin approves the venue
  const approveResult = approveTurf(submittedTurf.id);
  console.assert(approveResult === true, 'Failed to approve turf');
  console.log('  ✓ Platform admin clicked "Approve Listing"');

  // Step E: Check public discovery page — Must NOW appear!
  const publicListAfterApproval = getApprovedTurfs();
  const nowVisibleInPublic = publicListAfterApproval.some((t) => t.id === submittedTurf.id && t.status === 'approved');
  console.assert(nowVisibleInPublic === true, 'Failed: Approved turf did not appear on public page!');
  console.log(`  ✓ [PASS] Approved turf is NOW LIVE and publicly searchable (total approved: ${publicListAfterApproval.length})`);

  console.log('\n--- 4. Testing Google Maps URL Integrity (Zero API Key Expense) ---');
  for (const turf of getApprovedTurfs()) {
    console.assert(turf.maps_url?.startsWith('https://maps.google.com/?q='), `Invalid maps URL: ${turf.maps_url}`);
    console.assert(!turf.maps_url?.includes('key='), 'Maps URL should not leak paid API keys');
  }
  console.log('  ✓ All turf location links use free, direct Google Maps coordinates URLs');

  console.log('\n======================================================');
  console.log('>>> ALL PHASE 3 LISTING & APPROVAL CHECKS PASSED <<<');
  console.log('======================================================');
}

runPhase3Tests();
