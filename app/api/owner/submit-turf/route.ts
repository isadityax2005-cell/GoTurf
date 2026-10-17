import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      locality,
      address,
      lat,
      lng,
      facilities,
      courtName,
      courtSport,
      slotMinutes,
      courtFormat,
      photos,
      contactNumber,
      ownerId,
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: 'Turf name and address are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceRoleClient();

    // 1. Resolve owner ID (fallback to pre-seeded owner or first found admin/owner if not specified)
    let finalOwnerId = ownerId;
    if (!finalOwnerId) {
      const { data: firstOwner } = await (supabaseAdmin.from('profiles') as any)
        .select('id')
        .eq('role', 'owner')
        .limit(1)
        .single();
      finalOwnerId = firstOwner?.id || '20000000-0000-0000-0000-000000000002';
    }

    // 2. Resolve or find Region ID
    const { data: regions } = await (supabaseAdmin.from('regions') as any)
      .select('id, locality')
      .ilike('locality', `%${locality || 'Bandra'}%`)
      .limit(1);

    const regionId = regions && regions.length > 0 
      ? regions[0].id 
      : '10000000-0000-0000-0000-000000000001';

    // 3. Generate clean unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // 4. Insert Turf
    const { data: turf, error: turfError } = await (supabaseAdmin.from('turfs') as any)
      .insert({
        name,
        slug,
        address,
        owner_id: finalOwnerId,
        region_id: regionId,
        lat: parseFloat(lat) || 19.0596,
        lng: parseFloat(lng) || 72.8295,
        maps_url: `https://maps.google.com/?q=${lat || 19.0596},${lng || 72.8295}`,
        facilities: Array.isArray(facilities) && facilities.length > 0 ? facilities : ['Floodlights', 'Drinking Water'],
        status: 'pending',
        is_demo: false,
      })
      .select()
      .single();

    if (turfError || !turf) {
      console.error('Turf insert error:', turfError);
      return NextResponse.json(
        { success: false, error: turfError?.message || 'Failed to insert turf' },
        { status: 500 }
      );
    }

    // 5. Insert Court
    const { error: courtError } = await (supabaseAdmin.from('courts') as any).insert({
      turf_id: turf.id,
      name: courtName || 'Main Arena 1',
      sport: courtSport || 'cricket',
      format: courtFormat || 'Box Cricket',
      surface: 'Artificial Grass',
      slot_minutes: parseInt(slotMinutes, 10) || 60,
      is_active: true,
    });

    if (courtError) {
      console.warn('Court insert warning:', courtError);
    }

    // 6. Insert Photos
    if (Array.isArray(photos) && photos.length > 0) {
      const photoRows = photos.map((url: string, index: number) => ({
        turf_id: turf.id,
        path: url,
        caption: `${name} View ${index + 1}`,
        sort_order: index,
      }));

      await (supabaseAdmin.from('turf_photos') as any).insert(photoRows);
    }

    // 7. Insert Audit Log
    try {
      await (supabaseAdmin.from('audit_log') as any).insert({
        actor_id: finalOwnerId,
        action: 'turf.submitted',
        entity_type: 'turf',
        entity_id: turf.id,
        details: {
          name,
          contactNumber,
          locality,
          photosCount: photos?.length || 0,
        },
      });
    } catch (e) {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      turfId: turf.id,
      turfName: turf.name,
      status: 'pending',
    });
  } catch (err: any) {
    console.error('Submit turf exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
