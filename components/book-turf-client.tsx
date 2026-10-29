'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Turf, Court } from '@/types/database';
import { getTurfPhotoUrl, getIllustrativeSportFallback, VENUE_PHOTO_UNAVAILABLE_PATH } from '@/lib/utils/turf-photo';
import { getActiveBookingsForCourt } from '@/lib/data/bookings';
import {
  generateCourtSlots,
  findAvailableMultiHourWindows,
  findContinuousAvailableBlocks,
  formatPaise,
  type SlotGridItem,
  type MultiHourWindow,
  type ContinuousBlock,
} from '@/lib/engine/slot-calculator';

interface BookTurfClientProps {
  turf: Turf;
  initialCourtId?: string;
}

type DurationMode = 1 | 2 | 3 | 'custom';

interface SelectedBookingTarget {
  courtId: string;
  courtName: string;
  startAtUTC: string;
  endAtUTC: string;
  startTimeIST: string;
  endTimeIST: string;
  pricePaise: number;
  priceFormatted: string;
  durationHours: number;
}

interface SuggestionModalState {
  isOpen: boolean;
  attemptedTimeLabel: string;
  reasonMessage: string;
  requestedDurationHours: number;
  availableWindows: MultiHourWindow[];
  continuousBlocks: ContinuousBlock[];
  crossCourtSuggestions: {
    court: Court;
    windows: MultiHourWindow[];
    continuousBlocks: ContinuousBlock[];
  }[];
}

