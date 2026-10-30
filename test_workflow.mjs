// Automated verification script for BuildStaok business logic and workflows
import { dataService } from './src/lib/dataService.js';
import { mockDb } from './src/lib/mockDb.js';
import { formatCurrency, getStockStatus } from './src/lib/utils.js';

// Polyfill localStorage & crypto for Node testing environment
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store = {};
  global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

async function runTests() {
  console.log('--- STARTING BUILDSTAOK VERIFICATION SUITE ---');

  // Test 1: First user signup -> becomes Admin
  console.log('\n[TEST 1] First User Signup (Admin assignment)');
  const adminAuth = await dataService.signUp('admin@buildstaok.com', 'password123', 'Master Admin');
  console.log('Admin user ID:', adminAuth.user.id);
  console.log('Assigned role:', adminAuth.profile.role);
  if (adminAuth.profile.role !== 'admin') {
    throw new Error('FAIL: First user must be admin, got ' + adminAuth.profile.role);
  }
  console.log('✓ PASS: First signup automatically became admin');

  // Test 2: Add Category
  console.log('\n[TEST 2] Add Category');
  const cat = await dataService.createCategory('Safety Gear & Helmets', adminAuth.user.id);
  console.log('Created Category:', cat.name, 'ID:', cat.id);
  const categories = await dataService.getCategories();
  const catFound = categories.some(c => c.name === 'Safety Gear & Helmets');
  if (!catFound) throw new Error('FAIL: Category not found');
  console.log('✓ PASS: Category created and retrieved');

  // Test 3: Add Supplier
  console.log('\n[TEST 3] Add Supplier');
  const sup = await dataService.createSupplier({
    name: 'National Safety Corp',
    contact_person: 'Vikas Mehra',
    phone: '+91 98765 43210',
    email: 'vikas@nationalsafety.in',
    gstin: '27AABCN1234F1Z5',
    address: 'Plot 101, Industrial Estate, Pune',
    is_active: true
  }, adminAuth.user.id);
  console.log('Created Supplier:', sup.name, 'ID:', sup.id);
  const suppliers = await dataService.getSuppliers();
  const supFound = suppliers.some(s => s.name === 'National Safety Corp');
  if (!supFound) throw new Error('FAIL: Supplier not found');
  console.log('✓ PASS: Supplier registered');

  // Test 4: Add Product
  console.log('\n[TEST 4] Add Product');
  const prod = await dataService.createProduct({
    sku: 'SAF-HLM-001',
    name: 'Heavy Duty Safety Helmet Yellow',
    description: 'Industrial safety helmet with suspension harness',
    category_id: cat.id,
    supplier_id: sup.id,
    unit: 'pcs',
    cost_price: 250.00,
    sell_price: 350.00,
    min_stock: 15,
    barcode: '890123456799',
    image_url: 'https://images.unsplash.com/photo-1578873375969-d65239e23075?w=400',
    is_active: true
  }, adminAuth.user.id);
  console.log('Created Product:', prod.name, 'SKU:', prod.sku, 'ID:', prod.id);

  let initialProduct = await dataService.getProductById(prod.id);
  console.log('Initial Stock:', initialProduct.current_stock);
  if (initialProduct.current_stock !== 0) throw new Error('FAIL: Initial stock must be 0');
  console.log('✓ PASS: Product created with 0 initial stock');

  // Test 5: Stock In 50 units
  console.log('\n[TEST 5] Stock In 50 Units');
  await dataService.createStockMovements([{
    product_id: prod.id,
    type: 'IN',
    quantity: 50,
    unit_cost: 250.00,
    supplier_id: sup.id,
    reason: 'purchase / received',
    reference: 'PO-TEST-001',
    note: 'Initial batch delivery',
    created_at: new Date().toISOString()
  }], adminAuth.user.id);

  let updatedProduct = await dataService.getProductById(prod.id);
  console.log('Stock after receiving 50 units:', updatedProduct.current_stock);
  if (updatedProduct.current_stock !== 50) {
    throw new Error('FAIL: Expected stock 50, got ' + updatedProduct.current_stock);
  }
  console.log('✓ PASS: Stock successfully increased to 50');

  // Test 6: Stock Out 10 units
  console.log('\n[TEST 6] Stock Out 10 Units');
  await dataService.createStockMovements([{
    product_id: prod.id,
    type: 'OUT',
    quantity: -10,
    reason: 'sale',
    reference: 'INV-DISP-001',
    note: 'Dispatched to Site Alpha',
    created_at: new Date().toISOString()
  }], adminAuth.user.id);

  updatedProduct = await dataService.getProductById(prod.id);
  console.log('Stock after dispatching 10 units:', updatedProduct.current_stock);
  if (updatedProduct.current_stock !== 40) {
    throw new Error('FAIL: Expected stock 40, got ' + updatedProduct.current_stock);
  }
  console.log('✓ PASS: Stock successfully reduced to 40');

  // Test 7: Block Overdraw (Try to Stock Out 100 units when only 40 available)
  console.log('\n[TEST 7] Negative Stock Protection (Try Stock Out 100 with only 40 in stock)');
  let overdrawBlocked = false;
  try {
    await dataService.createStockMovements([{
      product_id: prod.id,
      type: 'OUT',
      quantity: -100,
      reason: 'sale',
      reference: 'INV-OVERDRAW-002',
      note: 'Excess dispatch',
      created_at: new Date().toISOString()
    }], adminAuth.user.id);
  } catch (err) {
    overdrawBlocked = true;
    console.log('Captured expected block error:', err.message);
    if (!err.message.includes('Insufficient stock: only 40 available')) {
      throw new Error('FAIL: Error message did not mention available quantity');
    }
  }
  if (!overdrawBlocked) {
    throw new Error('FAIL: Overdraw was NOT blocked!');
  }
  console.log('✓ PASS: Overdraw strictly blocked with clear message');

  // Test 8: Low Stock Alert Trigger
  console.log('\n[TEST 8] Low Stock Alert Trigger');
  // Dispatch 30 units (now 10 units remain, which is < min_stock 15)
  await dataService.createStockMovements([{
    product_id: prod.id,
    type: 'OUT',
    quantity: -30,
    reason: 'sale',
    reference: 'INV-LOW-003',
    created_at: new Date().toISOString()
  }], adminAuth.user.id);

  updatedProduct = await dataService.getProductById(prod.id);
  console.log('Stock now:', updatedProduct.current_stock, 'Min Threshold:', updatedProduct.min_stock);
  const stockStatus = getStockStatus(updatedProduct.current_stock, updatedProduct.min_stock);
  console.log('Status badge:', stockStatus.status, 'Label:', stockStatus.label);
  if (stockStatus.status !== 'low') {
    throw new Error('FAIL: Status should be "low", got ' + stockStatus.status);
  }

  const dashboard = await dataService.getDashboardData();
  console.log('Dashboard low stock count:', dashboard.kpis.lowStockCount);
  const foundInLowStock = dashboard.lowStockItems.some(i => i.id === prod.id);
  if (!foundInLowStock) {
    throw new Error('FAIL: Product not listed in low stock items table');
  }
  console.log('✓ PASS: Low-stock status correctly triggered on dashboard');

  // Test 9: Subsequent signup becomes Staff
  console.log('\n[TEST 9] Second User Signup (Staff Role)');
  const staffAuth = await dataService.signUp('staff@buildstaok.com', 'password123', 'Warehouse Staff');
  console.log('Second user role:', staffAuth.profile.role);
  if (staffAuth.profile.role !== 'staff') {
    throw new Error('FAIL: Expected staff role, got ' + staffAuth.profile.role);
  }
  console.log('✓ PASS: Second user successfully registered as Staff');

  // Test 10: Audit Log entry verification
  console.log('\n[TEST 10] Audit Log Trail');
  const auditLogs = await dataService.getAuditLogs();
  console.log('Total audit entries recorded:', auditLogs.length);
  const prodLog = auditLogs.find(a => a.table_name === 'products' && a.action === 'INSERT');
  if (!prodLog) throw new Error('FAIL: Audit log missing for product creation');
  console.log('✓ PASS: Audit logging actively tracking database events');

  console.log('\n======================================================');
  console.log('ALL 10 END-TO-END WORKFLOW VERIFICATIONS PASSED 100%!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
