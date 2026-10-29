import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';
import type { Turf, Court, TurfPhoto, Region } from '@/types/database';

export async function GET() {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    if (identity.role !== 'owner' && identity.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Owner access required.' }, { status: 403 });
    }

    const supabaseAdmin = getServiceRoleClient();
    const currentUserId = identity.user.id;
    const currentUserRole = identity.role;

    // Build query based on user role
    let query = supabaseAdmin.from('turfs').select(`
      id,
      name,
      slug,
      address,
      facilities,
      status,
      is_demo,
      created_at,
      owner_id,
      region_id
    `).order('created_at', { ascending: false });

    // Owners only see their own turfs; only admins may see all listings.
    if (currentUserRole === 'owner') {
      query = query.eq('owner_id', currentUserId);
    }

    const { data: turfsData, error: tErr } = await query;

    if (tErr) {
      console.error('my-turfs query error:', tErr);
      return NextResponse.json({ success: false, error: tErr.message }, { status: 500 });
    }

    const turfs = (turfsData || []) as Turf[];

    // Fetch courts, photos, and regions
    const [{ data: courtsData }, { data: photosData }, { data: regionsData }] = await Promise.all([
      supabaseAdmin.from('courts').select('*'),
      supabaseAdmin.from('turf_photos').select('*').order('sort_order', { ascending: true }),
      supabaseAdmin.from('regions').select('*'),
    ]);

    const courts = (courtsData || []) as Court[];
    const photos = (photosData || []) as TurfPhoto[];
    const regions = (regionsData || []) as Region[];

    const regionMap = new Map<string, string>(regions.map((r) => [r.id, r.locality]));

    const enriched = turfs.map((t) => {
      const turfCourts = courts.filter((c) => c.turf_id === t.id);
      const turfPhotos = photos.filter((p) => p.turf_id === t.id);
      const locality = regionMap.get(t.region_id) || 'Mumbai';

      return {
        ...t,
        locality,
        courts: turfCourts,
        photos: turfPhotos,
      };
    });

    return NextResponse.json({
      success: true,
      turfs: enriched,
    });
  } catch (err: unknown) {
    console.error('my-turfs API handler error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch owner turfs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
