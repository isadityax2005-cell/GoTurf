import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = getServiceRoleClient();
    let currentUserId: string | null = null;
    let currentUserRole: string | null = null;

    try {
      const authSupabase = await createClient();
      const {
        data: { user },
      } = await authSupabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        const { data: profile } = await (supabaseAdmin.from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        currentUserRole = profile?.role || 'owner';
      }
    } catch (e) {
      // Session extraction fallback
    }

    // Build query based on user role
    let query = (supabaseAdmin.from('turfs') as any).select(`
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

    // If an owner is logged in, show only their turfs
    if (currentUserId && currentUserRole === 'owner') {
      query = query.eq('owner_id', currentUserId);
    }

    const { data: turfs, error: tErr } = await query;

    if (tErr) {
      console.error('my-turfs query error:', tErr);
      return NextResponse.json({ success: false, error: tErr.message }, { status: 500 });
    }

    // Fetch courts, photos, and regions
    const [{ data: courts }, { data: photos }, { data: regions }] = await Promise.all([
      (supabaseAdmin.from('courts') as any).select('*'),
      (supabaseAdmin.from('turf_photos') as any).select('*').order('sort_order', { ascending: true }),
      (supabaseAdmin.from('regions') as any).select('*'),
    ]);

    const regionMap = new Map<string, string>((regions || []).map((r: any) => [r.id, r.locality]));

    const enriched = (turfs || []).map((t: any) => {
      const turfCourts = (courts || []).filter((c: any) => c.turf_id === t.id);
      const turfPhotos = (photos || []).filter((p: any) => p.turf_id === t.id);
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
  } catch (err: any) {
    console.error('my-turfs API handler error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
