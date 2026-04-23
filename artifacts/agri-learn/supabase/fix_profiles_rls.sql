-- ============================================================
-- Fix profiles infinite recursion (focused fix)
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run this query
-- ============================================================

-- Step 1: Drop ALL policies on profiles (catches any policy regardless of name)
DO $$
DECLARE
  pol TEXT;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol);
  END LOOP;
END;
$$;

-- Step 2: Recreate clean policies (none of these reference profiles)
CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

-- Step 3: Create a SECURITY DEFINER function that returns user counts
-- (bypasses RLS entirely so stats always load correctly)
CREATE OR REPLACE FUNCTION public.get_user_counts()
RETURNS TABLE(
  total_users BIGINT,
  farmers_count BIGINT,
  retailers_count BIGINT,
  new_users_this_month BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE role = 'farmer')::BIGINT,
    COUNT(*) FILTER (WHERE role = 'retailer')::BIGINT,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::BIGINT
  FROM public.profiles;
$$;
