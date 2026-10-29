'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTurfPhotoUrl } from '@/lib/utils/turf-photo';
import type { Turf } from '@/types/database';

interface ArrivalBooking {
  id: string;
  captain: string;
  phone: string;
  court: string;
  timeSlot: string;
  paidOnline: number; // in rupees
  balanceDue: number; // in rupees
  pin: string;
  balanceStatus: 'unpaid' | 'collected_cash' | 'collected_venue_upi';
}

export default function OwnerDashboardPage() {
  const [notification, setNotification] = useState<string | null>(null);
  const [myTurfs, setMyTurfs] = useState<Turf[]>([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);

  useEffect(() => {
    async function loadOwnerTurfs() {
      try {
        const res = await fetch('/api/owner/my-turfs');
        const data = await res.json();
        if (data.success && Array.isArray(data.turfs)) {
          setMyTurfs(data.turfs);
        }
      } catch (err) {
        console.warn('Failed to load owner turfs:', err);
      } finally {
        setLoadingTurfs(false);
      }
    }
    loadOwnerTurfs();
  }, []);

  // Today's matchday bookings arriving at the venue
  const [arrivals, setArrivals] = useState<ArrivalBooking[]>([
    {
      id: 'booking-preseeded-1',
      captain: 'Karan Verma',
      phone: '+91 98200 11223',
      court: 'Court 1 - Box Cricket',
      timeSlot: '06:00 PM – 07:00 PM',
      paidOnline: 245,
      balanceDue: 1600,
      pin: '4821',
      balanceStatus: 'unpaid',
    },
    {
      id: 'booking-demo-arriving-2',
      captain: 'Rahul Sharma',
      phone: '+91 98200 44556',
      court: 'Arena B - Football',
      timeSlot: '07:00 PM – 08:00 PM',
      paidOnline: 245,
      balanceDue: 1800,
      pin: '7392',
      balanceStatus: 'unpaid',
    },
  ]);

  const handleCollectBalance = async (booking: ArrivalBooking, method: 'cash' | 'venue_upi') => {
    try {
      const res = await fetch('/api/bookings/collect-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          method,
          attendantId: 'attendant-rohan-mehta',
        }),
      });

      const data = await res.json();
      if (res.ok || data.success) {
        setArrivals((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? { ...b, balanceStatus: method === 'cash' ? 'collected_cash' : 'collected_venue_upi' }
              : b
          )
        );
        setNotification(
          `✅ Collected ₹${booking.balanceDue.toLocaleString('en-IN')} via ${
            method === 'cash' ? 'Cash' : 'Venue UPI'
          } for ${booking.captain} (PIN: ${booking.pin}). Court access activated!`
        );
      } else {
        setNotification(`⚠️ ${data.error || 'Failed to record balance collection'}`);
      }
    } catch {
      setNotification('Network error recording balance. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Navbar */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-full bg-[#03594d] text-[#82eda6] flex items-center justify-center font-black text-sm shadow-maggie-sm group-hover:rotate-6 transition-transform">
              GT
            </div>
            <span className="font-black text-2xl tracking-tight text-[#03594d] lowercase">goturf</span>
          </Link>
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm">
            Owner Control Suite
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-black">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full bg-[#ffff94] hover:bg-white text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm transition-all uppercase text-[11px]"
          >
            ⚡ Admin Control Suite
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] border-2 border-[#03594d] shadow-maggie-sm transition-all uppercase text-[11px]"
          >
            Switch Account
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Toast Alert */}
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie flex items-center justify-between text-xs font-bold text-[#03594d] animate-in fade-in">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-[#03594d] hover:underline font-black cursor-pointer text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[#03594d]">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ffff94] text-[#03594d] px-3 py-0.5 rounded-full border border-[#03594d] text-[10px] font-black uppercase tracking-wider mb-2">
              <span>🏟️ Venue Partner Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#03594d]">
              Turf Operations Hub
            </h1>
            <p className="text-xs text-[#03594d]/80 font-bold mt-1">
              Manage your grounds, view real-time gate check-ins, and register new venues directly in Supabase.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/owner/new-turf"
              className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
            >
              📸 + Register New Turf
            </Link>
            <Link
              href="/owner/availability"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie-sm transition-all"
            >
              + Block Offline Time
            </Link>
          </div>
        </div>

        {/* REGISTERED VENUES FROM SUPABASE */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#03594d]">
                Your Live Venues in Supabase ({myTurfs.length})
              </h2>
              <p className="text-xs text-[#03594d]/80 font-bold">
                Real-time status of grounds linked to your owner account
              </p>
            </div>
            <Link
              href="/owner/new-turf"
              className="text-xs font-black underline hover:opacity-80 text-[#03594d]"
            >
              + Add Venue
            </Link>
          </div>

          {loadingTurfs ? (
            <div className="p-8 rounded-3xl bg-white border-2 border-[#03594d] text-center font-bold text-xs text-[#03594d]">
              Loading venues from Supabase database...
            </div>
          ) : myTurfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myTurfs.map((turf) => {
                const photoUrl = getTurfPhotoUrl(turf.photos?.[0], turf.courts?.[0]?.sport || 'cricket');
                const isApproved = turf.status === 'approved';

                return (
                  <div
                    key={turf.id}
                    className="p-5 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie flex flex-col justify-between gap-4 text-[#03594d]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm shrink-0 bg-[#03594d]/10">
                        <Image
                          src={photoUrl}
                          alt={turf.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-[#03594d] ${
                              isApproved ? 'bg-[#82eda6]' : 'bg-[#ffff94]'
                            }`}
                          >
                            {isApproved ? '✓ Live & Bookable' : '⏳ Pending Review'}
                          </span>
                          <span className="text-[10px] text-[#03594d]/70 font-bold">
                            📍 {turf.region?.locality || (turf as Turf & { locality?: string }).locality || 'Mumbai'}
                          </span>
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-tight">{turf.name}</h3>
                        <p className="text-xs text-[#03594d]/75 font-semibold line-clamp-1">{turf.address}</p>
                        <p className="text-xs font-bold text-[#03594d] mt-1">
                          {turf.courts?.length || 1} Active Court{(turf.courts?.length || 1) === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-[#03594d]/15 flex items-center justify-between text-xs font-black">
                      <Link
                        href={`/turfs/${turf.slug}`}
                        className="text-[#03594d] hover:underline flex items-center gap-1"
                      >
                        <span>Preview Venue Page</span>
                        <span>&rarr;</span>
                      </Link>

                      <Link
                        href="/owner/availability"
                        className="px-3 py-1.5 rounded-xl bg-[#f9f8f4] hover:bg-[#ffff94] border border-[#03594d] text-[11px] uppercase tracking-wider"
                      >
                        Calendar & Blocks
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border-2 border-[#03594d] text-center max-w-md mx-auto shadow-maggie">
              <span className="text-3xl block mb-2">🏟️</span>
              <h3 className="font-black text-sm uppercase mb-1">No Venues Registered Yet</h3>
              <p className="text-xs font-semibold text-[#03594d]/75 mb-4">
                You haven&apos;t registered any turfs under this account.
              </p>
              <Link
                href="/owner/new-turf"
                className="px-6 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider shadow-maggie inline-block"
              >
                Register Your First Turf &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* TODAY'S MATCH ARRIVALS & BALANCE COLLECTION CONSOLE */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#03594d]">
                Today&apos;s Matchday Check-In & Balance Collection
              </h2>
              <p className="text-xs text-[#03594d]/80 font-bold">
                Collect on-site cash or direct venue UPI when squads arrive at your gate.
              </p>
            </div>
            <span className="text-[10px] text-[#03594d] bg-[#ffff94] border border-[#03594d] px-3 py-1 rounded-full font-black uppercase shadow-maggie-sm">
              Gate Check-in Active
            </span>
          </div>

          <div className="rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie overflow-hidden text-xs text-[#03594d]">
            <div className="grid grid-cols-12 bg-[#f9f8f4] px-4 py-3.5 font-black uppercase tracking-wider text-[#03594d] border-b-2 border-[#03594d]/15">
              <div className="col-span-3">Captain & PIN</div>
              <div className="col-span-3">Court & Time</div>
              <div className="col-span-2">Online Advance</div>
              <div className="col-span-2">Balance Due</div>
              <div className="col-span-2 text-right">Collect & Check In</div>
            </div>

            <div className="divide-y-2 divide-[#03594d]/10">
              {arrivals.map((b) => (
                <div key={b.id} className="grid grid-cols-12 px-4 py-4 items-center">
                  <div className="col-span-3">
                    <p className="font-black text-[#03594d] text-sm">{b.captain}</p>
                    <p className="text-[11px] text-[#03594d]/70 font-semibold">{b.phone}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#ffff94] text-[#03594d] border border-[#03594d]">
                      PIN: {b.pin}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <p className="text-[#03594d] font-black">{b.court}</p>
                    <p className="text-[11px] text-[#03594d]/70 font-semibold">{b.timeSlot}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#82eda6] text-[#03594d] border border-[#03594d]">
                      ₹{b.paidOnline} (Paid Online)
                    </span>
                  </div>

                  <div className="col-span-2">
                    {b.balanceStatus === 'unpaid' ? (
                      <div>
                        <span className="text-[#03594d] font-black text-sm">₹{b.balanceDue.toLocaleString('en-IN')}</span>
                        <p className="text-[10px] text-[#03594d]/70 font-bold">Due at Gate</p>
                      </div>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#ffff94] text-[#03594d] border border-[#03594d]">
                        ✓ {b.balanceStatus === 'collected_cash' ? 'Paid in Cash' : 'Paid via Venue UPI'}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-right">
                    {b.balanceStatus === 'unpaid' ? (
                      <div className="flex flex-col sm:flex-row gap-1.5 justify-end">
                        <button
                          onClick={() => handleCollectBalance(b, 'cash')}
                          className="px-3 py-1.5 rounded-xl bg-[#03594d] hover:bg-[#02463c] text-[#82eda6] text-[11px] font-black uppercase border border-[#03594d] shadow-maggie-sm cursor-pointer"
                        >
                          💵 Cash
                        </button>
                        <button
                          onClick={() => handleCollectBalance(b, 'venue_upi')}
                          className="px-3 py-1.5 rounded-xl bg-[#ffff94] hover:bg-[#f5f583] text-[#03594d] text-[11px] font-black uppercase border border-[#03594d] shadow-maggie-sm cursor-pointer"
                        >
                          📱 UPI
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#03594d] font-black bg-[#82eda6] px-2 py-0.5 rounded border border-[#03594d]">
                        Squad Checked In
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf Owner Control Suite &bull; Payouts Processed Weekly Every Monday
      </footer>
    </main>
  );
}
