-- ============================================================================
-- ADD LAPTOPS, GRAPHICS CARDS (GPUs), AND PLAYSTATION CONSOLES
-- Real-world Indian market prices & high-resolution studio assets
-- ============================================================================

INSERT INTO public.products (name, category, price, description, image_url, stock) VALUES

-- Premium Laptops (Electronics & Gaming)
('Apple MacBook Pro 16" (M3 Max)', 'Electronics', 349900.00, '16.2" Liquid Retina XDR display, M3 Max 16-core CPU, 40-core GPU, 36GB Unified RAM, 1TB SSD.', '/products/macbook_pro.jpg', 8),
('ASUS ROG Strix SCAR 18 (RTX 4090)', 'Gaming', 359990.00, '18" 2.5K QHD+ 240Hz Nebula HDR display, Intel Core i9-14900HX, RTX 4090 16GB, 32GB DDR5.', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=75&fm=webp', 6),
('Razer Blade 16 Dual-Mode Mini-LED', 'Gaming', 289990.00, 'World''s first dual-mode Mini-LED display (4K 120Hz / FHD+ 240Hz), RTX 4080, anodized aluminum chassis.', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=75&fm=webp', 5),
('Lenovo Legion Pro 7i (RTX 4080)', 'Gaming', 249990.00, '16" WQXGA 240Hz PureSight Gaming display, Intel Core i9-14900HX, RTX 4080 12GB, 32GB DDR5, Legion Coldfront 5.0.', '/products/lenovo_legion.jpg', 8),
('Dell XPS 15 OLED InfinityEdge', 'Electronics', 189990.00, '3.5K OLED Touch display, Intel Core i7-13700H, NVIDIA RTX 4060, 32GB RAM, CNC machined aluminum.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=75&fm=webp', 12),
('Lenovo ThinkPad X1 Carbon Gen 12', 'Electronics', 169990.00, 'Ultralight carbon-fiber business laptop, Intel Core Ultra 7 with AI Boost NPU, 32GB LPDDR5X.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=75&fm=webp', 15),
('HP OMEN 16 Gaming Laptop (RTX 4070)', 'Gaming', 144990.00, '16.1" QHD 240Hz IPS display, Intel Core i7-14700HX, RTX 4070 8GB, 16GB DDR5, OMEN Tempest Cooling.', '/products/hp_omen.jpg', 10),
('HP Victus 15 Gaming Laptop (RTX 4050)', 'Gaming', 74990.00, '15.6" FHD 144Hz display, AMD Ryzen 5 7535HS, NVIDIA GeForce RTX 4050 6GB, 16GB DDR5, B&O Audio.', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=75&fm=webp', 20),
('Lenovo LOQ 15 Gaming Laptop (RTX 3050)', 'Gaming', 64990.00, '15.6" FHD 144Hz G-SYNC display, Intel Core i5-12450HX, NVIDIA RTX 3050 6GB, 16GB DDR5, Nahimic Audio.', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=75&fm=webp', 25),
('Lenovo IdeaPad Slim 5 OLED', 'Electronics', 69990.00, '14" 2.8K OLED 100% DCI-P3 display, Intel Core Ultra 5 125H, 16GB LPDDR5X, 512GB NVMe SSD, all-metal chassis.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=75&fm=webp', 22),

-- Graphics Cards / GPUs (Gaming)
('ASUS ROG Matrix GeForce RTX 4090 Platinum', 'Gaming', 249999.00, 'Liquid metal thermal compound, integrated 360mm all-in-one liquid cooler, magnetic daisy-chain fans.', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=75&fm=webp', 4),
('NVIDIA GeForce RTX 4090 Founders Edition (24GB)', 'Gaming', 169999.00, 'Ada Lovelace architecture, 24GB GDDR6X, DLSS 3.5 Frame Generation, 3rd Gen RT Cores.', '/products/rtx_4090.jpg', 6),
('NVIDIA GeForce RTX 4080 Super (16GB GDDR6X)', 'Gaming', 99999.00, '10,240 CUDA cores, 16GB ultra-fast GDDR6X memory, full ray tracing & DLSS 3.5 support.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=75&fm=webp', 12),
('AMD Radeon RX 7900 XTX (24GB)', 'Gaming', 94999.00, 'RDNA 3 chiplet architecture, 24GB GDDR6, DisplayPort 2.1, AMD HYPR-RX with FSR 3.1.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=75&fm=webp', 10),
('NVIDIA GeForce RTX 5070 Next-Gen Blackwell (12GB GDDR7)', 'Gaming', 64999.00, 'Blackwell GPU core, 12GB 28Gbps GDDR7, full path tracing acceleration, dual-flow cooling design.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=75&fm=webp', 15),
('NVIDIA GeForce RTX 5060 Next-Gen Blackwell (12GB GDDR7)', 'Gaming', 42999.00, 'Blackwell architecture, 12GB high-speed GDDR7, 4th-Gen Tensor Cores, DLSS 4 Multi-Frame AI Generation.', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=75&fm=webp', 18),
('NVIDIA GeForce RTX 5050 Next-Gen Blackwell (8GB GDDR7)', 'Gaming', 32999.00, 'Next-Gen NVIDIA Blackwell architecture, 8GB ultra-fast GDDR7 memory, DLSS 4 AI Neural Rendering, PCIe 5.0.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=75&fm=webp', 20),
('NVIDIA GeForce RTX 4060 Dual OC (8GB GDDR6)', 'Gaming', 29999.00, '3072 CUDA cores, 8GB GDDR6, DLSS 3.5 AI upscaling, 3rd-Gen Ray Tracing, Axial-tech fans.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=75&fm=webp', 25),
('NVIDIA GeForce RTX 3060 Gaming OC (12GB GDDR6)', 'Gaming', 25999.00, '3584 CUDA cores, massive 12GB GDDR6 VRAM for high-res gaming and AI generation, WINDFORCE 3X cooling system.', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=75&fm=webp', 30),
('NVIDIA GeForce RTX 4050 Stealth Edition (6GB GDDR6)', 'Gaming', 24999.00, 'Ada Lovelace architecture, 6GB GDDR6, DLSS 3 Frame Generation, AV1 encoding, low-power efficiency.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=75&fm=webp', 28),
('NVIDIA GeForce RTX 3050 Twin Edge (8GB GDDR6)', 'Gaming', 18499.00, '2560 CUDA cores, 8GB GDDR6, Ray Tracing Cores, Tensor Cores, DLSS 2 support, dual-fan cooling.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=75&fm=webp', 35),

-- PlayStation Consoles & Gear (Gaming)
('Sony PlayStation 5 Pro Console (2TB SSD)', 'Gaming', 69990.00, 'PlayStation Spectral Super Resolution (PSSR), advanced ray tracing, 60fps 4K fidelity mode, 2TB SSD.', '/products/ps5_pro.jpg', 12),
('Sony PlayStation VR2 Sense Headset Bundle', 'Gaming', 54990.00, '4K HDR OLED displays (2000x2040 per eye), 120Hz refresh, headset feedback, eye tracking, PS VR2 Sense controllers.', '/products/ps_vr2.jpg', 10),
('Sony PlayStation 5 Slim Digital Edition (1TB)', 'Gaming', 44990.00, 'Slim form factor, 1TB high-speed NVMe SSD, 3D AudioTech, ultra-fast loading times.', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=75&fm=webp', 20),
('PlayStation Portal Remote Player', 'Gaming', 18990.00, '8-inch Full HD 1080p 60fps LCD screen with DualSense haptic feedback and adaptive triggers over Wi-Fi.', 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=75&fm=webp', 22),
('DualSense Edge Wireless Controller for PS5', 'Gaming', 17990.00, 'Changeable stick caps, swappable stick modules, remappable rear buttons, and adjustable trigger stops.', '/products/dualsense_edge.jpg', 30)

ON CONFLICT DO NOTHING;
