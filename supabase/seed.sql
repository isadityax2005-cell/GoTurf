-- ============================================================================
-- GoTurf: Realistic Mumbai Seed Data (Phase 1)
-- 3 Fictional Demo Turfs covering Cricket, Football, Tennis & Pickleball
-- ============================================================================

-- 1. Insert Mumbai Localities
INSERT INTO regions (id, locality, city, state)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Bandra West', 'Mumbai', 'Maharashtra'),
  ('10000000-0000-0000-0000-000000000002', 'Powai', 'Mumbai', 'Maharashtra'),
  ('10000000-0000-0000-0000-000000000003', 'Andheri East', 'Mumbai', 'Maharashtra'),
  ('10000000-0000-0000-0000-000000000004', 'Juhu', 'Mumbai', 'Maharashtra'),
  ('10000000-0000-0000-0000-000000000005', 'Borivali West', 'Mumbai', 'Maharashtra')
ON CONFLICT (locality, city, state) DO NOTHING;

-- 2. Insert Demo Profiles (Owners & Admin)
INSERT INTO profiles (id, role, name, phone, email)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'admin', 'Aditya Singh (Admin)', '+919876543210', 'admin@goturf.in'),
  ('20000000-0000-0000-0000-000000000002', 'owner', 'Rohan Mehta (Bandra Owner)', '+919820011223', 'rohan@bandraturf.demo'),
  ('20000000-0000-0000-0000-000000000003', 'owner', 'Vikram Desai (Powai Owner)', '+919820044556', 'vikram@powaisports.demo'),
  ('20000000-0000-0000-0000-000000000004', 'owner', 'Ananya Sharma (Andheri Owner)', '+919820077889', 'ananya@andherihub.demo'),
  ('20000000-0000-0000-0000-000000000005', 'player', 'Karan Verma (Player)', '+919811122334', 'karan@player.demo')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert 3 Fictional Demo Turfs
INSERT INTO turfs (id, owner_id, region_id, name, slug, address, lat, lng, maps_url, facilities, rules, cancellation_rule, status, is_demo)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Bandra Turf Arena [Demo]',
    'bandra-turf-arena-demo',
    'Carter Road Promenade, Bandra West, Mumbai 400050',
    19.0653,
    72.8258,
    'https://maps.google.com/?q=19.0653,72.8258',
    ARRAY['Floodlights', 'Free Parking', 'Changing Rooms', 'Drinking Water', 'Bibs & Match Balls'],
    'Flat turf shoes or studs recommended. No metal spikes. Reach 10 minutes prior.',
    'Full refund if cancelled up to 24 hours before the match. No refund after 24h window.',
    'approved',
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'Powai Smash & Volley Club [Demo]',
    'powai-smash-club-demo',
    'Hiranandani Gardens, Central Avenue, Powai, Mumbai 400076',
    19.1176,
    72.9060,
    'https://maps.google.com/?q=19.1176,72.9060',
    ARRAY['Floodlights', 'Cushioned Acrylic Flooring', 'Paddles on Rent', 'Locker Room', 'Sports Cafe'],
    'Non-marking court shoes compulsory. Paddle rental available at counter.',
    'Full refund up to 12 hours prior to slot. 50% refund between 4 to 12 hours.',
    'approved',
    true
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000003',
    'Andheri Multi-Sport Hub [Demo]',
    'andheri-multi-sport-hub-demo',
    'Chakala Metro Station Road, Andheri East, Mumbai 400093',
    19.1136,
    72.8697,
    'https://maps.google.com/?q=19.1136,72.8697',
    ARRAY['All-Weather Covered Shed', 'High-Beam LED Floodlights', 'Spectator Seating', 'Refreshments'],
    'Only rubber studs allowed. Smoking and alcohol strictly prohibited on premises.',
    'Full refund up to 24 hours before game.',
    'approved',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. Insert Courts for Each Turf
