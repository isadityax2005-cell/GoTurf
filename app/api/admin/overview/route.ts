import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getServiceRoleClient();

    // 1. Fetch all profiles
    const { data: profiles, error: pErr } = await (supabaseAdmin.from('profiles') as any)
      .select('id, name, email, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (pErr) {
      console.error('Admin overview profiles error:', pErr);
    }

    const owners = (profiles || []).filter((p: any) => p.role === 'owner' || p.role === 'admin');

    // 2. Fetch all turfs
    const { data: turfs, error: tErr } = await (supabaseAdmin.from('turfs') as any)
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

    // 3. Fetch all photos
    const { data: photos } = await (supabaseAdmin.from('turf_photos') as any)
      .select('id, turf_id, path, caption, sort_order')
      .order('sort_order', { ascending: true });

    // 4. Fetch all courts
    const { data: courts } = await (supabaseAdmin.from('courts') as any)
      .select('id, turf_id, name, sport, format, slot_minutes, is_active');

    // 5. Fetch all regions for friendly locality names
    const { data: regions } = await (supabaseAdmin.from('regions') as any)
      .select('id, locality, city');

    const regionMap = new Map<string, string>((regions || []).map((r: any) => [r.id, r.locality]));
    const profileMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));

    // Map turfs with owner, photos, court info, and locality
    const enrichedTurfs = (turfs || []).map((t: any) => {
      const owner = profileMap.get(t.owner_id);
      const turfPhotos = (photos || []).filter((p: any) => p.turf_id === t.id);
      const turfCourts = (courts || []).filter((c: any) => c.turf_id === t.id);
      const locality = regionMap.get(t.region_id) || 'Mumbai';

      return {
        ...t,
        locality,
        ownerName: owner?.name || 'Partner Owner',
        ownerEmail: owner?.email || '',
        ownerPhone: owner?.phone || '',
        photos: turfPhotos.map((p: any) => p.path),
        courts: turfCourts,
      };
    });

    const pendingTurfs = enrichedTurfs.filter((t: any) => t.status === 'pending');
    const approvedTurfs = enrichedTurfs.filter((t: any) => t.status === 'approved');

    // Attach turf count to owners
    const ownersWithTurfs = owners.map((o: any) => {
      const ownerTurfs = enrichedTurfs.filter((t: any) => t.owner_id === o.id);
      return {
        ...o,
        turfCount: ownerTurfs.length,
        turfs: ownerTurfs.map((t: any) => ({ id: t.id, name: t.name, status: t.status })),
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalTurfs: (turfs || []).length,
        pendingCount: pendingTurfs.length,
        approvedCount: approvedTurfs.length,
        totalOwners: owners.length,
        totalUsers: (profiles || []).length,
      },
      pendingTurfs,
      approvedTurfs,
      owners: ownersWithTurfs,
    });
  } catch (err: any) {
    console.error('Admin overview handler error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
