import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import { getDemoTurfByCourtId } from '@/lib/data/turfs';
import { getServiceRoleClient } from '@/lib/supabase';
import { collectVenueBalance, inspectBookingToken } from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    if (identity.role !== 'owner' && identity.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Owner access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId, method } = body;

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

    const inspected = inspectBookingToken(String(bookingId));
    if (!inspected.valid && inspected.code !== 'HOLD_EXPIRED') {
      const status = inspected.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        { success: false, error: inspected.error || 'Booking not found.', code: inspected.code },
        { status }
      );
    }

    const booking = inspected.booking;
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });

    if (identity.role === 'owner') {
      const demoTurf = getDemoTurfByCourtId(booking.court_id);
      if (demoTurf) {
        if (demoTurf.owner_id !== identity.user.id) {
          return NextResponse.json({ success: false, error: 'You may only collect balances for your own venue.' }, { status: 403 });
        }
      } else {
        const admin = getServiceRoleClient();
        const { data: court } = await admin
          .from('courts')
          .select('turf_id')
          .eq('id', booking.court_id)
          .maybeSingle<{ turf_id: string }>();
        const { data: turf } = court
          ? await admin
              .from('turfs')
              .select('owner_id')
              .eq('id', court.turf_id)
              .maybeSingle<{ owner_id: string }>()
          : { data: null };
        if (turf?.owner_id !== identity.user.id) {
          return NextResponse.json({ success: false, error: 'You may only collect balances for your own venue.' }, { status: 403 });
        }
      }
    }

    const result = collectVenueBalance({
      bookingId: String(bookingId),
      method,
      attendantId: identity.user.id,
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
      bookingToken: result.bookingToken,
      message: `Balance marked collected via ${method === 'cash' ? 'Cash' : 'Venue UPI'} successfully`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error recording venue balance collection' },
      { status: 500 }
    );
  }
}
