'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatTimeIST } from '@/lib/engine/slot-calculator';

interface UserBooking {
  id: string;
  turfName: string;
  turfSlug: string;
  courtName: string;
  locality: string;
  sport: string;
  startAt: string;
  endAt: string;
  status: 'held' | 'confirmed' | 'cancelled' | 'expired' | 'completed' | 'no_show';
  pricePaise: number;
  advanceAmountPaise?: number;
  balanceAmountPaise?: number;
  checkInOtp?: string;
  createdAt: string;
}

interface SampleBooking {
  id: string;
  turfName: string;
  courtName: string;
  locality: string;
  dateStr: string;
  timeWindowIST: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  priceFormatted: string;
  canCancel: boolean;
  pin?: string;
  paidOnline?: string;
  balanceDue?: string;
}

const INITIAL_SAMPLE_BOOKINGS: SampleBooking[] = [
  {
    id: 'GT-BK-8841',
    turfName: 'Kick Off Turf Bandra [Demo]',
    courtName: 'Main 5v5 Arena',
    locality: 'Bandra West',
    dateStr: 'Tomorrow, Oct 12',
    timeWindowIST: '07:00 PM – 09:00 PM (2 Hours)',
    status: 'confirmed',
    priceFormatted: '₹2,400',
    canCancel: true,
    pin: '7492',
    paidOnline: '₹245',
    balanceDue: '₹2,200',
  },
  {
    id: 'GT-BK-7319',
    turfName: 'Smash Box Cricket Arena [Demo]',
    courtName: 'Cricket Pitch 1',
    locality: 'Andheri East',
    dateStr: 'Sunday, Oct 14',
    timeWindowIST: '08:00 AM – 10:00 AM (2 Hours)',
    status: 'confirmed',
    priceFormatted: '₹1,800',
    canCancel: true,
    pin: '3184',
    paidOnline: '₹245',
    balanceDue: '₹1,600',
  },
  {
    id: 'GT-BK-6102',
    turfName: 'Powai Play Sports Arena [Demo]',
    courtName: 'Multi-Sport Court B',
    locality: 'Powai',
    dateStr: 'Last Week',
    timeWindowIST: '06:00 PM – 07:00 PM (1 Hour)',
    status: 'completed',
    priceFormatted: '₹1,000',
    canCancel: false,
    pin: '9021',
    paidOnline: '₹1,045',
    balanceDue: '₹0',
  },
];

