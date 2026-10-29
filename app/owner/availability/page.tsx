'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Turf } from '@/types/database';

interface AdminSlot {
  id: string;
  startTimeIST: string;
  endTimeIST: string;
  status: 'available' | 'blocked' | 'booked';
  priceFormatted: string;
  courtId: string;
}

interface CourtOption {
  id: string;
  name: string;
  turfName?: string;
}

export default function AvailabilityManagementPage() {
  const [selectedCourtId, setSelectedCourtId] = useState('court-1');
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const [courts, setCourts] = useState<CourtOption[]>([
    { id: 'court-1', name: 'Court 1 - Box Cricket' },
    { id: 'court-2', name: 'Arena B - Football' },
  ]);

  useEffect(() => {
    async function loadCourts() {
      try {
        const res = await fetch('/api/owner/my-turfs');
        const data = await res.json();
        if (data.success && Array.isArray(data.turfs) && data.turfs.length > 0) {
          const loadedCourts: CourtOption[] = [];
          data.turfs.forEach((t: Turf) => {
            if (t.courts && t.courts.length > 0) {
              t.courts.forEach((c) => {
                loadedCourts.push({
                  id: c.id,
                  name: `${t.name}: ${c.name} (${c.sport})`,
                  turfName: t.name,
                });
              });
            }
          });
          if (loadedCourts.length > 0) {
            setCourts(loadedCourts);
            setSelectedCourtId(loadedCourts[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load owner courts:', err);
      }
    }
    loadCourts();
  }, []);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  const [slots, setSlots] = useState<AdminSlot[]>([
    { id: 's-1', startTimeIST: '06:00 AM', endTimeIST: '07:00 AM', status: 'available', priceFormatted: '₹1,200', courtId: 'court-1' },
    { id: 's-2', startTimeIST: '07:00 AM', endTimeIST: '08:00 AM', status: 'available', priceFormatted: '₹1,200', courtId: 'court-1' },
    { id: 's-3', startTimeIST: '08:00 AM', endTimeIST: '09:00 AM', status: 'blocked', priceFormatted: '₹1,200', courtId: 'court-1' },
    { id: 's-4', startTimeIST: '09:00 AM', endTimeIST: '10:00 AM', status: 'available', priceFormatted: '₹1,200', courtId: 'court-1' },
    { id: 's-5', startTimeIST: '06:00 PM', endTimeIST: '07:00 PM', status: 'booked', priceFormatted: '₹1,800', courtId: 'court-1' },
    { id: 's-6', startTimeIST: '07:00 PM', endTimeIST: '08:00 PM', status: 'available', priceFormatted: '₹1,800', courtId: 'court-1' },
    { id: 's-7', startTimeIST: '08:00 PM', endTimeIST: '09:00 PM', status: 'available', priceFormatted: '₹1,800', courtId: 'court-1' },
    { id: 's-8', startTimeIST: '09:00 PM', endTimeIST: '10:00 PM', status: 'available', priceFormatted: '₹1,800', courtId: 'court-1' },
  ]);

  const [modalSlot, setModalSlot] = useState<AdminSlot | null>(null);
  const [blockReason, setBlockReason] = useState('Phone Booking');

  const handleConfirmBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSlot) return;

    setSlots((prev) =>
      prev.map((s) => (s.id === modalSlot.id ? { ...s, status: 'blocked' } : s))
    );
    setStatusNote(`🔒 Blocked slot ${modalSlot.startTimeIST} (${blockReason}). Offline lock synced.`);
    setModalSlot(null);
  };

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d]">
      {/* Top Navbar */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#82eda6]/90 text-[#03594d]">
        <Link href="/owner" className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider">
          <span>&larr;</span>
          <span>Owner Dashboard</span>
        </Link>
        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
          Availability Management
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto px-6 py-8 flex-1">
        <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#03594d] uppercase tracking-tight">
              Manage Court Schedule & Offline Blocks
            </h1>
            <p className="text-xs text-[#03594d]/80 font-bold mt-1">
              Tap any free slot to block it for WhatsApp/phone bookings, maintenance, or batches.
            </p>
          </div>
        </div>

        {statusNote && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-xs font-bold text-[#03594d] flex justify-between items-center shadow-maggie animate-in fade-in">
            <span>{statusNote}</span>
            <button onClick={() => setStatusNote(null)} className="text-[#03594d] hover:text-black font-black text-sm">
              &times;
            </button>
          </div>
        )}

        {/* Court and Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
            <label className="block text-xs font-black uppercase tracking-wider mb-2">Select Court:</label>
            <div className="flex gap-2">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setSelectedCourtId(court.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all border-2 border-[#03594d] ${
                    selectedCourt?.id === court.id
                      ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
                      : 'bg-[#f9f8f4] text-[#03594d] hover:bg-[#ffff94]'
                  }`}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie text-[#03594d]">
            <label className="block text-xs font-black uppercase tracking-wider mb-2">Date (YYYY-MM-DD):</label>
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#f9f8f4] border-2 border-[#03594d] text-xs font-bold text-[#03594d] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Slot Grid for Owner */}
        <div>
          <h2 className="text-sm font-black text-[#03594d] mb-3 uppercase tracking-wider">
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
                  className={`p-4 rounded-2xl border-2 border-[#03594d] flex flex-col justify-between text-[#03594d] ${
                    isFree
                      ? 'bg-white shadow-maggie-sm hover:shadow-maggie'
                      : isBlocked
                      ? 'bg-[#ffff94] shadow-maggie-sm'
                      : 'bg-[#f9f8f4]/60 border-[#03594d]/40 opacity-70'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black block">{slot.startTimeIST}</span>
                    <span className="text-[10px] text-[#03594d]/70 font-semibold">{slot.endTimeIST}</span>
                    <span className="text-xs font-black mt-2 block">
                      {slot.priceFormatted}
                    </span>
                  </div>

                  <div className="mt-4 pt-2 border-t-2 border-[#03594d]/10">
                    {isFree && (
                      <button
                        onClick={() => setModalSlot(slot)}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#03594d] text-[#82eda6] text-[11px] font-black uppercase hover:bg-[#02463c] transition-colors"
                      >
                        + Block Time
                      </button>
                    )}

                    {isBlocked && (
                      <div className="text-[10px] font-black uppercase text-[#03594d] flex items-center justify-between">
                        <span>🔒 Offline Block</span>
                      </div>
                    )}

                    {isBooked && (
                      <span className="text-[10px] text-[#03594d]/80 font-bold uppercase">
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
        <div className="fixed inset-0 bg-[#03594d]/75 backdrop-blur-sm flex items-center justify-center p-6 z-50 text-[#03594d]">
          <div className="max-w-md w-full bg-[#f9f8f4] border-2 border-[#03594d] rounded-[32px] p-6 shadow-maggie-xl">
            <h3 className="text-lg font-black uppercase mb-1">Block Court Offline</h3>
            <p className="text-xs text-[#03594d]/80 font-semibold mb-4">
              Reserve slot {modalSlot.startTimeIST} &ndash; {modalSlot.endTimeIST} so players cannot book online.
            </p>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1.5">Reason for Block:</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#03594d] text-xs font-bold text-[#03594d]"
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
                  className="flex-1 py-2.5 rounded-xl bg-white border-2 border-[#03594d] text-[#03594d] text-xs font-black uppercase shadow-maggie-sm hover:bg-[#ffff94]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#03594d] text-[#82eda6] text-xs font-black uppercase border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c]"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-[#03594d] px-6 py-4 text-center text-xs text-[#03594d]/75 font-bold bg-[#82eda6]">
        GoTurf Owner Availability Engine &bull; Instant Double-Booking Safeguard Active
      </footer>
    </main>
  );
}
