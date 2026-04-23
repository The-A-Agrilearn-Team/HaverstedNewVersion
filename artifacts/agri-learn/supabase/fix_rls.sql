-- ============================================================
-- AgriLearn RLS Fix — Resolves "infinite recursion in policy for relation profiles"
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Step 1: Create a SECURITY DEFINER function that reads the current user's
-- role without triggering RLS evaluation (breaks the recursion cycle).
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Step 2: Drop ALL existing policies on every table to clear any manually
-- added recursive policies and start fresh.
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','learning_modules','learning_progress','bookmarks','product_listings','messages','audit_logs')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 3: Recreate all policies using get_my_role() where needed
-- ============================================================

-- PROFILES — simple, no self-references
CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

-- LEARNING MODULES — active visible to all; admin sees and manages everything
CREATE POLICY "modules_read_active"
  ON public.learning_modules FOR SELECT
  USING (is_active = true OR public.get_my_role() = 'admin');

CREATE POLICY "modules_admin_write"
  ON public.learning_modules FOR ALL
  USING (public.get_my_role() = 'admin');

-- LEARNING PROGRESS — own rows only
CREATE POLICY "progress_own"
  ON public.learning_progress FOR ALL
  USING (auth.uid() = user_id);

-- BOOKMARKS — own rows only
CREATE POLICY "bookmarks_own"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- PRODUCT LISTINGS — active visible to all; admin sees everything
CREATE POLICY "listings_read"
  ON public.product_listings FOR SELECT
  USING (status = 'active' OR public.get_my_role() = 'admin');

CREATE POLICY "listings_farmer_insert"
  ON public.product_listings FOR INSERT
  WITH CHECK (
    auth.uid() = farmer_id
    AND public.get_my_role() IN ('farmer', 'admin')
  );

CREATE POLICY "listings_farmer_update"
  ON public.product_listings FOR UPDATE
  USING (
    auth.uid() = farmer_id
    OR public.get_my_role() = 'admin'
  );

-- MESSAGES — sender or receiver
CREATE POLICY "messages_own"
  ON public.messages FOR ALL
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- AUDIT LOGS — admin read; anyone can insert
CREATE POLICY "audit_read_admin"
  ON public.audit_logs FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "audit_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Step 4: Ensure the admin account has role = 'admin'
-- (replace the email if different)
-- ============================================================
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@agrilearn.co.za';

-- ============================================================
-- Step 5: Fix product_listings status check to include 'removed'
-- ============================================================
ALTER TABLE public.product_listings
  DROP CONSTRAINT IF EXISTS product_listings_status_check;

ALTER TABLE public.product_listings
  ADD CONSTRAINT product_listings_status_check
  CHECK (status IN ('active', 'pending', 'sold', 'rejected', 'removed'));
