-- BuildStaok Seed Data
-- 6 categories, 4 suppliers, 25 realistic products, opening stock IN movements
-- All UUIDs are strictly valid hexadecimal format [0-9a-f]

-- 1. Insert Categories
insert into public.categories (id, name) values
  ('c1111111-1111-1111-1111-111111111111', 'Raw Materials'),
  ('c2222222-2222-2222-2222-222222222222', 'Building & Cement'),
  ('c3333333-3333-3333-3333-333333333333', 'Pipes & Fittings'),
  ('c4444444-4444-4444-4444-444444444444', 'Electrical & Wiring'),
  ('c5555555-5555-5555-5555-555555555555', 'Hardware & Fasteners'),
  ('c6666666-6666-6666-6666-666666666666', 'Paints & Finishes')
on conflict (name) do update set name = excluded.name;

-- 2. Insert Suppliers (Valid UUIDs with hex prefix 'b')
insert into public.suppliers (id, name, contact_person, phone, email, address, gstin, is_active) values
  ('b1111111-1111-1111-1111-111111111111', 'Ultratech Mega Supplies', 'Rajesh Sharma', '+91 98201 23456', 'sales@ultratechsupplies.in', 'Plot 45, MIDC Industrial Area, Mumbai', '27AABCU9603R1ZM', true),
  ('b2222222-2222-2222-2222-222222222222', 'Apex Pipes & Sanitary Corp', 'Priya Sundaram', '+91 94440 98765', 'orders@apexpipe.com', '12 SIDCO Estate, Ambattur, Chennai', '33AABCA4582E1Z8', true),
  ('b3333333-3333-3333-3333-333333333333', 'Havells Electric Hub', 'Amit Verma', '+91 98112 45678', 'b2b@havellshub.in', '88 Okhla Phase III, New Delhi', '07AABCH1294F1ZZ', true),
  ('b4444444-4444-4444-4444-444444444444', 'Asian Paints & Hardware Depot', 'Kavita Patel', '+91 97250 11223', 'kavita@apdepot.in', 'GIDC Vatva Phase 4, Ahmedabad', '24AABCA7789K1ZQ', true)
on conflict (id) do update set name = excluded.name;

