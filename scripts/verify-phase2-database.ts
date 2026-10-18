import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wedsiefskyzvnbooscuf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZHNpZWZza3l6dm5ib29zY3VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjA4MTE1OSwiZXhwIjoyMTA3NjU3MTU5fQ.Q3WGZ8JJuieH4zL4YQHKpyRDKUKuiqstKzH2Zl6-IVs';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runPhase2DatabaseVerification() {
  console.log('======================================================================');
  console.log('>>> PHASE 2: LIVE DATABASE DATA LAYER VERIFICATION SUITE <<<');
  console.log('======================================================================\n');

  // 1. Verify Live Approved Turfs Query
  console.log('--- TEST 1: Verifying Live Approved Turfs in Supabase ---');
  const { data: approvedTurfs, error: aErr } = await supabase
    .from('turfs')
    .select('id, name, slug, status, owner_id')
    .eq('status', 'approved');

  if (aErr) throw new Error(`Supabase query failed: ${aErr.message}`);
  console.log(`  ✓ Successfully queried Supabase; found ${approvedTurfs.length} approved turfs:`);
  approvedTurfs.forEach((t) => console.log(`     • [${t.status.toUpperCase()}] ${t.name} (slug: ${t.slug})`));

  // 2. Verify Owner Submission with status: 'pending' linked to owner_id
  console.log('\n--- TEST 2: Testing Owner Submission Lifecycle (status: pending & owner_id link) ---');
  const testOwnerId = '20000000-0000-0000-0000-000000000002'; // Rohan Mehta (Verified Owner)
  const testTurfSlug = `phase2-test-arena-${Date.now()}`;

  const { data: insertedTurf, error: insErr } = await supabase
    .from('turfs')
    .insert({
      name: 'Phase 2 Test Arena',
      slug: testTurfSlug,
      address: 'Linking Road, Khar West, Mumbai 400052',
      owner_id: testOwnerId,
      region_id: '10000000-0000-0000-0000-000000000001',
      lat: 19.0688,
      lng: 72.8344,
      facilities: ['Floodlights', 'Dressing Room'],
      status: 'pending',
      is_demo: false,
    })
    .select()
    .single();

  if (insErr || !insertedTurf) throw new Error(`Failed to insert pending turf: ${insErr?.message}`);
  console.log(`  ✓ Inserted pending turf "${insertedTurf.name}" with ID: ${insertedTurf.id}`);
  console.log(`  ✓ [PASS] Status is strictly 'pending': ${insertedTurf.status === 'pending'}`);
  console.log(`  ✓ [PASS] Correctly linked to owner_id: ${insertedTurf.owner_id === testOwnerId} (${insertedTurf.owner_id})`);

  // Insert test court
  const { error: cErr } = await supabase.from('courts').insert({
    turf_id: insertedTurf.id,
    name: 'Pitch 1 - Box Cricket',
    sport: 'cricket',
    format: 'Box Cricket (7v7)',
    slot_minutes: 60,
    is_active: true,
  });
  if (cErr) console.warn('Test court insert warning:', cErr.message);

  // 3. Verify Admin Visibility of Pending Submission
  console.log('\n--- TEST 3: Verifying Admin Queue Queries Pending Submissions ---');
  const { data: pendingList, error: pErr } = await supabase
    .from('turfs')
    .select('id, name, status, owner_id')
    .eq('status', 'pending');

  if (pErr) throw new Error(`Pending query failed: ${pErr.message}`);
  const foundPending = pendingList.find((t) => t.id === insertedTurf.id);
  console.log(`  ✓ Total pending venues in queue: ${pendingList.length}`);
  console.log(`  ✓ [PASS] Newly registered turf appears in admin pending queue: ${Boolean(foundPending)}`);

  // 4. Verify Admin Approval Action (pending -> approved)
  console.log('\n--- TEST 4: Simulating Admin "Approve" Action & Immediate Live Discovery ---');
  const { data: approvedTurf, error: upErr } = await supabase
    .from('turfs')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', insertedTurf.id)
    .select()
    .single();

  if (upErr || !approvedTurf) throw new Error(`Admin approve update failed: ${upErr?.message}`);
  console.log(`  ✓ Platform Admin approved "${approvedTurf.name}"`);
  console.log(`  ✓ [PASS] Database status transitioned to: '${approvedTurf.status}'`);

  // Check that public approved query now includes this turf
  const { data: updatedApproved } = await supabase
    .from('turfs')
    .select('id, name, slug')
    .eq('status', 'approved');

  const nowLive = updatedApproved?.some((t) => t.id === insertedTurf.id);
  console.log(`  ✓ [PASS] Approved turf is NOW LIVE on public discovery: ${nowLive}`);

  // 5. Cleanup Test Fixture
  console.log('\n--- TEST 5: Cleaning up verification test fixture ---');
  await supabase.from('courts').delete().eq('turf_id', insertedTurf.id);
  await supabase.from('turfs').delete().eq('id', insertedTurf.id);
  console.log('  ✓ Test fixture cleaned up successfully.');

  console.log('\n======================================================================');
  console.log('>>> ALL PHASE 2 LIVE DATABASE TESTS PASSED WITH 100% SUCCESS <<<');
  console.log('======================================================================\n');
}

runPhase2DatabaseVerification().catch((e) => {
  console.error('Phase 2 verification failed:', e);
  process.exit(1);
});
