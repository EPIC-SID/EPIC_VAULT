-- ============================================================================
-- 50+ HIGH QUALITY E-COMMERCE PRODUCTS SEED SCRIPT FOR EPIC_VAULT
-- Run this script in the Supabase SQL Editor to seed the catalog.
-- ============================================================================

INSERT INTO public.products (name, category, price, description, image_url, stock) VALUES

-- Electronics & Gadgets (12 Items)
('EpicBook Pro 16 M3 Max', 'Electronics', 249999.00, 'Ultra-powerful laptop featuring 16-core CPU, 40-core GPU, 36GB unified memory, and 1TB SSD. Built for extreme workflows.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 15),
('UltraTab Pro 12.9 Inch', 'Electronics', 109999.00, 'Liquid Retina XDR screen with M2 chip, Thunderbolt support, Apple Pencil hover, and all-day battery life.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 25),
('SoundPulse Noise Cancelling Headphones', 'Electronics', 29999.00, 'Industry-leading active noise cancellation with custom 40mm drivers and 30-hour continuous playback.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 40),
('AeroWatch Ultra Titanium', 'Electronics', 89999.00, 'Rugged 49mm aerospace-grade titanium case, precision dual-frequency GPS, 60-hour battery, and water resistance to 100m.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 20),
('VisionCurved 34" OLED Gaming Monitor', 'Electronics', 119999.00, 'Ultra-wide 240Hz 0.03ms response time Curved Gaming Monitor with HDR True Black 400 and NVIDIA G-Sync.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 10),
('MechKeys RGB Wireless Mechanical Keyboard', 'Electronics', 14999.00, 'Hot-swappable switches, CNC aluminum chassis, PBT keycaps, and tri-mode Bluetooth/2.4Ghz connectivity.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 50),
('ErgoPrecision Wireless Mouse', 'Electronics', 8999.00, 'Ergonomic vertical design, 8000 DPI sensor, quiet click switches, and multi-device fast pairing.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 60),
('StudioMic Pro XLR Condenser Microphone', 'Electronics', 22999.00, 'Broadcast-quality cardioid capsule for studio vocals, podcasts, and streaming. Includes metal shock mount.', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 18),
('TrueBass Wireless Earbuds Pro', 'Electronics', 18999.00, 'Spatial audio with head tracking, spatial ANC, wireless charging case, and IPX4 sweat resistance.', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 35),
('ZenCam 4K Mirrorless Cinema Camera', 'Electronics', 189999.00, 'Full-frame sensor, 4K 120fps recording, 5-axis IBIS, dual card slots, and cinematic color science.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', 8),
('PowerDrive 100W GaN Fast Charger', 'Electronics', 4999.00, 'Compact 4-port fast charger for laptops, phones, and tablets with intelligent power allocation.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', 100),
('StreamDeck 15-Key Controller', 'Electronics', 16999.00, 'Customizable LCD keys for streaming, content creation, macro shortcuts, and smart home automation.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 22),

-- Men's & Women's Fashion (12 Items)
('Urban Minimalist Leather Jacket', 'Fashion', 18999.00, '100% full-grain lambskin leather jacket with asymmetrical zip closure, quilted lining, and tailored fit.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', 30),
('Classic Cashmere Wool Overcoat', 'Fashion', 24999.00, 'Luxurious wool-cashmere blend overcoat featuring notch lapels, button cuff detail, and deep welt pockets.', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80', 15),
('AeroStep Premium Leather Sneakers', 'Fashion', 12999.00, 'Handcrafted Italian leather low-top sneakers with memory foam insoles and durable rubber cupsole.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 45),
('Nomad Canvas Backpack', 'Fashion', 7999.00, 'Water-resistant waxed canvas with genuine leather trim, padded 16" laptop sleeve, and brass hardware.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 50),
('Midnight Velvet Evening Gown', 'Fashion', 29999.00, 'Floor-length deep navy velvet gown featuring a sweetheart neckline, thigh-high slit, and subtle train.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', 12),
('Heritage Selvedge Denim Jeans', 'Fashion', 8999.00, '14oz Japanese shuttle loom selvedge denim with classic 5-pocket styling and custom copper rivets.', 'https://images.unsplash.com/photo-1542272604-780c36856d67?auto=format&fit=crop&w=800&q=80', 60),
('Solace Silk Button-Up Shirt', 'Fashion', 9999.00, 'Pure mulberry silk blouse with French seams, mother-of-pearl buttons, and relaxed drape.', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80', 25),
('Chronos Steel Chronograph Watch', 'Fashion', 34999.00, '316L stainless steel watch with Sapphire crystal lens, tachymeter bezel, and Japanese quartz movement.', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', 20),
('Nordic Heavy Knit Sweater', 'Fashion', 6999.00, '100% Merino wool chunky cable knit sweater offering superior warmth and breathability.', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80', 35),
('Vanguard Polarized Aviator Sunglasses', 'Fashion', 11999.00, 'Titanium frame aviators with TAC 100% UV400 anti-glare polarized lenses.', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', 40),
('Elegance Calfskin Crossbody Bag', 'Fashion', 21999.00, 'Structured calfskin leather bag with adjustable chain strap, magnetic flap closure, and suede interior.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 18),
('FlexFit Athletic Training Hoodie', 'Fashion', 4999.00, 'Moisture-wicking 4-way stretch blend hoodie featuring zippered kangaroo pocket and thumbhole cuffs.', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 75),

-- Home & Living (10 Items)
('Luxe Velvet Sectional Sofa', 'Home', 89999.00, 'Modular 4-piece velvet sofa with high-density foam cushions and kiln-dried hardwood frame.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', 5),
('AuraSmart HEPA Air Purifier', 'Home', 19999.00, 'Medical-grade H13 True HEPA filter capturing 99.97% of airborne particles with real-time PM2.5 display.', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80', 25),
('BaristaPro Espresso Machine', 'Home', 49999.00, '15-bar Italian pump espresso maker with integrated conical burr grinder and steam wand for latte art.', 'https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?auto=format&fit=crop&w=800&q=80', 14),
('Nordic Solid Oak Dining Table', 'Home', 64999.00, 'Hand-finished solid white oak dining table seating 6 to 8 people with natural matte varnish.', 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80', 8),
('Serene Bamboo Sheet Set (King)', 'Home', 8999.00, '100% Organic viscose from bamboo, 400 thread count, silk-like softness, cooling and hypoallergenic.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 40),
('Minimalist Ceramic Table Lamp', 'Home', 5999.00, 'Textured stoneware base paired with a linen drum shade, warm dimmable LED bulb included.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 30),
('Artisan Cast Iron Dutch Oven (5.5 Qt)', 'Home', 14999.00, 'Enameled cast iron pot with superior heat retention and self-basting lid. Oven safe up to 260°C.', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80', 20),
('RoboClean LiDAR Robot Vacuum & Mop', 'Home', 39999.00, '4000Pa suction with precision laser navigation, automatic dirt disposal dock, and app control.', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 12),
('Botanical Hand-Woven Wool Rug (8x10)', 'Home', 32999.00, 'Plush 100% New Zealand wool area rug featuring abstract organic patterns and fringe trim.', 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80', 7),
('HydroChef Precision Sous Vide Cooker', 'Home', 11999.00, '1100W Wi-Fi immersion circulator with digital touch display and ultra-quiet motor.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 22),

-- Books & Stationery (8 Items)
('The Design of Everyday Things', 'Books', 1499.00, 'Revised and expanded edition by Don Norman. Essential reading for designers and product thinkers.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 50),
('Atomic Habits Hardcover Edition', 'Books', 1299.00, 'An easy & proven way to build good habits & break bad ones by James Clear. Global bestseller.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', 80),
('Executive Leather Journal & Pen Set', 'Books', 3499.00, 'Refillable A5 Italian leather journal with 240 bleed-proof cream pages and brass fountain pen.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', 35),
('Deep Work: Rules for Focused Success', 'Books', 1199.00, 'Cal Newport shows how to cultivate intense focus in a distracted world to master hard information.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', 60),
('Artisanal Brass Fountain Pen', 'Books', 4999.00, 'Solid raw brass fountain pen with German iridium EF nib that ages with a unique patina.', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80', 28),
('Zero to One: Notes on Startups', 'Books', 999.00, 'Peter Thiel shows how we can find singular ways to create new things in a world of technology.', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80', 70),
('Minimalist Desk Calendar & Stand', 'Books', 1999.00, 'Solid walnut wooden base with 12 monthly textured cardstock calendar cards.', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80', 40),
('Creative Strategy & The Business of Design', 'Books', 2499.00, 'Douglas Davis guides designers to understand business framework to become strategic leaders.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80', 20),

-- Sports, Fitness & Outdoors (8 Items)
('UltraGrip Pro Yoga Mat (6mm)', 'Sports', 4999.00, 'Non-slip eco-friendly natural rubber yoga mat with alignment lines and carrying strap.', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80', 50),
('Adjustable Dial Dumbbell Set (24kg)', 'Sports', 24999.00, 'Rapid selection dial adjusts weights from 2.5kg to 24kg in 1kg increments. Saves space.', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', 15),
('AeroRide Carbon Fiber Road Bike', 'Sports', 189999.00, 'Ultra-lightweight carbon frame, Shimano 105 12-speed groupset, and hydraulic disc brakes.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80', 4),
('HydroShield Insulated Bottle (1L)', 'Sports', 2499.00, 'Triple-vacuum insulated stainless steel water bottle keeping drinks ice cold for 24 hours.', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80', 90),
('ProTrek 4-Person Waterproof Camping Tent', 'Sports', 16999.00, 'WeatherTec system with tub floors, continuous pole sleeves, and 5-minute setup.', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80', 16),
('Smart Pulse Rowing Machine', 'Sports', 59999.00, 'Magnetic resistance rower with 15" HD touch display, live interactive classes, and foldable frame.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', 6),
('RecoveryPulse Percussion Massage Gun', 'Sports', 12999.00, 'Quiet-force brushless motor delivering 16mm amplitude for deep muscle recovery with 6 heads.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 30),
('TrailBlazer Carbon Trekking Poles', 'Sports', 5999.00, '100% Carbon fiber collapsible hiking poles with cork grips and tungsten carbide tips.', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80', 25)

ON CONFLICT DO NOTHING;
