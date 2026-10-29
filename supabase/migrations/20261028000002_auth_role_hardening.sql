-- 1. Harden get_current_user_role() with an explicit search_path so SECURITY DEFINER
-- execution cannot be hijacked via mutable schema search paths.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'player'::public.user_role);
END;
$$;

-- 2. Keep account roles server-assigned. Public signup metadata is untrusted.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'player'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. RLS alone permits updates to every column on the user's own row. This trigger
-- prevents authenticated clients from changing role, email, id, or created_at while
-- allowing trusted service-role/Auth trigger operations (where auth.uid() is NULL).
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  request_user_id uuid := auth.uid();
  jwt_email text := NULLIF(auth.jwt()->>'email', '');
BEGIN
  IF request_user_id IS NOT NULL THEN
    IF NEW.id <> request_user_id THEN
      RAISE EXCEPTION 'Cannot modify another user profile';
    END IF;

    IF TG_OP = 'INSERT' THEN
      NEW.role := 'player'::public.user_role;
      IF jwt_email IS NOT NULL AND lower(NEW.email) <> lower(jwt_email) THEN
        RAISE EXCEPTION 'Profile email must match authenticated account email';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Cannot change profile primary key';
      END IF;
      IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Only trusted server operations may change account roles';
      END IF;
      IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Only trusted server operations may change account email';
      END IF;
      IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Cannot modify profile creation timestamp';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();
