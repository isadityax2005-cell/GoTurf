'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Turf } from '@/types/database';

interface CheckoutClientProps {
  turf: Turf;
  courtId?: string;
  slotId?: string;
}

export default function CheckoutClient({ turf, courtId: propCourtId, slotId: propSlotId }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courtId = searchParams.get('court') || propCourtId;
  const slotId = searchParams.get('slot') || propSlotId;
  const court = turf.courts?.find((c) => c.id === courtId) || turf.courts?.[0];

  // 10-minute countdown (600 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [isExpired, setIsExpired] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [playerName, setPlayerName] = useState('Karan Verma');
  const [playerPhone, setPlayerPhone] = useState('+91 98200 11223');
  const [playerEmail, setPlayerEmail] = useState('karan.verma@example.com');

  // Pricing breakdown
  const basePrice = 1800;
  const platformFee = 45;
  const totalAmount = basePrice + platformFee;

  useEffect(() => {
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
  }, [secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleRelease = async () => {
    setIsReleasing(true);
    try {
      await fetch('/api/bookings/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdId: slotId || 'demo-hold' }),
      });
    } catch {
      // ignore
    }
    router.push(`/turfs/${turf.slug}`);
  };

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
          <span className="text-xs text-neutral-400">Hold Active</span>
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-6 py-8 flex-1">
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
              className={`text-2xl font-black font-mono tracking-tight ${
                isExpired ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatTimer(secondsRemaining)}
            </span>
          </div>
        </div>

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
                  <span className="text-neutral-400">Date</span>
                  <span className="font-semibold text-white">Thursday, 15 Oct 2026</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
                  <span className="text-neutral-400">Time Window (IST)</span>
                  <span className="font-semibold text-emerald-400">06:00 PM &ndash; 07:00 PM</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Cancellation Rule</span>
                  <span className="text-neutral-300 font-medium">Free cancellation up to 24h</span>
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
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-2 text-xs">
              <h2 className="text-base font-bold text-white mb-3">Price Breakdown</h2>
              <div className="flex justify-between text-neutral-300">
                <span>Slot Fee (60 Mins)</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Platform Convenience Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-neutral-400 text-[11px]">
                <span>Payment Gateway & GST</span>
                <span>Included</span>
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
                onClick={() => alert('Phase 6 Gateway Trigger: Razorpay UPI Modal will open here.')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-sm hover:opacity-95 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Pay ₹{totalAmount.toLocaleString('en-IN')} via UPI / Card</span>
                <span>&rarr;</span>
              </button>

              <button
                type="button"
                disabled={isReleasing}
                onClick={handleRelease}
                className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
              >
                {isReleasing ? 'Releasing Slot...' : 'Release Slot & Back Out'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        Bank-Grade Encryption &bull; Signed Webhook Guarantee &bull; GoTurf Pay
      </footer>
    </main>
  );
}
