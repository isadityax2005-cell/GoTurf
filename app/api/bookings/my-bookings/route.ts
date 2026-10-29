import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';
import type { Booking, Court, Turf, Region } from '@/types/database';

export async function GET() {
  try {
    const identity = await getRequestIdentity();
    if (!identity) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        bookings: [],
      });
    }

    const currentUserId = identity.user.id;
    const supabase = getServiceRoleClient();

    // Strictly scoped to the authenticated user's ID
    const { data: bookingsData, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('player_id', currentUserId)
      .order('created_at', { ascending: false });

    if (bErr) {
      console.error('Failed to query player bookings:', bErr);
      return NextResponse.json({ success: false, error: bErr.message }, { status: 500 });
    }

    const bookings = (bookingsData || []) as Booking[];

    if (bookings.length === 0) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        bookings: [],
      });
    }

    // Fetch related courts, turfs, and regions
    const courtIds = Array.from(new Set(bookings.map((b) => b.court_id).filter(Boolean)));
    const { data: courtsData } = await supabase
      .from('courts')
      .select('id, name, sport, format, turf_id')
      .in('id', courtIds);

    const courts = (courtsData || []) as Court[];
    const turfIds = Array.from(new Set(courts.map((c) => c.turf_id).filter(Boolean)));

    const [{ data: turfsData }, { data: regionsData }] = await Promise.all([
      supabase.from('turfs').select('id, name, slug, address, region_id').in('id', turfIds),
      supabase.from('regions').select('id, locality'),
    ]);

    const turfs = (turfsData || []) as Turf[];
    const regions = (regionsData || []) as Region[];

    const courtMap = new Map<string, Court>(courts.map((c) => [c.id, c]));
    const turfMap = new Map<string, Turf>(turfs.map((t) => [t.id, t]));
    const regionMap = new Map<string, string>(regions.map((r) => [r.id, r.locality]));

    const enriched = bookings.map((b) => {
      const court = courtMap.get(b.court_id);
      const turf = court ? turfMap.get(court.turf_id) : undefined;
      const locality = turf ? regionMap.get(turf.region_id) || 'Mumbai' : 'Mumbai';

      return {
        id: b.id,
        courtId: b.court_id,
        turfName: turf?.name || 'Sports Venue',
        turfSlug: turf?.slug || '',
        courtName: court?.name || 'Court',
        sport: court?.sport || 'cricket',
        locality,
        startAt: b.start_at,
        endAt: b.end_at,
        status: b.status,
        pricePaise: b.price_paise,
        advanceAmountPaise: b.advance_amount_paise,
        balanceAmountPaise: b.balance_amount_paise,
        checkInOtp: b.check_in_otp,
        createdAt: b.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      bookings: enriched,
    });
  } catch (err: unknown) {
    console.error('my-bookings handler error:', err);
    const message = err instanceof Error ? err.message : 'Failed to retrieve bookings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
