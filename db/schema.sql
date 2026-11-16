-- SATVASTONES D1 DATABASE SCHEMA
-- Version 1.0 (Production Blueprint)

-- 1. Users / Customers
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 4. Collections
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    banner_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL,
    headline TEXT,
    description TEXT NOT NULL,
    material TEXT NOT NULL DEFAULT 'Stainless Steel with 18K Gold PVD Coating',
    finish TEXT NOT NULL DEFAULT 'Mirror Polished',
    tarnish_resistant INTEGER DEFAULT 1,
    waterproof_rating TEXT DEFAULT 'Water & Sweat Resistant',
    dimensions TEXT,
    weight_grams REAL,
    care_instructions TEXT,
    warranty_info TEXT DEFAULT '6 Months Anti-Tarnish Warranty',
    price_paise INTEGER NOT NULL,
    compare_at_price_paise INTEGER,
    rating REAL DEFAULT 4.9,
    review_count INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    is_bestseller INTEGER DEFAULT 0,
    is_new_arrival INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 6. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    color TEXT,
    size TEXT,
    price_paise INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_primary INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. Collection Products
CREATE TABLE IF NOT EXISTS collection_products (
    collection_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    PRIMARY KEY (collection_id, product_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 9. Inventory & Movements
CREATE TABLE IF NOT EXISTS inventory (
    product_id TEXT PRIMARY KEY,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    reorder_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 10. Carts & Items
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 11. Orders & Items
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    shipping_address_json TEXT NOT NULL,
    billing_address_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CREATED',
    subtotal_paise INTEGER NOT NULL,
    discount_paise INTEGER NOT NULL DEFAULT 0,
    shipping_paise INTEGER NOT NULL DEFAULT 0,
    tax_paise INTEGER NOT NULL DEFAULT 0,
    total_paise INTEGER NOT NULL,
    coupon_code TEXT,
    internal_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    price_paise INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_paise INTEGER NOT NULL,
    image_url TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 12. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'RAZORPAY',
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    amount_paise INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'PENDING',
    idempotency_key TEXT UNIQUE,
    payload_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment ON payments(gateway_payment_id);

-- 13. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    billing_address_json TEXT NOT NULL,
    shipping_address_json TEXT NOT NULL,
    subtotal_paise INTEGER NOT NULL,
    tax_paise INTEGER NOT NULL,
    total_paise INTEGER NOT NULL,
    gstin TEXT,
    pdf_r2_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 14. Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    courier_name TEXT,
    awb_number TEXT,
    tracking_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    dispatched_at TEXT,
    delivered_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 15. Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    comment TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 16. Coupons & Redemptions
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
    discount_value INTEGER NOT NULL,
    min_order_paise INTEGER DEFAULT 0,
    max_discount_paise INTEGER,
    usage_limit INTEGER,
    per_user_limit INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id TEXT PRIMARY KEY,
    coupon_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    user_id TEXT,
    discount_applied_paise INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 17. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    is_verified_purchase INTEGER DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 18. Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id TEXT PRIMARY KEY,
    wishlist_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 19. Refunds & Returns
CREATE TABLE IF NOT EXISTS return_requests (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence_urls TEXT,
    status TEXT NOT NULL DEFAULT 'REQUESTED',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    amount_paise INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'INITIATED',
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- 20. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'EMAIL',
    template_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payload_json TEXT,
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 21. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    subscribed_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 22. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT 'SatvaStones Editorial',
    cover_image_url TEXT,
    is_published INTEGER DEFAULT 1,
    published_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 23. Admin Roles & Users & Audit
CREATE TABLE IF NOT EXISTS admin_roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    permissions_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (role_id) REFERENCES admin_roles(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- 24. Site Settings (e.g. Announcement Bar, Free Shipping threshold)
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);
