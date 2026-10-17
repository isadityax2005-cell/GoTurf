import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { DEMO_TURFS } from '@/lib/data/turfs';
import type { Turf } from '@/types/database';

export async function GET() {
  try {
    const supabaseAdmin = getServiceRoleClient();

    // 1. Fetch all approved turfs from Supabase
    const { data: dbTurfs, error: tErr } = await (supabaseAdmin.from('turfs') as any)
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (tErr) {
      console.warn('Supabase turfs query warning, falling back to demo turfs:', tErr);
      return NextResponse.json({ success: true, turfs: DEMO_TURFS });
    }

    // 2. Fetch regions, courts, photos
    const [{ data: regions }, { data: courts }, { data: photos }] = await Promise.all([
      (supabaseAdmin.from('regions') as any).select('*'),
      (supabaseAdmin.from('courts') as any).select('*'),
      (supabaseAdmin.from('turf_photos') as any).select('*'),
    ]);

    const regionMap = new Map((regions || []).map((r: any) => [r.id, r]));

    const enrichedDbTurfs: Turf[] = (dbTurfs || []).map((t: any) => {
      const region = regionMap.get(t.region_id) || {
        id: t.region_id,
        locality: 'Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        created_at: t.created_at,
      };

      const turfCourts = (courts || []).filter((c: any) => c.turf_id === t.id);
      const turfPhotos = (photos || []).filter((p: any) => p.turf_id === t.id);

      return {
        ...t,
        region,
        courts: turfCourts.length > 0 ? turfCourts : [
          {
            id: `court-${t.id}-1`,
            turf_id: t.id,
            name: 'Main Arena',
            sport: 'cricket' as const,
            format: 'Box Cricket',
            surface: 'Artificial Grass',
            slot_minutes: 60,
            is_active: true,
            created_at: t.created_at,
            updated_at: t.updated_at,
          }
        ],
        photos: turfPhotos,
      };
    });

    // Merge with DEMO_TURFS (avoiding duplicate IDs)
    const dbTurfIds = new Set(enrichedDbTurfs.map((t) => t.id));
    const combinedTurfs: Turf[] = [
      ...enrichedDbTurfs,
      ...DEMO_TURFS.filter((demo) => !dbTurfIds.has(demo.id)),
    ];

    return NextResponse.json({
      success: true,
      turfs: combinedTurfs,
    });
  } catch (err: any) {
    console.error('API /turfs handler error:', err);
    return NextResponse.json({ success: true, turfs: DEMO_TURFS });
  }
}
