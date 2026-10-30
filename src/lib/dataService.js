import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { mockDb } from './mockDb.js';

const CURRENT_USER_SESSION_KEY = 'buildstock_current_session';

/**
 * Unified Data Service for BuildStaok
 * Seamlessly interfaces with Supabase Postgres/Auth/Storage or local engine.
 */
export const dataService = {
  // ==========================================
  // AUTHENTICATION & PROFILES
  // ==========================================
  async getSession() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) return null;
      // Fetch profile
      const profile = await this.getUserProfile(data.session.user.id);
      return { session: data.session, user: data.session.user, profile };
    }

    // Local / Mock session
    try {
      const sess = localStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (!sess) return null;
      const parsed = JSON.parse(sess);
      // Fetch fresh profile
      const profiles = mockDb.get('profiles');
      const profile = profiles.find((p) => p.id === parsed.user.id) || {
        id: parsed.user.id,
        full_name: parsed.user.email.split('@')[0],
        role: 'admin',
      };
      return { session: parsed, user: parsed.user, profile };
    } catch {
      return null;
    }
  },

  async signUp(email, password, fullName) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      return data;
    }

    // Mock SignUp
    const users = mockDb.get('auth_users') || [];
    const profiles = mockDb.get('profiles') || [];

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const userId = crypto.randomUUID ? crypto.randomUUID() : 'u-' + Date.now();
    // Rule: First signup becomes admin, subsequent become staff
    const isFirstUser = profiles.length === 0;
    const role = isFirstUser ? 'admin' : 'staff';

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password: password, // local mock only
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    mockDb.set('auth_users', users);

    const newProfile = {
      id: userId,
      full_name: fullName || email.split('@')[0],
      role: role,
      created_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    mockDb.set('profiles', profiles);

    // Save session
    const session = {
      user: { id: userId, email: newUser.email, user_metadata: { full_name: newProfile.full_name } },
      profile: newProfile,
      token: 'mock-jwt-token-' + userId,
    };
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(session));

    return { user: session.user, session, profile: newProfile };
  },

  async signIn(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const profile = await this.getUserProfile(data.user.id);
      return { ...data, profile };
    }

    // Mock SignIn
    const users = mockDb.get('auth_users') || [];
    const profiles = mockDb.get('profiles') || [];

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      // If no users exist in mock DB yet, automatically register as admin
      if (users.length === 0) {
        return this.signUp(email, password, email.split('@')[0]);
      }
      throw new Error('Invalid email or password.');
    }

    const profile = profiles.find((p) => p.id === user.id) || {
      id: user.id,
      full_name: user.email.split('@')[0],
      role: 'staff',
    };

    const session = {
      user: { id: user.id, email: user.email, user_metadata: { full_name: profile.full_name } },
      profile,
      token: 'mock-jwt-token-' + user.id,
    };
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(session));

    return { user: session.user, session, profile };
  },

  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
  },

  async resetPassword(email) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
      return true;
    }
    // Mock simulation
    return true;
  },

  async getUserProfile(userId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data;
    }

    const profiles = mockDb.get('profiles') || [];
    return profiles.find((p) => p.id === userId) || null;
  },

  async updateProfile(userId, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const profiles = mockDb.get('profiles') || [];
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates };
      mockDb.set('profiles', profiles);

      // Update active session if it matches
      const sess = localStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed.user.id === userId) {
          parsed.profile = profiles[idx];
          localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(parsed));
        }
      }
      return profiles[idx];
    }
    return null;
  },

  async getUsers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return mockDb.get('profiles') || [];
  },

  async updateUserRole(userId, newRole) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const profiles = mockDb.get('profiles') || [];
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx !== -1) {
      const old = { ...profiles[idx] };
      profiles[idx].role = newRole;
      mockDb.set('profiles', profiles);
      mockDb.logAudit('profiles', 'UPDATE', userId, old, profiles[idx]);
      return profiles[idx];
    }
    throw new Error('User not found');
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
    const categories = mockDb.get('categories') || [];
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCategory(name, userId = null) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const categories = mockDb.get('categories') || [];
    const exists = categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      throw new Error('A category with this name already exists.');
    }
    const newCat = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now(),
      name: name.trim(),
      created_at: new Date().toISOString(),
    };
    categories.push(newCat);
    mockDb.set('categories', categories);
    mockDb.logAudit('categories', 'INSERT', newCat.id, null, newCat, userId);
    return newCat;
  },

  async updateCategory(id, name, userId = null) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const categories = mockDb.get('categories') || [];
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const old = { ...categories[idx] };
    categories[idx].name = name.trim();
    mockDb.set('categories', categories);
    mockDb.logAudit('categories', 'UPDATE', id, old, categories[idx], userId);
    return categories[idx];
  },

  async deleteCategory(id, userId = null) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const categories = mockDb.get('categories') || [];
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const old = categories[idx];
    categories.splice(idx, 1);
    mockDb.set('categories', categories);
    mockDb.logAudit('categories', 'DELETE', id, old, null, userId);
    return true;
  },

  // ==========================================
  // SUPPLIERS
  // ==========================================
  async getSuppliers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
    const suppliers = mockDb.get('suppliers') || [];
    return suppliers.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getSupplierById(id) {
    if (isSupabaseConfigured) {
      const { data: supplier, error: sErr } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      if (sErr) throw sErr;

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', id);

      const { data: movements } = await supabase
        .from('stock_movements')
        .select('*, product:products(name, sku)')
        .eq('supplier_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      return {
        ...supplier,
        products: products || [],
        recent_movements: (movements || []).map((m) => ({
          ...m,
          product_name: m.product?.name || 'Unknown',
        })),
      };
    }

    const suppliers = mockDb.get('suppliers') || [];
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) throw new Error('Supplier not found');

    const products = (mockDb.get('products') || []).filter((p) => p.supplier_id === id);
    const movements = (mockDb.get('stock_movements') || [])
      .filter((m) => m.supplier_id === id)
      .map((m) => {
        const prod = products.find((p) => p.id === m.product_id);
        return {
          ...m,
          product_name: prod ? prod.name : 'Unknown Product',
          product_sku: prod ? prod.sku : '-',
        };
      })
      .slice(0, 20);

    return {
      ...supplier,
      products,
      recent_movements: movements,
    };
  },

  async createSupplier(data, userId = null) {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase
        .from('suppliers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created;
    }

    const suppliers = mockDb.get('suppliers') || [];
    const newSup = {
      id: crypto.randomUUID ? crypto.randomUUID() : 's-' + Date.now(),
      ...data,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    suppliers.push(newSup);
    mockDb.set('suppliers', suppliers);
    mockDb.logAudit('suppliers', 'INSERT', newSup.id, null, newSup, userId);
    return newSup;
  },

  async updateSupplier(id, data, userId = null) {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }

    const suppliers = mockDb.get('suppliers') || [];
    const idx = suppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    const old = { ...suppliers[idx] };
    suppliers[idx] = { ...suppliers[idx], ...data };
    mockDb.set('suppliers', suppliers);
    mockDb.logAudit('suppliers', 'UPDATE', id, old, suppliers[idx], userId);
    return suppliers[idx];
  },

  async deleteSupplier(id, userId = null) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const suppliers = mockDb.get('suppliers') || [];
    const idx = suppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    const old = suppliers[idx];
    suppliers.splice(idx, 1);
    mockDb.set('suppliers', suppliers);
    mockDb.logAudit('suppliers', 'DELETE', id, old, null, userId);
    return true;
  },

  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('product_stock')
        .select('*')
        .order('name');
      if (error) {
        // Fallback to manual join if view isn't accessible
        const { data: prods, error: pErr } = await supabase.from('products').select('*');
        if (pErr) throw pErr;
        return prods || [];
      }
      return data || [];
    }

    return mockDb.getProductsWithStock();
  },

  async getProductById(id) {
    if (isSupabaseConfigured) {
      const { data: product, error: pErr } = await supabase
        .from('product_stock')
        .select('*')
        .eq('id', id)
        .single();
      if (pErr) throw pErr;

      const { data: movements, error: mErr } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      if (mErr) throw mErr;

      return {
        ...product,
        movements: movements || [],
      };
    }

    const all = mockDb.getProductsWithStock();
    const product = all.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');

    const movements = (mockDb.get('stock_movements') || [])
      .filter((m) => m.product_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      ...product,
      movements,
    };
  },

  async createProduct(data, userId = null) {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase
        .from('products')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created;
    }

    const products = mockDb.get('products') || [];
    const exists = products.some((p) => p.sku.toLowerCase() === data.sku.trim().toLowerCase());
    if (exists) {
      throw new Error(`A product with SKU "${data.sku}" already exists.`);
    }

    const newProd = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now(),
      ...data,
      sku: data.sku.trim().toUpperCase(),
      unit: data.unit || 'pcs',
      cost_price: Number(data.cost_price || 0),
      sell_price: Number(data.sell_price || 0),
      min_stock: Number(data.min_stock || 0),
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    products.push(newProd);
    mockDb.set('products', products);
    mockDb.logAudit('products', 'INSERT', newProd.id, null, newProd, userId);
    return newProd;
  },

  async updateProduct(id, data, userId = null) {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }

    const products = mockDb.get('products') || [];
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    // SKU uniqueness check if SKU changed
    if (data.sku && data.sku.trim().toUpperCase() !== products[idx].sku) {
      const exists = products.some(
        (p) => p.id !== id && p.sku.toLowerCase() === data.sku.trim().toLowerCase()
      );
      if (exists) {
        throw new Error(`SKU "${data.sku}" is already in use by another product.`);
      }
    }

    const old = { ...products[idx] };
    products[idx] = {
      ...products[idx],
      ...data,
      cost_price: data.cost_price !== undefined ? Number(data.cost_price) : products[idx].cost_price,
      sell_price: data.sell_price !== undefined ? Number(data.sell_price) : products[idx].sell_price,
      min_stock: data.min_stock !== undefined ? Number(data.min_stock) : products[idx].min_stock,
    };
    mockDb.set('products', products);
    mockDb.logAudit('products', 'UPDATE', id, old, products[idx], userId);
    return products[idx];
  },

  async deleteProduct(id, hard = false, userId = null) {
    if (isSupabaseConfigured) {
      if (hard) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return true;
      } else {
        const { error } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
        return true;
      }
    }

    const products = mockDb.get('products') || [];
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    if (hard) {
      const movements = (mockDb.get('stock_movements') || []).filter((m) => m.product_id === id);
      if (movements.length > 0) {
        throw new Error(
          'Cannot hard delete a product with existing stock movements. Soft-delete (deactivate) instead.'
        );
      }
      const old = products[idx];
      products.splice(idx, 1);
      mockDb.set('products', products);
      mockDb.logAudit('products', 'DELETE', id, old, null, userId);
      return true;
    } else {
      // Soft-delete
      const old = { ...products[idx] };
      products[idx].is_active = false;
      mockDb.set('products', products);
      mockDb.logAudit('products', 'UPDATE', id, old, products[idx], userId);
      return true;
    }
  },

  async bulkImportProducts(records, userId = null) {
    const categories = await this.getCategories();
    const suppliers = await this.getSuppliers();

    const catMap = Object.fromEntries(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const supMap = Object.fromEntries(suppliers.map((s) => [s.name.toLowerCase(), s.id]));

    const imported = [];
    for (const r of records) {
      const sku = String(r.SKU || r.sku || '').trim().toUpperCase();
      const name = String(r.Name || r.name || '').trim();
      if (!sku || !name) continue;

      const catName = String(r.Category || r.category || '').toLowerCase();
      const supName = String(r.Supplier || r.supplier || '').toLowerCase();

      const prodData = {
        sku,
        name,
        description: r.Description || r.description || '',
        category_id: catMap[catName] || null,
        supplier_id: supMap[supName] || null,
        unit: r.Unit || r.unit || 'pcs',
        cost_price: Number(r.CostPrice || r.cost_price || 0),
        sell_price: Number(r.SellPrice || r.sell_price || 0),
        min_stock: Number(r.MinStock || r.min_stock || 5),
        barcode: String(r.Barcode || r.barcode || ''),
        is_active: true,
      };

      try {
        const prod = await this.createProduct(prodData, userId);
        imported.push(prod);
      } catch {
        // If product SKU already exists, update it
        const prods = await this.getProducts();
        const existing = prods.find((p) => p.sku === sku);
        if (existing) {
          const updated = await this.updateProduct(existing.id, prodData, userId);
          imported.push(updated);
        }
      }
    }
    return imported;
  },

  // ==========================================
  // STOCK MOVEMENTS
  // ==========================================
  async getMovements(filters = {}) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name, sku, unit),
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false });

      if (filters.type && filters.type !== 'ALL') query = query.eq('type', filters.type);
      if (filters.productId) query = query.eq('product_id', filters.productId);
      if (filters.supplierId) query = query.eq('supplier_id', filters.supplierId);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate + 'T23:59:59');

      const { data, error } = await query;
      if (error) throw error;

      // Safely resolve user profile full names without failing on PostgREST relationship cache
      let profMap = {};
      const userIds = [...new Set((data || []).map((m) => m.created_by).filter(Boolean))];
      if (userIds.length > 0) {
        try {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);
          if (profs && profs.length > 0) {
            profMap = Object.fromEntries(profs.map((p) => [p.id, p.full_name]));
          }
        } catch {
          // Non-critical: gracefully fall back to 'System' / 'Admin' if profiles table RLS or cache restricts
        }
      }

      return (data || []).map((m) => ({
        ...m,
        product_name: m.product?.name || 'Unknown',
        product_sku: m.product?.sku || '-',
        product_unit: m.product?.unit || 'pcs',
        supplier_name: m.supplier?.name || '-',
        user_name: profMap[m.created_by] || 'System',
      }));
    }

    const movements = mockDb.get('stock_movements') || [];
    const products = mockDb.get('products') || [];
    const suppliers = mockDb.get('suppliers') || [];
    const profiles = mockDb.get('profiles') || [];

    const prodMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const supMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));
    const profMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));

    let results = movements.map((m) => {
      const prod = prodMap[m.product_id];
      return {
        ...m,
        product_name: prod ? prod.name : 'Unknown Product',
        product_sku: prod ? prod.sku : '-',
        product_unit: prod ? prod.unit : 'pcs',
        supplier_name: supMap[m.supplier_id] || '-',
        user_name: profMap[m.created_by] || 'Admin',
      };
    });

    if (filters.type && filters.type !== 'ALL') {
      results = results.filter((m) => m.type === filters.type);
    }
    if (filters.productId) {
      results = results.filter((m) => m.product_id === filters.productId);
    }
    if (filters.supplierId) {
      results = results.filter((m) => m.supplier_id === filters.supplierId);
    }
    if (filters.startDate) {
      results = results.filter((m) => new Date(m.created_at) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate + 'T23:59:59');
      results = results.filter((m) => new Date(m.created_at) <= end);
    }

    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createStockMovements(items, userId = null) {
    if (isSupabaseConfigured) {
      // Execute in Supabase; database trigger `prevent_negative_stock` will catch insufficient stock
      const formatted = items.map((i) => ({
        product_id: i.product_id,
        type: i.type,
        quantity: Number(i.quantity),
        unit_cost: i.unit_cost !== undefined ? Number(i.unit_cost) : null,
        supplier_id: i.supplier_id || null,
        reason: i.reason || null,
        reference: i.reference || null,
        note: i.note || null,
        created_by: userId,
        created_at: i.created_at || new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('stock_movements')
        .insert(formatted)
        .select();

      if (error) {
        // Extract server trigger message cleanly
        throw new Error(error.message || 'Failed to submit stock movements');
      }

      // Update cost prices if user ticked update_cost_price
      for (const item of items) {
        if (item.update_cost_price && item.unit_cost !== undefined && item.unit_cost > 0) {
          await supabase
            .from('products')
            .update({ cost_price: Number(item.unit_cost) })
            .eq('id', item.product_id);
        }
      }

      return data;
    }

    // High fidelity mock engine execution (with strict negative stock block)
    return mockDb.createStockMovements(items, userId);
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error) {
        return mockDb.get('settings') || INITIAL_SETTINGS;
      }
      return data;
    }

    return mockDb.get('settings') || INITIAL_SETTINGS;
  },

  async updateSettings(data, userId = null) {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('settings')
        .update(data)
        .eq('id', 1)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }

    const current = mockDb.get('settings') || INITIAL_SETTINGS;
    const updated = { ...current, ...data };
    mockDb.set('settings', updated);
    mockDb.logAudit('settings', 'UPDATE', '1', current, updated, userId);
    return updated;
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async getAuditLogs() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    }

    const logs = mockDb.get('audit_log') || [];
    return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // ==========================================
  // IMAGE STORAGE
  // ==========================================
  async uploadProductImage(file) {
    if (!file) return null;

    if (isSupabaseConfigured) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    }

    // Mock image storage: Read as Base64 Data URL so it previews and renders immediately
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // ==========================================
  // DASHBOARD & ANALYTICS COMPUTATIONS
  // ==========================================
  async getDashboardData() {
    const products = await this.getProducts();
    const movements = await this.getMovements();
    const categories = await this.getCategories();

    // 1. KPI calculations
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const totalProducts = products.length;

    for (const p of products) {
      const stock = Number(p.current_stock || 0);
      const minStock = Number(p.min_stock || 0);
      totalStockValue += stock * Number(p.cost_price || 0);

      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= minStock) {
        lowStockCount++;
      }
    }

    // Today's IN / OUT quantities
    const todayStr = new Date().toISOString().split('T')[0];
    let todayIn = 0;
    let todayOut = 0;

    for (const m of movements) {
      const mDate = m.created_at.split('T')[0];
      if (mDate === todayStr) {
        if (m.type === 'IN') todayIn += Number(m.quantity || 0);
        if (m.type === 'OUT') todayOut += Math.abs(Number(m.quantity || 0));
      }
    }

    // 2. Stock Movement Trends for last 30 days
    const daysMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      daysMap[dKey] = { date: label, rawDate: dKey, IN: 0, OUT: 0 };
    }

    for (const m of movements) {
      const mDate = m.created_at.split('T')[0];
      if (daysMap[mDate]) {
        if (m.type === 'IN') daysMap[mDate].IN += Number(m.quantity || 0);
        if (m.type === 'OUT') daysMap[mDate].OUT += Math.abs(Number(m.quantity || 0));
      }
    }
    const movementTrends = Object.values(daysMap);

    // 3. Stock Value by Category (for Donut Chart)
    const catValueMap = {};
    for (const c of categories) {
      catValueMap[c.name] = 0;
    }
    for (const p of products) {
      const cat = p.category_name || 'Uncategorized';
      catValueMap[cat] = (catValueMap[cat] || 0) + Number(p.stock_value || 0);
    }

    const categoryValuation = Object.entries(catValueMap)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);

    // 4. Top 5 Fast Moving Items (based on OUT movements)
    const outCountMap = {};
    for (const m of movements) {
      if (m.type === 'OUT') {
        const qty = Math.abs(Number(m.quantity || 0));
        outCountMap[m.product_id] = (outCountMap[m.product_id] || 0) + qty;
      }
    }

    const topMovers = Object.entries(outCountMap)
      .map(([prodId, totalOut]) => {
        const prod = products.find((p) => p.id === prodId);
        return {
          id: prodId,
          name: prod ? prod.name : 'Unknown',
          sku: prod ? prod.sku : '-',
          totalOut,
          unit: prod ? prod.unit : 'pcs',
        };
      })
      .sort((a, b) => b.totalOut - a.totalOut)
      .slice(0, 5);

    // 5. Low stock items table list
    const lowStockItems = products
      .filter((p) => Number(p.current_stock || 0) <= Number(p.min_stock || 0))
      .slice(0, 8);

    // 6. Recent 10 movements
    const recentMovements = movements.slice(0, 10);

    return {
      kpis: {
        totalProducts,
        totalStockValue,
        lowStockCount,
        outOfStockCount,
        todayIn,
        todayOut,
      },
      movementTrends,
      categoryValuation,
      topMovers,
      lowStockItems,
      recentMovements,
    };
  },
};