export default function BookingsPage() {
  const [realBookings, setRealBookings] = useState<UserBooking[]>([]);
  const [sampleBookings, setSampleBookings] = useState<SampleBooking[]>(INITIAL_SAMPLE_BOOKINGS);
  const [loading, setLoading] = useState(true);
  const [showSampleBookings, setShowSampleBookings] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

      useEffect(() => {
        let isMounted = true;
        async function loadBookings() {
          try {
            const res = await fetch('/api/bookings/my-bookings');
            const data = await res.json();
            if (!isMounted) return;

            if (data.success) {
              if (Array.isArray(data.bookings) && data.bookings.length > 0) {
                setRealBookings(data.bookings);
                setShowSampleBookings(false);
              } else {
                // No real bookings found
                setRealBookings([]);
                // In demo mode or for guests, offer sample preview
                if (!data.authenticated || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
                  setShowSampleBookings(true);
                }
              }
            }
          } catch (err) {
            console.warn('Failed to load my-bookings:', err);
          } finally {
            if (isMounted) setLoading(false);
          }
        }

        loadBookings();
        return () => {
          isMounted = false;
        };
      }, []);

    const handleCancelSample = (bookingId: string) => {
      setSampleBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', canCancel: false } : b))
      );
      setNotification(
          `Sample booking ${bookingId} marked cancelled in preview. No real charges or payment action was performed.`
      );
    };

    const handleCancelRealBooking = async (bookingId: string) => {
      try {
        const res = await fetch('/api/bookings/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, reason: 'Player requested voluntary cancellation' }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setRealBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
          );
          setNotification(`✅ Booking ${bookingId} has been successfully cancelled.`);
        } else {
          setNotification(`⚠️ ${data.error || 'Failed to cancel booking.'}`);
        }
      } catch {
        setNotification('Network error while cancelling booking.');
      }
    };

    return (
      <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
        {/* Top Header */}
        <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
          <Link href="/" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
            <span>&larr;</span>
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white text-[#03594d] border border-[#03594d] shadow-maggie-sm hover:bg-[#ffff94] transition-colors"
            >
              👤 Profile
            </Link>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
              My Passes
            </span>
          </div>
        </header>

        {/* Main Container */}
        <div className="max-w-3xl w-full mx-auto px-6 py-8 flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] uppercase tracking-tight">Your Matches & Reservations</h1>
              <p className="text-xs text-[#03594d]/80 font-bold mt-1">
                View authoritative booking confirmations, match PINs, and manage your upcoming games.
              </p>
            </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSampleBookings((prev) => !prev)}
                  className="text-[11px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-[#03594d] bg-white hover:bg-[#ffff94] shadow-maggie-sm transition-all cursor-pointer"
                >
                  {showSampleBookings ? 'Hide Sample Preview' : 'Preview Sample Passes'}
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {notification && (
              <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs text-[#03594d] font-bold flex justify-between items-center shadow-maggie-sm">
                <span>{notification}</span>
                  <button onClick={() => setNotification(null)} className="text-[#03594d] hover:text-black font-black text-sm cursor-pointer">
                    &times;
                  </button>
              </div>
            )}

                {/* Loading State */ }
        { loading && (
                  <div className="p-8 rounded-3xl bg-white border-2 border-[#03594d] text-center text-xs font-black shadow-maggie">
                    Checking your match passes...
                  </div>
                )}

              {/* Real User Bookings */}
              {!loading && realBookings.length > 0 && (
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#03594d]">
                      Active Reservations ({realBookings.length})
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#82eda6] border border-[#03594d]">
                      Live Account
                    </span>
                  </div>

                  {realBookings.map((b) => {
                    const start = new Date(b.startAt);
                    const end = new Date(b.endAt);
                    const dateStr = start.toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });
                    const timeWindow = `${formatTimeIST(start)} – ${formatTimeIST(end)}`;
                    const priceFormatted = `₹${(b.pricePaise / 100).toLocaleString('en-IN')}`;
                    const advanceFormatted = b.advanceAmountPaise ? `₹${(b.advanceAmountPaise / 100).toLocaleString('en-IN')}` : null;
                    const balanceFormatted = b.balanceAmountPaise ? `₹${(b.balanceAmountPaise / 100).toLocaleString('en-IN')}` : null;
                    const canCancel = b.status === 'confirmed' || b.status === 'held';

                    return (
                      <div
                        key={b.id}
                        className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#03594d]"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono font-black text-[#03594d]/60">#{b.id.slice(0, 8)}</span>
                            <span
                              className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-[#03594d] ${b.status === 'confirmed'
                                  ? 'bg-[#82eda6] text-[#03594d]'
                                  : b.status === 'completed'
                                    ? 'bg-[#f9f8f4] text-[#03594d]/60'
                                    : b.status === 'cancelled'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-[#ffff94] text-[#03594d]'
                                }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-[#03594d]">{b.turfName}</h3>
                          <p className="text-xs text-[#03594d]/75 font-semibold mt-0.5">
                            {b.courtName} &bull; 📍 {b.locality}
                          </p>
                          <p className="text-xs text-[#03594d] font-black mt-1.5">
                            🗓️ {dateStr} &bull; 🕒 {timeWindow}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t-2 border-[#03594d]/10">
                            {b.checkInOtp && (
                              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#ffff94] text-[#03594d] border border-[#03594d]">
                                Match PIN: {b.checkInOtp}
                              </span>
                            )}
                            {balanceFormatted && balanceFormatted !== '₹0' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f9f8f4] text-[#03594d] border border-[#03594d]">
                                Advance Paid: {advanceFormatted} &bull; Balance Due at Venue: {balanceFormatted}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#82eda6] text-[#03594d] border border-[#03594d]">
                                100% Pre-Paid Online
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-[#03594d]/10">
                          <span className="text-base font-black text-[#03594d]">{priceFormatted}</span>

                          <div className="flex gap-2">
                            {b.turfSlug && (
                              <Link
                                href={`/turfs/${b.turfSlug}`}
                                className="px-4 py-2 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] text-xs font-black uppercase border-2 border-[#03594d] shadow-maggie-sm transition-colors"
                              >
                                Venue Info
                              </Link>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancelRealBooking(b.id)}
                                className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-600 text-xs font-black uppercase transition-colors cursor-pointer"
                              >
                                Cancel Match
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State when no real bookings exist */}
              {!loading && realBookings.length === 0 && !showSampleBookings && (
                <div className="p-8 sm:p-12 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie text-center text-[#03594d] mb-8">
                  <div className="text-4xl mb-3">🏟️</div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Match Passes Yet</h3>
                  <p className="text-xs font-bold text-[#03594d]/75 max-w-md mx-auto mb-6">
                    You haven&apos;t reserved any turf slots yet. Explore available grounds across Mumbai and book your next box cricket, football, or padel session!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link
                      href="/turfs"
                      className="px-6 py-3 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
                    >
                      Browse Turfs & Slots →
                    </Link>
                    <button
                      onClick={() => setShowSampleBookings(true)}
                      className="px-5 py-3 rounded-full bg-[#f9f8f4] text-[#03594d] text-xs font-black uppercase border-2 border-[#03594d] shadow-maggie-sm hover:bg-[#ffff94] transition-all cursor-pointer"
                    >
                      View Sample Pass Layout
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Bookings Preview */}
              {showSampleBookings && (
                <div className="space-y-4">
                  <div
                    data-testid="sample-bookings-banner"
                    className="p-4 rounded-2xl bg-white border-2 border-[#03594d] text-xs text-[#03594d] font-bold shadow-maggie-sm"
                  >
                      <span className="px-2 py-0.5 mr-2 rounded bg-[#03594d] text-[#ffff94] text-[10px] font-black uppercase">Sample data</span>
                      These are illustrative sample reservations for demonstration. Your actual confirmed bookings will appear above under your verified account.
                    </div>

                          {sampleBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#03594d]"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] font-mono font-black text-[#03594d]/60">SAMPLE {booking.id}</span>
                                  <span
                                    className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-[#03594d] ${booking.status === 'confirmed'
                                        ? 'bg-[#ffff94] text-[#03594d]'
                                        : booking.status === 'completed'
                                          ? 'bg-[#f9f8f4] text-[#03594d]/60'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>

                                <h3 className="text-lg font-black text-[#03594d]">{booking.turfName}</h3>
                                <p className="text-xs text-[#03594d]/75 font-semibold mt-0.5">
                                  {booking.courtName} &bull; 📍 {booking.locality}
                                </p>
                                <p className="text-xs text-[#03594d] font-black mt-1.5">
                                  🗓️ {booking.dateStr} &bull; 🕒 {booking.timeWindowIST}
                                </p>

                  {booking.pin && (
                                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t-2 border-[#03594d]/10">
                                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#ffff94] text-[#03594d] border border-[#03594d]">
                                        Match PIN: {booking.pin}
                                      </span>
                                      {booking.balanceDue && booking.balanceDue !== '₹0' ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f9f8f4] text-[#03594d] border border-[#03594d]">
                                          Paid Online: {booking.paidOnline} &bull; Due at Venue: {booking.balanceDue}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#82eda6] text-[#03594d] border border-[#03594d]">
                                          100% Pre-Paid Online
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-[#03594d]/10">
                                  <span className="text-base font-black text-[#03594d]">{booking.priceFormatted}</span>

                                  <div className="flex gap-2">
                                    <Link
                                      href="/turfs"
                                      className="px-4 py-2 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] text-xs font-black uppercase border-2 border-[#03594d] shadow-maggie-sm transition-colors"
                                    >
                                      Venue Info
                                    </Link>
                                    {booking.canCancel && (
                                      <button
                                        onClick={() => handleCancelSample(booking.id)}
                                        className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-600 text-xs font-black uppercase transition-colors cursor-pointer"
                                      >
                                        Cancel Match
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                    ))}
                  </div>
        )}
                </div>

      {/* Footer */}
              <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
                GoTurf &bull; Match Passes & Reservations
              </footer>
            </main>
            );
}
