// ============================================================================
// GoTurf Database Types (Phase 1)
// Fully typed interfaces matching the PostgreSQL schema
// ============================================================================

export type UserRole = 'player' | 'owner' | 'admin';
export type TurfStatus = 'draft' | 'pending' | 'approved' | 'hidden';
export type SportType = 'cricket' | 'football' | 'tennis' | 'pickleball';
export type BookingStatus = 'held' | 'confirmed' | 'cancelled' | 'expired' | 'completed' | 'no_show';
export type BookingType = 'player' | 'owner_block';
export type DayType = 'weekday' | 'weekend' | 'holiday';
export type PaymentStatus = 'created' | 'captured' | 'failed' | 'refunded';
export type PaymentMode = 'full_online' | 'token_advance';
export type BalanceStatus = 'unpaid' | 'collected_cash' | 'collected_venue_upi' | 'waived';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  locality: string;
  city: string;
  state: string;
  created_at: string;
}

export interface Turf {
  id: string;
  owner_id: string | null;
  region_id: string;
  name: string;
  slug: string;
  address: string;
  lat: number;
  lng: number;
  maps_url: string | null;
  facilities: string[];
  rules: string | null;
  cancellation_rule: string | null;
  status: TurfStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  region?: Region;
  courts?: Court[];
  photos?: TurfPhoto[];
}

export interface Court {
  id: string;
  turf_id: string;
  name: string;
  sport: SportType;
  format: string;
  surface: string | null;
  slot_minutes: number;
  is_active: boolean;
  allows_advance_booking?: boolean;
  min_advance_paise?: number;
  created_at: string;
  updated_at: string;
  opening_hours?: OpeningHours[];
  price_rules?: PriceRule[];
}

export interface TurfPhoto {
  id: string;
  turf_id: string;
  path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface OpeningHours {
  id: string;
  court_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  open_time: string;  // HH:MM:SS
  close_time: string; // HH:MM:SS
}

export interface PriceRule {
  id: string;
  court_id: string;
  day_type: DayType;
  from_time: string; // HH:MM:SS
  to_time: string;   // HH:MM:SS
  price_paise: number; // Stored in integer paise (₹1,000 = 100000)
  is_peak: boolean;
}

export interface Booking {
  id: string;
  court_id: string;
  player_id: string | null;
  booking_type: BookingType;
  start_at: string; // ISO 8601 UTC
  end_at: string;   // ISO 8601 UTC
  status: BookingStatus;
  hold_expires_at: string | null;
  price_paise: number;
  payment_mode?: PaymentMode;
  advance_amount_paise?: number;
  balance_amount_paise?: number;
  balance_status?: BalanceStatus;
  balance_collected_at?: string | null;
  balance_collected_by?: string | null;
  check_in_otp?: string | null;
  cancel_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  court?: Court;
  player?: Profile;
}


export interface Payment {
  id: string;
  booking_id: string;
  provider_order_id: string;
  provider_payment_id: string | null;
  status: PaymentStatus;
  amount_paise: number;
  raw_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  provider_refund_id: string | null;
  amount_paise: number;
  status: string;
  reason: string | null;
  created_at: string;
}

export interface OwnerPayoutAccount {
  id: string;
  owner_id: string;
  provider_linked_account_id: string;
  kyc_status: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Database schema definition for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      regions: { Row: Region; Insert: Omit<Region, 'created_at'>; Update: Partial<Region> };
      turfs: { Row: Turf; Insert: Omit<Turf, 'created_at' | 'updated_at'>; Update: Partial<Turf> };
      courts: { Row: Court; Insert: Omit<Court, 'created_at' | 'updated_at'>; Update: Partial<Court> };
      turf_photos: { Row: TurfPhoto; Insert: Omit<TurfPhoto, 'created_at'>; Update: Partial<TurfPhoto> };
      opening_hours: { Row: OpeningHours; Insert: Omit<OpeningHours, 'id'>; Update: Partial<OpeningHours> };
      price_rules: { Row: PriceRule; Insert: Omit<PriceRule, 'id'>; Update: Partial<PriceRule> };
      bookings: { Row: Booking; Insert: Omit<Booking, 'created_at' | 'updated_at'>; Update: Partial<Booking> };
      payments: { Row: Payment; Insert: Omit<Payment, 'created_at' | 'updated_at'>; Update: Partial<Payment> };
      refunds: { Row: Refund; Insert: Omit<Refund, 'created_at'>; Update: Partial<Refund> };
      owner_payout_accounts: { Row: OwnerPayoutAccount; Insert: Omit<OwnerPayoutAccount, 'created_at' | 'updated_at'>; Update: Partial<OwnerPayoutAccount> };
      audit_log: { Row: AuditLog; Insert: Omit<AuditLog, 'id' | 'created_at'>; Update: Partial<AuditLog> };
    };
  };
}
