-- ============================================================================
-- EPIC_VAULT Database Schema
-- Supabase PostgreSQL 15 Setup for ACM Junior Webmaster Recruitment Task
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  products JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  order_status TEXT NOT NULL DEFAULT 'Processing' CHECK (order_status IN ('Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
  shipping_address JSONB,
  status_timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECURITY DEFINER HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION — ALL TABLES PROTECTED BY RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Clean Drop Old Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;

-- PROFILES POLICIES (Non-Recursive SELECT USING true)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ADDRESSES POLICIES
CREATE POLICY "Users can view their own addresses" 
  ON public.addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
  ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
  ON public.addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
  ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS POLICIES
CREATE POLICY "Products are viewable by everyone" 
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Only admins can insert products" 
  ON public.products FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update products" 
  ON public.products FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete products" 
  ON public.products FOR DELETE USING (public.is_admin());

-- ORDERS POLICIES
CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "Users can insert their own orders" 
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update order status" 
  ON public.orders FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ATOMIC STORED PROCEDURE FOR RACE-CONDITION SAFE ORDER PLACEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_shipping_address JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_current_stock INT;
  v_product_name TEXT;
  v_order_id UUID;
  v_initial_timeline JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Caller ID does not match transaction user ID';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    SELECT stock, name INTO v_current_stock, v_product_name
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found', v_product_id;
    END IF;

    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Requested: %, Available: %', 
        v_product_name, v_quantity, v_current_stock;
    END IF;
  END LOOP;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    UPDATE public.products
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;
  END LOOP;

  v_initial_timeline := jsonb_build_array(
    jsonb_build_object(
      'status', 'Processing',
      'timestamp', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );

  INSERT INTO public.orders (user_id, products, total_amount, order_status, shipping_address, status_timeline)
  VALUES (p_user_id, p_items, p_total_amount, 'Processing', p_shipping_address, v_initial_timeline)
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'message', 'Order placed successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
