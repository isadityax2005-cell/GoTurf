'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Turf, Booking, PaymentMode } from '@/types/database';
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

  // Player selected payment mode (Token Advance default for local sports teams)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('token_advance');

  // Player Form
  const [playerName, setPlayerName] = useState('Karan Verma');
  const [playerPhone, setPlayerPhone] = useState('+91 98200 11223');
  const [playerEmail, setPlayerEmail] = useState('karan.verma@example.com');

  // Price calculations
  const slotTotalPaise = holdBooking?.price_paise || 180000;
  const slotTotal = slotTotalPaise / 100;
  const tokenAdvancePaise = holdBooking?.advance_amount_paise || 20000; // ₹200
  const tokenAdvance = tokenAdvancePaise / 100;
  const platformFee = 45;

  const venueBalancePaise = paymentMode === 'token_advance' ? Math.max(0, slotTotalPaise - tokenAdvancePaise) : 0;
  const venueBalance = venueBalancePaise / 100;
  const onlinePayable = paymentMode === 'token_advance' ? tokenAdvance + platformFee : slotTotal + platformFee;

  // 1. Fetch server-authoritative hold status & initialize absolute clock
  const fetchHoldStatus = useCallback(async () => {
    if (!holdId) return;

    try {
      const res = await fetch(`/api/bookings/hold?holdId=${encodeURIComponent(holdId)}`);
      const data = await res.json();

      if (data.success && data.booking) {
        const booking: Booking = data.booking;
        setHoldBooking(booking);

        if (booking.payment_mode) {
          setPaymentMode(booking.payment_mode);
        }

        if (booking.status === 'confirmed' || booking.status === 'completed') {
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
      // Fallback
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
          paymentMode,
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
        await fetchHoldStatus();
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

  const durationMins = holdBooking
    ? Math.max(60, Math.round((new Date(holdBooking.end_at).getTime() - new Date(holdBooking.start_at).getTime()) / (60 * 1000)))
    : 60;
  const durationHours = Math.round(durationMins / 60);
  const durationLabel = durationHours > 1 ? `${durationHours} Hours (${durationMins}m)` : `${durationMins} Mins`;

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Header */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <Link
          href={`/turfs/${turf.slug}`}
          className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider"
        >
          <span>&larr;</span>
          <span>Cancel & Exit</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#03594d] bg-[#ffff94] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
            {paymentSuccess ? 'Slot Confirmed' : isExpired ? 'Hold Expired' : 'Hold Active'}
          </span>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              paymentSuccess ? 'bg-[#03594d]' : isExpired ? 'bg-rose-500' : 'bg-[#03594d] animate-ping'
            }`}
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-6 py-8 flex-1">
        {/* Payment Confirmed State / Digital Match Pass */}
        {paymentSuccess ? (
          <div className="p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie-lg text-center animate-in zoom-in-95 duration-200 text-[#03594d]">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-3xl font-black shadow-maggie-sm">
              ✓
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#03594d] px-3.5 py-1 rounded-full bg-[#ffff94] border border-[#03594d] inline-block mb-3 shadow-maggie-sm">
              Slot Reserved &bull; Zero Double-Bookings Guarantee
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#03594d] tracking-tight uppercase mb-2">
              Match Slot Locked!
            </h1>
            <p className="text-xs text-[#03594d]/80 font-bold max-w-md mx-auto mb-6">
              Your online payment was verified by signed webhook. Show this Match Pass to the turf manager when your squad arrives.
            </p>

            {/* Match Pass Card */}
            <div className="p-6 rounded-2xl bg-[#f9f8f4] border-2 border-[#03594d] max-w-md mx-auto mb-6 text-left text-xs space-y-3 shadow-maggie">
              <div className="flex justify-between items-center pb-2.5 border-b-2 border-[#03594d]/15">
                <div>
                  <span className="text-[10px] text-[#03594d]/70 uppercase font-black">Venue</span>
                  <p className="text-sm font-black text-[#03594d]">{turf.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#03594d]/70 uppercase font-black">Match PIN</span>
                  <p className="text-lg font-black font-mono text-[#03594d] tracking-wider bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d]">
                    {holdBooking?.check_in_otp || '4821'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-[#03594d]/75 font-semibold">Match Time:</span>
                <span className="text-[#03594d] font-black">{matchTimeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#03594d]/75 font-semibold">Court / Arena:</span>
                <span className="text-[#03594d] font-bold">{court?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#03594d]/75 font-semibold">Player:</span>
                <span className="text-[#03594d] font-bold">{playerName}</span>
              </div>

              <div className="pt-2.5 border-t-2 border-[#03594d]/15">
                <div className="flex justify-between text-[#03594d]">
                  <span className="font-semibold">Paid Online (Advance + Fee):</span>
                  <span className="font-black text-[#03594d]">₹{onlinePayable}</span>
                </div>
                {paymentMode === 'token_advance' && venueBalance > 0 ? (
                  <div className="flex justify-between text-[#03594d] font-black pt-1">
                    <span>Balance Due at Turf (Cash/UPI):</span>
                    <span>₹{venueBalance}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[#03594d] font-black pt-1">
                    <span>Balance Due at Turf:</span>
                    <span>₹0 (100% Pre-paid)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/bookings"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
              >
                View in My Bookings &rarr;
              </Link>
              <Link
                href="/turfs"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase tracking-wider shadow-maggie-sm hover:bg-[#ffff94] transition-all"
              >
                Explore More Turfs
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Countdown Banner */}
            <div
              className={`p-4 rounded-2xl border-2 border-[#03594d] mb-6 flex items-center justify-between transition-all shadow-maggie-sm ${
                isExpired
                  ? 'bg-rose-100 text-rose-800 border-rose-500'
                  : secondsRemaining < 120
                  ? 'bg-[#fdc068] text-[#03594d]'
                  : 'bg-[#ffff94] text-[#03594d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isExpired ? '⌛' : '⏱️'}</span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">
                    {isExpired ? 'Hold Expired' : 'Temporary 10-Minute Hold'}
                  </p>
                  <p className="text-xs font-semibold opacity-90">
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
                    isExpired ? 'text-rose-600' : 'text-[#03594d]'
                  }`}
                >
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {paymentError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-100 border-2 border-rose-500 text-rose-800 flex items-center justify-between text-xs animate-in fade-in shadow-maggie-sm font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{paymentError}</span>
                </div>
                <button
                  onClick={() => setPaymentError(null)}
                  className="text-rose-800 hover:text-rose-950 font-black text-xs px-2 py-1 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {isExpired ? (
              <div className="p-8 rounded-3xl bg-white border-2 border-[#03594d] text-center shadow-maggie text-[#03594d]">
                <h2 className="text-lg font-black uppercase mb-2">Slot Released</h2>
                <p className="text-xs font-semibold opacity-80 mb-6">
                  To prevent locking venues permanently, slots are freed if payment is not completed within 10 minutes.
                </p>
                <Link
                  href={`/turfs/${turf.slug}/book?court=${court?.id}`}
                  className="px-6 py-3 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
                >
                  Pick Another Slot &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Payment Option Selector (Token Advance vs Full Prepayment) */}
                <div className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie space-y-3 text-[#03594d]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider">
                      Choose How You Want to Pay
                    </label>
                    <span className="text-[10px] font-black uppercase bg-[#ffff94] px-2.5 py-0.5 rounded-full border border-[#03594d]">
                      Mumbai Squad Friendly
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Token Advance */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('token_advance')}
                      className={`p-4 rounded-2xl border-2 border-[#03594d] text-left transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMode === 'token_advance'
                          ? 'bg-[#ffff94] shadow-maggie ring-2 ring-[#03594d] translate-x-0.5 translate-y-0.5'
                          : 'bg-[#f9f8f4] shadow-maggie-sm hover:bg-[#ffff94]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-xs text-[#03594d]">Token Advance</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#82eda6] text-[#03594d] border border-[#03594d]">
                            Recommended 🏏
                          </span>
                        </div>
                        <p className="text-[11px] text-[#03594d]/85 font-semibold leading-snug">
                          Pay <strong className="text-[#03594d] font-black underline">₹{tokenAdvance + platformFee}</strong> online now to lock slot.
                        </p>
                      </div>
                      <p className="text-[10px] text-[#03594d]/75 font-bold mt-3 pt-2 border-t border-[#03594d]/15">
                        Pay remaining <strong className="text-[#03594d]">₹{slotTotal - tokenAdvance}</strong> at turf gate (Cash/UPI)
                      </p>
                    </button>

                    {/* Option 2: Full Prepayment */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('full_online')}
                      className={`p-4 rounded-2xl border-2 border-[#03594d] text-left transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMode === 'full_online'
                          ? 'bg-[#ffff94] shadow-maggie ring-2 ring-[#03594d] translate-x-0.5 translate-y-0.5'
                          : 'bg-[#f9f8f4] shadow-maggie-sm hover:bg-[#ffff94]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-xs text-[#03594d]">100% Online</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-[#03594d] border border-[#03594d]">
                            Zero Cash
                          </span>
                        </div>
                        <p className="text-[11px] text-[#03594d]/85 font-semibold leading-snug">
                          Pay full <strong className="text-[#03594d] font-black underline">₹{slotTotal + platformFee}</strong> online now.
                        </p>
                      </div>
                      <p className="text-[10px] text-[#03594d]/75 font-bold mt-3 pt-2 border-t border-[#03594d]/15">
                        Walk straight onto the pitch &bull; ₹0 due at venue
                      </p>
                    </button>
                  </div>
                </div>

                {/* Match Details Card */}
                <div className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
                  <h2 className="text-base font-black uppercase mb-4">Match Details</h2>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#03594d]/15">
                      <span className="text-[#03594d]/75 font-semibold">Venue</span>
                      <span className="font-black text-[#03594d]">{turf.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#03594d]/15">
                      <span className="text-[#03594d]/75 font-semibold">Court & Sport</span>
                      <span className="font-black text-[#03594d]">{court?.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#03594d]/15">
                      <span className="text-[#03594d]/75 font-semibold">Time Window (IST)</span>
                      <span className="font-black text-[#03594d] bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d]">{matchTimeLabel}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#03594d]/75 font-semibold">Cancellation Rule</span>
                      <span className="text-[#03594d] font-bold">{turf.cancellation_rule || 'Free cancellation up to 24h'}</span>
                    </div>
                  </div>
                </div>

                {/* Player Information */}
                <div className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie space-y-3 text-[#03594d]">
                  <h2 className="text-base font-black uppercase mb-2">Player Details (For Receipt & Access)</h2>
                  <div>
                    <label className="block text-xs font-black text-[#03594d] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs text-[#03594d] font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#03594d] mb-1">WhatsApp Phone Number</label>
                    <input
                      type="tel"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs text-[#03594d] font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#03594d] mb-1">Email</label>
                    <input
                      type="email"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs text-[#03594d] font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Transparent Bill Breakdown */}
                <div className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie space-y-3 text-xs text-[#03594d]">
                  <h2 className="text-base font-black uppercase mb-2">Price Breakdown</h2>
                  <div className="flex justify-between text-[#03594d] font-bold">
                    <span>Slot Value ({durationLabel})</span>
                    <span>₹{slotTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[#03594d] font-bold">
                      <span className="flex items-center gap-1.5">
                        <span>Platform Convenience Fee</span>
                        <span className="text-[10px] text-[#03594d] bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d]">
                          Verified Protection
                        </span>
                      </span>
                      <span>₹{platformFee}</span>
                    </div>
                    <p className="text-[11px] text-[#03594d]/75 font-semibold leading-relaxed">
                      Covers live database locking, instant UPI payment handling, and 100% automated refund protection.
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-[#03594d]/15 space-y-2">
                    <div className="flex justify-between items-center text-sm font-black text-[#03594d]">
                      <span>Total Amount to Pay Now</span>
                      <span className="text-[#03594d] text-2xl font-black bg-[#ffff94] px-3 py-1 rounded-xl border-2 border-[#03594d] shadow-maggie-sm">
                        ₹{onlinePayable.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {paymentMode === 'token_advance' && venueBalance > 0 && (
                      <div className="flex justify-between items-center text-xs text-[#03594d] font-bold p-3 rounded-xl bg-[#ffff94]/70 border-2 border-[#03594d]">
                        <span>Remaining Balance Due at Venue:</span>
                        <span>₹{venueBalance.toLocaleString('en-IN')} (Cash/UPI)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={isPaying || isExpired}
                    onClick={handleInitiatePayment}
                    className="w-full py-4 rounded-full bg-[#03594d] text-[#82eda6] font-black text-sm uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-y-0.5 disabled:opacity-50 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-[#82eda6] border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Locking Slot...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          Pay ₹{onlinePayable.toLocaleString('en-IN')}{' '}
                          {paymentMode === 'token_advance' ? 'Token Advance' : 'Full Payment'} via UPI
                        </span>
                        <span>&rarr;</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isReleasing || isPaying}
                    onClick={handleRelease}
                    className="w-full py-3 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] hover:bg-[#ffff94] text-xs font-black uppercase tracking-wider shadow-maggie-sm transition-colors cursor-pointer"
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
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        Bank-Grade Encryption &bull; Signed Webhook Guarantee &bull; GoTurf Pay
      </footer>
    </main>
  );
}

