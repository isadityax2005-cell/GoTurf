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
          <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2.5 py-0.5 rounded-full border border-[#03594d] shadow-maggie-sm">
            Owner Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-[#03594d]/80 hidden sm:inline">Rohan Mehta (Bandra Turf Arena)</span>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full bg-white border-2 border-[#03594d] text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm transition-all"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        {/* Toast Notification */}
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d] flex justify-between items-center shadow-maggie animate-in fade-in">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-[#03594d] hover:text-black font-black text-sm ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white border-2 border-[#03594d] shadow-maggie mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[#03594d]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#03594d]">
              {ownerTurf.name}
            </h1>
            <p className="text-xs text-[#03594d]/80 font-bold mt-1">
              📍 {ownerTurf.locality} &bull; Status:{' '}
              <span className="bg-[#82eda6] px-2 py-0.5 rounded-full border border-[#03594d] uppercase font-black text-[10px]">
                {ownerTurf.status}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/owner/new-turf"
              className="px-5 py-2.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
            >
              📸 + Register Turf & Upload Photos
            </Link>
            <Link
              href="/owner/availability"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie-sm transition-all"
            >
              + Block Offline Time
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-full bg-[#ffff94] hover:bg-white text-[#03594d] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie-sm transition-all"
            >
              ⚡ Admin Suite
            </Link>
          </div>
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

        {/* Courts Section */}
        <div className="mb-10">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#03594d] mb-4">
            Your Courts & Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ownerTurf.courts.map((court) => (
              <div
                key={court.name}
                className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-[#03594d] text-base">{court.name}</h3>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d]">
                    {court.sport}
                  </span>
                </div>
                <p className="text-xs text-[#03594d]/80 font-bold">🕒 Operating Hours: {court.hours}</p>
                <p className="text-xs text-[#03594d] mt-1 font-black">💰 Rates: {court.price}</p>

                <div className="mt-4 pt-3 border-t-2 border-[#03594d]/10 flex gap-2">
                  <button className="text-xs text-[#03594d] font-black uppercase px-3 py-1 rounded-lg bg-[#f9f8f4] border border-[#03594d] hover:bg-[#ffff94]">
                    Edit Hours
                  </button>
                  <button className="text-xs text-[#03594d] font-black uppercase px-3 py-1 rounded-lg bg-[#f9f8f4] border border-[#03594d] hover:bg-[#ffff94]">
                    Price Rules
                  </button>
                  <Link href="/owner/availability" className="text-xs text-[#82eda6] font-black uppercase px-3 py-1 rounded-lg bg-[#03594d] border border-[#03594d] hover:bg-[#02463c]">
                    View Schedule
                  </Link>
                </div>
              </div>
            ))}
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
