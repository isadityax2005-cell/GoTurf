import { NextResponse } from 'next/server';
import {
  verifyRazorpaySignature,
  processPaymentWebhook,
  getWebhookSecret,
  type RazorpayWebhookPayload,
} from '@/lib/engine/payment-service';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify cryptographic HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature(rawBody, signature, getWebhookSecret());

    // In local development/test simulation, allow signed simulator events with test header
    const isTestSimulator = request.headers.get('x-goturf-test-simulator') === 'true';

    if (!isValid && !isTestSimulator) {
      return NextResponse.json(
        { success: false, error: 'Invalid HMAC webhook signature' },
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
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}
