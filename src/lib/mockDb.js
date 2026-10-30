/**
 * High-Fidelity Local Database Engine for BuildStaok
 * Provides full offline/local execution, triggers, audit logging,
 * auth simulation, and reactive state persistence matching Supabase schema.
 */

const STORAGE_KEY_PREFIX = 'buildstock_db_';

export const INITIAL_CATEGORIES = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Raw Materials', created_at: new Date('2026-01-01').toISOString() },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Building & Cement', created_at: new Date('2026-01-01').toISOString() },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Pipes & Fittings', created_at: new Date('2026-01-01').toISOString() },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Electrical & Wiring', created_at: new Date('2026-01-01').toISOString() },
  { id: 'c5555555-5555-5555-5555-555555555555', name: 'Hardware & Fasteners', created_at: new Date('2026-01-01').toISOString() },
  { id: 'c6666666-6666-6666-6666-666666666666', name: 'Paints & Finishes', created_at: new Date('2026-01-01').toISOString() }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Ultratech Mega Supplies',
    contact_person: 'Rajesh Sharma',
    phone: '+91 98201 23456',
    email: 'sales@ultratechsupplies.in',
    address: 'Plot 45, MIDC Industrial Area, Mumbai',
    gstin: '27AABCU9603R1ZM',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Apex Pipes & Sanitary Corp',
    contact_person: 'Priya Sundaram',
    phone: '+91 94440 98765',
    email: 'orders@apexpipe.com',
    address: '12 SIDCO Estate, Ambattur, Chennai',
    gstin: '33AABCA4582E1Z8',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    name: 'Havells Electric Hub',
    contact_person: 'Amit Verma',
    phone: '+91 98112 45678',
    email: 'b2b@havellshub.in',
    address: '88 Okhla Phase III, New Delhi',
    gstin: '07AABCH1294F1ZZ',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    name: 'Asian Paints & Hardware Depot',
    contact_person: 'Kavita Patel',
    phone: '+91 97250 11223',
    email: 'kavita@apdepot.in',
    address: 'GIDC Vatva Phase 4, Ahmedabad',
    gstin: '24AABCA7789K1ZQ',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString()
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'a0100000-0000-0000-0000-000000000001',
    sku: 'CEM-ULT-50K',
    name: 'Ultratech Super Cement (50kg)',
    description: 'Portland Pozzolana Cement bag 50kg premium grade',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'bags',
    cost_price: 380.00,
    sell_price: 430.00,
    min_stock: 40,
    barcode: '890123456701',
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'a0200000-0000-0000-0000-000000000002',
    sku: 'CEM-AMB-50K',
    name: 'Ambuja Kawach Cement (50kg)',
    description: 'Water repellent composite cement 50kg bag',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'bags',
    cost_price: 395.00,
    sell_price: 450.00,
    min_stock: 30,
    barcode: '890123456702',
    image_url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400',
    is_active: true,
    created_at: new Date('2026-01-02').toISOString()
  },
  {
    id: 'a0300000-0000-0000-0000-000000000003',
    sku: 'STL-TMT-12M',
    name: 'TMT Steel Rebar 12mm Fe-550D',
    description: 'High ductility corrosion resistant thermo-mechanically treated bar (12m)',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'pcs',
    cost_price: 720.00,
    sell_price: 830.00,
    min_stock: 50,
    barcode: '890123456703',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400',
    is_active: true,
    created_at: new Date('2026-01-02').toISOString()
  },
  {
    id: 'a0400000-0000-0000-0000-000000000004',
    sku: 'STL-TMT-16M',
    name: 'TMT Steel Rebar 16mm Fe-550D',
    description: 'Primary load bearing high strength rebar',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'pcs',
    cost_price: 1280.00,
    sell_price: 1450.00,
    min_stock: 30,
    barcode: '890123456704',
    image_url: 'https://images.unsplash.com/photo-1533230677271-e4905cf52eb7?w=400',
    is_active: true,
    created_at: new Date('2026-01-03').toISOString()
  },
  {
    id: 'a0500000-0000-0000-0000-000000000005',
    sku: 'PIP-CPVC-075',
    name: 'CPVC Pipe 3/4 inch SDR 11 (3m)',
    description: 'Hot and cold potable water plumbing pipe 3m',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    supplier_id: 'b2222222-2222-2222-2222-222222222222',
    unit: 'pcs',
    cost_price: 240.00,
    sell_price: 310.00,
    min_stock: 25,
    barcode: '890123456705',
    image_url: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=400',
    is_active: true,
    created_at: new Date('2026-01-03').toISOString()
  },
  {
    id: 'a0600000-0000-0000-0000-000000000006',
    sku: 'PIP-CPVC-100',
    name: 'CPVC Pipe 1 inch SDR 11 (3m)',
    description: 'Heavy pressure CPVC water pipe',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    supplier_id: 'b2222222-2222-2222-2222-222222222222',
    unit: 'pcs',
    cost_price: 360.00,
    sell_price: 460.00,
    min_stock: 20,
    barcode: '890123456706',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'a0700000-0000-0000-0000-000000000007',
    sku: 'PIP-UPVC-110',
    name: 'UPVC Drainage Pipe 110mm (3m)',
    description: 'Ring fit drainage and sewage pipe 110mm',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    supplier_id: 'b2222222-2222-2222-2222-222222222222',
    unit: 'pcs',
    cost_price: 490.00,
    sell_price: 620.00,
    min_stock: 15,
    barcode: '890123456707',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'a0800000-0000-0000-0000-000000000008',
    sku: 'FIT-CPVC-ELB',
    name: 'CPVC Elbow 90 Deg 3/4 inch',
    description: 'Heavy duty brass threaded pipe elbow joint',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    supplier_id: 'b2222222-2222-2222-2222-222222222222',
    unit: 'pcs',
    cost_price: 28.00,
    sell_price: 42.00,
    min_stock: 100,
    barcode: '890123456708',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'a0900000-0000-0000-0000-000000000009',
    sku: 'FIT-CPVC-TEE',
    name: 'CPVC Equal Tee 3/4 inch',
    description: 'Standard branch tee connector for CPVC',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    supplier_id: 'b2222222-2222-2222-2222-222222222222',
    unit: 'pcs',
    cost_price: 35.00,
    sell_price: 52.00,
    min_stock: 80,
    barcode: '890123456709',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'a1000000-0000-0000-0000-000000000010',
    sku: 'ELE-WIR-15M',
    name: 'Havells FR-LSH Wire 1.5 sq mm (90m)',
    description: 'Flame retardant copper conduit single core wire coil',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    supplier_id: 'b3333333-3333-3333-3333-333333333333',
    unit: 'coils',
    cost_price: 1450.00,
    sell_price: 1750.00,
    min_stock: 15,
    barcode: '890123456710',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    is_active: true,
    created_at: new Date('2026-01-06').toISOString()
  },
  {
    id: 'a1100000-0000-0000-0000-000000000011',
    sku: 'ELE-WIR-25M',
    name: 'Havells FR-LSH Wire 2.5 sq mm (90m)',
    description: 'High current power wiring coil 90m length',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    supplier_id: 'b3333333-3333-3333-3333-333333333333',
    unit: 'coils',
    cost_price: 2350.00,
    sell_price: 2790.00,
    min_stock: 12,
    barcode: '890123456711',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-06').toISOString()
  },
  {
    id: 'a1200000-0000-0000-0000-000000000012',
    sku: 'ELE-MCB-16A',
    name: 'Single Pole MCB 16A C-Curve',
    description: 'Miniature circuit breaker 10kA rupture capacity',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    supplier_id: 'b3333333-3333-3333-3333-333333333333',
    unit: 'pcs',
    cost_price: 165.00,
    sell_price: 220.00,
    min_stock: 30,
    barcode: '890123456712',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-07').toISOString()
  },
  {
    id: 'a1300000-0000-0000-0000-000000000013',
    sku: 'ELE-MCB-32A',
    name: 'Double Pole MCB 32A C-Curve',
    description: 'Main isolator circuit breaker DP 32 Amp',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    supplier_id: 'b3333333-3333-3333-3333-333333333333',
    unit: 'pcs',
    cost_price: 480.00,
    sell_price: 620.00,
    min_stock: 10,
    barcode: '890123456713',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-07').toISOString()
  },
  {
    id: 'a1400000-0000-0000-0000-000000000014',
    sku: 'ELE-SWT-06A',
    name: 'Modular 6A One-Way Switch (Pack of 10)',
    description: 'Polycarbonate fire-proof smooth click electrical switches',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    supplier_id: 'b3333333-3333-3333-3333-333333333333',
    unit: 'boxes',
    cost_price: 320.00,
    sell_price: 440.00,
    min_stock: 20,
    barcode: '890123456714',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'a1500000-0000-0000-0000-000000000015',
    sku: 'HDW-SCR-001',
    name: 'Drywall Screws 1.5 inch (Box of 500)',
    description: 'Black phosphate bugle head Phillips drywall fasteners',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    supplier_id: 'b4444444-4444-4444-4444-444444444444',
    unit: 'boxes',
    cost_price: 210.00,
    sell_price: 290.00,
    min_stock: 25,
    barcode: '890123456715',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'a1600000-0000-0000-0000-000000000016',
    sku: 'HDW-ANC-M08',
    name: 'Wedge Anchor Bolts M8 x 75mm (Pack of 50)',
    description: 'Zinc plated concrete heavy expansion anchor',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    supplier_id: 'b4444444-4444-4444-4444-444444444444',
    unit: 'boxes',
    cost_price: 340.00,
    sell_price: 460.00,
    min_stock: 15,
    barcode: '890123456716',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'a1700000-0000-0000-0000-000000000017',
    sku: 'HDW-HNG-SS4',
    name: 'SS-304 Butt Hinge 4x3x3mm (Pair)',
    description: 'Ball bearing stainless steel architectural door hinge',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    supplier_id: 'b4444444-4444-4444-4444-444444444444',
    unit: 'pairs',
    cost_price: 180.00,
    sell_price: 260.00,
    min_stock: 40,
    barcode: '890123456717',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'a1800000-0000-0000-0000-000000000018',
    sku: 'PNT-APX-WHT',
    name: 'Asian Paints Apex White Exterior (20L)',
    description: 'Exterior weather-proof emulsion drum 20 Litres',
    category_id: 'c6666666-6666-6666-6666-666666666666',
    supplier_id: 'b4444444-4444-4444-4444-444444444444',
    unit: 'buckets',
    cost_price: 4600.00,
    sell_price: 5450.00,
    min_stock: 8,
    barcode: '890123456718',
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    is_active: true,
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    id: 'a1900000-0000-0000-0000-000000000019',
    sku: 'PNT-ROY-IVY',
    name: 'Asian Paints Royale Luxury Interior (10L)',
    description: 'Teflon surface protector luxury finish Ivory',
    category_id: 'c6666666-6666-6666-6666-666666666666',
    supplier_id: 'b4444444-4444-4444-4444-444444444444',
    unit: 'buckets',
    cost_price: 3200.00,
    sell_price: 3850.00,
    min_stock: 10,
    barcode: '890123456719',
    image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    is_active: true,
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    id: 'a2000000-0000-0000-0000-000000000020',
    sku: 'PNT-PRM-20L',
    name: 'Wall Primer Water-Based Acrylic (20L)',
    description: 'Undercoat surface sealing white primer',
    category_id: 'c6666666-6666-6666-6666-666666666666',
    supplier_id: 'b4444444-4444-4444-4444-444444444444',
    unit: 'buckets',
    cost_price: 1700.00,
    sell_price: 2150.00,
    min_stock: 12,
    barcode: '890123456720',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-11').toISOString()
  },
  {
    id: 'a2100000-0000-0000-0000-000000000021',
    sku: 'PNT-WPT-40K',
    name: 'Birla White Wall Seal Putty (40kg)',
    description: 'White cement-based water resistant wall putty bag',
    category_id: 'c6666666-6666-6666-6666-666666666666',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'bags',
    cost_price: 780.00,
    sell_price: 920.00,
    min_stock: 25,
    barcode: '890123456721',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-11').toISOString()
  },
  {
    id: 'a2200000-0000-0000-0000-000000000022',
    sku: 'RAW-AGG-10M',
    name: 'Crushed Aggregate 10mm Stone (Ton)',
    description: 'Washed graded coarse aggregate for structural concrete',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'ton',
    cost_price: 850.00,
    sell_price: 1100.00,
    min_stock: 10,
    barcode: '890123456722',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-12').toISOString()
  },
  {
    id: 'a2300000-0000-0000-0000-000000000023',
    sku: 'RAW-SND-M20',
    name: 'M-Sand Manufactured River Sand (Ton)',
    description: 'Zone II graded manufactured plastering sand',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'ton',
    cost_price: 750.00,
    sell_price: 950.00,
    min_stock: 10,
    barcode: '890123456723',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-12').toISOString()
  },
  {
    id: 'a2400000-0000-0000-0000-000000000024',
    sku: 'BLD-RED-BRK',
    name: 'Standard Red Clay Kiln Bricks (1000 pcs)',
    description: 'First class red clay masonry building bricks',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'lots',
    cost_price: 6500.00,
    sell_price: 7800.00,
    min_stock: 5,
    barcode: '890123456724',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-13').toISOString()
  },
  {
    id: 'a2500000-0000-0000-0000-000000000025',
    sku: 'BLD-AAC-BLK',
    name: 'AAC Autoclaved Blocks 600x200x150mm (m3)',
    description: 'Lightweight thermal insulation masonry block cube',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    supplier_id: 'b1111111-1111-1111-1111-111111111111',
    unit: 'm3',
    cost_price: 2900.00,
    sell_price: 3450.00,
    min_stock: 4,
    barcode: '890123456725',
    image_url: null,
    is_active: true,
    created_at: new Date('2026-01-13').toISOString()
  }
];

