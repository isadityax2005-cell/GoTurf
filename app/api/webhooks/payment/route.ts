import { NextResponse } from 'next/server';
import {
  verifyRazorpaySignature,
  processPaymentWebhook,
  getWebhookSecret,
  isTestPaymentSimulatorEnabled,
  type RazorpayWebhookPayload,
} from '@/lib/engine/payment-service';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const webhookSecret = getWebhookSecret();
    const simulatorEnabled = isTestPaymentSimulatorEnabled();
    const isSimulatorRequest = request.headers.get('x-goturf-test-simulator') === 'true';

    if (!webhookSecret && !simulatorEnabled) {
      return NextResponse.json(
        { success: false, error: 'Webhook verification is not configured.' },
        { status: 503 }
      );
    }

    const isValid = webhookSecret
      ? verifyRazorpaySignature(rawBody, signature, webhookSecret)
      : false;

    // The unsigned simulator is restricted to explicitly enabled non-production development/demo environments.
    if (!isValid && !(simulatorEnabled && isSimulatorRequest)) {
      return NextResponse.json(
        {
          success: false,
          error: isSimulatorRequest
            ? 'Test payment simulator is disabled in this environment'
            : 'Invalid HMAC webhook signature',
        },
        { status: 401 }
      );
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    const eventIdHeader = request.headers.get('x-razorpay-event-id');
    const result = await processPaymentWebhook(payload, eventIdHeader || undefined);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate || false,
      outcome: result.outcome,
      message: result.message,
      bookingId: result.bookingId,
      bookingToken: result.bookingToken,
      booking: result.booking,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}
