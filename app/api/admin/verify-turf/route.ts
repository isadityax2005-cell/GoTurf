import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { turfId, status, rejectionReason } = await request.json();

    if (!turfId || !['approved', 'rejected', 'suspended'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid turfId and status (approved/rejected/suspended) are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceRoleClient();

    // Map 'rejected' to 'suspended' if needed by enum or keep as is
    // Let's check turf_status enum: ('draft', 'pending', 'approved', 'suspended')
    const finalDbStatus = status === 'rejected' ? 'suspended' : status;

    const { data: updatedTurf, error: updateError } = await (supabaseAdmin.from('turfs') as any)
      .update({
        status: finalDbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', turfId)
      .select('id, name, status, owner_id')
      .single();

    if (updateError || !updatedTurf) {
      console.error('Verify turf update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError?.message || 'Failed to update turf status' },
        { status: 500 }
      );
    }

    // Insert verification audit log
    await (supabaseAdmin.from('audit_log') as any).insert({
      action: `turf.${finalDbStatus}`,
      entity_type: 'turf',
      entity_id: turfId,
      details: {
        turfName: updatedTurf.name,
        newStatus: finalDbStatus,
        rejectionReason: rejectionReason || null,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      turf: updatedTurf,
      message: `Turf "${updatedTurf.name}" has been ${finalDbStatus === 'approved' ? 'approved and made live' : 'rejected'}.`,
    });
  } catch (err: any) {
    console.error('Verify turf handler error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
