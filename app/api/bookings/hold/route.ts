import { NextResponse } from 'next/server';
import { createTemporaryHold } from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, playerId, startAtUTC, endAtUTC, pricePaise, notes } = body;

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
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: result.code === 'SLOT_TAKEN' ? 409 : 400 }
      );
    }

    return NextResponse.json({ success: true, booking: result.booking });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating slot hold' },
      { status: 500 }
    );
  }
}
