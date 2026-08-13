# EPIC_VAULT — Full-Stack E-Commerce Platform

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel)](https://vercel.com/)

A modern, functional Full-Stack E-Commerce web application built for the **ACM Junior Webmaster Recruitment Task**. Features real-time stock limits, full user authentication, role-based admin controls, and **race-condition-safe atomic order checkouts**.

---

## Project Features

- **Interactive Product Catalog**: Search by keyword, filter by category, and sort by price or name.
- **Real-Time Stock Enforcement**: Product quantities in cart are capped server-side and client-side by available stock.
- **Supabase Auth & RLS**: User registration, login session persistence, and Row-Level Security policies.
- **Race-Condition-Safe Checkout**: Handled inside PostgreSQL using `SELECT ... FOR UPDATE` row locks to prevent double-purchasing of limited stock.
- **Admin Management Dashboard**: Protected admin routes to create, edit, delete products, and manage order statuses (`Processing` → `Shipped` → `Delivered`).
- **Clean Responsive UI**: Styled with Tailwind CSS v4 in light theme using Indian Rupee (`₹`) formatting.

---

## Race Condition Challenge & Solution

### The Problem: Concurrent Purchasing
In standard e-commerce implementations, checking stock on the frontend before calling an `UPDATE` query leads to a **race condition**. If two users attempt to purchase the final unit (`stock = 1`) at the exact same millisecond:

1. User A reads `stock = 1` (valid).
2. User B reads `stock = 1` (valid).
3. User A decrements stock to `0` and creates an order.
4. User B decrements stock to `-1` and creates a duplicate order for non-existent stock.

### The Solution: Atomic PL/pgSQL RPC with `SELECT FOR UPDATE`
`EPIC_VAULT` solves this inside PostgreSQL using a custom stored procedure `place_order_atomic(p_user_id, p_items, p_total_amount)`:

```sql
CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount NUMERIC
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
  -- 1. Acquire exclusive ROW LOCK on products being purchased
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    -- Exclusive row-level lock (TX2 blocks here until TX1 commits/rolls back)
    SELECT stock, name INTO v_current_stock, v_product_name
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

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

  -- 3. Record Order
  INSERT INTO public.orders (user_id, products, total_amount, order_status)
  VALUES (p_user_id, p_items, p_total_amount, 'Processing')
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### How it Behaves Under Load:
- **Transaction 1 (User A)** acquires the row lock via `FOR UPDATE`, verifies stock = 1, deducts to 0, inserts order, and commits.
- **Transaction 2 (User B)** waits for Transaction 1's lock release, re-reads stock = 0, triggers an `INSUFFICIENT_STOCK` exception, and PostgreSQL automatically rolls back the entire transaction. User B receives a clean error toast.

---

## Security & RLS Matrix

| Entity | Public Access | Customer Access | Admin Access |
|---|---|---|---|
| `profiles` | None | Read/Update Own Profile | Read All |
| `products` | Read Catalog | Read Catalog | Insert / Update / Delete |
| `orders` | None | Read Own Orders / Place Order via RPC | Read All / Update Order Status |

---

## Project Setup & Local Run

### Prerequisites
- Node.js 18+
- Supabase PostgreSQL Database

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/EPIC-SID/EPIC_VAULT.git
cd EPIC_VAULT
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Initialize Database Schema
Execute the SQL statements from [`schema.sql`](./schema.sql) in your **Supabase SQL Editor** to create the required tables, triggers, and the `place_order_atomic` function.

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 5. Production Build
```bash
npm run build
```

---

## Deployment (Vercel)

This application is configured for single-page app (SPA) routing on **Vercel** via `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Deployment Steps:
1. Push repository to GitHub.
2. Import project into Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**.

---

## Repository Structure

```
EPIC_VAULT/
├── schema.sql                 # PostgreSQL tables, RLS & place_order_atomic RPC
├── implementation_plan.txt    # Architecture and execution plan
├── vercel.json                # Vercel SPA rewrite configuration
├── vite.config.ts             # Vite build & alias configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
└── src/
    ├── types/                 # Domain interfaces (Product, Profile, Order, etc.)
    ├── lib/                   # Supabase client singleton
    ├── context/               # AuthContext, CartContext, ToastContext
    ├── hooks/                 # useProducts hook
    ├── components/            # Layout, Auth, Products, Cart & Checkout components
    ├── pages/                 # ProductsPage, LoginPage, SignupPage, ProfilePage, AdminPage
    ├── App.tsx                # Main App Router & Provider Tree
    ├── main.tsx               # DOM entrypoint
    └── index.css              # Global styles & design system
```

---

## 👤 Author
Developed for the **ACM Junior Webmaster Recruitment Task**.
