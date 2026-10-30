-- BuildStaok Schema
-- PostgreSQL / Supabase schema for BuildStaok stock inventory management system

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin','manager','staff')),
  created_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text, phone text, email text, address text, gstin text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  unit text not null default 'pcs',
  cost_price numeric(12,2) not null default 0,
  sell_price numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 0,
  barcode text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  type text not null check (type in ('IN','OUT','ADJUST')),
  quantity numeric(12,2) not null check (quantity <> 0), -- signed: IN positive, OUT negative, ADJUST either
  unit_cost numeric(12,2),
  supplier_id uuid references public.suppliers(id) on delete set null,
  reason text, -- sale, damage, return, internal use, stocktake, opening stock...
  reference text, -- bill / PO / invoice number
  note text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz default now()
);
create index if not exists stock_movements_prod_date_idx on public.stock_movements(product_id, created_at desc);

create table public.settings (
  id int primary key default 1 check (id = 1),
  company_name text default 'BuildStaok Logistics Pvt Ltd',
  currency text default 'INR',
  default_min_stock numeric default 5
);
insert into public.settings (id, company_name, currency, default_min_stock)
values (1, 'BuildStaok Logistics Pvt Ltd', 'INR', 5)
on conflict do nothing;

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text, action text, row_id uuid,
  old_data jsonb, new_data jsonb,
  user_id uuid default auth.uid(),
  created_at timestamptz default now()
);

-- Helper: current user's role
create or replace function public.user_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- Auto-create profile on signup; the very first user becomes admin
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'staff' end);
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Prevent negative stock
create or replace function public.prevent_negative_stock() returns trigger
language plpgsql as $$
declare current_qty numeric;
begin
  select coalesce(sum(quantity),0) into current_qty from public.stock_movements where product_id = new.product_id;
  if current_qty + new.quantity < 0 then
    raise exception 'Insufficient stock: only % available', current_qty;
  end if;
  return new;
end; $$;
drop trigger if exists trg_prevent_negative_stock on public.stock_movements;
create trigger trg_prevent_negative_stock before insert on public.stock_movements
for each row execute function public.prevent_negative_stock();

-- Audit trigger for products, suppliers, categories
create or replace function public.log_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (table_name, action, row_id, old_data, new_data)
  values (tg_table_name, tg_op,
    coalesce((case when tg_op='DELETE' then old.id else new.id end), null),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return null;
end; $$;
drop trigger if exists audit_products on public.products;
create trigger audit_products after insert or update or delete on public.products for each row execute function public.log_audit();
drop trigger if exists audit_suppliers on public.suppliers;
create trigger audit_suppliers after insert or update or delete on public.suppliers for each row execute function public.log_audit();
drop trigger if exists audit_categories on public.categories;
create trigger audit_categories after insert or update or delete on public.categories for each row execute function public.log_audit();

-- Stock view
create or replace view public.product_stock with (security_invoker = true) as
select p.*, c.name as category_name, s.name as supplier_name,
  coalesce(sum(m.quantity),0) as current_stock,
  coalesce(sum(m.quantity),0) * p.cost_price as stock_value
from public.products p
left join public.categories c on c.id = p.category_id
left join public.suppliers s on s.id = p.supplier_id
left join public.stock_movements m on m.product_id = p.id
group by p.id, c.name, s.name;

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;

-- Profiles Policies
create policy "read profiles" on public.profiles for select to authenticated using (true);
create policy "update own name" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "admin manages profiles" on public.profiles for update to authenticated using (public.user_role() = 'admin');

-- Categories Policies
create policy "read categories" on public.categories for select to authenticated using (true);
create policy "write categories" on public.categories for insert to authenticated with check (public.user_role() in ('admin','manager'));
create policy "edit categories" on public.categories for update to authenticated using (public.user_role() in ('admin','manager'));
create policy "delete categories" on public.categories for delete to authenticated using (public.user_role() = 'admin');

-- Suppliers Policies
create policy "read suppliers" on public.suppliers for select to authenticated using (true);
create policy "write suppliers" on public.suppliers for insert to authenticated with check (public.user_role() in ('admin','manager'));
create policy "edit suppliers" on public.suppliers for update to authenticated using (public.user_role() in ('admin','manager'));
create policy "delete suppliers" on public.suppliers for delete to authenticated using (public.user_role() = 'admin');

-- Products Policies
create policy "read products" on public.products for select to authenticated using (true);
create policy "write products" on public.products for insert to authenticated with check (public.user_role() in ('admin','manager'));
create policy "edit products" on public.products for update to authenticated using (public.user_role() in ('admin','manager'));
create policy "delete products" on public.products for delete to authenticated using (public.user_role() = 'admin');

-- Stock Movements Policies
create policy "read movements" on public.stock_movements for select to authenticated using (true);
create policy "insert IN/OUT" on public.stock_movements for insert to authenticated with check (type in ('IN','OUT') or public.user_role() in ('admin','manager'));

-- Settings Policies
create policy "read settings" on public.settings for select to authenticated using (true);
create policy "edit settings" on public.settings for update to authenticated using (public.user_role() = 'admin');

-- Audit Log Policy
create policy "admin reads audit" on public.audit_log for select to authenticated using (public.user_role() in ('admin','manager'));

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');
create policy "staff upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "staff update images" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "staff delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');
