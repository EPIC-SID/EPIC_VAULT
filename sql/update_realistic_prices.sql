-- ============================================================================
-- UPDATE EXISTING PRODUCTS TO REALISTIC PRICES AND HIGH-RES STUDIO IMAGES
-- ============================================================================

-- Laptops
UPDATE public.products SET price = 349900.00, image_url = '/products/macbook_pro.jpg' WHERE name ILIKE '%MacBook Pro 16%';
UPDATE public.products SET price = 359990.00 WHERE name ILIKE '%ROG Strix SCAR 18%';
UPDATE public.products SET price = 289990.00 WHERE name ILIKE '%Razer Blade 16%';
UPDATE public.products SET price = 249990.00, image_url = '/products/lenovo_legion.jpg' WHERE name ILIKE '%Legion Pro 7i%';
UPDATE public.products SET price = 189990.00 WHERE name ILIKE '%Dell XPS 15%';
UPDATE public.products SET price = 169990.00 WHERE name ILIKE '%ThinkPad X1 Carbon%';
UPDATE public.products SET price = 144990.00, image_url = '/products/hp_omen.jpg' WHERE name ILIKE '%HP OMEN 16%';
UPDATE public.products SET price = 74990.00  WHERE name ILIKE '%HP Victus 15%';
UPDATE public.products SET price = 64990.00  WHERE name ILIKE '%Lenovo LOQ 15%';
UPDATE public.products SET price = 69990.00  WHERE name ILIKE '%IdeaPad Slim 5%';

-- Graphics Cards (GPUs)
UPDATE public.products SET price = 249999.00 WHERE name ILIKE '%ROG Matrix%4090%';
UPDATE public.products SET price = 169999.00, image_url = '/products/rtx_4090.jpg' WHERE name ILIKE '%RTX 4090 Founders%';
UPDATE public.products SET price = 99999.00  WHERE name ILIKE '%RTX 4080 Super%';
UPDATE public.products SET price = 94999.00  WHERE name ILIKE '%RX 7900 XTX%';
UPDATE public.products SET price = 64999.00  WHERE name ILIKE '%RTX 5070%';
UPDATE public.products SET price = 42999.00  WHERE name ILIKE '%RTX 5060%';
UPDATE public.products SET price = 32999.00  WHERE name ILIKE '%RTX 5050%';
UPDATE public.products SET price = 29999.00  WHERE name ILIKE '%RTX 4060 Dual%';
UPDATE public.products SET price = 25999.00  WHERE name ILIKE '%RTX 3060 Gaming%';
UPDATE public.products SET price = 24999.00  WHERE name ILIKE '%RTX 4050 Stealth%';
UPDATE public.products SET price = 18499.00  WHERE name ILIKE '%RTX 3050 Twin%';

-- PlayStation Consoles & Gear
UPDATE public.products SET price = 69990.00, image_url = '/products/ps5_pro.jpg' WHERE name ILIKE '%PlayStation 5 Pro%';
UPDATE public.products SET price = 54990.00, image_url = '/products/ps_vr2.jpg' WHERE name ILIKE '%PlayStation VR2%';
UPDATE public.products SET price = 44990.00  WHERE name ILIKE '%PlayStation 5 Slim%';
UPDATE public.products SET price = 18990.00  WHERE name ILIKE '%PlayStation Portal%';
UPDATE public.products SET price = 17990.00, image_url = '/products/dualsense_edge.jpg' WHERE name ILIKE '%DualSense Edge%';
