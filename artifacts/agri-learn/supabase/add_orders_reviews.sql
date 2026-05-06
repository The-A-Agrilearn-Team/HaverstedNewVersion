-- ============================================================
-- ORDERS & REVIEWS — run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id       UUID REFERENCES public.product_listings(id) ON DELETE SET NULL,
  offer_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  quantity         DECIMAL(10,2) NOT NULL,
  price_per_unit   DECIMAL(10,2) NOT NULL,
  unit             TEXT NOT NULL DEFAULT 'kg',
  status           TEXT NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed','ready_for_pickup','completed','cancelled')),
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (reviewer_id, order_id)
);

-- RLS
ALTER TABLE public.orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_own"
  ON public.orders FOR ALL
  USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

CREATE POLICY "reviews_read_all"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- updated_at helper function (create if not already present)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Auto updated_at trigger for orders
DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer   ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer  ON public.orders (farmer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order    ON public.reviews (order_id);
