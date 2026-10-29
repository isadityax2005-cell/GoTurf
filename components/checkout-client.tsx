'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Turf, Booking, PaymentMode } from '@/types/database';
import { getTurfPhotoUrl, getIllustrativeSportFallback, VENUE_PHOTO_UNAVAILABLE_PATH } from '@/lib/utils/turf-photo';
import { formatTimeIST } from '@/lib/engine/slot-calculator';

interface CheckoutClientProps {
  turf: Turf;
  courtId?: string;
  slotId?: string;
}

type CheckoutHoldState = 'loading' | 'active' | 'confirmed' | 'expired' | 'missing' | 'invalid';

export default function CheckoutClient({ turf, courtId: propCourtId, slotId: propSlotId }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourtId = searchParams.get('court') || propCourtId;
  const rawHoldParam = searchParams.get('holdId') || searchParams.get('hold') || searchParams.get('slot') || propSlotId || '';

  const [activeHoldToken, setActiveHoldToken] = useState<string>(rawHoldParam);
  const [holdBooking, setHoldBooking] = useState<Booking | null>(null);
  const [holdState, setHoldState] = useState<CheckoutHoldState>(() => (rawHoldParam ? 'loading' : 'missing'));
  const [holdInvalidReason, setHoldInvalidReason] = useState<string | null>(null);
  const [simulatedCheckout, setSimulatedCheckout] = useState<boolean>(Boolean(turf.is_demo));
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [thumbFailed, setThumbFailed] = useState(false);

  // Player selected payment mode (Token Advance default for local sports teams)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('token_advance');

  // Player Form
  const [playerName, setPlayerName] = useState('Karan Verma');
  const [playerPhone, setPlayerPhone] = useState('+91 98200 11223');
  const [playerEmail, setPlayerEmail] = useState('karan.verma@example.com');

  const resolvedCourtId = holdBooking?.court_id || initialCourtId;
  const court = turf.courts?.find((c) => c.id === resolvedCourtId) || turf.courts?.[0];

  // Price calculations strictly derived from server-verified booking hold
  const slotTotalPaise = holdBooking?.price_paise ?? 0;
  const slotTotal = slotTotalPaise / 100;
  const tokenAdvancePaise = holdBooking?.advance_amount_paise ?? Math.min(20000, slotTotalPaise);
  const tokenAdvance = tokenAdvancePaise / 100;
  const platformFee = holdBooking ? 45 : 0;

  const venueBalancePaise = paymentMode === 'token_advance' ? Math.max(0, slotTotalPaise - tokenAdvancePaise) : 0;
  const venueBalance = venueBalancePaise / 100;
  const onlinePayable = paymentMode === 'token_advance' ? tokenAdvance + platformFee : slotTotal + platformFee;

  // 1. Fetch server-authoritative hold status & initialize absolute clock
  useEffect(() => {
    if (!rawHoldParam) {
      return;
    }

    let isCancelled = false;

    async function verifyHoldOnServer() {
      try {
        const res = await fetch(`/api/bookings/hold?holdId=${encodeURIComponent(rawHoldParam)}`);
        const data = await res.json();

        if (isCancelled) return;

        if (!res.ok || !data.success || !data.booking) {
          setHoldBooking(null);
          setHoldInvalidReason(
            data.error || 'This booking hold link is invalid, tampered with, or no longer exists.'
          );
          setHoldState('invalid');
          return;
        }

        const booking: Booking = data.booking;

        // Verify the booking belongs to a court on this turf
        if (turf.courts && turf.courts.length > 0 && !turf.courts.some((c) => c.id === booking.court_id)) {
          setHoldBooking(null);
          setHoldInvalidReason('This slot hold belongs to a different venue and cannot be checked out here.');
          setHoldState('invalid');
          return;
        }

        setHoldBooking(booking);
        if (typeof data.holdToken === 'string' && data.holdToken.length > 0) {
          setActiveHoldToken(data.holdToken);
        }
        if (typeof data.simulatedCheckout === 'boolean') {
          setSimulatedCheckout(data.simulatedCheckout || Boolean(turf.is_demo));
        }
        if (booking.payment_mode) {
          setPaymentMode(booking.payment_mode);
        }

        if (booking.status === 'confirmed' || booking.status === 'completed') {
          setHoldState('confirmed');
          setSecondsRemaining(0);
          return;
        }

        if (booking.status === 'expired' || booking.status === 'cancelled') {
          setHoldState('expired');
          setSecondsRemaining(0);
          return;
        }

        if (booking.hold_expires_at) {
          const expiresAtMs = new Date(booking.hold_expires_at).getTime();
          const remaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
          setSecondsRemaining(remaining);
          setHoldState(remaining > 0 ? 'active' : 'expired');
        } else {
          setHoldState('invalid');
          setHoldInvalidReason('Booking hold is missing a valid server expiration timestamp.');
        }
      } catch {
        if (!isCancelled) {
          setHoldState('invalid');
          setHoldInvalidReason('Could not verify your slot hold with the booking server. Please select a slot again.');
        }
      }
    }

    verifyHoldOnServer();

    return () => {
      isCancelled = true;
    };
  }, [rawHoldParam, turf.courts, turf.is_demo]);

  // 2. Countdown ticker (only active while holdState === 'active')
  useEffect(() => {
    if (holdState !== 'active' || !holdBooking?.hold_expires_at) return;

    const expiresAtMs = new Date(holdBooking.hold_expires_at).getTime();

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setHoldState('expired');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [holdState, holdBooking?.hold_expires_at]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 3. Explicit Hold Release
  const handleRelease = async () => {
    setIsReleasing(true);
    try {
      if (activeHoldToken) {
        await fetch('/api/bookings/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdId: activeHoldToken }),
        });
      }
    } catch {
      // ignore network error during release navigation
    }
    router.push(`/turfs/${turf.slug}/book${court ? `?court=${court.id}` : ''}`);
  };

  // 4. Server-Authoritative Payment Flow
  const handleInitiatePayment = async () => {
    if (!activeHoldToken || !holdBooking || holdState !== 'active') {
      setPaymentError('No active slot hold detected. Please select an available slot first.');
      return;
    }

    if (!turf.is_demo) {
      setPaymentError(
        'Online checkout for live arenas is temporarily unavailable while banking gateway configuration is being finalized by the platform operator. Please explore our interactive demo arenas.'
      );
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
          holdId: activeHoldToken,
          playerId: holdBooking.player_id,
          paymentMode,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setPaymentError(orderData.error || 'Failed to initiate order. Hold may have expired.');
        if (orderData.code === 'HOLD_EXPIRED') {
          setHoldState('expired');
          setSecondsRemaining(0);
        } else if (orderData.code === 'INVALID_TOKEN' || orderData.code === 'TAMPERED_TOKEN') {
          setHoldInvalidReason(orderData.error || 'Invalid hold token.');
          setHoldState('invalid');
        }
        setIsPaying(false);
        return;
      }

      const { orderId, amountPaise, holdToken: updatedHoldToken } = orderData.order;
      if (updatedHoldToken) {
        setActiveHoldToken(updatedHoldToken);
      }

      // Step B: Trigger Webhook-Verified Payment (Simulated test capture in dev/demo)
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
        if (webhookData.booking) {
          setHoldBooking(webhookData.booking);
        }
        if (webhookData.bookingToken) {
          setActiveHoldToken(webhookData.bookingToken);
          router.replace(
            `/turfs/${turf.slug}/checkout?court=${encodeURIComponent(court?.id || '')}&holdId=${encodeURIComponent(webhookData.bookingToken)}`,
            { scroll: false }
          );
        }
        setHoldState('confirmed');
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
    : null;

  const durationMins = holdBooking
    ? Math.max(60, Math.round((new Date(holdBooking.end_at).getTime() - new Date(holdBooking.start_at).getTime()) / (60 * 1000)))
    : 0;
  const durationHours = Math.round(durationMins / 60);
  const durationLabel = durationHours > 1 ? `${durationHours} Hours (${durationMins}m)` : `${durationMins} Mins`;

  const isConfirmed = holdState === 'confirmed';
  const isExpired = holdState === 'expired';
  const isMissingOrInvalid = holdState === 'missing' || holdState === 'invalid';

  const statusBadgeText = isConfirmed
    ? 'Slot Confirmed'
    : isExpired
      ? 'Hold Expired'
      : isMissingOrInvalid
        ? 'Action Required'
        : holdState === 'loading'
          ? 'Verifying Hold...'
          : 'Hold Active';

  const photoSrc = thumbFailed
    ? (turf.is_demo ? getIllustrativeSportFallback(court?.sport || 'cricket') : VENUE_PHOTO_UNAVAILABLE_PATH)
    : getTurfPhotoUrl(turf.photos?.[0], court?.sport || 'cricket', turf.is_demo);

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Header */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <Link
          href={`/turfs/${turf.slug}/book${court ? `?court=${court.id}` : ''}`}
          className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider"
        >
          <span>&larr;</span>
          <span>Back to Slot Grid</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#03594d] bg-[#ffff94] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
            {statusBadgeText}
          </span>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConfirmed
                ? 'bg-[#03594d]'
                : isExpired || isMissingOrInvalid
                  ? 'bg-rose-500'
                  : 'bg-[#03594d] animate-ping'
            }`}
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-6 py-8 flex-1">
        {/* Explicit Demo / Simulated Checkout Banner */}
        {turf.is_demo ? (
          <div
            data-testid="simulated-checkout-banner"
            className="mb-6 p-3.5 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-maggie-sm"
          >
            <div className="flex items-center gap-2 font-black uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-[#03594d] text-[#ffff94] text-[10px]">DEMO MODE</span>
              <span>Simulated checkout, no real payment</span>
            </div>
            <span className="text-[11px] font-semibold text-[#03594d]/80">
              Test order &amp; signed webhook simulation only
            </span>
          </div>
        ) : (
          <div
            data-testid="live-gateway-notice-banner"
            className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex flex-col gap-1.5 text-xs shadow-maggie-sm"
          >
            <div className="flex items-center gap-2 font-black uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-[#03594d] text-[#82eda6] text-[10px]">OPERATOR NOTICE</span>
              <span>Online Payment Setup in Progress</span>
            </div>
            <p className="text-[11px] font-semibold text-[#03594d]/85 leading-relaxed">
              Online slot reservations for live Mumbai arenas are temporarily paused while our banking gateway integration is being finalized by the platform operator. Explore our interactive demo arenas to experience simulated booking.
            </p>
          </div>
        )}

        {/* Loading State */}
        {holdState === 'loading' && (
          <div className="p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-center text-[#03594d]">
            <div className="inline-block h-8 w-8 border-3 border-[#03594d] border-t-transparent rounded-full animate-spin mb-4" />
            <h1 className="text-lg font-black uppercase tracking-tight mb-1">Verifying Signed Slot Hold...</h1>
            <p className="text-xs font-semibold text-[#03594d]/75">
              Validating your reservation token and lock expiration with the booking engine.
            </p>
          </div>
        )}

        {/* Missing or Invalid Hold Recovery State */}
        {isMissingOrInvalid && (
          <div
            data-testid="checkout-recovery-card"
            className="p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie-lg text-center text-[#03594d]"
          >
            <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-rose-100 border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-2xl font-black shadow-maggie-sm">
              !
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#03594d] px-3.5 py-1 rounded-full bg-[#ffff94] border border-[#03594d] inline-block mb-3 shadow-maggie-sm">
              {holdState === 'missing' ? 'No Active Slot Hold' : 'Invalid Booking Context'}
            </span>
            <h1 className="text-2xl font-black text-[#03594d] tracking-tight uppercase mb-2">
              {holdState === 'missing' ? 'Select a Slot Before Checkout' : 'Unable to Verify Slot Hold'}
            </h1>
            <p className="text-xs text-[#03594d]/80 font-semibold max-w-md mx-auto mb-6 leading-relaxed">
              {holdInvalidReason ||
                'Checkout requires an active, server-signed 10-minute slot hold so no two squads can double-book the same pitch. Please choose an available time slot on the live grid.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/turfs/${turf.slug}/book${court ? `?court=${court.id}` : ''}`}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
              >
                Select a Live Slot &rarr;
              </Link>
              <Link
                href={`/turfs/${turf.slug}`}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase tracking-wider shadow-maggie-sm hover:bg-[#ffff94] transition-all"
              >
                Back to {turf.name}
              </Link>
            </div>
          </div>
        )}

        {/* Payment Confirmed State / Digital Match Pass */}
        {isConfirmed && holdBooking && (
          <div
            data-testid="booking-confirmed-card"
            className="p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie-lg text-center animate-in zoom-in-95 duration-200 text-[#03594d]"
          >
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
              <div className="flex items-center gap-3 pb-3 border-b-2 border-[#03594d]/15">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm shrink-0 bg-[#03594d]/10">
                  <Image
                    src={photoSrc}
                    alt={turf.name}
                    fill
                    sizes="60px"
                    className="object-cover"
                    onError={() => setThumbFailed(true)}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#03594d]/70 uppercase font-black block">
                    {turf.is_demo ? 'Demo Venue (Illustrative)' : 'Verified Venue'}
                  </span>
                  <p className="text-sm font-black text-[#03594d] line-clamp-1">{turf.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#03594d]/70 uppercase font-black">Match PIN</span>
                  <p
                    data-testid="match-pin-code"
                    className="text-lg font-black font-mono text-[#03594d] tracking-wider bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d]"
                  >
                    {holdBooking.check_in_otp || '----'}
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
        )}

        {/* Active or Expired Hold State */}
        {(holdState === 'active' || holdState === 'expired') && holdBooking && (
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
              <div
                data-testid="hold-expired-card"
                className="p-8 rounded-3xl bg-white border-2 border-[#03594d] text-center shadow-maggie text-[#03594d]"
              >
                <h2 className="text-lg font-black uppercase mb-2">Slot Released</h2>
                <p className="text-xs font-semibold opacity-80 mb-6">
                  To prevent locking venues permanently, slots are freed if payment is not completed within 10 minutes.
                </p>
                <Link
                  href={`/turfs/${turf.slug}/book${court ? `?court=${court.id}` : ''}`}
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
                  <div className="flex items-center gap-3.5 pb-4 mb-4 border-b-2 border-[#03594d]/15">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm shrink-0 bg-[#03594d]/10">
                      <Image
                        src={photoSrc}
                        alt={turf.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        onError={() => setThumbFailed(true)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2 py-0.5 rounded-full border border-[#03594d] inline-block mb-1">
                        📍 {turf.region?.locality || 'Mumbai'}
                      </span>
                      <h2 className="text-base font-black uppercase tracking-tight line-clamp-1">{turf.name}</h2>
                      <p className="text-[11px] font-semibold text-[#03594d]/70 line-clamp-1">{turf.address}</p>
                    </div>
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-wider text-[#03594d]/70 mb-3">Session Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#03594d]/15">
                      <span className="text-[#03594d]/75 font-semibold">Venue</span>
                      <span className="font-black text-[#03594d]">{turf.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#03594d]/15">
                      <span className="text-[#03594d]/75 font-semibold">Court &amp; Sport</span>
                      <span className="font-black text-[#03594d]">{court?.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#03594d]/15">
                      <span className="text-[#03594d]/75 font-semibold">Time Window (IST)</span>
                      <span className="font-black text-[#03594d] bg-[#ffff94] px-2 py-0.5 rounded border border-[#03594d]">
                        {matchTimeLabel}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#03594d]/75 font-semibold">Cancellation Rule</span>
                      <span className="text-[#03594d] font-bold">
                        {turf.cancellation_rule || 'Free cancellation up to 24h'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player Information */}
                <div className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie space-y-3 text-[#03594d]">
                  <h2 className="text-base font-black uppercase mb-2">Player Details (For Receipt &amp; Access)</h2>
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
                          {turf.is_demo ? 'Demo Fee' : 'Platform Fee'}
                        </span>
                      </span>
                      <span>₹{platformFee}</span>
                    </div>
                    <p className="text-[11px] text-[#03594d]/75 font-semibold leading-relaxed">
                      {turf.is_demo
                        ? 'Illustrative fee breakdown for simulated preview. No real bank charge, UPI transfer, or automated refund is executed in demo mode.'
                        : 'Covers server-verified reservation routing and slot confirmation.'}
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
                        <span>₹{venueBalance.toLocaleString('en-IN')} {turf.is_demo ? '(Simulated Due)' : '(Gate Collection)'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={isPaying || isExpired || !turf.is_demo}
                    onClick={handleInitiatePayment}
                    className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-wider border-2 border-[#03594d] shadow-maggie transition-all flex items-center justify-center gap-2 ${
                      !turf.is_demo
                        ? 'bg-amber-100 text-[#03594d]/70 border-[#03594d]/40 cursor-not-allowed opacity-90'
                        : 'bg-[#03594d] text-[#82eda6] hover:bg-[#02463c] hover:-translate-y-0.5 cursor-pointer shadow-xl disabled:opacity-50'
                    }`}
                  >
                    {isPaying ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-[#82eda6] border-t-transparent rounded-full animate-spin" />
                        <span>{turf.is_demo ? 'Simulating Payment &amp; Match Pass...' : 'Processing Payment...'}</span>
                      </>
                    ) : !turf.is_demo ? (
                      <span>Online Payments Unavailable &bull; Gateway Setup in Progress</span>
                    ) : (
                      <>
                        <span>
                          {simulatedCheckout || turf.is_demo ? 'Simulate Payment — ' : 'Pay '}₹{onlinePayable.toLocaleString('en-IN')}{' '}
                          {paymentMode === 'token_advance' ? 'Token Advance' : 'Full Payment'} (Demo Simulation)
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
