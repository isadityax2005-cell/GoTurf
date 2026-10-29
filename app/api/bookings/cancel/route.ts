import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { cancelBooking, inspectBookingToken } from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });

    const body = await request.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
    }

    const inspected = inspectBookingToken(String(bookingId));
    if (!inspected.valid && inspected.code !== 'HOLD_EXPIRED') {
      const status = inspected.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        {
          success: false,
          error: inspected.error || 'Booking not found.',
          code: inspected.code,
        },
        { status }
      );
    }

    const booking = inspected.booking;
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    if (identity.role !== 'admin' && booking.player_id !== identity.user.id) {
      return NextResponse.json({ success: false, error: 'You may only cancel your own booking.' }, { status: 403 });
    }

    const result = cancelBooking(String(bookingId), reason || 'Player voluntary cancellation');
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to cancel booking' }, { status: 500 });
  }
}
