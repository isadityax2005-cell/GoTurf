-- ============================================================================
-- GoTurf: Database Schema (Phase 1)
-- Zero double-bookings via PostgreSQL GiST Exclusion Constraints
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Enumerated Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('player', 'owner', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE turf_status AS ENUM ('draft', 'pending', 'approved', 'hidden');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sport_type AS ENUM ('cricket', 'football', 'tennis', 'pickleball');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('held', 'confirmed', 'cancelled', 'expired', 'completed', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM ('player', 'owner_block');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE day_type AS ENUM ('weekday', 'weekend', 'holiday');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('created', 'captured', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL DEFAULT 'player',
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Regions Table (Localities in Mumbai)
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locality TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Mumbai',
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(locality, city, state)
);

-- 5. Turfs Table
CREATE TABLE IF NOT EXISTS turfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  region_id UUID REFERENCES regions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  maps_url TEXT,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  rules TEXT,
  cancellation_rule TEXT,
  status turf_status NOT NULL DEFAULT 'draft',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Courts Table (Bookable Units inside a Turf)
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport sport_type NOT NULL,
  format TEXT NOT NULL, -- e.g., 'Box Cricket', '5-a-side', 'Singles/Doubles'
  surface TEXT,        -- e.g., 'Artificial Grass', 'Cushioned Acrylic', 'Synthetic'
  slot_minutes INTEGER NOT NULL DEFAULT 60 CHECK (slot_minutes IN (30, 60, 90, 120)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Turf Photos
CREATE TABLE IF NOT EXISTS turf_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Opening Hours (Per Court)
CREATE TABLE IF NOT EXISTS opening_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  CHECK (open_time < close_time),
  UNIQUE(court_id, day_of_week)
);

-- 9. Price Rules (Prices stored in integer paise)
CREATE TABLE IF NOT EXISTS price_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_type day_type NOT NULL DEFAULT 'weekday',
  from_time TIME NOT NULL,
  to_time TIME NOT NULL,
  price_paise INTEGER NOT NULL CHECK (price_paise > 0),
  is_peak BOOLEAN NOT NULL DEFAULT false,
  CHECK (from_time < to_time)
);

-- 10. Bookings Table (Unified for Player Bookings & Owner Offline Blocks)
-- The heart of concurrency protection: PostgreSQL GiST exclusion constraint
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  player_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_type booking_type NOT NULL DEFAULT 'player',
  time_range TSTZRANGE NOT NULL,
  status booking_status NOT NULL DEFAULT 'held',
  hold_expires_at TIMESTAMPTZ,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
  cancel_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Mathematical Guarantee: Zero Overlaps for Active Bookings & Holds
  CONSTRAINT no_overlapping_active_slots EXCLUDE USING gist (
    court_id WITH =,
    time_range WITH &&
  ) WHERE (status IN ('held', 'confirmed'))
);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  provider_order_id TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT UNIQUE,
  status payment_status NOT NULL DEFAULT 'created',
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  raw_event_id TEXT UNIQUE, -- For webhook idempotency
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  provider_refund_id TEXT UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  status TEXT NOT NULL DEFAULT 'processed',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Owner Payout Accounts (Razorpay Route Linked Accounts)
CREATE TABLE IF NOT EXISTS owner_payout_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  provider_linked_account_id TEXT NOT NULL UNIQUE,
  kyc_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Turf Verifications
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  evidence_notes TEXT,
  evidence_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Audit Log (Administrative & Financial Tracking)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_turfs_region_status ON turfs(region_id, status);
CREATE INDEX IF NOT EXISTS idx_courts_turf_sport ON courts(turf_id, sport);
CREATE INDEX IF NOT EXISTS idx_bookings_court_status ON bookings(court_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_player ON bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON bookings USING gist (time_range);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_price_rules_court ON price_rules(court_id, day_type);
