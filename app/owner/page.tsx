'use client';

import { useState } from 'react';
import Link from 'next/link';

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

  const ownerTurf = {
    name: 'Bandra Turf Arena [Demo]',
    locality: 'Bandra West, Mumbai',
    status: 'approved',
    courts: [
      { name: 'Court 1 - Box Cricket', sport: 'Box Cricket', hours: '06:00 - 23:00', price: '₹1,200 - ₹1,800/hr' },
      { name: 'Arena B - Football', sport: '5-a-side Football', hours: '06:00 - 23:00', price: '₹1,400 - ₹2,000/hr' },
    ],
  };

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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-sm">
              GT
            </div>
            <span className="font-bold text-lg tracking-tight text-white">GoTurf</span>
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Owner Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-400 hidden sm:inline">Rohan Mehta (Bandra Turf Arena)</span>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        {/* Toast Notification */}
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 flex justify-between items-center shadow-lg animate-in fade-in">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white text-xs ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {ownerTurf.name}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              📍 {ownerTurf.locality} &bull; Status: <span className="text-emerald-400 font-semibold uppercase">{ownerTurf.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/owner/new-turf"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              + Register New Turf
            </Link>
            <Link
              href="/owner/availability"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              + Block Offline Time
            </Link>
          </div>
        </div>

        {/* TODAY'S MATCH ARRIVALS & BALANCE COLLECTION CONSOLE */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Today&apos;s Matchday Check-In & Balance Collection</h2>
              <p className="text-xs text-neutral-400">Collect on-site cash or direct venue UPI when squads arrive at your gate.</p>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
              Gate Check-in Active
            </span>
          </div>

          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-neutral-900/80 px-4 py-3 font-semibold text-neutral-400 border-b border-neutral-800">
              <div className="col-span-3">Captain & PIN</div>
              <div className="col-span-3">Court & Time</div>
              <div className="col-span-2">Online Advance</div>
              <div className="col-span-2">Balance Due</div>
              <div className="col-span-2 text-right">Collect & Check In</div>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {arrivals.map((b) => (
                <div key={b.id} className="grid grid-cols-12 px-4 py-3.5 items-center">
                  <div className="col-span-3">
                    <p className="font-bold text-white">{b.captain}</p>
                    <p className="text-[11px] text-neutral-400">{b.phone}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 border border-neutral-700">
                      PIN: {b.pin}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <p className="text-white font-medium">{b.court}</p>
                    <p className="text-[11px] text-neutral-400">{b.timeSlot}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ₹{b.paidOnline} (Paid Online)
                    </span>
                  </div>

                  <div className="col-span-2">
                    {b.balanceStatus === 'unpaid' ? (
                      <div>
                        <span className="text-amber-400 font-bold text-sm">₹{b.balanceDue.toLocaleString('en-IN')}</span>
                        <p className="text-[10px] text-neutral-500">Due at Gate</p>
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ {b.balanceStatus === 'collected_cash' ? 'Paid in Cash' : 'Paid via Venue UPI'}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-right">
                    {b.balanceStatus === 'unpaid' ? (
                      <div className="flex flex-col sm:flex-row gap-1.5 justify-end">
                        <button
                          onClick={() => handleCollectBalance(b, 'cash')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold shadow-sm cursor-pointer"
                        >
                          💵 Cash
                        </button>
                        <button
                          onClick={() => handleCollectBalance(b, 'venue_upi')}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-semibold border border-neutral-700 cursor-pointer"
                        >
                          📱 UPI
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Squad Checked In
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courts Section */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">Your Courts & Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownerTurf.courts.map((court) => (
              <div
                key={court.name}
                className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white text-base">{court.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-medium">
                    {court.sport}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">🕒 Operating Hours: {court.hours}</p>
                <p className="text-xs text-emerald-400 mt-1 font-medium">💰 Rates: {court.price}</p>

                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex gap-2">
                  <button className="text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800/60">
                    Edit Hours
                  </button>
                  <button className="text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800/60">
                    Price Rules
                  </button>
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10">
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        GoTurf Owner Control Suite &bull; Payouts Processed Weekly Every Monday
      </footer>
    </main>
  );
}
