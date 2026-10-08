// ============================================================================
// GoTurf Slot Calculator Engine (Phase 4)
// Calculates live slot grids on-the-fly from opening hours and price rules.
// Enforces:
// 1. Storage in UTC, rendering in IST (Asia/Kolkata, UTC+5:30).
// 2. Strict masking of past slots (end_at <= now).
// 3. Collision detection against confirmed bookings, active holds, and owner blocks.
// 4. Dynamic peak vs off-peak pricing in whole integer paise.
// ============================================================================

import type { Court, OpeningHours, PriceRule, Booking } from '@/types/database';

export interface SlotGridItem {
  id: string; // e.g. "courtId_2026-10-15T12:30:00Z"
  courtId: string;
  startAtUTC: string;
  endAtUTC: string;
  startTimeIST: string; // "06:00 PM"
  endTimeIST: string;   // "07:00 PM"
  pricePaise: number;
  priceFormatted: string; // "₹1,800"
  isPeak: boolean;
  status: 'available' | 'held' | 'booked' | 'blocked' | 'past';
  blockReason?: string;
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function formatTimeIST(date: Date): string {
  // IST is strictly UTC + 5 hours 30 minutes
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffsetMs);

  const hours24 = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();

  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(hour12)}:${pad(minutes)} ${ampm}`;
}

// Convert "YYYY-MM-DD" + "HH:MM" in IST to UTC Date object
export function istToUtcDate(dateStr: string, timeStr: string): Date {
  // IST is UTC+05:30. Form ISO string with +05:30 offset
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Pad numbers
  const pad = (n: number) => String(n).padStart(2, '0');
  const isoStr = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+05:30`;
  return new Date(isoStr);
}

// Determine if date is weekend (Saturday = 6, Sunday = 0)
export function isWeekendIST(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function calculatePriceForSlot(
  slotStartTimeStr: string, // "HH:MM"
  isWeekend: boolean,
  priceRules?: PriceRule[]
): { pricePaise: number; isPeak: boolean } {
  const defaultOffPeak = 120000; // ₹1,200 default
  const defaultPeak = 180000;    // ₹1,800 default

  if (!priceRules || priceRules.length === 0) {
    // Default fallback: 17:00 to 23:00 or weekends is peak
    const [h] = slotStartTimeStr.split(':').map(Number);
    const isPeakTime = isWeekend || h >= 17;
    return {
      pricePaise: isPeakTime ? defaultPeak : defaultOffPeak,
      isPeak: isPeakTime,
    };
  }

  const targetDayType = isWeekend ? 'weekend' : 'weekday';

  for (const rule of priceRules) {
    if (rule.day_type === targetDayType) {
      const from = rule.from_time.slice(0, 5);
      const to = rule.to_time.slice(0, 5);
      if (slotStartTimeStr >= from && slotStartTimeStr < to) {
        return {
          pricePaise: rule.price_paise,
          isPeak: rule.is_peak,
        };
      }
    }
  }

  // Fallback to first matching rule or default
  return { pricePaise: defaultOffPeak, isPeak: false };
}

export interface GenerateSlotsOptions {
  court: Court;
  dateStr: string; // "YYYY-MM-DD"
  openingHours?: OpeningHours;
  priceRules?: PriceRule[];
  activeBookings: Booking[];
  now?: Date;
}

export function generateCourtSlots({
  court,
  dateStr,
  openingHours,
  priceRules,
  activeBookings,
  now = new Date(),
}: GenerateSlotsOptions): SlotGridItem[] {
  const slotMinutes = court.slot_minutes || 60;
  const openTimeStr = openingHours ? openingHours.open_time.slice(0, 5) : '06:00';
  const closeTimeStr = openingHours ? openingHours.close_time.slice(0, 5) : '23:00';

  const [openHour, openMin] = openTimeStr.split(':').map(Number);
  const [closeHour, closeMin] = closeTimeStr.split(':').map(Number);

  const totalOpenMinutes = openHour * 60 + openMin;
  const totalCloseMinutes = closeHour * 60 + closeMin;

  const slots: SlotGridItem[] = [];
  const isWeekend = isWeekendIST(dateStr);

  for (let current = totalOpenMinutes; current + slotMinutes <= totalCloseMinutes; current += slotMinutes) {
    const startHour = Math.floor(current / 60);
    const startMinute = current % 60;
    const endHour = Math.floor((current + slotMinutes) / 60);
    const endMinute = (current + slotMinutes) % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${pad(startHour)}:${pad(startMinute)}`;
    const endTimeStr = `${pad(endHour)}:${pad(endMinute)}`;

    const startUtc = istToUtcDate(dateStr, timeStr);
    const endUtc = istToUtcDate(dateStr, endTimeStr);

    const { pricePaise, isPeak } = calculatePriceForSlot(timeStr, isWeekend, priceRules);

    // Conflict Check against Bookings & Holds & Blocks
    let slotStatus: SlotGridItem['status'] = 'available';
    let blockReason: string | undefined;

    // Check if slot has already passed
    if (endUtc.getTime() <= now.getTime()) {
      slotStatus = 'past';
    } else {
      for (const b of activeBookings) {
        if (b.court_id !== court.id) continue;

        const bStart = new Date(b.start_at).getTime();
        const bEnd = new Date(b.end_at).getTime();
        const sStart = startUtc.getTime();
        const sEnd = endUtc.getTime();

        // Interval overlap condition: (sStart < bEnd) && (sEnd > bStart)
        if (sStart < bEnd && sEnd > bStart) {
          if (b.booking_type === 'owner_block') {
            slotStatus = 'blocked';
            blockReason = b.notes || 'Offline Reservation';
            break;
          } else if (b.status === 'confirmed') {
            slotStatus = 'booked';
            break;
          } else if (b.status === 'held') {
            // Check if hold is still active
            const holdExpires = b.hold_expires_at ? new Date(b.hold_expires_at).getTime() : 0;
            if (holdExpires > now.getTime()) {
              slotStatus = 'held';
              break;
            }
          }
        }
      }
    }

    slots.push({
      id: `${court.id}_${startUtc.toISOString()}`,
      courtId: court.id,
      startAtUTC: startUtc.toISOString(),
      endAtUTC: endUtc.toISOString(),
      startTimeIST: formatTimeIST(startUtc),
      endTimeIST: formatTimeIST(endUtc),
      pricePaise,
      priceFormatted: formatPaise(pricePaise),
      isPeak,
      status: slotStatus,
      blockReason,
    });
  }

  return slots;
}
