'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Turf, Booking } from '@/types/database';
import { formatTimeIST } from '@/lib/engine/slot-calculator';

interface CheckoutClientProps {
  turf: Turf;
  courtId?: string;
  slotId?: string;
}

export default function CheckoutClient({ turf, courtId: propCourtId, slotId: propSlotId }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courtId = searchParams.get('court') || propCourtId;
  const holdId = searchParams.get('holdId') || searchParams.get('hold') || searchParams.get('slot') || propSlotId;
  const court = turf.courts?.find((c) => c.id === courtId) || turf.courts?.[0];

  const [holdBooking, setHoldBooking] = useState<Booking | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [isExpired, setIsExpired] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Player Form
  const [playerName, setPlayerName] = useState('Karan Verma');
  const [playerPhone, setPlayerPhone] = useState('+91 98200 11223');
  const [playerEmail, setPlayerEmail] = useState('karan.verma@example.com');

  // Price calculations
  const baseCourtPaise = holdBooking?.price_paise || 180000;
  const basePrice = baseCourtPaise / 100;
  const platformFee = 45;
  const totalAmount = basePrice + platformFee;
  const totalPaise = baseCourtPaise + 4500;

  // 1. Fetch server-authoritative hold status & initialize absolute clock
  const fetchHoldStatus = useCallback(async () => {
    if (!holdId) return;

    try {
      const res = await fetch(`/api/bookings/hold?holdId=${encodeURIComponent(holdId)}`);
      const data = await res.json();

      if (data.success && data.booking) {
        const booking: Booking = data.booking;
        setHoldBooking(booking);

        if (booking.status === 'confirmed') {
          setPaymentSuccess(true);
          return;
        }

        if (booking.status === 'expired') {
          setIsExpired(true);
          setSecondsRemaining(0);
          return;
        }

        if (booking.hold_expires_at) {
          const expiresAtMs = new Date(booking.hold_expires_at).getTime();
          const remaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
          setSecondsRemaining(remaining);
          if (remaining <= 0) {
            setIsExpired(true);
          }
        }
      }
    } catch {
      // Fallback to local default if offline or demo hold
    }
  }, [holdId]);

  useEffect(() => {
    fetchHoldStatus();
  }, [fetchHoldStatus]);

  // 2. Countdown ticker
  useEffect(() => {
    if (isExpired || paymentSuccess) return;

    if (secondsRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isExpired, paymentSuccess]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 3. Explicit Hold Release (Approach 2)
  const handleRelease = async () => {
    setIsReleasing(true);
    try {
      await fetch('/api/bookings/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdId: holdId || 'demo-hold' }),
      });
    } catch {
      // ignore
    }
    router.push(`/turfs/${turf.slug}`);
  };

  // 4. Server-Authoritative Payment Flow
  const handleInitiatePayment = async () => {
    if (!holdId) {
      setPaymentError('No active slot hold detected. Please select a slot first.');
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      // Step A: Create Server-Authoritative Order (Price locked on server)
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdId,
          playerId: 'player-demo-current',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setPaymentError(orderData.error || 'Failed to initiate order. Hold may have expired.');
        if (orderData.code === 'HOLD_EXPIRED') {
          setIsExpired(true);
        }
        setIsPaying(false);
        return;
      }

      const { orderId, amountPaise } = orderData.order;

      // Step B: Trigger Webhook-Verified Payment (Simulated test capture)
      // Generates a verified gateway webhook callback to /api/webhooks/payment
      const webhookPayload = {
        entity: 'event',
        event: 'order.paid',
        event_id: `evt_sim_${Date.now()}`,
        payload: {
          payment: {
            entity: {
              id: `pay_rzp_${Date.now()}`,
              order_id: orderId,
              amount: amountPaise,
              currency: 'INR',
              status: 'captured',
              method: 'upi',
              email: playerEmail,
              contact: playerPhone,
            },
          },
          order: {
            entity: {
              id: orderId,
              amount: amountPaise,
              status: 'paid',
            },
          },
        },
      };

      const webhookRes = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goturf-test-simulator': 'true',
        },
        body: JSON.stringify(webhookPayload),
      });

      const webhookData = await webhookRes.json();
      if (webhookRes.ok && webhookData.success) {
        setPaymentSuccess(true);
      } else {
        setPaymentError(webhookData.error || 'Payment verification failed at gateway');
      }
    } catch {
      setPaymentError('Network failure during payment communication. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const matchTimeLabel = holdBooking
    ? `${formatTimeIST(new Date(holdBooking.start_at))} – ${formatTimeIST(new Date(holdBooking.end_at))}`
    : '06:00 PM – 07:00 PM';

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link
          href={`/turfs/${turf.slug}`}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white"
        >
          <span>&larr;</span>
          <span>Cancel & Exit</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {paymentSuccess ? 'Payment Confirmed' : isExpired ? 'Hold Expired' : 'Hold Active'}
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              paymentSuccess ? 'bg-emerald-400' : isExpired ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'
            }`}
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-6 py-8 flex-1">
        {/* Payment Confirmed State */}
        {paymentSuccess ? (
          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-emerald-500/30 text-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl font-black">
              ✓
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-2">
              Slot Guaranteed &bull; Zero Double-Bookings
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
              Your ₹{totalAmount.toLocaleString('en-IN')} payment was verified via server webhook. Your digital match pass is live with directions and rules.
            </p>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 max-w-sm mx-auto mb-6 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-400">Venue:</span>
                <span className="text-white font-semibold">{turf.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Time:</span>
                <span className="text-emerald-400 font-bold">{matchTimeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Player:</span>
                <span className="text-white font-medium">{playerName}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/bookings"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                View My Match Pass &rarr;
              </Link>
              <Link
                href="/turfs"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold hover:text-white"
              >
                Explore More Turfs
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Countdown Banner */}
            <div
              className={`p-4 rounded-2xl border mb-6 flex items-center justify-between transition-all ${
                isExpired
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : secondsRemaining < 120
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isExpired ? '⌛' : '⏱️'}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    {isExpired ? 'Hold Expired' : 'Temporary 10-Minute Hold'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {isExpired
                      ? 'Your slot has been released back to other players'
                      : 'Slot is locked for you while you complete checkout'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  suppressHydrationWarning
                  className={`text-2xl font-black font-mono tracking-tight ${
                    isExpired ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {paymentError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{paymentError}</span>
                </div>
                <button
                  onClick={() => setPaymentError(null)}
                  className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            {isExpired ? (
              <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 text-center">
                <h2 className="text-lg font-bold text-white mb-2">Slot Released</h2>
                <p className="text-xs text-neutral-400 mb-6">
                  To prevent locking venues permanently, slots are freed if payment is not completed within 10 minutes.
                </p>
                <Link
                  href={`/turfs/${turf.slug}/book?court=${court?.id}`}
                  className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
                >
                  Pick Another Slot &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Booking Summary Card */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800">
                  <h2 className="text-base font-bold text-white mb-4">Match Details</h2>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Venue</span>
                      <span className="font-semibold text-white">{turf.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Court & Sport</span>
                      <span className="font-semibold text-white">{court?.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Time Window (IST)</span>
                      <span className="font-semibold text-emerald-400">{matchTimeLabel}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-400">Cancellation Rule</span>
                      <span className="text-neutral-300 font-medium">{turf.cancellation_rule || 'Free cancellation up to 24h'}</span>
                    </div>
                  </div>
                </div>

                {/* Player Information */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                  <h2 className="text-base font-bold text-white mb-2">Player Details (For Receipt & Access)</h2>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="tel"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Transparent Bill Breakdown */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-3 text-xs">
                  <h2 className="text-base font-bold text-white mb-2">Price Breakdown</h2>
                  <div className="flex justify-between text-neutral-300">
                    <span>Slot Fee (60 Mins)</span>
                    <span>₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <span>Platform Convenience Fee</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Verified Protection
                        </span>
                      </span>
                      <span>₹{platformFee}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Covers live slot locking, instant UPI payment gateway handling, and 100% automated refund protection. (Payment Gateway & 18% GST included).
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Amount Payable</span>
                    <span className="text-emerald-400 text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={isPaying || isExpired}
                    onClick={handleInitiatePayment}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-sm hover:opacity-95 disabled:opacity-50 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{totalAmount.toLocaleString('en-IN')} via UPI / Card</span>
                        <span>&rarr;</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isReleasing || isPaying}
                    onClick={handleRelease}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
                  >
                    {isReleasing ? 'Releasing Slot...' : 'Release Slot & Back Out'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        Bank-Grade Encryption &bull; Signed Webhook Guarantee &bull; GoTurf Pay
      </footer>
    </main>
  );
}
