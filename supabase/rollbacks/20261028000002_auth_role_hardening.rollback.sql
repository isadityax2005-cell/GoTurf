-- ============================================================================
-- ROLLBACK for supabase/migrations/20261028000002_auth_role_hardening.sql
-- NOT a migration. Do NOT place in supabase/migrations. Review-only until approved.
--
-- The forward migration changes exactly three objects plus one trigger:
--   1. public.get_current_user_role()            (adds SET search_path)
--   2. public.handle_new_user()                  (stops trusting signup metadata role)
--   3. public.prevent_profile_role_escalation()  (new function)
--   4. trigger profiles_prevent_role_escalation  (new trigger on public.profiles)
--
-- It changes NO tables, columns, policies, grants or data rows, so no data
-- restore is needed. Run inside one transaction.
-- ============================================================================
BEGIN;

-- (4) + (3): remove the new trigger and its function.
DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_profile_role_escalation();

-- (1): restore get_current_user_role() exactly as defined in
-- 20261008000001_rls_policies.sql (no explicit search_path).
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'player'::user_role);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- (2): restore handle_new_user() exactly as defined in
-- 20261008000001_rls_policies.sql.
-- WARNING: this original definition trusts raw_user_meta_data->>'role', which
-- lets any visitor self-register as 'owner' or 'admin' via supabase.auth.signUp.
-- Prefer the PARTIAL rollback below (drop only the trigger) unless the whole
-- migration must be reverted.
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

COMMIT;

-- ----------------------------------------------------------------------------
-- PARTIAL ROLLBACK (recommended if the only problem is the new trigger blocking
-- a legitimate client write): keep the safer functions, drop just the trigger.
--   DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
-- ----------------------------------------------------------------------------

-- ROLLBACK VERIFICATION (read-only):
--   SELECT proname, proconfig FROM pg_proc
--    WHERE proname IN ('get_current_user_role','handle_new_user','prevent_profile_role_escalation')
--      AND pronamespace = 'public'::regnamespace;
--   -- after full rollback: prevent_profile_role_escalation absent; the other two
--   -- have proconfig NULL.
--   SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;
--   -- after rollback: profiles_prevent_role_escalation absent.

