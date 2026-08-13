# EPIC_VAULT — Full-Stack E-Commerce Platform

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Live-Vercel-000000?logo=vercel)](https://epic-vault-store.vercel.app/)

> A modern, full-stack e-commerce web application built for the **ACM Junior Webmaster Recruitment Task**. Features real-time stock enforcement, complete user authentication, role-based admin controls, race-condition-safe atomic checkouts, wishlists, reviews, coupons, and a live analytics dashboard.

**Live Site:** [https://epic-vault-store.vercel.app/](https://epic-vault-store.vercel.app/)

---

## Core Features

- **Interactive Product Catalog** — Search by keyword, filter by category (Electronics, Fitness, Audio, Gaming), sort by price or name, with lazy loading and pagination.
- **Real-Time Stock Enforcement** — Cart quantities are capped by live stock. Out-of-stock products are disabled across the UI.
- **Supabase Auth & RLS** — Email/password sign-up, OTP magic link login, session persistence, and Row-Level Security policies across all tables.
- **Race-Condition-Safe Checkout** — Handled inside PostgreSQL via `SELECT ... FOR UPDATE` row locks to prevent double-purchasing of limited stock.
- **Cart Drawer** — Slide-in cart with quantity controls, live total, and direct checkout.
- **Order Tracking** — Per-order delivery progress timeline (Processing → Shipped → Out for Delivery → Delivered) with live status badges.
- **User Profile System** — Edit name, phone, bio, and avatar (preset or custom URL). Email is permanently locked.
- **Saved Shipping Addresses** — Add/remove multiple addresses; select at checkout.
- **Admin Dashboard** — Protected portal to add/edit/delete products, update order statuses, manage user roles, and view analytics.
- **Responsive Design** — Fully mobile-first; works on phones, tablets, and desktops.
- **Low-Network UX** — Offline/slow-network detection banner, skeleton loaders, `localStorage` stale-while-revalidate product caching, and lazy image loading.

---

## Bonus Features

### Wishlist
- Heart toggle on every product card — add/remove from wishlist in one tap.
- Wishlist synced to Supabase; persists across devices and sessions.
- Dedicated `/wishlist` page with grid view, remove button, and direct add-to-cart.
- Wishlist count badge in the Navbar (desktop & mobile).

### Coupon / Discount System
- Coupon input field in the checkout modal (above order totals).
- Validates coupon code against the `coupons` table (checks active status, expiry, usage limits).
- Shows discount breakdown line (`PCCOE30 — 30%`) and updated final total.
- Increments `used_count` after each successful order.

**Available Coupon Codes:**

| Code | Discount | Max Uses |
|------|----------|----------|
| `ACM10` | 10% off | 100 |
| `EPIC20` | 20% off | 50 |
| `STUDENT15` | 15% off | 200 |
| `PCCOE30` | 30% off | 100 |

### Product Reviews & Ratings
- Any logged-in user can submit a 1–5 star rating and optional review text per product.
- Edit or delete your own review at any time.
- Average star rating displayed on each product card and in the detail modal.
- Reviews tab in the product detail modal shows all community reviews with timestamps.

### Admin Analytics Dashboard
- **KPI Cards**: Total Products, Total Users, Total Orders, Total Revenue.
- **Revenue Bar Chart**: 7-day daily revenue (custom pure-CSS chart, no external library).
- **Top 5 Products**: Most ordered products ranked by units sold and revenue.
- **Recent Orders**: Latest 5 orders with status badges and amounts.
- Accessible via the **Analytics** tab in the Admin Portal.

---

## Race Condition Challenge & Solution

### The Problem: Concurrent Purchasing
In standard e-commerce, checking stock on the frontend before calling an `UPDATE` query causes a **race condition**. If two users attempt to purchase the final unit (`stock = 1`) simultaneously:

1. User A reads `stock = 1` (valid).
2. User B reads `stock = 1` (valid).
3. User A decrements to `0` and creates an order.
4. User B decrements to `-1` — overselling non-existent stock.

### The Solution: Atomic PL/pgSQL RPC with `SELECT FOR UPDATE`

```sql
CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_shipping_address JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_current_stock INT;
  v_product_name TEXT;
  v_order_id UUID;
BEGIN
  -- 1. Acquire exclusive ROW LOCK on each product being purchased
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    -- TX2 blocks here until TX1 commits or rolls back
    SELECT stock, name INTO v_current_stock, v_product_name
    FROM public.products WHERE id = v_product_id FOR UPDATE;

    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Available: %', v_product_name, v_current_stock;
    END IF;
  END LOOP;

  -- 2. Deduct inventory atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::INT
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  -- 3. Record the order
  INSERT INTO public.orders (user_id, products, total_amount, order_status, shipping_address)
  VALUES (p_user_id, p_items, p_total_amount, 'Processing', p_shipping_address)
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Under concurrent load:**
- **User A** acquires the row lock, verifies stock, decrements, inserts order, commits.
- **User B** waits for the lock release, re-reads `stock = 0`, triggers an `INSUFFICIENT_STOCK` exception, and the entire transaction is automatically rolled back. User B sees a clean error toast.

---

## Security & RLS Matrix

| Table | Public | Customer | Admin |
|-------|--------|----------|-------|
| `profiles` | — | Read/Update Own | Read All |
| `products` | Read | Read | Insert / Update / Delete |
| `orders` | — | Read Own / Place via RPC | Read All / Update Status |
| `wishlists` | — | Read/Write Own | — |
| `reviews` | Read | Write/Edit/Delete Own | — |
| `coupons` | Read Active | Read Active | Full Manage |
| `addresses` | — | Read/Write Own | — |

---

## Project Setup & Local Run

### Prerequisites

- Node.js 18+
- Supabase PostgreSQL project

### 1. Clone & Install
```bash
git clone https://github.com/EPIC-SID/EPIC_VAULT.git
cd EPIC_VAULT
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BREVO_API_KEY=your-brevo-api-key        # Optional – for order confirmation emails
```

### 3. Initialize Database
Run [`sql/schema.sql`](./sql/schema.sql) in your **Supabase SQL Editor** to create all tables, triggers, RLS policies, and the `place_order_atomic` function.

Then run [`sql/bonus_features_setup.sql`](./sql/bonus_features_setup.sql) to set up:

- `wishlists` table + RLS
- `reviews` table + RLS
- `coupons` table + RLS + default coupon codes
- `increment_coupon_usage` RPC function
- `phone` and `bio` columns on `profiles`

### 4. Seed Products (Optional)
Run [`sql/seed_products.sql`](./sql/seed_products.sql) to populate the catalog with 40+ products across Electronics, Fitness, Audio, and Gaming.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 6. Production Build
```bash
npm run build
```

---

## Deployment (Vercel)

Configured for single-page app (SPA) routing via [`vercel.json`](./vercel.json):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Steps:**
1. Push to GitHub.
2. Import project into [Vercel](https://vercel.com/).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Deploy.

---

## Repository Structure

```
EPIC_VAULT/
│
├── sql/
│   ├── schema.sql                   # PostgreSQL tables, RLS, triggers & place_order_atomic RPC
│   ├── bonus_features_setup.sql     # Wishlist, Reviews, Coupons tables, RLS & RPC functions
│   ├── seed_products.sql            # 40+ product catalog seed data
│   ├── update_lower_prices.sql      # SQL to update existing product prices
│   └── cleanup_duplicate_products.sql # SQL to deduplicate products table
│
├── vercel.json                      # Vercel SPA rewrite config
├── vite.config.ts                   # Vite build config & path aliases (@/)
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies & npm scripts
├── tailwind.config.js               # Tailwind CSS configuration
│
└── src/
    │
    ├── App.tsx                      # Root router, provider tree, lazy-loaded routes
    ├── main.tsx                     # React DOM entry point
    ├── index.css                    # Global styles, design tokens & utility classes
    ├── vite-env.d.ts                # Vite environment type declarations
    │
    ├── types/
    │   └── index.ts                 # Domain interfaces: Profile, Product, Order, Cart, Auth, etc.
    │
    ├── lib/
    │   ├── supabase.ts              # Supabase client singleton
    │   ├── validation.ts            # Email, mobile validation & user-friendly error formatting
    │   └── brevo.ts                 # Brevo transactional email integration (order confirmation)
    │
    ├── context/
    │   ├── AuthContext.tsx          # Auth state, sign-in/up/out, OTP, updateProfile
    │   ├── CartContext.tsx          # Cart state, add/remove/update/clear
    │   ├── ToastContext.tsx         # Global toast notification system
    │   └── WishlistContext.tsx      # Wishlist state synced to Supabase with optimistic updates
    │
    ├── hooks/
    │   ├── useProducts.ts           # Products fetching with caching, deduplication & batching
    │   └── useNetworkStatus.ts      # Real-time online/offline/slow-network detection
    │
    ├── pages/
    │   ├── ProductsPage.tsx         # Main catalog with filters, skeleton loaders & pagination
    │   ├── LoginPage.tsx            # Email/password login + OTP magic link
    │   ├── SignupPage.tsx           # Registration with password strength indicator
    │   ├── ProfilePage.tsx          # User profile, saved addresses & order history
    │   ├── WishlistPage.tsx         # User's wishlisted products with add-to-cart
    │   ├── OrderDetailPage.tsx      # Order receipt + live delivery progress tracker
    │   ├── AdminPage.tsx            # Admin portal: products, orders, users & analytics tabs
    │   └── NotFoundPage.tsx         # 404 page
    │
    └── components/
        │
        ├── layout/
        │   ├── Navbar.tsx           # Sticky nav: category links, wishlist badge, cart, user menu
        │   ├── Footer.tsx           # Site footer
        │   └── NetworkBanner.tsx    # Fixed top banner for offline/slow/restored connectivity
        │
        ├── auth/
        │   └── ProtectedRoute.tsx   # Auth guard (redirects to login) with optional admin check
        │
        ├── products/
        │   ├── ProductCard.tsx      # Product card with wishlist heart, lazy image, stock badge
        │   ├── ProductDetailModal.tsx  # Product modal with Details & Reviews tabs
        │   ├── ProductFilters.tsx   # Category, search & sort filter controls
        │   └── ReviewSection.tsx    # Star rating input, review form, reviews list
        │
        ├── cart/
        │   ├── CartDrawer.tsx       # Slide-in cart panel
        │   └── CartItem.tsx         # Individual cart item row with quantity controls
        │
        ├── checkout/
        │   └── CheckoutModal.tsx    # Checkout modal: address picker, coupon input, order totals
        │
        ├── profile/
        │   ├── EditProfileModal.tsx # Edit name, phone, bio, avatar (email locked)
        │   └── AddressModal.tsx     # Add new shipping address form with validation
        │
        └── admin/
            └── AnalyticsDashboard.tsx  # KPI cards, revenue bar chart, top products, recent orders
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Backend / DB | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth (Email + OTP) |
| Email | Brevo Transactional API |
| Deployment | Vercel |

---

## 👤 Author
Developed for the **ACM Junior Webmaster Recruitment Task** by **Siddhant**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-epic--vault--store.vercel.app-000000?logo=vercel)](https://epic-vault-store.vercel.app/)
