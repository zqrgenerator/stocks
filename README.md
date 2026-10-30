# BuildStaok - Production-Grade Stock Inventory Management System

BuildStaok is a modern, full-featured stock and inventory management system designed for logistics, construction suppliers, hardware merchants, and enterprise distributors. It features immutable ledger tracking, live stock status indicators, multi-line intake/dispatch workflows, strict negative-stock prevention, barcode scanning, analytics charts, and automated Excel/PDF report generation.

---

## 🌟 Key Features

1. **Dashboard & Executive Analytics**:
   - Real-time KPI cards: Total Products, Stock Valuation (₹ en-IN formatting), Low-Stock count, Out-of-Stock count, and Today's In/Out units.
   - 30-day stock movement curves (Area chart), Stock Value distribution by Category (Donut chart), and Top 5 fast-moving items.
   - Actionable low-stock alerts with one-click **"Restock"** action.

2. **Catalog & Product Management (`/products`)**:
   - High-density data grid with image thumbnails, SKU, category, supplier, stock badges, cost/sell prices, and asset values.
   - Slide-over drawer for Add/Edit with photo upload, auto-SKU generator (`CAT-PRD-123`), and quick category creation.
   - Camera barcode scanner via `html5-qrcode` to look up or assign barcodes.
   - Multi-format bulk import (Excel/CSV) with downloadable template and row preview validation.
   - Soft-delete (archive) by default; guarded hard-delete for admin if no ledger movements exist.

3. **Multi-Line Inbound Intake (`/stock-in`)**:
   - Receive supplier consignments with reference/PO numbers, bill dates, unit costs, and notes.
   - Atomic multi-line submission: add multiple products in one batch.
   - Optional automatic updating of the product's master cost price with the latest unit cost.

4. **Guarded Multi-Line Dispatch (`/stock-out`)**:
   - Stock dispatch with reason classification (Sale, Damage, Return to Supplier, Internal Use, Other).
   - **Live available stock enforcement**: Blocks quantities above currently available stock both client-side and via database triggers.

5. **Stocktake Reconciliation (`/adjustments`)** *(Admin & Manager)*:
   - Physical count audit mode: enter verified physical counts against system records.
   - Automatically computes signed discrepancy differences and creates audited `ADJUST` ledger movements.

6. **Movement Ledger (`/movements`)**:
   - Complete immutable ledger of all `IN`, `OUT`, and `ADJUST` events.
   - Filter by date range, type, product, supplier, and search term.
   - Instant export to Excel (`.xlsx`) and PDF.

7. **Suppliers & Categories (`/suppliers`, `/categories`)**:
   - Full CRUD management with phone, email, address, and GSTIN records.
   - Dedicated Supplier Detail page (`/suppliers/:id`) showing supplied products and recent delivery consignments.

8. **Enterprise Reports (`/reports`)**:
   - 6 specialized reports:
     1. Current Stock Report
     2. Stock Valuation by Category
     3. Low Stock & Reorder Report (with suggested replenishment quantity and estimated cost)
     4. Stock Movement Report (with date range filters)
     5. Fast vs Slow Movers (30/60/90 days velocity classification)
     6. Supplier Purchase & Spend Report
   - Export to clean Excel spreadsheets and branded PDF documents with company header and page numbering.

9. **Security, Roles & Audit Trail**:
   - Role-Based Access Control (RBAC): **Admin**, **Manager**, **Staff**.
   - Admin manages user roles and system settings (`company_name`, `currency`, `default_min_stock`).
   - Audit Log (`/audit-log`): Records `INSERT`, `UPDATE`, and `DELETE` mutations with a side-by-side JSON diff viewer.
   - Global Command Palette (`Ctrl + K`) to search any page, product, or action.
   - Light and Dark mode with persistent theme preference.
   - PWA manifest for desktop and mobile installability.

---

## 🛠️ Tech Stack

- **Frontend**: Vite + React 18 + JavaScript (JSX), React Router v6
- **Styling**: Tailwind CSS v3, Lucide React icons, Inter typography
- **Database / Backend**: Supabase (PostgreSQL, Auth, Storage, RLS) + High-Fidelity Local Engine
- **Data Management**: TanStack Query v5 (React Query), TanStack Table
- **Forms & Validation**: React Hook Form + Zod
- **Data Visualizations**: Recharts
- **Exports & Utilities**: SheetJS (`xlsx`), jsPDF + `jspdf-autotable`, `date-fns`, `sonner`
- **Scanning**: `html5-qrcode`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
cd BuildStock
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Contents of `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> **Note**: If Supabase environment variables remain placeholder values or are offline, BuildStaok automatically runs in its **High-Fidelity Engine Mode**, allowing you to test every single feature, signup, stock overdraw check, and report generation immediately out of the box!

### 4. Running Locally
Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🗄️ Supabase Setup Guide

If you wish to connect a live Supabase PostgreSQL database:

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, paste the entire contents into the SQL Editor, and click **Run**.
   - This sets up tables (`profiles`, `categories`, `suppliers`, `products`, `stock_movements`, `settings`, `audit_log`), triggers (`prevent_negative_stock`, `log_audit`, `handle_new_user`), views (`product_stock`), Row Level Security policies, and the `product-images` storage bucket.
4. Next, open `supabase/seed.sql`, paste it into the SQL Editor, and click **Run**.
   - This seeds 6 categories, 4 suppliers, 25 realistic products, and opening-stock ledger entries.
5. In **Authentication -> Providers**, ensure **Email** is enabled.
6. In **Project Settings -> API**, copy your **Project URL** and **anon / public key**, and paste them into your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
7. Restart your development server (`npm run dev`).

---

## 👥 How Roles Work

- **First User Rule**: The very first user to sign up via `/signup` is automatically assigned the **Admin** role.
- **Subsequent Users**: Any subsequent signups are assigned the **Staff** role.
- **Role Permissions**:
  - **Admin**: Full access to all features, including User Management (`/users`), Settings (`/settings`), Audit Log (`/audit-log`), Adjustments (`/adjustments`), and hard-delete operations.
  - **Manager**: Access to catalog editing, category & supplier CRUD, adjustments, receiving/dispatching stock, audit logs, and reports.
  - **Staff**: Operational access to view products, receive stock (`/stock-in`), dispatch stock (`/stock-out`), view ledger movements, and download reports. Administration pages (`/users`, `/settings`, `/audit-log`) are hidden and protected by route guards.
- **Role Switcher**: During testing, you can quickly test different roles by clicking your profile in the top-right corner and clicking **Quick Switch Role** (Admin / Manager / Staff).

---

## 🌐 Vercel Deployment

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. The repository already includes `vercel.json` configured for Single Page Application (SPA) routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **Deploy**.

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts the local Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Bundles production assets into `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs Oxlint checks across source files.
#   s t o c k s  
 #   s t o c k s  
 