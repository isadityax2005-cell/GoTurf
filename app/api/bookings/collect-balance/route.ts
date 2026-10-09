import { NextResponse } from 'next/server';
import { collectVenueBalance } from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, method, attendantId } = body;

    if (!bookingId || !method) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bookingId and method (cash | venue_upi)' },
        { status: 400 }
      );
    }

    if (method !== 'cash' && method !== 'venue_upi') {
      return NextResponse.json(
        { success: false, error: 'Invalid method. Must be "cash" or "venue_upi"' },
        { status: 400 }
      );
    }

    const result = collectVenueBalance({
      bookingId,
      method,
      attendantId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: `Balance marked collected via ${method === 'cash' ? 'Cash' : 'Venue UPI'} successfully`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error recording venue balance collection' },
      { status: 500 }
    );
  }
}
