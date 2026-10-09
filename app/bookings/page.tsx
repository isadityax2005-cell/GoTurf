'use client';

import { useState } from 'react';
import Link from 'next/link';

interface UserBooking {
  id: string;
  turfName: string;
  courtName: string;
  locality: string;
  sport: string;
  dateStr: string;
  timeWindowIST: string;
  priceFormatted: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  canCancel: boolean;
  pin?: string;
  paymentMode?: 'token_advance' | 'full_online';
  paidOnline?: string;
  balanceDue?: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<UserBooking[]>([
    {
      id: 'GT-BK-9812',
      turfName: 'Bandra Turf Arena [Demo]',
      courtName: 'Court 1 - Box Cricket',
      locality: 'Bandra West, Mumbai',
      sport: 'Cricket',
      dateStr: 'Thursday, 15 Oct 2026',
      timeWindowIST: '06:00 PM – 07:00 PM',
      priceFormatted: '₹1,845',
      status: 'confirmed',
      canCancel: true,
      pin: '4821',
      paymentMode: 'token_advance',
      paidOnline: '₹245',
      balanceDue: '₹1,600',
    },
    {
      id: 'GT-BK-7432',
      turfName: 'Powai Smash & Volley Club [Demo]',
      courtName: 'Court A - Pickleball',
      locality: 'Powai, Mumbai',
      sport: 'Pickleball',
      dateStr: 'Sunday, 11 Oct 2026',
      timeWindowIST: '08:00 AM – 09:00 AM',
      priceFormatted: '₹1,245',
      status: 'completed',
      canCancel: false,
      pin: '8392',
      paymentMode: 'full_online',
      paidOnline: '₹1,245',
      balanceDue: '₹0',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Refunds are processed according to the turf policy.')) {
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const, canCancel: false } : b))
    );

    setNotification('✅ Booking cancelled. Full refund of ₹1,800 initiated per 24h turf cancellation policy.');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link href="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
          <span>&larr;</span>
          <span>Home</span>
        </Link>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          My Bookings
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Matches & Reservations</h1>
          <p className="text-xs text-neutral-400 mt-1">
            View booking confirmations, directions, and manage your upcoming games.
          </p>
        </div>

        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-xs text-emerald-400 flex justify-between items-center shadow-lg">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white">
              &times;
            </button>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-neutral-500">{booking.id}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : booking.status === 'completed'
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{booking.turfName}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {booking.courtName} &bull; 📍 {booking.locality}
                </p>
                <p className="text-xs text-emerald-400 font-medium mt-1.5">
                  🗓️ {booking.dateStr} &bull; 🕒 {booking.timeWindowIST}
                </p>

                {booking.pin && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-neutral-800/60">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 border border-neutral-700">
                      Match PIN: {booking.pin}
                    </span>
                    {booking.balanceDue && booking.balanceDue !== '₹0' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Paid Online: {booking.paidOnline} &bull; Due at Venue: {booking.balanceDue}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        100% Pre-Paid Online
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                <span className="text-sm font-extrabold text-white">{booking.priceFormatted}</span>

                <div className="flex gap-2">
                  <Link
                    href="/turfs"
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                  >
                    Venue Info
                  </Link>
                  {booking.canCancel && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
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
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        GoTurf &bull; Live Match Confirmations
      </footer>
    </main>
  );
}