-- 3. Insert 25 Realistic Products (Valid UUIDs with hex prefix 'a')
insert into public.products (id, sku, name, description, category_id, supplier_id, unit, cost_price, sell_price, min_stock, barcode, image_url, is_active) values
  ('a0100000-0000-0000-0000-000000000001', 'CEM-ULT-50K', 'Ultratech Super Cement (50kg)', 'Portland Pozzolana Cement bag 50kg premium grade', 'c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'bags', 380.00, 430.00, 40, '890123456701', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', true),
  ('a0200000-0000-0000-0000-000000000002', 'CEM-AMB-50K', 'Ambuja Kawach Cement (50kg)', 'Water repellent composite cement 50kg bag', 'c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'bags', 395.00, 450.00, 30, '890123456702', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400', true),
  ('a0300000-0000-0000-0000-000000000003', 'STL-TMT-12M', 'TMT Steel Rebar 12mm Fe-550D', 'High ductility corrosion resistant thermo-mechanically treated bar (12m)', 'c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'pcs', 720.00, 830.00, 50, '890123456703', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400', true),
  ('a0400000-0000-0000-0000-000000000004', 'STL-TMT-16M', 'TMT Steel Rebar 16mm Fe-550D', 'Primary load bearing high strength rebar', 'c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'pcs', 1280.00, 1450.00, 30, '890123456704', 'https://images.unsplash.com/photo-1533230677271-e4905cf52eb7?w=400', true),
  ('a0500000-0000-0000-0000-000000000005', 'PIP-CPVC-075', 'CPVC Pipe 3/4 inch SDR 11 (3m)', 'Hot and cold potable water plumbing pipe 3m', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'pcs', 240.00, 310.00, 25, '890123456705', 'https://images.unsplash.com/photo-1542013936693-884638332954?w=400', true),
  ('a0600000-0000-0000-0000-000000000006', 'PIP-CPVC-100', 'CPVC Pipe 1 inch SDR 11 (3m)', 'Heavy pressure CPVC water pipe', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'pcs', 360.00, 460.00, 20, '890123456706', null, true),
  ('a0700000-0000-0000-0000-000000000007', 'PIP-UPVC-110', 'UPVC Drainage Pipe 110mm (3m)', 'Ring fit drainage and sewage pipe 110mm', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'pcs', 490.00, 620.00, 15, '890123456707', null, true),
  ('a0800000-0000-0000-0000-000000000008', 'FIT-CPVC-ELB', 'CPVC Elbow 90 Deg 3/4 inch', 'Heavy duty brass threaded pipe elbow joint', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'pcs', 28.00, 42.00, 100, '890123456708', null, true),
  ('a0900000-0000-0000-0000-000000000009', 'FIT-CPVC-TEE', 'CPVC Equal Tee 3/4 inch', 'Standard branch tee connector for CPVC', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'pcs', 35.00, 52.00, 80, '890123456709', null, true),
  ('a1000000-0000-0000-0000-000000000010', 'ELE-WIR-15M', 'Havells FR-LSH Wire 1.5 sq mm (90m)', 'Flame retardant copper conduit single core wire coil', 'c4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'coils', 1450.00, 1750.00, 15, '890123456710', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400', true),
  ('a1100000-0000-0000-0000-000000000011', 'ELE-WIR-25M', 'Havells FR-LSH Wire 2.5 sq mm (90m)', 'High current power wiring coil 90m length', 'c4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'coils', 2350.00, 2790.00, 12, '890123456711', null, true),
  ('a1200000-0000-0000-0000-000000000012', 'ELE-MCB-16A', 'Single Pole MCB 16A C-Curve', 'Miniature circuit breaker 10kA rupture capacity', 'c4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'pcs', 165.00, 220.00, 30, '890123456712', null, true),
  ('a1300000-0000-0000-0000-000000000013', 'ELE-MCB-32A', 'Double Pole MCB 32A C-Curve', 'Main isolator circuit breaker DP 32 Amp', 'c4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'pcs', 480.00, 620.00, 10, '890123456713', null, true),
  ('a1400000-0000-0000-0000-000000000014', 'ELE-SWT-06A', 'Modular 6A One-Way Switch (Pack of 10)', 'Polycarbonate fire-proof smooth click electrical switches', 'c4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'boxes', 320.00, 440.00, 20, '890123456714', null, true),
  ('a1500000-0000-0000-0000-000000000015', 'HDW-SCR-001', 'Drywall Screws 1.5 inch (Box of 500)', 'Black phosphate bugle head Phillips drywall fasteners', 'c5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', 'boxes', 210.00, 290.00, 25, '890123456715', null, true),
  ('a1600000-0000-0000-0000-000000000016', 'HDW-ANC-M08', 'Wedge Anchor Bolts M8 x 75mm (Pack of 50)', 'Zinc plated concrete heavy expansion anchor', 'c5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', 'boxes', 340.00, 460.00, 15, '890123456716', null, true),
  ('a1700000-0000-0000-0000-000000000017', 'HDW-HNG-SS4', 'SS-304 Butt Hinge 4x3x3mm (Pair)', 'Ball bearing stainless steel architectural door hinge', 'c5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', 'pairs', 180.00, 260.00, 40, '890123456717', null, true),
  ('a1800000-0000-0000-0000-000000000018', 'PNT-APX-WHT', 'Asian Paints Apex White Exterior (20L)', 'Exterior weather-proof emulsion drum 20 Litres', 'c6666666-6666-6666-6666-666666666666', 'b4444444-4444-4444-4444-444444444444', 'buckets', 4600.00, 5450.00, 8, '890123456718', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', true),
  ('a1900000-0000-0000-0000-000000000019', 'PNT-ROY-IVY', 'Asian Paints Royale Luxury Interior (10L)', 'Teflon surface protector luxury finish Ivory', 'c6666666-6666-6666-6666-666666666666', 'b4444444-4444-4444-4444-444444444444', 'buckets', 3200.00, 3850.00, 10, '890123456719', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', true),
  ('a2000000-0000-0000-0000-000000000020', 'PNT-PRM-20L', 'Wall Primer Water-Based Acrylic (20L)', 'Undercoat surface sealing white primer', 'c6666666-6666-6666-6666-666666666666', 'b4444444-4444-4444-4444-444444444444', 'buckets', 1700.00, 2150.00, 12, '890123456720', null, true),
  ('a2100000-0000-0000-0000-000000000021', 'PNT-WPT-40K', 'Birla White Wall Seal Putty (40kg)', 'White cement-based water resistant wall putty bag', 'c6666666-6666-6666-6666-666666666666', 'b1111111-1111-1111-1111-111111111111', 'bags', 780.00, 920.00, 25, '890123456721', null, true),
  ('a2200000-0000-0000-0000-000000000022', 'RAW-AGG-10M', 'Crushed Aggregate 10mm Stone (Ton)', 'Washed graded coarse aggregate for structural concrete', 'c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'ton', 850.00, 1100.00, 10, '890123456722', null, true),
  ('a2300000-0000-0000-0000-000000000023', 'RAW-SND-M20', 'M-Sand Manufactured River Sand (Ton)', 'Zone II graded manufactured plastering sand', 'c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'ton', 750.00, 950.00, 10, '890123456723', null, true),
  ('a2400000-0000-0000-0000-000000000024', 'BLD-RED-BRK', 'Standard Red Clay Kiln Bricks (1000 pcs)', 'First class red clay masonry building bricks', 'c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'lots', 6500.00, 7800.00, 5, '890123456724', null, true),
  ('a2500000-0000-0000-0000-000000000025', 'BLD-AAC-BLK', 'AAC Autoclaved Blocks 600x200x150mm (m3)', 'Lightweight thermal insulation masonry block cube', 'c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'm3', 2900.00, 3450.00, 4, '890123456725', null, true)
on conflict (sku) do update set name = excluded.name;

-- 4. Insert Initial Stock Movements (Opening Stock IN)
insert into public.stock_movements (product_id, type, quantity, unit_cost, supplier_id, reason, reference, note) values
  ('a0100000-0000-0000-0000-000000000001', 'IN', 150, 380.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-001', 'Warehouse initial batch'),
  ('a0200000-0000-0000-0000-000000000002', 'IN', 18, 395.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-001', 'Low stock warning test item (min is 30)'),
  ('a0300000-0000-0000-0000-000000000003', 'IN', 220, 720.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-002', 'Yard steel rebar consignment'),
  ('a0400000-0000-0000-0000-000000000004', 'IN', 95, 1280.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-002', '16mm rebar stock'),
  ('a0500000-0000-0000-0000-000000000005', 'IN', 80, 240.00, 'b2222222-2222-2222-2222-222222222222', 'opening stock', 'PO-INIT-003', 'CPVC plumbing lines'),
  ('a0600000-0000-0000-0000-000000000006', 'IN', 12, 360.00, 'b2222222-2222-2222-2222-222222222222', 'opening stock', 'PO-INIT-003', 'Low stock test item (min is 20)'),
  ('a0700000-0000-0000-0000-000000000007', 'IN', 45, 490.00, 'b2222222-2222-2222-2222-222222222222', 'opening stock', 'PO-INIT-003', 'UPVC drainage pipes'),
  ('a0800000-0000-0000-0000-000000000008', 'IN', 350, 28.00, 'b2222222-2222-2222-2222-222222222222', 'opening stock', 'PO-INIT-004', 'Fittings stock'),
  ('a0900000-0000-0000-0000-000000000009', 'IN', 280, 35.00, 'b2222222-2222-2222-2222-222222222222', 'opening stock', 'PO-INIT-004', 'Tee connectors'),
  ('a1000000-0000-0000-0000-000000000010', 'IN', 40, 1450.00, 'b3333333-3333-3333-3333-333333333333', 'opening stock', 'PO-INIT-005', 'Electrical wire batch'),
  ('a1100000-0000-0000-0000-000000000011', 'IN', 35, 2350.00, 'b3333333-3333-3333-3333-333333333333', 'opening stock', 'PO-INIT-005', '2.5 sq mm copper wire'),
  ('a1200000-0000-0000-0000-000000000012', 'IN', 110, 165.00, 'b3333333-3333-3333-3333-333333333333', 'opening stock', 'PO-INIT-005', 'Circuit breakers'),
  ('a1300000-0000-0000-0000-000000000013', 'IN', 28, 480.00, 'b3333333-3333-3333-3333-333333333333', 'opening stock', 'PO-INIT-005', 'DP isolators'),
  ('a1400000-0000-0000-0000-000000000014', 'IN', 75, 320.00, 'b3333333-3333-3333-3333-333333333333', 'opening stock', 'PO-INIT-005', 'Modular switches box'),
  ('a1500000-0000-0000-0000-000000000015', 'IN', 60, 210.00, 'b4444444-4444-4444-4444-444444444444', 'opening stock', 'PO-INIT-006', 'Fasteners inventory'),
  ('a1600000-0000-0000-0000-000000000016', 'IN', 45, 340.00, 'b4444444-4444-4444-4444-444444444444', 'opening stock', 'PO-INIT-006', 'Anchor bolts'),
  ('a1700000-0000-0000-0000-000000000017', 'IN', 90, 180.00, 'b4444444-4444-4444-4444-444444444444', 'opening stock', 'PO-INIT-006', 'Stainless door hinges'),
  ('a1800000-0000-0000-0000-000000000018', 'IN', 25, 4600.00, 'b4444444-4444-4444-4444-444444444444', 'opening stock', 'PO-INIT-007', 'Exterior emulsion buckets'),
  ('a1900000-0000-0000-0000-000000000019', 'IN', 30, 3200.00, 'b4444444-4444-4444-4444-444444444444', 'opening stock', 'PO-INIT-007', 'Luxury interior paints'),
  ('a2000000-0000-0000-0000-000000000020', 'IN', 5, 1700.00, 'b4444444-4444-4444-4444-444444444444', 'opening stock', 'PO-INIT-007', 'Low stock test item (min is 12)'),
  ('a2100000-0000-0000-0000-000000000021', 'IN', 80, 780.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-008', 'Wall putty bags'),
  ('a2200000-0000-0000-0000-000000000022', 'IN', 50, 850.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-008', 'Coarse aggregates'),
  ('a2300000-0000-0000-0000-000000000023', 'IN', 45, 750.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-008', 'Manufactured sand'),
  ('a2400000-0000-0000-0000-000000000024', 'IN', 15, 6500.00, 'b1111111-1111-1111-1111-111111111111', 'opening stock', 'PO-INIT-008', 'Clay bricks lots');

-- Sample OUT movements
insert into public.stock_movements (product_id, type, quantity, supplier_id, reason, reference, note) values
  ('a0100000-0000-0000-0000-000000000001', 'OUT', -25, null, 'sale', 'INV-2026-001', 'Dispatch to site A'),
  ('a0300000-0000-0000-0000-000000000003', 'OUT', -40, null, 'sale', 'INV-2026-002', 'Commercial contract order'),
  ('a1000000-0000-0000-0000-000000000010', 'OUT', -10, null, 'sale', 'INV-2026-003', 'Electric contractor billing'),
  ('a1800000-0000-0000-0000-000000000018', 'OUT', -5, null, 'damage', 'DMG-042', 'Container leak during rain transit');