export default function BookTurfClient({ turf, initialCourtId }: BookTurfClientProps) {
  const router = useRouter();
  const courts = useMemo(() => turf.courts || [], [turf.courts]);
  const searchParams = useSearchParams();
  const courtFromUrl = searchParams.get('court');
  const [selectedCourtId, setSelectedCourtId] = useState(courtFromUrl || initialCourtId || courts[0]?.id || '');
  const selectedCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];
  const [isHolding, setIsHolding] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [bannerImgFailed, setBannerImgFailed] = useState(false);

  // Match Duration Mode: 1h, 2h, 3h, or 'custom' (Multi-Select for 3+ hours)
  const [durationMode, setDurationMode] = useState<DurationMode>(1);

  // Custom multi-selected slot indices when in 'custom' mode
  const [customSelectedIndices, setCustomSelectedIndices] = useState<number[]>([]);

  // Selected Booking Target
  const [selectedBooking, setSelectedBooking] = useState<SelectedBookingTarget | null>(null);

  // Smart Suggestion Box Modal State
  const [suggestionModal, setSuggestionModal] = useState<SuggestionModalState>({
    isOpen: false,
    attemptedTimeLabel: '',
    reasonMessage: '',
    requestedDurationHours: 1,
    availableWindows: [],
    continuousBlocks: [],
    crossCourtSuggestions: [],
  });

  // Generate next 7 selectable dates in Indian Standard Time (IST)
  const availableDates = useMemo(() => {
    const list: { label: string; dateStr: string; subLabel: string }[] = [];
    const istParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()).split('-');
    const base = new Date(Number(istParts[0]), Number(istParts[1]) - 1, Number(istParts[2]));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const subLabel = dayNames[d.getDay()];
      let label = `${subLabel}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
      if (i === 0) label = 'Today';
      if (i === 1) label = 'Tomorrow';

      list.push({ label, dateStr, subLabel });
    }
    return list;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState(
    availableDates[0]?.dateStr ||
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  );

  // Calculate slots dynamically for current court
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

  // Compute all contiguous available blocks on current court
  const continuousBlocks = useMemo(() => {
    return findContinuousAvailableBlocks(slots);
  }, [slots]);

  // Compute effective requested duration in hours
  const effectiveRequestedDuration = useMemo(() => {
    if (typeof durationMode === 'number') return durationMode;
    return customSelectedIndices.length >= 3 ? customSelectedIndices.length : 3;
  }, [durationMode, customSelectedIndices]);

  // Compute cross-court recommendations on other courts for this turf
  const crossCourtSuggestions = useMemo(() => {
    const otherCourts = courts.filter((c) => c.id !== selectedCourt?.id);
    const targetHours = effectiveRequestedDuration;

    return otherCourts
      .map((court) => {
        const cBookings = getActiveBookingsForCourt(court.id);
        const cSlots = generateCourtSlots({
          court,
          dateStr: selectedDateStr,
          activeBookings: cBookings,
          now: new Date(),
        });
        const cWindows = findAvailableMultiHourWindows(cSlots, targetHours);
        const cBlocks = findContinuousAvailableBlocks(cSlots);
        return { court, windows: cWindows, continuousBlocks: cBlocks };
      })
      .filter((item) => item.windows.length > 0 || item.continuousBlocks.some((b) => b.durationHours >= 2));
  }, [courts, selectedCourt, selectedDateStr, effectiveRequestedDuration]);

  // Open the Smart Suggestion Box Modal
  const openSuggestionModal = (attemptedSlot: SlotGridItem, customReason?: string) => {
    const targetHours = effectiveRequestedDuration;
    let reason = customReason;

    if (!reason) {
      if (targetHours >= 2) {
        reason = `${attemptedSlot.startTimeIST} cannot complete a continuous ${targetHours}-hour match because an overlapping hour is already reserved.`;
      } else {
        reason = `${attemptedSlot.startTimeIST} – ${attemptedSlot.endTimeIST} is already ${
          attemptedSlot.status === 'blocked' ? 'reserved offline by the venue' : 'booked by another squad'
        }.`;
      }
    }

    const targetWindows = findAvailableMultiHourWindows(slots, targetHours);

    setSuggestionModal({
      isOpen: true,
      attemptedTimeLabel: attemptedSlot.startTimeIST,
      reasonMessage: reason,
      requestedDurationHours: targetHours,
      availableWindows: targetWindows,
      continuousBlocks,
      crossCourtSuggestions,
    });
  };

  // Duration mode change handler
  const handleDurationModeChange = (newMode: DurationMode) => {
    setDurationMode(newMode);
    setSelectedBooking(null);
    setCustomSelectedIndices([]);
  };

  // Slot click handler for preset modes (1h, 2h, 3h)
  const handlePresetSlotClick = (slot: SlotGridItem, slotIndex: number, requiredHours: number) => {
    if (!selectedCourt) return;

    if (requiredHours === 1) {
      if (slot.status !== 'available') {
        openSuggestionModal(slot);
        return;
      }

      setSelectedBooking({
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        startAtUTC: slot.startAtUTC,
        endAtUTC: slot.endAtUTC,
        startTimeIST: slot.startTimeIST,
        endTimeIST: slot.endTimeIST,
        pricePaise: slot.pricePaise,
        priceFormatted: slot.priceFormatted,
        durationHours: 1,
      });
      return;
    }

    // Multi-hour preset (2 Hours or 3 Hours)
    const chunk = slots.slice(slotIndex, slotIndex + requiredHours);

    if (chunk.length < requiredHours) {
      openSuggestionModal(
        slot,
        `${slot.startTimeIST} does not have ${requiredHours} remaining operating hours before venue closing.`
      );
      return;
    }

    const unavailableIndex = chunk.findIndex((s) => s.status !== 'available');
    if (unavailableIndex !== -1) {
      const badSlot = chunk[unavailableIndex];
      const conflictReason =
        badSlot.id === slot.id
          ? `${slot.startTimeIST} is already ${badSlot.status === 'blocked' ? 'reserved offline' : 'booked'}.`
          : `${slot.startTimeIST} is free, but hour ${unavailableIndex + 1} (${badSlot.startTimeIST} – ${badSlot.endTimeIST}) is already ${
              badSlot.status === 'blocked' ? 'reserved offline' : 'booked'
            }.`;

      openSuggestionModal(slot, conflictReason);
      return;
    }

    // All consecutive hours are free!
    const combinedPricePaise = chunk.reduce((sum, s) => sum + s.pricePaise, 0);
    const lastSlot = chunk[chunk.length - 1];

    setSelectedBooking({
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      startAtUTC: slot.startAtUTC,
      endAtUTC: lastSlot.endAtUTC,
      startTimeIST: slot.startTimeIST,
      endTimeIST: lastSlot.endTimeIST,
      pricePaise: combinedPricePaise,
      priceFormatted: formatPaise(combinedPricePaise),
      durationHours: requiredHours,
    });
  };

  // Slot click handler for 'custom' multi-select mode (3+ Hours)
  const handleCustomSlotClick = (slot: SlotGridItem, slotIndex: number) => {
    if (!selectedCourt) return;

    if (slot.status !== 'available') {
      openSuggestionModal(slot);
      return;
    }

    // If nothing selected yet, start the chain
    if (customSelectedIndices.length === 0) {
      setCustomSelectedIndices([slotIndex]);
      setSelectedBooking({
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        startAtUTC: slot.startAtUTC,
        endAtUTC: slot.endAtUTC,
        startTimeIST: slot.startTimeIST,
        endTimeIST: slot.endTimeIST,
        pricePaise: slot.pricePaise,
        priceFormatted: slot.priceFormatted,
        durationHours: 1,
      });
      return;
    }

    // Toggle if clicking the boundary slot to deselect
    if (customSelectedIndices.includes(slotIndex)) {
      const min = Math.min(...customSelectedIndices);
      const max = Math.max(...customSelectedIndices);

      if (slotIndex === min && customSelectedIndices.length > 1) {
        const nextIndices = customSelectedIndices.filter((idx) => idx !== min);
        updateCustomBookingFromIndices(nextIndices);
        return;
      }
      if (slotIndex === max && customSelectedIndices.length > 1) {
        const nextIndices = customSelectedIndices.filter((idx) => idx !== max);
        updateCustomBookingFromIndices(nextIndices);
        return;
      }
      // Clicking middle slot restarts chain from this slot
      setCustomSelectedIndices([slotIndex]);
      updateCustomBookingFromIndices([slotIndex]);
      return;
    }

    // Check if slot is adjacent to current selection
    const min = Math.min(...customSelectedIndices);
    const max = Math.max(...customSelectedIndices);

    if (slotIndex === min - 1) {
      // Prepend consecutive hour
      const nextIndices = [slotIndex, ...customSelectedIndices].sort((a, b) => a - b);
      updateCustomBookingFromIndices(nextIndices);
      return;
    }

    if (slotIndex === max + 1) {
      // Append consecutive hour
      const nextIndices = [...customSelectedIndices, slotIndex].sort((a, b) => a - b);
      updateCustomBookingFromIndices(nextIndices);
      return;
    }

    // Clicked slot with a gap between selection!
    // Check if the entire range between min and slotIndex is available
    const newMin = Math.min(min, slotIndex);
    const newMax = Math.max(max, slotIndex);
    const rangeIndices: number[] = [];
    let hasGap = false;

    for (let i = newMin; i <= newMax; i++) {
      if (slots[i]?.status !== 'available') {
        hasGap = true;
        break;
      }
      rangeIndices.push(i);
    }

    if (hasGap) {
      openSuggestionModal(
        slot,
        `Cannot link ${slots[min].startTimeIST} with ${slot.startTimeIST} because there are booked slots in between. Match sessions must be continuous without gaps.`
      );
      return;
    }

    updateCustomBookingFromIndices(rangeIndices);
  };

  const updateCustomBookingFromIndices = (indices: number[]) => {
    if (!selectedCourt || indices.length === 0) {
      setSelectedBooking(null);
      setCustomSelectedIndices([]);
      return;
    }

    setCustomSelectedIndices(indices);
    const firstSlot = slots[indices[0]];
    const lastSlot = slots[indices[indices.length - 1]];
    const totalPaise = indices.reduce((sum, idx) => sum + (slots[idx]?.pricePaise || 0), 0);
    const duration = indices.length;

    setSelectedBooking({
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      startAtUTC: firstSlot.startAtUTC,
      endAtUTC: lastSlot.endAtUTC,
      startTimeIST: firstSlot.startTimeIST,
      endTimeIST: lastSlot.endTimeIST,
      pricePaise: totalPaise,
      priceFormatted: formatPaise(totalPaise),
      durationHours: duration,
    });
  };

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: { slot: SlotGridItem; index: number }[] = [];
    const afternoon: { slot: SlotGridItem; index: number }[] = [];
    const evening: { slot: SlotGridItem; index: number }[] = [];

    slots.forEach((slot, index) => {
      const [h] = slot.startTimeIST.split(':').map(Number);
      const isPM = slot.startTimeIST.includes('pm') || slot.startTimeIST.includes('PM');
      const hour24 = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;

      if (hour24 < 12) {
        morning.push({ slot, index });
      } else if (hour24 < 17) {
        afternoon.push({ slot, index });
      } else {
        evening.push({ slot, index });
      }
    });
    return { morning, afternoon, evening };
  }, [slots]);

  // Proceed to Checkout
  const handleProceedToCheckout = async () => {
    if (!selectedBooking || !selectedCourt) return;
    setIsHolding(true);
    setHoldError(null);

    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: selectedBooking.courtId,
          startAtUTC: selectedBooking.startAtUTC,
          endAtUTC: selectedBooking.endAtUTC,
          pricePaise: selectedBooking.pricePaise,
          notes: `${selectedBooking.startTimeIST} to ${selectedBooking.endTimeIST} (${selectedBooking.durationHours}-Hour Match)`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.booking) {
        setHoldError(data.error || 'Slot was just taken! Please pick another slot.');
        setSelectedBooking(null);
        return;
      }

      const holdToken = data.holdToken || data.booking.id;
      router.push(
        `/turfs/${turf.slug}/checkout?court=${encodeURIComponent(selectedBooking.courtId)}&holdId=${encodeURIComponent(holdToken)}`
      );
    } catch {
      setHoldError('Network error while holding slot. Please try again.');
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col justify-between selection:bg-[#ffff94] selection:text-[#03594d] pb-32">
      {/* Top Navbar */}
      <header className="border-b-2 border-[#03594d] px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 bg-[#82eda6]/90">
        <Link
          href={`/turfs/${turf.slug}`}
          className="flex items-center gap-2 text-xs font-black text-[#03594d] hover:underline uppercase tracking-wider"
        >
          <span>&larr;</span>
          <span>Back to {turf.name}</span>
        </Link>
        <span className="text-[10px] uppercase font-black tracking-wider text-[#03594d] bg-[#ffff94] px-3 py-1 rounded-full border border-[#03594d] shadow-maggie-sm">
          Live Slot Grid
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto px-6 py-8 flex-1">
        {/* Error Alert */}
        {holdError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-100 border-2 border-rose-500 text-rose-800 flex items-center justify-between text-xs animate-in fade-in shadow-maggie-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{holdError}</span>
            </div>
            <button
              onClick={() => setHoldError(null)}
              className="text-rose-800 hover:text-rose-950 font-black text-xs px-2 py-1 cursor-pointer underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Venue Summary & Photo Banner */}
        <div className="mb-6 p-4 sm:p-5 rounded-[28px] bg-white border-2 border-[#03594d] shadow-maggie flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#03594d] shadow-maggie-sm shrink-0 bg-[#03594d]/10">
              <Image
                src={
                  bannerImgFailed
                    ? (turf.is_demo ? getIllustrativeSportFallback(selectedCourt?.sport || 'cricket') : VENUE_PHOTO_UNAVAILABLE_PATH)
                    : getTurfPhotoUrl(turf.photos?.[0], selectedCourt?.sport || 'cricket', turf.is_demo)
                }
                alt={turf.name}
                fill
                sizes="100px"
                className="object-cover"
                onError={() => setBannerImgFailed(true)}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffff94] text-[#03594d] px-2.5 py-0.5 rounded-full border border-[#03594d]">
                  📍 {turf.region?.locality}, Mumbai
                </span>
                <span className="text-[10px] font-black bg-[#82eda6] text-[#03594d] px-2 py-0.5 rounded-full border border-[#03594d]">
                  {turf.is_demo
                    ? (turf.slug === 'bandra-turf-arena-demo' ? '🤖 Demo • AI Image' : '🎨 Demo • Illustrative')
                    : 'Registered Arena'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#03594d] tracking-tight uppercase">
                {turf.name}
              </h1>
              <p className="text-xs text-[#03594d]/75 font-semibold line-clamp-1 mt-0.5">
                {turf.address}
              </p>
            </div>
          </div>

          <Link
            href={`/turfs/${turf.slug}`}
            className="self-stretch sm:self-auto px-4 py-2 rounded-full bg-[#f9f8f4] hover:bg-[#ffff94] border-2 border-[#03594d] text-[11px] font-black text-[#03594d] text-center shadow-maggie-sm transition-all whitespace-nowrap"
          >
            📸 View Full Gallery ({turf.photos?.length || 1}) &rarr;
          </Link>
        </div>

        {/* Court Switcher */}
        {courts.length > 1 && (
          <div className="mb-6">
            <label className="block text-xs font-black text-[#03594d] mb-2 uppercase tracking-wider">
              Select Court / Arena:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => {
                    setSelectedCourtId(court.id);
                    setSelectedBooking(null);
                    setCustomSelectedIndices([]);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer border-2 border-[#03594d] ${
                    selectedCourt?.id === court.id
                      ? 'bg-[#03594d] text-[#82eda6] shadow-maggie translate-x-0.5 translate-y-0.5'
                      : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
                  }`}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Selector Pills */}
        <div className="mb-6">
          <label className="block text-xs font-black text-[#03594d] mb-2 uppercase tracking-wider">
            Select Date:
          </label>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {availableDates.map((item) => (
              <button
                key={item.dateStr}
                onClick={() => {
                  setSelectedDateStr(item.dateStr);
                  setSelectedBooking(null);
                  setCustomSelectedIndices([]);
                }}
                className={`flex flex-col items-center justify-center min-w-[85px] py-3 px-3 rounded-2xl border-2 border-[#03594d] text-xs font-bold transition-all cursor-pointer ${
                  selectedDateStr === item.dateStr
                    ? 'bg-[#ffff94] text-[#03594d] shadow-maggie translate-x-0.5 translate-y-0.5'
                    : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]/60'
                }`}
              >
                <span className="text-[11px] font-semibold opacity-80">{item.subLabel}</span>
                <span className="text-sm font-black mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MATCH DURATION & FLEXIBLE MULTI-SLOT SELECTOR */}
        {/* =================================================================== */}
        <div className="mb-6 p-5 rounded-3xl bg-[#f9f8f4] border-2 border-[#03594d] shadow-maggie flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#03594d] uppercase tracking-wider">Match Duration:</span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#ffff94] text-[#03594d] border border-[#03594d] shadow-maggie-sm">
                  Continuous Lock
                </span>
              </div>
              <p className="text-[11px] text-[#03594d]/80 font-semibold mt-1">
                Lock 1, 2, 3 or flexible 3+ hours continuously in a single transaction.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDurationModeChange(1)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-[#03594d] ${
                  durationMode === 1
                    ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
                    : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
                }`}
              >
                ⏱️ 1 Hour
              </button>
              <button
                type="button"
                onClick={() => handleDurationModeChange(2)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-[#03594d] ${
                  durationMode === 2
                    ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
                    : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
                }`}
              >
                🏏 2 Hours
              </button>
              <button
                type="button"
                onClick={() => handleDurationModeChange(3)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-[#03594d] ${
                  durationMode === 3
                    ? 'bg-[#03594d] text-[#82eda6] shadow-maggie-sm'
                    : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
                }`}
              >
                🏆 3 Hours
              </button>
              <button
                type="button"
                onClick={() => handleDurationModeChange('custom')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-[#03594d] flex items-center gap-1 ${
                  durationMode === 'custom'
                    ? 'bg-[#fdc068] text-[#03594d] shadow-maggie-sm'
                    : 'bg-white text-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]'
                }`}
              >
                <span>⚡ Flexible (3+ Hours)</span>
              </button>
            </div>
          </div>

          {/* At-a-Glance: Long Play Availability Windows */}
          {continuousBlocks.length > 0 && (
            <div className="pt-2 border-t-2 border-[#03594d]/15 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-[#03594d]/80 uppercase font-black">
                Open Blocks Today:
              </span>
              {continuousBlocks.map((blk) => (
                <button
                  key={blk.startAtUTC}
                  type="button"
                  onClick={() => {
                    const blkSlots = blk.slots;
                    if (blkSlots.length === 0) return;
                    setSelectedBooking({
                      courtId: selectedCourt.id,
                      courtName: selectedCourt.name,
                      startAtUTC: blk.startAtUTC,
                      endAtUTC: blk.endAtUTC,
                      startTimeIST: blk.startTimeIST,
                      endTimeIST: blk.endTimeIST,
                      pricePaise: blk.totalPricePaise,
                      priceFormatted: blk.priceFormatted,
                      durationHours: blk.durationHours,
                    });
                    if (durationMode === 'custom') {
                      const indices = blkSlots.map((s) => slots.findIndex((slot) => slot.id === s.id)).filter((i) => i !== -1);
                      setCustomSelectedIndices(indices);
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-white border border-[#03594d] text-[11px] text-[#03594d] hover:bg-[#ffff94] shadow-maggie-sm flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
                >
                  <span className="text-[#03594d] font-black underline decoration-[#fdc068] decoration-2">{blk.durationHours}H Open</span>
                  <span>{blk.startTimeIST} – {blk.endTimeIST}</span>
                </button>
              ))}
            </div>
          )}

          {/* Custom mode helper text */}
          {durationMode === 'custom' && (
            <div className="p-3.5 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] text-xs flex items-center justify-between font-semibold shadow-maggie-sm">
              <span>
                💡 <strong>Multi-Select Active:</strong> Tap consecutive slots below to chain 3, 4, or 5+ hours together into a single booking!
              </span>
              {customSelectedIndices.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomSelectedIndices([]);
                    setSelectedBooking(null);
                  }}
                  className="text-[#03594d] hover:underline font-black text-[11px] ml-3 cursor-pointer"
                >
                  Reset Selection
                </button>
              )}
            </div>
          )}
        </div>

        {/* Slots Sections */}
        <div className="space-y-8">
          {/* Evening / Prime Slots */}
          {groupedSlots.evening.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌙</span>
                  <h3 className="text-sm font-black text-[#03594d] uppercase tracking-wider">
                    Evening & Night Slots (Prime Time)
                  </h3>
                </div>
                {typeof durationMode === 'number' && durationMode > 1 && (
                  <span className="text-[10px] text-[#03594d]/80 font-bold">
                    Showing {durationMode}-Hour Windows
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupedSlots.evening.map(({ slot, index }) => (
                  <SlotCardUnified
                    key={slot.id}
                    slot={slot}
                    index={index}
                    allSlots={slots}
                    durationMode={durationMode}
                    isCustomSelected={customSelectedIndices.includes(index)}
                    isPresetSelected={selectedBooking?.startAtUTC === slot.startAtUTC}
                    onClick={() => {
                      if (durationMode === 'custom') {
                        handleCustomSlotClick(slot, index);
                      } else {
                        handlePresetSlotClick(slot, index, durationMode);
                      }
                    }}
                    onUnavailableClick={() => openSuggestionModal(slot)}
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
                <h3 className="text-sm font-black text-[#03594d] uppercase tracking-wider">
                  Afternoon Slots
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupedSlots.afternoon.map(({ slot, index }) => (
                  <SlotCardUnified
                    key={slot.id}
                    slot={slot}
                    index={index}
                    allSlots={slots}
                    durationMode={durationMode}
                    isCustomSelected={customSelectedIndices.includes(index)}
                    isPresetSelected={selectedBooking?.startAtUTC === slot.startAtUTC}
                    onClick={() => {
                      if (durationMode === 'custom') {
                        handleCustomSlotClick(slot, index);
                      } else {
                        handlePresetSlotClick(slot, index, durationMode);
                      }
                    }}
                    onUnavailableClick={() => openSuggestionModal(slot)}
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
                <h3 className="text-sm font-black text-[#03594d] uppercase tracking-wider">
                  Morning Slots
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {groupedSlots.morning.map(({ slot, index }) => (
                  <SlotCardUnified
                    key={slot.id}
                    slot={slot}
                    index={index}
                    allSlots={slots}
                    durationMode={durationMode}
                    isCustomSelected={customSelectedIndices.includes(index)}
                    isPresetSelected={selectedBooking?.startAtUTC === slot.startAtUTC}
                    onClick={() => {
                      if (durationMode === 'custom') {
                        handleCustomSlotClick(slot, index);
                      } else {
                        handlePresetSlotClick(slot, index, durationMode);
                      }
                    }}
                    onUnavailableClick={() => openSuggestionModal(slot)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar (When slot is selected) */}
      {selectedBooking && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t-2 border-[#03594d] backdrop-blur-md z-40 animate-in slide-in-from-bottom duration-200 shadow-maggie-xl">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-lg font-black shadow-maggie-sm">
                ✓
              </div>
              <div>
                <p className="text-sm font-black text-[#03594d]">
                  {selectedBooking.startTimeIST} – {selectedBooking.endTimeIST}{' '}
                  <span className="text-xs font-bold text-[#03594d]/80 bg-[#ffff94] px-2 py-0.5 rounded-full border border-[#03594d]">
                    ({selectedBooking.durationHours} {selectedBooking.durationHours === 1 ? 'Hour' : 'Hours Continuous'})
                  </span>
                </p>
                <p className="text-xs text-[#03594d]/80 font-bold mt-0.5">
                  {selectedBooking.courtName} &bull; Total Value: {selectedBooking.priceFormatted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setCustomSelectedIndices([]);
                }}
                className="px-3 py-2 text-xs font-black text-[#03594d] hover:underline cursor-pointer"
              >
                Clear
              </button>
              <button
                disabled={isHolding}
                onClick={handleProceedToCheckout}
                className="flex-1 sm:flex-none px-7 py-3.5 rounded-full bg-[#03594d] text-[#82eda6] text-xs font-black uppercase tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] hover:-translate-y-0.5 disabled:opacity-50 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                {isHolding ? (
                  <>
                    <span className="inline-block h-3 w-3 border-2 border-[#82eda6] border-t-transparent rounded-full animate-spin" />
                    <span>Locking {selectedBooking.durationHours}H Slot...</span>
                  </>
                ) : (
                  <span>Proceed to Book ({selectedBooking.priceFormatted}) &rarr;</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SMART ALTERNATIVE SUGGESTION BOX (DYNAMIC FOR 1, 2, 3+ HOURS) */}
      {/* ===================================================================== */}
      {suggestionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#03594d]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-[#f9f8f4] border-2 border-[#03594d] rounded-3xl p-6 shadow-maggie-xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-[#03594d]">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-xl font-bold shadow-maggie-sm">
                  💡
                </div>
                <div>
                  <h3 className="text-base font-black text-[#03594d] tracking-tight">
                    Smart Slot Assistant &bull; {suggestionModal.requestedDurationHours}-Hour Match
                  </h3>
                  <p className="text-xs text-[#03594d]/80 font-bold">
                    Continuous alternative slots for extended play
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuggestionModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-[#03594d] hover:text-black p-1 text-sm font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Why was the requested slot unavailable? */}
            <div className="p-3.5 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] text-xs leading-relaxed flex items-start gap-2.5 shadow-maggie-sm">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p className="font-black text-[#03594d]">Conflict Explanation:</p>
                <p className="mt-0.5 font-semibold opacity-90">{suggestionModal.reasonMessage}</p>
              </div>
            </div>

            {/* Available Continuous Windows on Current Court */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-black text-[#03594d] uppercase tracking-wider">
                  Available Continuous {suggestionModal.requestedDurationHours}-Hour Slots ({selectedCourt?.name})
                </h4>
                <span className="text-[10px] text-[#03594d] font-black bg-[#ffff94] px-2 py-0.5 rounded-full border border-[#03594d]">
                  {suggestionModal.availableWindows.length} Options
                </span>
              </div>

              {suggestionModal.availableWindows.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {suggestionModal.availableWindows.map((win) => (
                    <div
                      key={win.startAtUTC}
                      className="p-3 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie-sm hover:bg-[#ffff94]/40 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#03594d]">
                            {win.startTimeIST} – {win.endTimeIST}
                          </span>
                          {win.isPeak && (
                            <span className="text-[9px] text-[#03594d] font-black bg-[#ffff94] px-1.5 py-0.5 rounded border border-[#03594d]">
                              ⚡ Prime Peak
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#03594d]/80 font-bold mt-0.5">
                          {win.priceFormatted} &bull; {win.durationHours} Hours Continuous
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBooking({
                            courtId: selectedCourt.id,
                            courtName: selectedCourt.name,
                            startAtUTC: win.startAtUTC,
                            endAtUTC: win.endAtUTC,
                            startTimeIST: win.startTimeIST,
                            endTimeIST: win.endTimeIST,
                            pricePaise: win.totalPricePaise,
                            priceFormatted: win.priceFormatted,
                            durationHours: win.durationHours,
                          });
                          setSuggestionModal((prev) => ({ ...prev, isOpen: false }));
                        }}
                        className="px-4 py-2 rounded-xl bg-[#03594d] text-[#82eda6] text-xs font-black uppercase border-2 border-[#03594d] shadow-maggie-sm hover:bg-[#02463c] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Select Slot &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border-2 border-[#03594d] text-xs text-[#03594d] shadow-maggie-sm font-semibold">
                  <p>No continuous {suggestionModal.requestedDurationHours}-hour slots remaining on this court today.</p>
                  {suggestionModal.continuousBlocks.length > 0 && (
                    <p className="text-[11px] text-[#03594d] mt-1 font-bold">
                      💡 Longest available block on this court: <strong>{suggestionModal.continuousBlocks[0].durationHours} Hours</strong> ({suggestionModal.continuousBlocks[0].startTimeIST} – {suggestionModal.continuousBlocks[0].endTimeIST}).
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cross-Court Recommendations (Other courts at this venue!) */}
            {suggestionModal.crossCourtSuggestions.length > 0 && (
              <div className="pt-2 border-t-2 border-[#03594d]/15">
                <h4 className="text-xs font-black text-[#03594d] uppercase tracking-wider mb-2">
                  Other Courts Available at {turf.name}
                </h4>

                <div className="space-y-2">
                  {suggestionModal.crossCourtSuggestions.map(({ court, windows, continuousBlocks: cBlocks }) => {
                    const firstWin = windows[0];
                    if (firstWin) {
                      return (
                        <div
                          key={court.id}
                          className="p-3.5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie-sm flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-xs font-black text-[#03594d]">{court.name}</p>
                            <p className="text-[11px] text-[#03594d]/80 font-bold mt-0.5">
                              Has <strong className="text-[#03594d] underline decoration-[#ffff94] decoration-2">{firstWin.startTimeIST} – {firstWin.endTimeIST}</strong> ({firstWin.priceFormatted}) open!
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourtId(court.id);
                              setSelectedBooking({
                                courtId: court.id,
                                courtName: court.name,
                                startAtUTC: firstWin.startAtUTC,
                                endAtUTC: firstWin.endAtUTC,
                                startTimeIST: firstWin.startTimeIST,
                                endTimeIST: firstWin.endTimeIST,
                                pricePaise: firstWin.totalPricePaise,
                                priceFormatted: firstWin.priceFormatted,
                                durationHours: firstWin.durationHours,
                              });
                              setSuggestionModal((prev) => ({ ...prev, isOpen: false }));
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#ffff94] hover:bg-[#f5f583] text-[#03594d] text-xs font-black border-2 border-[#03594d] shadow-maggie-sm transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Switch & Select &rarr;
                          </button>
                        </div>
                      );
                    }

                    // If exact window not found, show longest block on other court
                    const longestBlock = cBlocks[0];
                    if (longestBlock && longestBlock.durationHours >= 2) {
                      return (
                        <div
                          key={court.id}
                          className="p-3.5 rounded-2xl bg-white border-2 border-[#03594d] shadow-maggie-sm flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-xs font-black text-[#03594d]">{court.name}</p>
                            <p className="text-[11px] text-[#03594d]/80 font-bold mt-0.5">
                              Open for <strong className="text-[#03594d] underline decoration-[#ffff94] decoration-2">{longestBlock.durationHours} Hours</strong> ({longestBlock.startTimeIST} – {longestBlock.endTimeIST})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourtId(court.id);
                              setSelectedBooking({
                                courtId: court.id,
                                courtName: court.name,
                                startAtUTC: longestBlock.startAtUTC,
                                endAtUTC: longestBlock.endAtUTC,
                                startTimeIST: longestBlock.startTimeIST,
                                endTimeIST: longestBlock.endTimeIST,
                                pricePaise: longestBlock.totalPricePaise,
                                priceFormatted: longestBlock.priceFormatted,
                                durationHours: longestBlock.durationHours,
                              });
                              setSuggestionModal((prev) => ({ ...prev, isOpen: false }));
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#ffff94] text-[#03594d] text-xs font-black border-2 border-[#03594d] shadow-maggie-sm transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Switch & Select &rarr;
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuggestionModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#ffff94] text-[#03594d] text-xs font-black border-2 border-[#03594d] shadow-maggie-sm transition-colors cursor-pointer"
              >
                Back to Schedule Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// UNIFIED SLOT CARD COMPONENT
// Handles 1h, 2h, 3h presets and custom multi-select
// ============================================================================
function SlotCardUnified({
  slot,
  index,
  allSlots,
  durationMode,
  isCustomSelected,
  isPresetSelected,
  onClick,
  onUnavailableClick,
}: {
  slot: SlotGridItem;
  index: number;
  allSlots: SlotGridItem[];
  durationMode: DurationMode;
  isCustomSelected: boolean;
  isPresetSelected: boolean;
  onClick: () => void;
  onUnavailableClick: () => void;
}) {
  // Custom Multi-Select Mode
  if (durationMode === 'custom') {
    const isAvailable = slot.status === 'available';

    return (
      <button
        type="button"
        onClick={isAvailable ? onClick : onUnavailableClick}
        className={`p-3.5 rounded-2xl border-2 border-[#03594d] text-left flex flex-col justify-between transition-all relative cursor-pointer ${
          isCustomSelected
            ? 'bg-[#ffff94] shadow-maggie ring-2 ring-[#03594d] translate-x-0.5 translate-y-0.5'
            : isAvailable
            ? 'bg-white shadow-maggie-sm hover:bg-[#ffff94]/40 hover:shadow-maggie'
            : 'bg-[#f9f8f4]/60 border-[#03594d]/30 opacity-60 hover:border-[#03594d]'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-1">
            <span suppressHydrationWarning className="text-xs font-black text-[#03594d] tracking-tight">
              {slot.startTimeIST}
            </span>
            {isCustomSelected ? (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#03594d] text-[#82eda6]">
                ✓ Added
              </span>
            ) : (
              isAvailable && (
                <span className="text-[9px] font-bold text-[#03594d] border border-[#03594d] px-1 rounded bg-[#f9f8f4]">
                  + Add
                </span>
              )
            )}
          </div>
          <span suppressHydrationWarning className="text-[10px] text-[#03594d]/75 font-semibold block">
            {slot.endTimeIST}
          </span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#03594d]/15 flex justify-between items-center">
          {isAvailable ? (
            <>
              <span className="text-xs font-black text-[#03594d]">{slot.priceFormatted}</span>
              <span className="text-[9px] font-bold text-[#03594d]/70">1 Hour</span>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#03594d]/60">
                {slot.status === 'blocked' ? 'Offline Block' : slot.status === 'booked' ? 'Booked' : 'Passed'}
              </span>
              <span className="text-[9px] text-[#03594d] font-black underline">Alternatives &rarr;</span>
            </div>
          )}
        </div>
      </button>
    );
  }

  // 1-Hour Mode
  if (durationMode === 1) {
    const isAvailable = slot.status === 'available';

    return (
      <button
        type="button"
        onClick={isAvailable ? onClick : onUnavailableClick}
        className={`p-3.5 rounded-2xl border-2 border-[#03594d] text-left flex flex-col justify-between transition-all relative cursor-pointer ${
          isPresetSelected
            ? 'bg-[#ffff94] shadow-maggie ring-2 ring-[#03594d] translate-x-0.5 translate-y-0.5'
            : isAvailable
            ? 'bg-white shadow-maggie-sm hover:bg-[#ffff94]/40 hover:shadow-maggie'
            : 'bg-[#f9f8f4]/60 border-[#03594d]/30 opacity-60 hover:border-[#03594d]'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-1">
            <span suppressHydrationWarning className="text-xs font-black text-[#03594d] tracking-tight">
              {slot.startTimeIST}
            </span>
            {slot.isPeak && isAvailable && (
              <span className="text-[9px] text-[#03594d] font-black bg-[#ffff94] px-1.5 py-0.5 rounded border border-[#03594d]">
                ⚡ Peak
              </span>
            )}
          </div>
          <span suppressHydrationWarning className="text-[10px] text-[#03594d]/75 font-semibold block">
            {slot.endTimeIST}
          </span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#03594d]/15 flex justify-between items-center">
          {isAvailable ? (
            <>
              <span className="text-xs font-black text-[#03594d]">{slot.priceFormatted}</span>
              <span className="text-[9px] font-bold text-[#03594d]/70">Free</span>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#03594d]/60">
                {slot.status === 'blocked' ? 'Offline Block' : slot.status === 'booked' ? 'Booked' : 'Passed'}
              </span>
              <span className="text-[9px] text-[#03594d] font-black underline">Alternatives &rarr;</span>
            </div>
          )}
        </div>
      </button>
    );
  }

  // Multi-Hour Presets (2 Hours or 3 Hours)
  const requiredHours = durationMode;
  const chunk = allSlots.slice(index, index + requiredHours);
  const hasFullLength = chunk.length === requiredHours;
  const allAvailable = hasFullLength && chunk.every((s) => s.status === 'available');

  const displayEndTime = hasFullLength ? chunk[chunk.length - 1].endTimeIST : slot.endTimeIST;
  const combinedPricePaise = chunk.reduce((sum, s) => sum + s.pricePaise, 0);
  const combinedPriceFormatted = formatPaise(combinedPricePaise);

  return (
    <button
      type="button"
      onClick={allAvailable ? onClick : onUnavailableClick}
      className={`p-3.5 rounded-2xl border-2 border-[#03594d] text-left flex flex-col justify-between transition-all relative cursor-pointer ${
        isPresetSelected
          ? 'bg-[#ffff94] shadow-maggie ring-2 ring-[#03594d] translate-x-0.5 translate-y-0.5'
          : allAvailable
          ? 'bg-white shadow-maggie-sm hover:bg-[#ffff94]/40 hover:shadow-maggie'
          : 'bg-[#f9f8f4]/60 border-[#03594d]/30 opacity-60 hover:border-[#03594d]'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-1">
          <span suppressHydrationWarning className="text-xs font-black text-[#03594d] tracking-tight">
            {slot.startTimeIST}
          </span>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#f9f8f4] text-[#03594d] border border-[#03594d]">
            {requiredHours} Hours
          </span>
        </div>
        <span suppressHydrationWarning className="text-[10px] text-[#03594d]/75 font-semibold block">
          until {displayEndTime}
        </span>
      </div>

      <div className="mt-3 pt-2 border-t border-[#03594d]/15 flex justify-between items-center">
        {allAvailable ? (
          <>
            <span className="text-xs font-black text-[#03594d]">{combinedPriceFormatted}</span>
            <span className="text-[9px] font-black text-[#03594d] bg-[#ffff94] px-1 rounded">
              {requiredHours}H Free
            </span>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-black text-[#03594d]/60">
              {slot.status !== 'available'
                ? slot.status === 'blocked'
                  ? 'Blocked'
                  : 'Booked'
                : 'Split / Taken'}
            </span>
            <span className="text-[9px] text-[#03594d] font-black underline">Alternatives &rarr;</span>
          </div>
        )}
      </div>
    </button>
  );
}

