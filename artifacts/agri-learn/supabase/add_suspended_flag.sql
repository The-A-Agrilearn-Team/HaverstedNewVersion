-- ============================================================
-- Add suspended flag to profiles
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;

-- Allow admin users to update any profile (needed for suspend/unsuspend)
-- Uses a SECURITY DEFINER helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop existing update policy and recreate to also allow admin updates
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_user());

-- Grant execute on the helper
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
