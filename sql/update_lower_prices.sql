-- ============================================================================
-- SQL SCRIPT: UPDATE EXISTING PRODUCTS TO LOWER ACCESSIBLE RATES
-- Run this in your Supabase SQL Editor to update prices of existing items.
-- ============================================================================

-- Electronics
UPDATE public.products SET price = 34999.00 WHERE name = 'EpicBook Pro 16 M3 Max';
UPDATE public.products SET price = 18999.00 WHERE name = 'UltraTab Pro 12.9 Inch';
UPDATE public.products SET price = 4999.00  WHERE name = 'AeroWatch Ultra Titanium';
UPDATE public.products SET price = 1299.00  WHERE name = 'ErgoPrecision Wireless Mouse';
UPDATE public.products SET price = 24999.00 WHERE name = 'ZenCam 4K Mirrorless Camera';
UPDATE public.products SET price = 999.00   WHERE name = 'PowerDrive 100W GaN Fast Charger';
UPDATE public.products SET price = 14999.00 WHERE name = 'VisionPad 11 OLED Tablet';
UPDATE public.products SET price = 2499.00  WHERE name = 'SmartHub Pro Home Gateway';
UPDATE public.products SET price = 6999.00  WHERE name = 'UltraSlim 4K USB-C Portable Monitor';
UPDATE public.products SET price = 12999.00 WHERE name = 'ProDrone 4K HDR Quadcopter';

-- Fitness
UPDATE public.products SET price = 799.00   WHERE name = 'UltraGrip Pro Yoga Mat (6mm)';
UPDATE public.products SET price = 3499.00  WHERE name = 'Adjustable Dial Dumbbell Set (24kg)';
UPDATE public.products SET price = 2199.00  WHERE name = 'RecoveryPulse Percussion Massage Gun';
UPDATE public.products SET price = 9999.00  WHERE name = 'Smart Pulse Rowing Machine';
UPDATE public.products SET price = 18999.00 WHERE name = 'AeroRide Carbon Fiber Road Bike';
UPDATE public.products SET price = 499.00   WHERE name = 'HydroShield Insulated Bottle (1L)';
UPDATE public.products SET price = 399.00   WHERE name = 'HeavyDuty Resistance Band Set';
UPDATE public.products SET price = 14999.00 WHERE name = 'FlexRunner Smart Treadmill';
UPDATE public.products SET price = 999.00   WHERE name = 'CoreSteel Kettlebell 16kg';
UPDATE public.products SET price = 299.00   WHERE name = 'SpeedRope Pro Ball-Bearing Jump Rope';

-- Audio
UPDATE public.products SET price = 2999.00  WHERE name = 'SoundPulse Noise Cancelling Headphones';
UPDATE public.products SET price = 1499.00  WHERE name = 'TrueBass Wireless Earbuds Pro';
UPDATE public.products SET price = 3499.00  WHERE name = 'StudioMic Pro XLR Condenser Microphone';
UPDATE public.products SET price = 1799.00  WHERE name = 'AeroBoom Waterproof Portable Speaker';
UPDATE public.products SET price = 5999.00  WHERE name = 'HiFi Desktop Reference Monitors (Pair)';
UPDATE public.products SET price = 3999.00  WHERE name = 'VinylGroove Bluetooth Turntable';
UPDATE public.products SET price = 6999.00  WHERE name = 'CinemaSound 5.1 Dolby Atmos Soundbar';
UPDATE public.products SET price = 1999.00  WHERE name = 'OpenAir Bone Conduction Sport Earphones';
UPDATE public.products SET price = 2499.00  WHERE name = 'PodcastPro USB Dynamic Microphone';
UPDATE public.products SET price = 3999.00  WHERE name = 'Audiophile DAC & Headphone Amplifier';

-- Gaming
UPDATE public.products SET price = 15999.00 WHERE name = 'VisionCurved 34" OLED Gaming Monitor';
UPDATE public.products SET price = 2499.00  WHERE name = 'MechKeys RGB Wireless Mechanical Keyboard';
UPDATE public.products SET price = 3499.00  WHERE name = 'StreamDeck 15-Key Controller';
UPDATE public.products SET price = 6999.00  WHERE name = 'TitanErgo Adjustable Gaming Chair';
UPDATE public.products SET price = 1499.00  WHERE name = 'AeroGlide Ultra Light Gaming Mouse (49g)';
UPDATE public.products SET price = 8999.00  WHERE name = 'VR Pulse Wireless Headset 128GB';
UPDATE public.products SET price = 1799.00  WHERE name = 'ProFight Wireless Controller for PC & Console';
UPDATE public.products SET price = 499.00   WHERE name = 'RGB Extended XXL Gaming Desk Pad';
UPDATE public.products SET price = 1999.00  WHERE name = '7.1 Surround Sound Gaming Headset';
UPDATE public.products SET price = 2999.00  WHERE name = 'CaptureCard 4K 60FPS Game Capture';
