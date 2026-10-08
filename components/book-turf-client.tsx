'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Turf } from '@/types/database';
import { getActiveBookingsForCourt } from '@/lib/data/bookings';
import { generateCourtSlots, type SlotGridItem } from '@/lib/engine/slot-calculator';

interface BookTurfClientProps {
  turf: Turf;
  initialCourtId?: string;
}

export default function BookTurfClient({ turf, initialCourtId }: BookTurfClientProps) {
  const courts = turf.courts || [];
  const searchParams = useSearchParams();
  const courtFromUrl = searchParams.get('court');
  const [selectedCourtId, setSelectedCourtId] = useState(courtFromUrl || initialCourtId || courts[0]?.id || '');
  const selectedCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  // Generate next 7 selectable dates
  const availableDates = useMemo(() => {
    const list: { label: string; dateStr: string; subLabel: string }[] = [];
    const base = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      if (i === 0) label = 'Today';
      if (i === 1) label = 'Tomorrow';

      const subLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });

      list.push({ label, dateStr, subLabel });
    }
    return list;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState(availableDates[0]?.dateStr || '2026-10-15');
  const [selectedSlot, setSelectedSlot] = useState<SlotGridItem | null>(null);

  // Calculate slots dynamically
  const slots = useMemo(() => {
    if (!selectedCourt) return [];
    const activeBookings = getActiveBookingsForCourt(selectedCourt.id);

    return generateCourtSlots({
      court: selectedCourt,
      dateStr: selectedDateStr,
      activeBookings,
      now: new Date(),
    });
  }, [selectedCourt, selectedDateStr]);

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: SlotGridItem[] = [];
    const afternoon: SlotGridItem[] = [];
    const evening: SlotGridItem[] = [];

    for (const slot of slots) {
      const [h] = slot.startTimeIST.split(':').map(Number);
      const isPM = slot.startTimeIST.includes('pm') || slot.startTimeIST.includes('PM');
      const hour24 = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;

      if (hour24 < 12) {
        morning.push(slot);
      } else if (hour24 < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    }
    return { morning, afternoon, evening };
  }, [slots]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black pb-28">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-neutral-950/80">
        <Link
          href={`/turfs/${turf.slug}`}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white"
        >
          <span>&larr;</span>
          <span>Back to {turf.name}</span>
        </Link>
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Live Slot Grid
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto px-6 py-8 flex-1">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Select Slot &bull; {turf.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            📍 {turf.region?.locality}, Mumbai &bull; Prices shown in Indian Rupees (INR)
          </p>
        </div>

        {/* Court Switcher */}
        {courts.length > 1 && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              Select Court / Arena:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => {
                    setSelectedCourtId(court.id);
                    setSelectedSlot(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCourt?.id === court.id
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Selector Pills */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
            Select Date:
          </label>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {availableDates.map((item) => (
              <button
                key={item.dateStr}
                onClick={() => {
                  setSelectedDateStr(item.dateStr);
                  setSelectedSlot(null);
                }}
                className={`flex flex-col items-center justify-center min-w-[85px] py-3 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                  selectedDateStr === item.dateStr
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span className="text-[11px] font-normal opacity-80">{item.subLabel}</span>
                <span className="text-sm font-bold mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slots Sections */}
        <div className="space-y-8">
          {/* Evening / Peak Slots */}
          {groupedSlots.evening.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🌙</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Evening & Night Slots (Prime Time)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupedSlots.evening.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelect={() => setSelectedSlot(slot)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Afternoon Slots */}
          {groupedSlots.afternoon.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">☀️</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Afternoon Slots
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupedSlots.afternoon.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelect={() => setSelectedSlot(slot)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Morning Slots */}
          {groupedSlots.morning.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🌅</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Morning Slots
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupedSlots.morning.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot?.id === slot.id}
                    onSelect={() => setSelectedSlot(slot)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar (When slot is selected) */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/95 border-t border-neutral-800 backdrop-blur-xl z-50 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedSlot.startTimeIST} – {selectedSlot.endTimeIST}
                </p>
                <p className="text-xs text-neutral-400">
                  {selectedCourt?.name} &bull; {selectedSlot.priceFormatted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Clear
              </button>
              <Link
                href={`/turfs/${turf.slug}/checkout?court=${selectedCourt?.id}&slot=${encodeURIComponent(
                  selectedSlot.id
                )}`}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 text-center"
              >
                Proceed to Book ({selectedSlot.priceFormatted}) &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SlotCard({
  slot,
  isSelected,
  onSelect,
}: {
  slot: SlotGridItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isAvailable = slot.status === 'available';

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={onSelect}
      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
        isSelected
          ? 'bg-emerald-500/15 border-emerald-400 shadow-md shadow-emerald-500/20'
          : isAvailable
          ? 'bg-neutral-900/50 border-neutral-800/90 hover:border-emerald-500/40 hover:bg-neutral-900'
          : 'bg-neutral-950/40 border-neutral-900 opacity-40 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-white tracking-tight">
            {slot.startTimeIST}
          </span>
          {slot.isPeak && isAvailable && (
            <span className="text-[9px] text-amber-400 font-bold">⚡ Peak</span>
          )}
        </div>
        <span className="text-[10px] text-neutral-400 block">{slot.endTimeIST}</span>
      </div>

      <div className="mt-3 pt-2 border-t border-neutral-800/40 flex justify-between items-center">
        {isAvailable ? (
          <>
            <span className="text-xs font-bold text-emerald-400">{slot.priceFormatted}</span>
            <span className="text-[9px] font-semibold text-neutral-500">Free</span>
          </>
        ) : (
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            {slot.status === 'blocked' ? 'Offline Block' : slot.status === 'booked' ? 'Booked' : 'Passed'}
          </span>
        )}
      </div>
    </button>
  );
}
