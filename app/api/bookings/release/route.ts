import { NextResponse } from 'next/server';
import { releaseHold } from '@/lib/engine/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { holdId } = body;

    if (!holdId) {
      return NextResponse.json({ success: false, error: 'Missing holdId' }, { status: 400 });
    }

    const released = releaseHold(holdId);
    return NextResponse.json({ success: released });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to release hold' }, { status: 500 });
  }
}
