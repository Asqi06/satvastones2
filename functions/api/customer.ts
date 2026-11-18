// Cloudflare Pages / Worker Function: /api/customer/*
// Handles Customer Registration, Login, Profile Updates, and Personal Order History
import {
  hashCustomerPassword,
  verifyCustomerPassword,
  generateSalt,
  createCustomerToken,
  verifyCustomerToken,
  checkCustomerRateLimit,
  recordCustomerFailure,
  clearCustomerFailure,
  isCustomerAuthConfigured
} from '../../src/lib/customer-auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Helper to authenticate customer from request
async function getAuthCustomer(request: Request, env: any) {
  const authHeader = request.headers.get('Authorization') || '';
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/satva_customer_session=([^;]+)/);
    if (match) token = match[1].trim();
  }

  if (!token) return null;
  const result = await verifyCustomerToken(token, env?.CUSTOMER_SESSION_SECRET);
  return result.valid && result.customer ? result.customer : null;
}

export async function handleCustomerRequest(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  // Customer sessions require their own signing secret. Refusing to mint or
  // verify them without one keeps accounts closed rather than forgeable.
  if (!isCustomerAuthConfigured(env?.CUSTOMER_SESSION_SECRET)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Customer accounts are not configured. Set the CUSTOMER_SESSION_SECRET secret (32+ characters) for this deployment.'
      }),
      { status: 503, headers: corsHeaders }
    );
  }

  const clientIp = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   '127.0.0.1';

  // ----------------------------------------------------
  // 1. REGISTER: POST /api/customer/register
  // ----------------------------------------------------
  if (pathname === '/api/customer/register' && request.method === 'POST') {
    try {
      const data = await request.json() as any;
      const fullName = (data.fullName || '').trim();
      const email = (data.email || '').toLowerCase().trim();
      const rawPhone = (data.phone || '').replace(/[^0-9]/g, '');
      const phone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
      const password = (data.password || '').trim();
      const address = (data.address || '').trim();
      const city = (data.city || '').trim();
      const state = (data.state || '').trim();
      const pincode = (data.pincode || '').replace(/[^0-9]/g, '').slice(0, 6);

      if (!fullName || fullName.length < 2) {
        return new Response(JSON.stringify({ success: false, error: 'Please enter your full name.' }), { status: 400, headers: corsHeaders });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }), { status: 400, headers: corsHeaders });
      }
      if (!phone || phone.length !== 10) {
        return new Response(JSON.stringify({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' }), { status: 400, headers: corsHeaders });
      }
      if (!password || password.length < 8) {
        return new Response(JSON.stringify({ success: false, error: 'Password must be at least 8 characters long.' }), { status: 400, headers: corsHeaders });
      }

      // Check if user already exists
      const existing = await db.prepare(`
        SELECT id, email, phone FROM customers 
        WHERE email = ? OR phone = ? 
        LIMIT 1
      `).bind(email, phone).first();

      if (existing) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'An account with this email or mobile number already exists. Please sign in.'
          }),
          { status: 409, headers: corsHeaders }
        );
      }

      // Generate salt and hash password
      const salt = generateSalt();
      const passwordHash = await hashCustomerPassword(password, salt);
      const id = 'cust_' + crypto.randomUUID();

      await db.prepare(`
        INSERT INTO customers (id, full_name, email, phone, password_hash, salt, address, city, state, pincode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'), datetime('now', 'utc'))
      `).bind(id, fullName, email, phone, passwordHash, salt, address, city, state, pincode).run();

      const customerObj = { id, fullName, email, phone, address, city, state, pincode };
      const token = await createCustomerToken(customerObj, env?.CUSTOMER_SESSION_SECRET);

      const cookieVal = `satva_customer_session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000; Path=/`;
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.append('Set-Cookie', cookieVal);

      return new Response(
        JSON.stringify({
          success: true,
          customer: customerObj,
          token,
          message: 'Account created successfully! Welcome to Satvastones.'
        }),
        { status: 201, headers: responseHeaders }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message || 'Registration failed.' }), { status: 500, headers: corsHeaders });
    }
  }

  // ----------------------------------------------------
  // 2. LOGIN: POST /api/customer/login
  // ----------------------------------------------------
  if (pathname === '/api/customer/login' && request.method === 'POST') {
    const rateStatus = checkCustomerRateLimit(clientIp);
    if (!rateStatus.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Too many failed login attempts. Please retry in ${rateStatus.waitMinutes || 15} minutes.`,
          locked: true
        }),
        { status: 429, headers: corsHeaders }
      );
    }

    try {
      const data = await request.json() as any;
      const identifier = (data.identifier || '').trim();
      const password = (data.password || '').trim();

      if (!identifier || !password) {
        return new Response(JSON.stringify({ success: false, error: 'Email/Phone and password are required.' }), { status: 400, headers: corsHeaders });
      }

      const cleanDigits = identifier.replace(/[^0-9]/g, '');
      const cleanPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

      // Lookup by email or phone
      const row = await db.prepare(`
        SELECT * FROM customers 
        WHERE LOWER(email) = ? OR (length(?) = 10 AND phone = ?)
        LIMIT 1
      `).bind(identifier.toLowerCase(), cleanPhone, cleanPhone).first();

      if (!row || !row.password_hash || !row.salt) {
        recordCustomerFailure(clientIp);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email, mobile number, or password.' }),
          { status: 401, headers: corsHeaders }
        );
      }

      const isValid = await verifyCustomerPassword(password, row.salt, row.password_hash);

      if (!isValid) {
        const failStatus = recordCustomerFailure(clientIp);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Invalid email, mobile number, or password. ${failStatus.remaining} attempts remaining.`
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      clearCustomerFailure(clientIp);

      const customerObj = {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        pincode: row.pincode || ''
      };

      const token = await createCustomerToken(customerObj, env?.CUSTOMER_SESSION_SECRET);

      const cookieVal = `satva_customer_session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000; Path=/`;
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.append('Set-Cookie', cookieVal);

      return new Response(
        JSON.stringify({
          success: true,
          customer: customerObj,
          token,
          message: 'Welcome back, ' + customerObj.fullName + '!'
        }),
        { status: 200, headers: responseHeaders }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed.' }), { status: 500, headers: corsHeaders });
    }
  }

  // ----------------------------------------------------
  // 3. PROFILE: GET /api/customer/profile
  // ----------------------------------------------------
  if (pathname === '/api/customer/profile' && request.method === 'GET') {
    const auth = await getAuthCustomer(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ success: false, error: 'Please sign in to view your profile.' }), { status: 401, headers: corsHeaders });
    }

    const row = await db.prepare(`SELECT * FROM customers WHERE id = ? LIMIT 1`).bind(auth.id).first();
    if (!row) {
      return new Response(JSON.stringify({ success: false, error: 'Customer not found.' }), { status: 404, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({
        success: true,
        customer: {
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          address: row.address || '',
          city: row.city || '',
          state: row.state || '',
          pincode: row.pincode || ''
        }
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  // ----------------------------------------------------
  // 4. UPDATE ADDRESS/PROFILE: PUT /api/customer/profile
  // ----------------------------------------------------
  if (pathname === '/api/customer/profile' && request.method === 'PUT') {
    const auth = await getAuthCustomer(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), { status: 401, headers: corsHeaders });
    }

    try {
      const data = await request.json() as any;
      const fullName = (data.fullName || auth.name).trim();
      const address = (data.address || '').trim();
      const city = (data.city || '').trim();
      const state = (data.state || '').trim();
      const pincode = (data.pincode || '').replace(/[^0-9]/g, '').slice(0, 6);

      await db.prepare(`
        UPDATE customers 
        SET full_name = ?, address = ?, city = ?, state = ?, pincode = ?, updated_at = datetime('now', 'utc')
        WHERE id = ?
      `).bind(fullName, address, city, state, pincode, auth.id).run();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Saved delivery address updated successfully.',
          customer: { id: auth.id, fullName, email: auth.email, phone: auth.phone, address, city, state, pincode }
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
    }
  }

  // ----------------------------------------------------
  // 5. CUSTOMER ORDERS: GET /api/customer/orders
  // ----------------------------------------------------
  if (pathname === '/api/customer/orders' && request.method === 'GET') {
    const auth = await getAuthCustomer(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ success: false, error: 'Please sign in to view your order history.' }), { status: 401, headers: corsHeaders });
    }

    try {
      const email = auth.email.toLowerCase();
      const phone = auth.phone.slice(-10);

      const { results } = await db.prepare(`
        SELECT * FROM orders 
        WHERE LOWER(email) = ? OR replace(phone, ' ', '') LIKE '%' || ?
        ORDER BY datetime(created_at) DESC 
        LIMIT 50
      `).bind(email, phone).all();

      const orders = (results || []).map((row: any) => {
        let items = [];
        try {
          items = JSON.parse(row.items_json || '[]');
        } catch {}

        return {
          id: row.id,
          orderNumber: row.order_number,
          createdAt: row.created_at,
          customerName: row.customer_name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          items,
          subtotalPaise: row.subtotal_paise,
          shippingPaise: row.shipping_paise,
          discountPaise: row.discount_paise,
          totalPaise: row.total_paise,
          paymentMethod: row.payment_method,
          paymentStatus: row.payment_status,
          fulfillmentStatus: row.fulfillment_status,
          courierPartner: row.courier_partner || 'Bluedart Express',
          trackingNumber: row.tracking_number || null
        };
      });

      return new Response(
        JSON.stringify({ success: true, orders, count: orders.length }),
        { status: 200, headers: corsHeaders }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
    }
  }

  // ----------------------------------------------------
  // 6. LOGOUT: POST /api/customer/logout
  // ----------------------------------------------------
  if (pathname === '/api/customer/logout') {
    const cookieVal = `satva_customer_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.append('Set-Cookie', cookieVal);

    return new Response(
      JSON.stringify({ success: true, message: 'Signed out successfully.' }),
      { status: 200, headers: responseHeaders }
    );
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });
}
