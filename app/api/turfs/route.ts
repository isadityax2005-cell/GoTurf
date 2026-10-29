import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import { DEMO_TURFS } from '@/lib/data/turfs';
import type { Turf, Region, Court, TurfPhoto } from '@/types/database';

export async function GET(request?: Request) {
  const url = request ? new URL(request.url) : new URL('http://localhost:3000/api/turfs');
  const requestedMode = url.searchParams.get('mode');

  if (
    requestedMode === 'demo' ||
    (requestedMode !== 'live' &&
      (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.GOTURF_DEMO_ONLY === 'true'))
  ) {
    const demoTurfs = DEMO_TURFS.filter((t) => t.status === 'approved');
    return NextResponse.json({
      success: true,
      mode: 'demo',
      turfs: demoTurfs,
      total: demoTurfs.length,
    });
  }

  try {
    const supabaseAdmin = getServiceRoleClient();

    // 1. Fetch strictly approved non-demo real owner listings from Supabase
    const { data: dbTurfsData, error: tErr } = await supabaseAdmin
      .from('turfs')
      .select('*')
      .eq('status', 'approved')
      .eq('is_demo', false)
      .order('created_at', { ascending: false });

    const demoCount = DEMO_TURFS.filter((t) => t.status === 'approved').length;

    if (tErr) {
      console.warn('Supabase turfs query warning:', tErr);
      return NextResponse.json({
        success: true,
        mode: 'live',
        turfs: [],
        total: 0,
        demoCount,
      });
    }

    const dbTurfs = (dbTurfsData || []) as Turf[];
    if (dbTurfs.length === 0) {
      return NextResponse.json({
        success: true,
        mode: 'live',
        turfs: [],
        total: 0,
        demoCount,
      });
    }

    // 2. Fetch regions, courts, photos for real listings
    const [{ data: regionsData }, { data: courtsData }, { data: photosData }] = await Promise.all([
      supabaseAdmin.from('regions').select('*'),
      supabaseAdmin.from('courts').select('*'),
      supabaseAdmin.from('turf_photos').select('*'),
    ]);

    const regions = (regionsData || []) as Region[];
    const courts = (courtsData || []) as Court[];
    const photos = (photosData || []) as TurfPhoto[];

    const regionMap = new Map<string, Region>(regions.map((r) => [r.id, r]));

    const enrichedDbTurfs: Turf[] = dbTurfs.map((t) => {
      const region = regionMap.get(t.region_id) || {
        id: t.region_id,
        locality: 'Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        created_at: t.created_at,
      };

      const turfCourts = courts.filter((c) => c.turf_id === t.id);
      const turfPhotos = photos.filter((p) => p.turf_id === t.id);

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

    return NextResponse.json({
      success: true,
      mode: 'live',
      turfs: enrichedDbTurfs,
      total: enrichedDbTurfs.length,
      demoCount,
    });
  } catch (err: unknown) {
    console.error('API /turfs handler error:', err);
    return NextResponse.json({
      success: true,
      mode: 'live',
      turfs: [],
      total: 0,
      demoCount: DEMO_TURFS.filter((t) => t.status === 'approved').length,
    });
  }
}