export const INITIAL_MOVEMENTS = [
  { id: 'f0000000-0000-0000-0000-000000000001', product_id: 'a0100000-0000-0000-0000-000000000001', type: 'IN', quantity: 150, unit_cost: 380, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-001', note: 'Warehouse initial batch', created_at: new Date('2026-01-15T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000002', product_id: 'a0200000-0000-0000-0000-000000000002', type: 'IN', quantity: 18, unit_cost: 395, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-001', note: 'Low stock warning item (min is 30)', created_at: new Date('2026-01-15T11:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000003', product_id: 'a0300000-0000-0000-0000-000000000003', type: 'IN', quantity: 220, unit_cost: 720, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-002', note: 'Yard steel rebar consignment', created_at: new Date('2026-01-16T09:30:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000004', product_id: 'a0400000-0000-0000-0000-000000000004', type: 'IN', quantity: 95, unit_cost: 1280, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-002', note: '16mm rebar stock', created_at: new Date('2026-01-16T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000005', product_id: 'a0500000-0000-0000-0000-000000000005', type: 'IN', quantity: 80, unit_cost: 240, supplier_id: 'b2222222-2222-2222-2222-222222222222', reason: 'opening stock', reference: 'PO-INIT-003', note: 'CPVC plumbing lines', created_at: new Date('2026-01-17T14:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000006', product_id: 'a0600000-0000-0000-0000-000000000006', type: 'IN', quantity: 12, unit_cost: 360, supplier_id: 'b2222222-2222-2222-2222-222222222222', reason: 'opening stock', reference: 'PO-INIT-003', note: 'Low stock item (min is 20)', created_at: new Date('2026-01-17T15:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000007', product_id: 'a0700000-0000-0000-0000-000000000007', type: 'IN', quantity: 45, unit_cost: 490, supplier_id: 'b2222222-2222-2222-2222-222222222222', reason: 'opening stock', reference: 'PO-INIT-003', note: 'UPVC drainage pipes', created_at: new Date('2026-01-18T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000008', product_id: 'a0800000-0000-0000-0000-000000000008', type: 'IN', quantity: 350, unit_cost: 28, supplier_id: 'b2222222-2222-2222-2222-222222222222', reason: 'opening stock', reference: 'PO-INIT-004', note: 'Fittings stock', created_at: new Date('2026-01-18T11:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000009', product_id: 'a0900000-0000-0000-0000-000000000009', type: 'IN', quantity: 280, unit_cost: 35, supplier_id: 'b2222222-2222-2222-2222-222222222222', reason: 'opening stock', reference: 'PO-INIT-004', note: 'Tee connectors', created_at: new Date('2026-01-19T09:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000010', product_id: 'a1000000-0000-0000-0000-000000000010', type: 'IN', quantity: 40, unit_cost: 1450, supplier_id: 'b3333333-3333-3333-3333-333333333333', reason: 'opening stock', reference: 'PO-INIT-005', note: 'Electrical wire batch', created_at: new Date('2026-01-20T12:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000011', product_id: 'a1100000-0000-0000-0000-000000000011', type: 'IN', quantity: 35, unit_cost: 2350, supplier_id: 'b3333333-3333-3333-3333-333333333333', reason: 'opening stock', reference: 'PO-INIT-005', note: '2.5 sq mm copper wire', created_at: new Date('2026-01-20T13:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000012', product_id: 'a1200000-0000-0000-0000-000000000012', type: 'IN', quantity: 110, unit_cost: 165, supplier_id: 'b3333333-3333-3333-3333-333333333333', reason: 'opening stock', reference: 'PO-INIT-005', note: 'Circuit breakers', created_at: new Date('2026-01-21T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000013', product_id: 'a1300000-0000-0000-0000-000000000013', type: 'IN', quantity: 28, unit_cost: 480, supplier_id: 'b3333333-3333-3333-3333-333333333333', reason: 'opening stock', reference: 'PO-INIT-005', note: 'DP isolators', created_at: new Date('2026-01-21T11:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000014', product_id: 'a1400000-0000-0000-0000-000000000014', type: 'IN', quantity: 75, unit_cost: 320, supplier_id: 'b3333333-3333-3333-3333-333333333333', reason: 'opening stock', reference: 'PO-INIT-005', note: 'Modular switches box', created_at: new Date('2026-01-22T09:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000015', product_id: 'a1500000-0000-0000-0000-000000000015', type: 'IN', quantity: 60, unit_cost: 210, supplier_id: 'b4444444-4444-4444-4444-444444444444', reason: 'opening stock', reference: 'PO-INIT-006', note: 'Fasteners inventory', created_at: new Date('2026-01-22T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000016', product_id: 'a1600000-0000-0000-0000-000000000016', type: 'IN', quantity: 45, unit_cost: 340, supplier_id: 'b4444444-4444-4444-4444-444444444444', reason: 'opening stock', reference: 'PO-INIT-006', note: 'Anchor bolts', created_at: new Date('2026-01-23T14:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000017', product_id: 'a1700000-0000-0000-0000-000000000017', type: 'IN', quantity: 90, unit_cost: 180, supplier_id: 'b4444444-4444-4444-4444-444444444444', reason: 'opening stock', reference: 'PO-INIT-006', note: 'Stainless door hinges', created_at: new Date('2026-01-23T15:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000018', product_id: 'a1800000-0000-0000-0000-000000000018', type: 'IN', quantity: 25, unit_cost: 4600, supplier_id: 'b4444444-4444-4444-4444-444444444444', reason: 'opening stock', reference: 'PO-INIT-007', note: 'Exterior emulsion buckets', created_at: new Date('2026-01-24T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000019', product_id: 'a1900000-0000-0000-0000-000000000019', type: 'IN', quantity: 30, unit_cost: 3200, supplier_id: 'b4444444-4444-4444-4444-444444444444', reason: 'opening stock', reference: 'PO-INIT-007', note: 'Luxury interior paints', created_at: new Date('2026-01-24T11:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000020', product_id: 'a2000000-0000-0000-0000-000000000020', type: 'IN', quantity: 5, unit_cost: 1700, supplier_id: 'b4444444-4444-4444-4444-444444444444', reason: 'opening stock', reference: 'PO-INIT-007', note: 'Low stock item (min is 12)', created_at: new Date('2026-01-25T09:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000021', product_id: 'a2100000-0000-0000-0000-000000000021', type: 'IN', quantity: 80, unit_cost: 780, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-008', note: 'Wall putty bags', created_at: new Date('2026-01-25T10:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000022', product_id: 'a2200000-0000-0000-0000-000000000022', type: 'IN', quantity: 50, unit_cost: 850, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-008', note: 'Coarse aggregates', created_at: new Date('2026-01-26T14:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000023', product_id: 'a2300000-0000-0000-0000-000000000023', type: 'IN', quantity: 45, unit_cost: 750, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-008', note: 'Manufactured sand', created_at: new Date('2026-01-26T15:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000024', product_id: 'a2400000-0000-0000-0000-000000000024', type: 'IN', quantity: 15, unit_cost: 6500, supplier_id: 'b1111111-1111-1111-1111-111111111111', reason: 'opening stock', reference: 'PO-INIT-008', note: 'Clay bricks lots', created_at: new Date('2026-01-27T09:00:00').toISOString() },
  // Sample OUT movements
  { id: 'f0000000-0000-0000-0000-000000000025', product_id: 'a0100000-0000-0000-0000-000000000001', type: 'OUT', quantity: -25, unit_cost: 380, supplier_id: null, reason: 'sale', reference: 'INV-2026-001', note: 'Dispatch to site A', created_at: new Date('2026-01-28T11:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000026', product_id: 'a0300000-0000-0000-0000-000000000003', type: 'OUT', quantity: -40, unit_cost: 720, supplier_id: null, reason: 'sale', reference: 'INV-2026-002', note: 'Commercial contract order', created_at: new Date('2026-01-28T14:30:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000027', product_id: 'a1000000-0000-0000-0000-000000000010', type: 'OUT', quantity: -10, unit_cost: 1450, supplier_id: null, reason: 'sale', reference: 'INV-2026-003', note: 'Electric contractor billing', created_at: new Date('2026-01-29T16:00:00').toISOString() },
  { id: 'f0000000-0000-0000-0000-000000000028', product_id: 'a1800000-0000-0000-0000-000000000018', type: 'OUT', quantity: -5, unit_cost: 4600, supplier_id: null, reason: 'damage', reference: 'DMG-042', note: 'Container leak during rain transit', created_at: new Date('2026-01-29T17:00:00').toISOString() }
];

export const INITIAL_SETTINGS = {
  id: 1,
  company_name: 'BuildStaok Logistics Pvt Ltd',
  currency: 'INR',
  default_min_stock: 5
};

const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  if (!globalThis._mockStorage) {
    const store = {};
    globalThis._mockStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
  }
  return globalThis._mockStorage;
};

class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    const storage = getStorage();
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'categories')) {
      this.set('categories', INITIAL_CATEGORIES);
    }
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'suppliers')) {
      this.set('suppliers', INITIAL_SUPPLIERS);
    }
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'products')) {
      this.set('products', INITIAL_PRODUCTS);
    }
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'stock_movements')) {
      this.set('stock_movements', INITIAL_MOVEMENTS);
    }
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'settings')) {
      this.set('settings', INITIAL_SETTINGS);
    }
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'audit_log')) {
      this.set('audit_log', [
        {
          id: 'a01',
          table_name: 'settings',
          action: 'INSERT',
          row_id: '1',
          old_data: null,
          new_data: INITIAL_SETTINGS,
          created_at: new Date('2026-01-01').toISOString()
        }
      ]);
    }
    if (!storage.getItem(STORAGE_KEY_PREFIX + 'profiles')) {
      this.set('profiles', []);
    }
  }

  get(table) {
    try {
      const storage = getStorage();
      const data = storage.getItem(STORAGE_KEY_PREFIX + table);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  set(table, data) {
    const storage = getStorage();
    storage.setItem(STORAGE_KEY_PREFIX + table, JSON.stringify(data));
  }

  // Calculate live current stock for a product
  getCurrentStock(productId) {
    const movements = this.get('stock_movements');
    const total = movements
      .filter((m) => m.product_id === productId)
      .reduce((acc, m) => acc + Number(m.quantity || 0), 0);
    return total;
  }

  // Get full products list with live computed current_stock, category_name, and supplier_name
  getProductsWithStock() {
    const products = this.get('products');
    const categories = this.get('categories');
    const suppliers = this.get('suppliers');
    const movements = this.get('stock_movements');

    const stockMap = {};
    for (const m of movements) {
      stockMap[m.product_id] = (stockMap[m.product_id] || 0) + Number(m.quantity || 0);
    }

    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const supMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));

    return products.map((p) => {
      const currentStock = stockMap[p.id] !== undefined ? stockMap[p.id] : 0;
      return {
        ...p,
        category_name: catMap[p.category_id] || 'Uncategorized',
        supplier_name: supMap[p.supplier_id] || 'Direct / None',
        current_stock: currentStock,
        stock_value: currentStock * Number(p.cost_price || 0),
      };
    });
  }

  logAudit(tableName, action, rowId, oldData, newData, userId = null) {
    const logs = this.get('audit_log');
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      table_name: tableName,
      action: action,
      row_id: rowId,
      old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    logs.unshift(entry);
    this.set('audit_log', logs.slice(0, 500)); // retain last 500 logs
  }

  // Atomic stock submission with strict trigger simulation (prevent negative stock)
  createStockMovements(items, userId = null) {
    const movements = this.get('stock_movements');
    const products = this.get('products');

    // 1. Pre-validate stock for every item to avoid partial or invalid movements
    const tempStockMap = {};
    for (const m of movements) {
      tempStockMap[m.product_id] = (tempStockMap[m.product_id] || 0) + Number(m.quantity || 0);
    }

    for (const item of items) {
      const currentQty = tempStockMap[item.product_id] || 0;
      const change = Number(item.quantity);
      if (isNaN(change) || change === 0) {
        throw new Error(`Invalid quantity ${item.quantity}`);
      }
      if (currentQty + change < 0) {
        throw new Error(`Insufficient stock: only ${currentQty} available`);
      }
      tempStockMap[item.product_id] = currentQty + change;
    }

    // 2. Insert all movements
    const newMovements = items.map((item) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : 'mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      product_id: item.product_id,
      type: item.type, // 'IN' | 'OUT' | 'ADJUST'
      quantity: Number(item.quantity),
      unit_cost: item.unit_cost !== undefined ? Number(item.unit_cost) : null,
      supplier_id: item.supplier_id || null,
      reason: item.reason || null,
      reference: item.reference || null,
      note: item.note || null,
      created_by: userId,
      created_at: item.created_at || new Date().toISOString(),
    }));

    movements.unshift(...newMovements);
    this.set('stock_movements', movements);

    // 3. Update cost prices if requested
    for (const item of items) {
      if (item.update_cost_price && item.unit_cost !== undefined && item.unit_cost > 0) {
        const prodIndex = products.findIndex((p) => p.id === item.product_id);
        if (prodIndex !== -1) {
          const oldProd = { ...products[prodIndex] };
          products[prodIndex].cost_price = Number(item.unit_cost);
          this.logAudit('products', 'UPDATE', products[prodIndex].id, oldProd, products[prodIndex], userId);
        }
      }
    }
    this.set('products', products);

    return newMovements;
  }
}

export const mockDb = new MockDatabase();
