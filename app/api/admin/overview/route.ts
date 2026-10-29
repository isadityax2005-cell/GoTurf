import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';
import type { Profile, Turf, TurfPhoto, Court, Region, Booking, AuditLog } from '@/types/database';

export async function GET() {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    if (identity.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

    const supabaseAdmin = getServiceRoleClient();

    // 1. Fetch all profiles
    const { data: profilesData, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (pErr) {
      console.error('Admin overview profiles error:', pErr);
    }

    const profiles = (profilesData || []) as Profile[];
    const owners = profiles.filter((p) => p.role === 'owner' || p.role === 'admin');

    // 2. Fetch all turfs
    const { data: turfsData, error: tErr } = await supabaseAdmin
      .from('turfs')
      .select(`
        id,
        name,
        slug,
        address,
        lat,
        lng,
        facilities,
        status,
        is_demo,
        created_at,
        owner_id,
        region_id
      `)
      .order('created_at', { ascending: false });

    if (tErr) {
      console.error('Admin overview turfs error:', tErr);
    }

    const turfs = (turfsData || []) as Turf[];

    // 3. Fetch all photos
    const { data: photosData } = await supabaseAdmin
      .from('turf_photos')
      .select('id, turf_id, path, caption, sort_order')
      .order('sort_order', { ascending: true });

    const photos = (photosData || []) as TurfPhoto[];

    // 4. Fetch all courts
    const { data: courtsData } = await supabaseAdmin
      .from('courts')
      .select('id, turf_id, name, sport, format, slot_minutes, is_active');

    const courts = (courtsData || []) as Court[];

    // 5. Fetch all regions for friendly locality names
    const { data: regionsData } = await supabaseAdmin
      .from('regions')
      .select('id, locality, city');

    const regions = (regionsData || []) as Region[];

    const regionMap = new Map<string, string>(regions.map((r) => [r.id, r.locality]));
    const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]));
    const courtMap = new Map<string, Court>(courts.map((c) => [c.id, c]));
    const turfMap = new Map<string, Turf>(turfs.map((t) => [t.id, t]));

    // Map turfs with owner, photos, court info, and locality
    const enrichedTurfs = turfs.map((t) => {
      const owner = t.owner_id ? profileMap.get(t.owner_id) : undefined;
      const turfPhotos = photos.filter((p) => p.turf_id === t.id);
      const turfCourts = courts.filter((c) => c.turf_id === t.id);
      const locality = regionMap.get(t.region_id) || 'Mumbai';

      return {
        ...t,
        locality,
        ownerName: owner?.name || 'Partner Owner',
        ownerEmail: owner?.email || '',
        ownerPhone: owner?.phone || '',
        photos: turfPhotos.map((p) => p.path),
        courts: turfCourts,
      };
    });

    const pendingTurfs = enrichedTurfs.filter((t) => t.status === 'pending');
    const approvedTurfs = enrichedTurfs.filter((t) => t.status === 'approved');

    // Attach turf count to owners
    const ownersWithTurfs = owners.map((o) => {
      const ownerTurfs = enrichedTurfs.filter((t) => t.owner_id === o.id);
      return {
        ...o,
        turfCount: ownerTurfs.length,
        turfs: ownerTurfs.map((t) => ({ id: t.id, name: t.name, status: t.status })),
      };
    });

    // 6. Fetch recent bookings for admin oversight
    const { data: bookingsData } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    const bookings = (bookingsData || []) as Booking[];

    const enrichedBookings = bookings.map((b) => {
      const court = courtMap.get(b.court_id);
      const turf = court ? turfMap.get(court.turf_id) : undefined;
      const player = b.player_id ? profileMap.get(b.player_id) : undefined;

      return {
        id: b.id,
        turfName: turf?.name || 'Sports Venue',
        courtName: court?.name || 'Court',
        playerName: player?.name || 'Player',
        playerEmail: player?.email || '',
        playerPhone: player?.phone || '',
        status: b.status,
        pricePaise: b.price_paise,
        advanceAmountPaise: b.advance_amount_paise,
        balanceAmountPaise: b.balance_amount_paise,
        checkInOtp: b.check_in_otp,
        createdAt: b.created_at,
        startAt: b.start_at,
        endAt: b.end_at,
      };
    });

    // 7. Fetch recent audit logs
    const { data: auditData } = await supabaseAdmin
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    const auditLogs = (auditData || []) as AuditLog[];

    return NextResponse.json({
      success: true,
      stats: {
        totalTurfs: turfs.length,
        pendingCount: pendingTurfs.length,
        approvedCount: approvedTurfs.length,
        totalOwners: owners.length,
        totalUsers: profiles.length,
        totalBookings: bookings.length,
      },
      pendingTurfs,
      approvedTurfs,
      owners: ownersWithTurfs,
      bookings: enrichedBookings,
      auditLogs,
    });
  } catch (err: unknown) {
    console.error('Admin overview handler error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load admin overview';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
