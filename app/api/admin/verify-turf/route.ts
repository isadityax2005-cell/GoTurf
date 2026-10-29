import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    if (identity.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

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

    const { data: updatedTurf, error: updateError } = await supabaseAdmin
      .from('turfs')
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

    // Insert verification audit log with schema-conforming columns
    await supabaseAdmin.from('audit_log').insert({
      actor_id: identity.user.id,
      action: `turf.${finalDbStatus}`,
        target_type: 'turf',
        target_id: turfId,
        metadata: {
          turfName: updatedTurf.name,
          newStatus: finalDbStatus,
          rejectionReason: rejectionReason || null,
          adminEmail: identity.user.email || null,
          timestamp: new Date().toISOString(),
        },
      });

    return NextResponse.json({
      success: true,
      turf: updatedTurf,
      message: `Turf "${updatedTurf.name}" has been ${finalDbStatus === 'approved' ? 'approved and made live' : 'rejected'}.`,
    });
  } catch (err: unknown) {
    console.error('Verify turf handler error:', err);
    const message = err instanceof Error ? err.message : 'Failed to verify turf';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
