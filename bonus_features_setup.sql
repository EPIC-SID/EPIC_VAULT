-- ============================================================================
-- SAFE SETUP SCRIPT FOR ALL BONUS FEATURES
-- Uses IF NOT EXISTS + DROP POLICY IF EXISTS — safe to re-run multiple times!
-- Run this entire script in your Supabase SQL Editor.
-- ============================================================================

-- ─── WISHLIST TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own wishlist" ON public.wishlists;
CREATE POLICY "Users manage their own wishlist"
  ON public.wishlists FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── REVIEWS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can write reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own review" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own review" ON public.reviews;
CREATE POLICY "Everyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can write reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own review" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own review" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ─── COUPONS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Only admins can manage coupons" ON public.coupons;
CREATE POLICY "Anyone can read active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Only admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Add coupon columns to orders if not already there
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- Seed default coupons (safe to re-run)
INSERT INTO public.coupons (code, discount_percent, max_uses) VALUES
  ('ACM10',     10, 100),
  ('EPIC20',    20, 50),
  ('STUDENT15', 15, 200),
  ('PCCOE30',   30, 100)
ON CONFLICT (code) DO NOTHING;

-- ─── PROFILES: phone & bio columns ───────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- ─── COUPON USAGE INCREMENT FUNCTION (used by checkout) ──────────────────────
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_code;
END;
$$;

-- ─── VERIFY: Show all tables ─────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

