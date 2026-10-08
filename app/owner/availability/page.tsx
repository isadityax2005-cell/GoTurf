'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DEMO_TURFS } from '@/lib/data/turfs';
import {
  getActiveBookingsForCourt,
  createOwnerBlock,
  removeOwnerBlock,
} from '@/lib/data/bookings';
import { generateCourtSlots, type SlotGridItem } from '@/lib/engine/slot-calculator';

export default function OwnerAvailabilityPage() {
  const turf = DEMO_TURFS[0]; // Rohan Mehta's Bandra venue
  const courts = turf.courts || [];

  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || '');
  const selectedCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  const [selectedDateStr, setSelectedDateStr] = useState('2026-10-15');
  const [modalSlot, setModalSlot] = useState<SlotGridItem | null>(null);
  const [blockReason, setBlockReason] = useState('Phone Booking');
  const [statusNote, setStatusNote] = useState<string | null>(null);

  // Generate slots for this court & date
  const slots = useMemo(() => {
    if (!selectedCourt) return [];
    const activeBookings = getActiveBookingsForCourt(selectedCourt.id);

    return generateCourtSlots({
      court: selectedCourt,
      dateStr: selectedDateStr,
      activeBookings,
      now: new Date('2026-10-15T00:00:00Z'), // fixed testing anchor
    });
  }, [selectedCourt, selectedDateStr, statusNote]);

  const handleConfirmBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSlot || !selectedCourt) return;

    createOwnerBlock({
      courtId: selectedCourt.id,
      startAt: modalSlot.startAtUTC,
      endAt: modalSlot.endAtUTC,
      notes: blockReason,
    });

    setStatusNote(`🔒 Blocked slot (${modalSlot.startTimeIST} – ${modalSlot.endTimeIST}) for "${blockReason}".`);
    setModalSlot(null);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link href="/owner" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white">
          <span>&larr;</span>
          <span>Owner Dashboard</span>
        </Link>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Availability Management
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto px-6 py-8 flex-1">
        <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Manage Court Schedule & Offline Blocks
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Tap any free slot to block it for WhatsApp/phone bookings, maintenance, or batches.
            </p>
          </div>
        </div>

        {statusNote && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-xs text-emerald-400 flex justify-between items-center shadow-lg">
            <span>{statusNote}</span>
            <button onClick={() => setStatusNote(null)} className="text-neutral-400 hover:text-white">
              &times;
            </button>
          </div>
        )}

        {/* Court and Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-400 mb-2">Select Court:</label>
            <div className="flex gap-2">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setSelectedCourtId(court.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    selectedCourt?.id === court.id
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-400 mb-2">Date (YYYY-MM-DD):</label>
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Slot Grid for Owner */}
        <div>
          <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
            All Slots for {selectedDateStr}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isFree = slot.status === 'available';
              const isBlocked = slot.status === 'blocked';
              const isBooked = slot.status === 'booked';

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isFree
                      ? 'bg-neutral-900/40 border-neutral-800 hover:border-emerald-500/50'
                      : isBlocked
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-neutral-900/20 border-neutral-900 opacity-70'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{slot.startTimeIST}</span>
                    <span className="text-[10px] text-neutral-500">{slot.endTimeIST}</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-2 block">
                      {slot.priceFormatted}
                    </span>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-800/40">
                    {isFree && (
                      <button
                        onClick={() => setModalSlot(slot)}
                        className="w-full py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-neutral-200 transition-colors"
                      >
                        + Block Time
                      </button>
                    )}

                    {isBlocked && (
                      <div className="text-[10px] text-amber-400 font-semibold flex items-center justify-between">
                        <span>🔒 Offline Block</span>
                      </div>
                    )}

                    {isBooked && (
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        ⚽ Player Booked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Block Slot Modal */}
      {modalSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Block Court Offline</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Reserve slot {modalSlot.startTimeIST} &ndash; {modalSlot.endTimeIST} so players cannot book online.
            </p>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Reason for Block:</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                >
                  <option value="Phone Booking">Phone Booking (Advance Collected)</option>
                  <option value="WhatsApp Booking">WhatsApp Booking</option>
                  <option value="Coaching Academy Batch">Coaching Academy Batch</option>
                  <option value="Turf Maintenance & Lighting">Turf Maintenance / Lighting</option>
                  <option value="Private League Match">Private League Match</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSlot(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Confirm Offline Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        GoTurf Owner Availability Engine &bull; Instant Double-Booking Safeguard Active
      </footer>
    </main>
  );
}
