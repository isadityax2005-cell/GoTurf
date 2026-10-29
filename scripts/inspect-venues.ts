import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspect() {
  console.log('=== INSPECTING LIVE SUPABASE TURFS ===');

  const { data: allTurfs, error: turfsErr } = await supabase
    .from('turfs')
    .select('*');

  if (turfsErr) {
    console.error('Error fetching turfs:', turfsErr);
    return;
  }

  console.log(`Total turfs in database: ${allTurfs?.length || 0}`);

  for (const turf of allTurfs || []) {
    console.log('\n----------------------------------------');
    console.log(`Turf ID:    ${turf.id}`);
    console.log(`Name:       ${turf.name}`);
    console.log(`Slug:       ${turf.slug}`);
    console.log(`Status:     ${turf.status}`);
    console.log(`Is Demo:    ${turf.is_demo}`);
    console.log(`Address:    ${turf.address}`);
    console.log(`Owner ID:   ${turf.owner_id}`);
    console.log(`Created At: ${turf.created_at}`);

    // Owner profile
    const { data: owner } = await supabase
      .from('profiles')
      .select('id, name, email, role, phone')
      .eq('id', turf.owner_id)
      .maybeSingle();
    console.log('Owner:', owner || 'No profile record found');

    // Courts
    const { data: courts } = await supabase
      .from('courts')
      .select('id, name, sport, format, surface, slot_minutes, is_active')
      .eq('turf_id', turf.id);
    console.log(`Courts (${courts?.length || 0}):`, courts);

    // Photos
    const { data: photos } = await supabase
      .from('turf_photos')
      .select('id, path, caption, sort_order')
      .eq('turf_id', turf.id);
    console.log(`Photos (${photos?.length || 0}):`, photos);

    // Bookings on these courts
    const courtIds = (courts || []).map((c) => c.id);
    if (courtIds.length > 0) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, court_id, player_id, status, price_paise, payment_mode, created_at')
        .in('court_id', courtIds);
      console.log(`Bookings (${bookings?.length || 0}):`, bookings);

      // Payments
      const bookingIds = (bookings || []).map((b) => b.id);
      if (bookingIds.length > 0) {
        const { data: payments } = await supabase
          .from('payments')
          .select('id, booking_id, amount_paise, status, gateway_payment_id, created_at')
          .in('booking_id', bookingIds);
        console.log(`Payments (${payments?.length || 0}):`, payments);
      }
    } else {
      console.log('Bookings: None (no courts registered in DB)');
    }
  }

  // Also check total counts across tables
  console.log('\n=== GLOBAL COUNTS IN DATABASE ===');
  const [{ count: profileCount }, { count: bookingCount }, { count: paymentCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true }),
  ]);
  console.log(`Total Profiles: ${profileCount}`);
  console.log(`Total Bookings: ${bookingCount}`);
  console.log(`Total Payments: ${paymentCount}`);
}

inspect().catch(console.error);
