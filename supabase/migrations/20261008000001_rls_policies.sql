-- ============================================================================
-- GoTurf: Row Level Security (RLS) & Access Control (Phase 2)
-- Strict multi-tenant isolation: Players, Turf Owners, and Admins
-- ============================================================================

-- 1. Helper function to retrieve the authenticated user's role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'player'::user_role);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Trigger to automatically provision profiles upon Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'player')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 3. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE turf_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Regions Policies (Publicly readable)
CREATE POLICY "Regions are viewable by everyone"
  ON regions FOR SELECT
  USING (true);

-- 5. Profiles Policies
CREATE POLICY "Users can read own profile or admin can read all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update own profile details"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Turfs Policies
-- Public can view approved, non-hidden turfs.
-- Owners can view all their own turfs (even drafts).
-- Admins can view everything.
CREATE POLICY "Public can view approved turfs"
  ON turfs FOR SELECT
  USING (
    (status = 'approved') 
    OR (owner_id = auth.uid()) 
    OR (public.get_current_user_role() = 'admin')
  );

CREATE POLICY "Owners can insert their own turfs"
  ON turfs FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() 
    AND public.get_current_user_role() IN ('owner', 'admin')
  );

CREATE POLICY "Owners can update their own turfs"
  ON turfs FOR UPDATE
  USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
  WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- 7. Courts Policies
CREATE POLICY "Courts are viewable if turf is viewable"
  ON courts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM turfs t
      WHERE t.id = courts.turf_id
      AND ((t.status = 'approved' AND courts.is_active = true) OR t.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
  );

CREATE POLICY "Owners can manage courts for their own turfs"
  ON courts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM turfs t
      WHERE t.id = courts.turf_id
      AND (t.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
  );

-- 8. Opening Hours & Price Rules Policies (Inherit turf ownership)
CREATE POLICY "Opening hours are viewable by public"
  ON opening_hours FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage opening hours for their courts"
  ON opening_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courts c
      JOIN turfs t ON c.turf_id = t.id
      WHERE c.id = opening_hours.court_id
      AND (t.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
  );

CREATE POLICY "Price rules are viewable by public"
  ON price_rules FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage price rules for their courts"
  ON price_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courts c
      JOIN turfs t ON c.turf_id = t.id
      WHERE c.id = price_rules.court_id
      AND (t.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
  );

-- 9. Bookings Policies (Strict Isolation)
-- Players see only their own bookings.
-- Owners see bookings for courts in their turfs (CANNOT see other owners' bookings).
-- Admins see all.
CREATE POLICY "Bookings select policy"
  ON bookings FOR SELECT
  USING (
    (player_id = auth.uid())
    OR (
      EXISTS (
        SELECT 1 FROM courts c
        JOIN turfs t ON c.turf_id = t.id
        WHERE c.id = bookings.court_id
        AND t.owner_id = auth.uid()
      )
    )
    OR (public.get_current_user_role() = 'admin')
  );

CREATE POLICY "Players can create held bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    (player_id = auth.uid() AND booking_type = 'player')
    OR (
      booking_type = 'owner_block' 
      AND EXISTS (
        SELECT 1 FROM courts c
        JOIN turfs t ON c.turf_id = t.id
        WHERE c.id = bookings.court_id
        AND (t.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
      )
    )
    OR (public.get_current_user_role() = 'admin')
  );

CREATE POLICY "Players can cancel own bookings or owners manage own court bookings"
  ON bookings FOR UPDATE
  USING (
    (player_id = auth.uid())
    OR (
      EXISTS (
        SELECT 1 FROM courts c
        JOIN turfs t ON c.turf_id = t.id
        WHERE c.id = bookings.court_id
        AND t.owner_id = auth.uid()
      )
    )
    OR (public.get_current_user_role() = 'admin')
  );

-- 10. Payments Policies
CREATE POLICY "Players see own payments; owners see payments for their turfs; admin sees all"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN turfs t ON c.turf_id = t.id
      WHERE b.id = payments.booking_id
      AND (b.player_id = auth.uid() OR t.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
  );

-- 11. Owner Payout Accounts
CREATE POLICY "Owners see only their payout account"
  ON owner_payout_accounts FOR SELECT
  USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- 12. Audit Log (Admin Only)
CREATE POLICY "Only admin can view audit logs"
  ON audit_log FOR SELECT
  USING (public.get_current_user_role() = 'admin');
