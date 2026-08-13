-- ============================================================================
-- CLEANUP DUPLICATE PRODUCTS SCRIPT FOR SUPABASE
-- Run this in your Supabase SQL Editor to delete duplicate products 
-- and keep only the latest single entry for each product name.
-- ============================================================================
DELETE FROM public.products
WHERE id NOT IN (
    SELECT DISTINCT ON (LOWER(TRIM(name))) id
    FROM public.products
    ORDER BY LOWER(TRIM(name)),
      created_at DESC
  );
-- Verify remaining clean count
SELECT category,
  count(*)
FROM public.products
GROUP BY category;