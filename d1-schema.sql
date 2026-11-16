-- ==============================================================================
-- SATVASTONES JEWELLERY - CLOUDFLARE D1 (SQLITE) PRODUCTION SCHEMA
-- Proprietor: Anirudh A Verma | GSTIN: 24DDAPV4074H1ZF | Chala, Vapi, Gujarat 396191
-- ==============================================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal_paise INTEGER NOT NULL,
    shipping_paise INTEGER NOT NULL DEFAULT 0,
    discount_paise INTEGER NOT NULL DEFAULT 0,
    total_paise INTEGER NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'RAZORPAY',
    payment_status TEXT NOT NULL DEFAULT 'PAID',
    fulfillment_status TEXT NOT NULL DEFAULT 'VERIFIED',
    courier_partner TEXT,
    tracking_number TEXT,
    internal_notes TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);

-- 2. 360° UNBOXING VIDEO DAMAGE CLAIMS (Anti-Tarnish / Transit Guarantee)
CREATE TABLE IF NOT EXISTS damage_claims (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    submission_date TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    video_proof_url TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    admin_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_claims_order ON damage_claims(order_number);
CREATE INDEX IF NOT EXISTS idx_claims_status ON damage_claims(status);

-- 3. PRODUCTS & CATALOGUE
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    headline TEXT,
    description TEXT,
    price_paise INTEGER NOT NULL,
    compare_at_price_paise INTEGER,
    image_url TEXT NOT NULL,
    gallery_json TEXT,
    material TEXT NOT NULL DEFAULT '316L Surgical Stainless Steel with 18K Gold Vacuum PVD',
    finish TEXT NOT NULL DEFAULT 'Mirror Polished',
    tarnish_resistant INTEGER DEFAULT 1,
    waterproof_rating TEXT DEFAULT 'Water & Sweat Resistant',
    in_stock INTEGER NOT NULL DEFAULT 1,
    is_bestseller INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 4. COUPONS & DISCOUNTS
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER,
    flat_discount_paise INTEGER,
    min_order_paise INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    usage_limit INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 5. SITE CONFIGURATION & SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 6. AUDIT & ADMIN LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    actor TEXT NOT NULL DEFAULT 'admin',
    details_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 7. DPDP ACT 2023 & DPDP RULES 2025: CONSENT LOGS (Mandatory 1-Year Minimum Retention)
CREATE TABLE IF NOT EXISTS consent_logs (
    id TEXT PRIMARY KEY,
    consent_id TEXT UNIQUE NOT NULL,
    timestamp_utc TEXT NOT NULL,
    categories_accepted TEXT NOT NULL, -- JSON array of accepted categories e.g. ["necessary","analytics"]
    policy_version TEXT NOT NULL DEFAULT '2026.1-DPDP',
    session_hash TEXT NOT NULL, -- Anonymized cryptographic hash of session/IP
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_consent_id ON consent_logs(consent_id);
CREATE INDEX IF NOT EXISTS idx_consent_time ON consent_logs(timestamp_utc);

-- 8. DPDP ACT 2023: USER PRIVACY RIGHTS REQUESTS & GRIEVANCE REDRESSAL (SLA: 48h Ack, 1 Month Resolution)
CREATE TABLE IF NOT EXISTS privacy_requests (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    request_type TEXT NOT NULL, -- 'ACCESS', 'CORRECTION', 'ERASURE', 'WITHDRAW_CONSENT', 'NOMINEE'
    patron_name TEXT NOT NULL,
    patron_email TEXT NOT NULL,
    patron_phone TEXT NOT NULL,
    details_json TEXT,
    status TEXT NOT NULL DEFAULT 'ACKNOWLEDGED', -- 'ACKNOWLEDGED', 'IN_REVIEW', 'COMPLETED', 'REJECTED'
    acknowledged_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    sla_due_date TEXT NOT NULL, -- Statutory resolution deadline (1 month from receipt)
    resolution_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_privacy_ticket ON privacy_requests(ticket_number);
CREATE INDEX IF NOT EXISTS idx_privacy_email ON privacy_requests(patron_email);
CREATE INDEX IF NOT EXISTS idx_privacy_status ON privacy_requests(status);

-- 9. CUSTOMERS TABLE (Secure Personal Accounts & Address Book)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Active Promotional Coupons
INSERT OR IGNORE INTO coupons (id, code, discount_percent, flat_discount_paise, min_order_paise, is_active, description) VALUES
('coup-1', 'FIRSTBUY', NULL, 20000, 249900, 1, 'Flat ₹200 OFF on orders above ₹2,499'),
('coup-2', 'SATVA10', 10, NULL, 0, 1, '10% OFF on all fine anti-tarnish jewellery'),
('coup-3', 'FESTIVE15', 15, NULL, 299900, 1, '15% Privilege savings on festive orders above ₹2,999');

-- Seed Global Site Settings (Pricing, Announcement Bar, Dispatch Timings)
INSERT OR IGNORE INTO site_settings (key, value_json) VALUES
('global_config', '{
  "shippingChargePaise": 4900,
  "freeShippingThresholdPaise": 49900,
  "stackDiscountPercent": 15,
  "announcementText": "LIMITED EDITION BIRTHDAY ATELIER — UPTO 60% PRIVILEGE SAVINGS · COMPLIMENTARY EXPRESS SHIPPING ON ORDERS ABOVE ₹499 · HAND-INSPECTED & DISPATCHED FROM VAPI ATELIER IN 24–48 HOURS · 18K VACUUM GOLD PVD · 100% WATERPROOF & SWEAT-PROOF",
  "heroHeadline": "Jewellery that feels like you.",
  "heroTagline": "Waterproof, sweat-proof anti-tarnish fine jewellery engineered with 316L surgical stainless steel & 18K vacuum gold PVD. Hand-inspected and dispatched from our Vapi store location.",
  "cloudinaryCloudName": "",
  "cloudinaryUploadPreset": "",
  "stackStudioEnabledProducts": ["prod-1", "prod-2", "prod-3", "prod-4", "prod-5", "prod-6", "prod-7"]
}');