INSERT INTO courts (id, turf_id, name, sport, format, surface, slot_minutes, is_active)
VALUES
  -- Bandra Turf Arena Courts
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Court 1 - Box Cricket', 'cricket', 'Box Cricket (8v8)', 'Artificial Turf', 60, true),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Arena B - Football', 'football', '5-a-side Football', 'FIFA-grade 50mm Turf', 60, true),

  -- Powai Smash Club Courts
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'Court A - Pickleball', 'pickleball', 'Doubles / Singles', 'Cushioned Acrylic', 60, true),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Court 1 - Tennis', 'tennis', 'Regulation Tennis Court', 'Synthetic Hard Court', 60, true),

  -- Andheri Sports Hub Courts
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'Pitch 1 - Box Cricket', 'cricket', 'Box Cricket (7v7)', 'High-Density Turf', 60, true),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', 'Court 1 - Pickleball', 'pickleball', 'Doubles Regulation', 'Multi-Sport Polymeric', 60, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Opening Hours (Days 0 to 6 = All Week)
-- Bandra Courts: 06:00 to 23:00
INSERT INTO opening_hours (court_id, day_of_week, open_time, close_time)
SELECT c.id, d.day, '06:00'::TIME, '23:00'::TIME
FROM courts c
CROSS JOIN (SELECT generate_series(0, 6) AS day) d
WHERE c.turf_id = '30000000-0000-0000-0000-000000000001'
ON CONFLICT (court_id, day_of_week) DO NOTHING;

-- Powai Courts: 06:00 to 22:00
INSERT INTO opening_hours (court_id, day_of_week, open_time, close_time)
SELECT c.id, d.day, '06:00'::TIME, '22:00'::TIME
FROM courts c
CROSS JOIN (SELECT generate_series(0, 6) AS day) d
WHERE c.turf_id = '30000000-0000-0000-0000-000000000002'
ON CONFLICT (court_id, day_of_week) DO NOTHING;

-- Andheri Courts: 07:00 to 23:59
INSERT INTO opening_hours (court_id, day_of_week, open_time, close_time)
SELECT c.id, d.day, '07:00'::TIME, '23:59'::TIME
FROM courts c
CROSS JOIN (SELECT generate_series(0, 6) AS day) d
WHERE c.turf_id = '30000000-0000-0000-0000-000000000003'
ON CONFLICT (court_id, day_of_week) DO NOTHING;

-- 6. Insert Pricing Rules (in Integer Paise)
-- Bandra Cricket: Off-peak ₹1,200 (120000 paise), Peak ₹1,800 (180000 paise)
INSERT INTO price_rules (court_id, day_type, from_time, to_time, price_paise, is_peak)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'weekday', '06:00', '17:00', 120000, false),
  ('40000000-0000-0000-0000-000000000001', 'weekday', '17:00', '23:00', 180000, true),
  ('40000000-0000-0000-0000-000000000001', 'weekend', '06:00', '23:00', 180000, true),

  -- Bandra Football: Off-peak ₹1,400 (140000 paise), Peak ₹2,000 (200000 paise)
  ('40000000-0000-0000-0000-000000000002', 'weekday', '06:00', '17:00', 140000, false),
  ('40000000-0000-0000-0000-000000000002', 'weekday', '17:00', '23:00', 200000, true),
  ('40000000-0000-0000-0000-000000000002', 'weekend', '06:00', '23:00', 200000, true),

  -- Powai Pickleball: Off-peak ₹800 (80000 paise), Peak ₹1,200 (120000 paise)
  ('40000000-0000-0000-0000-000000000003', 'weekday', '06:00', '17:00', 80000, false),
  ('40000000-0000-0000-0000-000000000003', 'weekday', '17:00', '22:00', 120000, true),
  ('40000000-0000-0000-0000-000000000003', 'weekend', '06:00', '22:00', 120000, true),

  -- Powai Tennis: Off-peak ₹1,400 (140000 paise), Peak ₹2,200 (220000 paise)
  ('40000000-0000-0000-0000-000000000004', 'weekday', '06:00', '17:00', 140000, false),
  ('40000000-0000-0000-0000-000000000004', 'weekday', '17:00', '22:00', 220000, true),
  ('40000000-0000-0000-0000-000000000004', 'weekend', '06:00', '22:00', 220000, true),

  -- Andheri Cricket: Off-peak ₹1,000 (100000 paise), Peak ₹1,600 (160000 paise)
  ('40000000-0000-0000-0000-000000000005', 'weekday', '07:00', '17:00', 100000, false),
  ('40000000-0000-0000-0000-000000000005', 'weekday', '17:00', '23:59', 160000, true),
  ('40000000-0000-0000-0000-000000000005', 'weekend', '07:00', '23:59', 160000, true),

  -- Andheri Pickleball: Off-peak ₹700 (70000 paise), Peak ₹1,100 (110000 paise)
  ('40000000-0000-0000-0000-000000000006', 'weekday', '07:00', '17:00', 70000, false),
  ('40000000-0000-0000-0000-000000000006', 'weekday', '17:00', '23:59', 110000, true),
  ('40000000-0000-0000-0000-000000000006', 'weekend', '07:00', '23:59', 110000, true);
