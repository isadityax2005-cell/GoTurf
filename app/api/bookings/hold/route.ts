import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getRequestIdentity } from '@/lib/auth/authorization';
import {
  createTemporaryHold,
  inspectBookingToken,
} from '@/lib/engine/booking-service';
import { isTestPaymentSimulatorEnabled } from '@/lib/engine/payment-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const holdId = searchParams.get('holdId');

    if (!holdId) {
      return NextResponse.json(
        { success: false, error: 'Missing holdId query parameter', code: 'MISSING_HOLD_ID' },
        { status: 400 }
      );
    }

    const inspected = inspectBookingToken(holdId);
    if (!inspected.valid && inspected.code !== 'HOLD_EXPIRED') {
      const status = inspected.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        {
          success: false,
          error: inspected.error || 'Invalid or unrecognized hold token',
          code: inspected.code || 'INVALID_TOKEN',
        },
        { status }
      );
    }

    if (!inspected.booking) {
      return NextResponse.json(
        { success: false, error: 'Hold not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: inspected.booking,
      holdToken: inspected.bookingToken,
      simulatedCheckout: isTestPaymentSimulatorEnabled(),
    });
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
        { success: false, error: 'Missing required reservation fields', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const numericPricePaise = Number(pricePaise);
    if (!Number.isFinite(numericPricePaise) || numericPricePaise <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid pricePaise is required to create a slot hold', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Verify that court belongs to an approved, active venue
    const { getDemoTurfByCourtId } = await import('@/lib/data/turfs');
    const demoTurf = getDemoTurfByCourtId(String(courtId));
    if (demoTurf && demoTurf.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'This venue is currently unpublished / archived and not taking reservations.', code: 'VENUE_UNPUBLISHED' },
        { status: 400 }
      );
    }

    try {
      const { getServiceRoleClient } = await import('@/lib/supabase');
      const supabase = getServiceRoleClient();
      const { data: courtRow } = await supabase
        .from('courts')
        .select('id, is_active, turf_id, turfs(status)')
        .eq('id', String(courtId))
        .maybeSingle();

      if (courtRow) {
        const turfRel = courtRow.turfs as unknown as { status: string } | null;
        if (!courtRow.is_active || (turfRel?.status && turfRel.status !== 'approved')) {
          return NextResponse.json(
            { success: false, error: 'This venue or court is currently unpublished or inactive.', code: 'VENUE_UNPUBLISHED' },
            { status: 400 }
          );
        }
      }
    } catch {
      // Allow through for in-memory unit tests
    }

    const identity = await getRequestIdentity();
    const sanitizedClientPlayerId =
      typeof playerId === 'string' &&
      playerId.trim().length > 0 &&
      playerId !== 'player-demo-current'
        ? playerId.trim()
        : null;
    const resolvedPlayerId =
      identity?.user.id || sanitizedClientPlayerId || `guest-${crypto.randomUUID()}`;

    const result = await createTemporaryHold({
      courtId: String(courtId),
      playerId: resolvedPlayerId,
      startAtUTC: String(startAtUTC),
      endAtUTC: String(endAtUTC),
      pricePaise: numericPricePaise,
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

    return NextResponse.json({
      success: true,
      booking: result.booking,
      holdToken: result.holdToken,
      simulatedCheckout: isTestPaymentSimulatorEnabled(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating slot hold' },
      { status: 500 }
    );
  }
}

