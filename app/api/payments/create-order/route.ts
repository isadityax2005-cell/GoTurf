import { NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/engine/payment-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdId, playerId, paymentMode } = body;

    if (!holdId) {
      return NextResponse.json(
        { success: false, error: 'Missing holdId in request body', code: 'MISSING_HOLD_ID' },
        { status: 400 }
      );
    }

    const result = await createPaymentOrder({ holdId, playerId, paymentMode });

    if (!result.success) {
      const status =
        result.code === 'HOLD_EXPIRED'
          ? 410
          : result.code === 'HOLD_NOT_FOUND'
            ? 404
            : 400;
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status }
      );
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating payment order' },
      { status: 500 }
    );
  }
}
