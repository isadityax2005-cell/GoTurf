import { NextResponse } from 'next/server';
import {
  encodeSignedBookingToken,
  inspectBookingToken,
  releaseHold,
} from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdId } = body;

    if (!holdId) {
      return NextResponse.json({ success: false, error: 'Missing holdId', code: 'MISSING_HOLD_ID' }, { status: 400 });
    }

    const inspected = inspectBookingToken(String(holdId));
    if (!inspected.valid && inspected.code !== 'HOLD_EXPIRED') {
      const status = inspected.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        {
          success: false,
          error: inspected.error || 'Invalid hold token',
          code: inspected.code || 'INVALID_TOKEN',
        },
        { status }
      );
    }

    const released = releaseHold(String(holdId));
    const updatedBooking = inspectBookingToken(String(holdId)).booking;
    return NextResponse.json({
      success: released,
      booking: updatedBooking,
      bookingToken: updatedBooking ? encodeSignedBookingToken(updatedBooking) : undefined,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to release hold' }, { status: 500 });
  }
}
