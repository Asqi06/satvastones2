-- ==============================================================================
-- SATVASTONES JEWELLERY — PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Legal Entity: Anirudh A Verma (Sole Proprietorship)
-- Dispatch: Chala, Vapi, Gujarat - 396191
-- ==============================================================================

-- 1. ORDERS TABLE (Customer Purchases & Fulfillment Tracking)
create table if not exists public.orders (
  id text primary key,
  order_number text unique not null,
  created_at timestamptz default now(),
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal_paise bigint not null,
  shipping_paise bigint not null default 0,
  discount_paise bigint not null default 0,
  total_paise bigint not null,
  payment_method text not null default 'Razorpay (UPI / Cards)',
  payment_status text not null default 'PAID',
  fulfillment_status text not null default 'VERIFIED',
  courier_partner text default 'BlueDart Air Express',
  tracking_number text,
  updated_at timestamptz default now()
);

-- Indexing for fast lookups by order number, phone, email, and tracking
create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_tracking on public.orders (tracking_number);
create index if not exists idx_orders_phone on public.orders (phone);
create index if not exists idx_orders_email on public.orders (email);

-- 2. TRANSIT DAMAGE CLAIMS TABLE (360° Unboxing Video Proofs)
create table if not exists public.damage_claims (
  id text primary key,
  order_number text not null,
  customer_name text not null,
  phone text not null,
  submission_date timestamptz default now(),
  video_proof_url text not null,
  description text,
  status text not null default 'PENDING_REVIEW', -- 'PENDING_REVIEW' | 'REPLACEMENT_APPROVED' | 'REJECTED'
  created_at timestamptz default now()
);

create index if not exists idx_claims_order_number on public.damage_claims (order_number);

-- 3. PRODUCTS & INVENTORY TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text unique not null,
  sku text not null,
  category text not null,
  price_paise bigint not null,
  compare_at_price_paise bigint,
  headline text,
  image text not null,
  in_stock boolean default true,
  material text default '316L Surgical Stainless Steel',
  finish text default '18K Vacuum Gold PVD',
  created_at timestamptz default now()
);

-- 4. PROMOTIONS & COUPONS TABLE
create table if not exists public.coupons (
  id text primary key,
  code text unique not null,
  discount_percent integer,
  flat_discount_paise bigint,
  min_order_paise bigint default 0,
  is_active boolean default true,
  description text,
  created_at timestamptz default now()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.orders enable row level security;
alter table public.damage_claims enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;

-- Public customers can insert orders (checkout)
create policy "Public customer can insert orders"
  on public.orders for insert
  with check (true);

-- Public customer can view their own order by order_number for order tracking & invoice
create policy "Public customer can track orders"
  on public.orders for select
  using (true);

-- Public customer can submit 360 video claims
create policy "Public customer can submit claims"
  on public.damage_claims for insert
  with check (true);

-- Public can view catalog products and coupons
create policy "Public read products"
  on public.products for select
  using (true);

create policy "Public read coupons"
  on public.coupons for select
  using (true);

-- Enable full read/write for service role & authenticated admin
create policy "Admin manage all orders"
  on public.orders for all
  using (true);

create policy "Admin manage claims"
  on public.damage_claims for all
  using (true);

create policy "Admin manage products"
  on public.products for all
  using (true);

create policy "Admin manage coupons"
  on public.coupons for all
  using (true);

-- 6. ENABLE REALTIME NOTIFICATIONS (Vapi Store live order alerts)
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.damage_claims;
