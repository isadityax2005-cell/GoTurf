import { NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/engine/payment-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdId, playerId } = body;

    if (!holdId) {
      return NextResponse.json(
        { success: false, error: 'Missing holdId in request body' },
        { status: 400 }
      );
    }

    const result = await createPaymentOrder({ holdId, playerId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: result.code === 'HOLD_EXPIRED' ? 410 : 400 }
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
