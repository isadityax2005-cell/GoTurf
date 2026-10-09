import { NextResponse } from 'next/server';
import { executeBookingRefund } from '@/lib/engine/payment-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, reason, adminOverride } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing bookingId in request body' },
        { status: 400 }
      );
    }

    const result = executeBookingRefund({
      bookingId,
      reason: reason || 'Player requested cancellation',
      adminOverride: Boolean(adminOverride),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      refundEligible: result.refundEligible,
      refund: result.refund || null,
      message: result.message,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error processing refund' },
      { status: 500 }
    );
  }
}
