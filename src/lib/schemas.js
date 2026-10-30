import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Must be at least 6 characters').optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const productSchema = z.object({
  sku: z.string().min(2, 'SKU is required and must be unique'),
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional().default(''),
  category_id: z.string().uuid('Please select a category').nullable().optional(),
  supplier_id: z.string().uuid('Please select a supplier').nullable().optional(),
  unit: z.string().min(1, 'Unit of measurement is required').default('pcs'),
  cost_price: z.coerce.number().min(0, 'Cost price cannot be negative'),
  sell_price: z.coerce.number().min(0, 'Sell price cannot be negative'),
  min_stock: z.coerce.number().min(0, 'Minimum stock cannot be negative').default(5),
  barcode: z.string().optional().default(''),
  image_url: z.string().optional().nullable().default(null),
  is_active: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier company name is required'),
  contact_person: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional().default(''),
  gstin: z.string().optional().default(''),
  is_active: z.boolean().default(true),
});

export const stockInLineSchema = z.object({
  product_id: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit_cost: z.coerce.number().min(0, 'Cost cannot be negative').optional(),
  update_cost_price: z.boolean().default(false),
  note: z.string().optional().default(''),
});

export const stockInFormSchema = z.object({
  supplier_id: z.string().optional().nullable(),
  reference: z.string().min(1, 'Reference / PO / Bill number is required'),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  note: z.string().optional().default(''),
  lines: z.array(stockInLineSchema).min(1, 'At least one item is required'),
});

export const stockOutLineSchema = z.object({
  product_id: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  reason: z.enum(['sale', 'damage', 'return', 'internal use', 'other'], {
    errorMap: () => ({ message: 'Please select a reason' }),
  }),
  note: z.string().optional().default(''),
});

export const stockOutFormSchema = z.object({
  reference: z.string().min(1, 'Reference / Invoice / Slip number is required'),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  reason_default: z.enum(['sale', 'damage', 'return', 'internal use', 'other']).default('sale'),
  note: z.string().optional().default(''),
  lines: z.array(stockOutLineSchema).min(1, 'At least one item is required'),
});

export const stockAdjustmentSchema = z.object({
  product_id: z.string().min(1, 'Select a product'),
  counted_quantity: z.coerce.number().min(0, 'Counted quantity cannot be negative'),
  reason: z.string().min(2, 'Reason for adjustment is required (e.g. stocktake discrepancy, spoilage)'),
  note: z.string().optional().default(''),
});

export const settingsSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  currency: z.string().default('INR'),
  default_min_stock: z.coerce.number().min(0, 'Default minimum stock cannot be negative'),
});
