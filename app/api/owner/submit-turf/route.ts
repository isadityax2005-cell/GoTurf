import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    if (identity.role !== 'owner') return NextResponse.json({ success: false, error: 'Verified owner access required.' }, { status: 403 });

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
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: 'Turf name and address are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceRoleClient();
    // The authenticated owner ID is authoritative; request-body ownerId is never used.
    const finalOwnerId = identity.user.id;

    // 2. Resolve or find Region ID
    const { data: regions } = await supabaseAdmin
      .from('regions')
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
    const { data: turf, error: turfError } = await supabaseAdmin
      .from('turfs')
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
    const { error: courtError } = await supabaseAdmin.from('courts').insert({
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

      await supabaseAdmin.from('turf_photos').insert(photoRows);
    }

    // 7. Insert Audit Log with schema-conforming columns
    try {
      await supabaseAdmin.from('audit_log').insert({
        actor_id: finalOwnerId,
        action: 'turf.submitted',
          target_type: 'turf',
          target_id: turf.id,
          metadata: {
            name,
            contactNumber,
            locality,
            photosCount: photos?.length || 0,
          },
        });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      turfId: turf.id,
      turfName: turf.name,
      status: 'pending',
    });
  } catch (err: unknown) {
    console.error('Submit turf exception:', err);
    const message = err instanceof Error ? err.message : 'Failed to submit turf';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
