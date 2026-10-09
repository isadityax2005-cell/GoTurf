import { NextResponse } from 'next/server';
import { createTemporaryHold, getBookingById } from '@/lib/engine/booking-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const holdId = searchParams.get('holdId');

    if (!holdId) {
      return NextResponse.json({ success: false, error: 'Missing holdId query parameter' }, { status: 400 });
    }

    const booking = getBookingById(holdId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Hold not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch hold' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, playerId, startAtUTC, endAtUTC, pricePaise, notes, paymentMode, advanceAmountPaise } = body;

    if (!courtId || !startAtUTC || !endAtUTC) {
      return NextResponse.json(
        { success: false, error: 'Missing required reservation fields' },
        { status: 400 }
      );
    }

    const result = await createTemporaryHold({
      courtId,
      playerId: playerId || 'guest-player',
      startAtUTC,
      endAtUTC,
      pricePaise: pricePaise || 120000,
      notes,
      paymentMode,
      advanceAmountPaise,
    });


    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: result.code === 'SLOT_TAKEN' ? 409 : 400 }
      );
    }

    return NextResponse.json({ success: true, booking: result.booking });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating slot hold' },
      { status: 500 }
    );
  }
}

