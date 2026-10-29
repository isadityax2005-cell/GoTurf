'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BookingItem {
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: 'GT-BK-8841',
      turfName: 'Kick Off Turf Bandra',
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
      turfName: 'Smash Box Cricket Arena',
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
      turfName: 'Powai Play Sports Arena',
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
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', canCancel: false } : b))
    );
    setNotification(
      `Sample booking ${bookingId} marked cancelled in this preview only. No real cancellation, refund or payment action was performed.`
    );
  };

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Header */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90">
        <Link href="/" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Home</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
          My Bookings
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] uppercase tracking-tight">Your Matches & Reservations</h1>
          <p className="text-xs text-[#03594d]/80 font-bold mt-1">
            View booking confirmations, directions, and manage your upcoming games.
          </p>
        </div>

        <div
          data-testid="sample-bookings-banner"
          className="mb-6 p-4 rounded-2xl bg-white border-2 border-[#03594d] text-xs text-[#03594d] font-bold shadow-maggie-sm"
        >
          <span className="px-2 py-0.5 mr-2 rounded bg-[#03594d] text-[#ffff94] text-[10px] font-black uppercase">Sample data</span>
          These are illustrative sample reservations, not connected to your account. A real booking&apos;s Match Pass is shown on its checkout confirmation screen.
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs text-[#03594d] font-bold flex justify-between items-center shadow-maggie-sm">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-[#03594d] hover:text-black font-black text-sm">
              &times;
            </button>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#03594d]"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-black text-[#03594d]/60">SAMPLE {booking.id}</span>
                  <span
                    className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-[#03594d] ${
                      booking.status === 'confirmed'
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
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-600 text-xs font-black uppercase transition-colors"
                    >
                      Cancel Match
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf &bull; Sample Booking Preview
      </footer>
    </main>
  );
}
