import { NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
    }

    const result = cancelBooking(bookingId, reason || 'Player voluntary cancellation');
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to cancel booking' }, { status: 500 });
  }
}
