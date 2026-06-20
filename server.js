import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEmail, emailTemplates, generateInvoice } from './emailService.js';
import { OAuth2Client } from 'google-auth-library';
import compression from 'compression';


dotenv.config();

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());

// Security Headers (Referrer-Policy, CSP, X-Frame-Options, X-Content-Type-Options)
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.cloudinary.com https://*.razorpay.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.cloudinary.com https://*.razorpay.com https://api.razorpay.com; frame-src https://*.razorpay.com https://checkout.razorpay.com;"
  );
  next();
});

// Root Health Check (For Cron-jobs and Render keep-alive)
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Satvastones API is running beautifully.' });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/satvastones';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Schemas ---

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  oldPrice: Number,
  rating: Number,
  reviewsCount: Number,
  image: String,
  images: [String],
  category: String,
  description: String,
  customOptions: [String],
  variants: [{
    color: String,
    images: [String]
  }],
  reviews: [{
    name: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  isFeatured: { type: Boolean, default: false },
  isAntiTarnish: { type: Boolean, default: false },
  isNinetyNine: { type: Boolean, default: false },
  material: String,
  sku: { type: String, unique: true, sparse: true },
  stockQuantity: { type: Number, default: 0 },
  weight: String,
  dimensions: String,
  giftingOption: { type: Boolean, default: false },
  isRestockable: { type: Boolean, default: true },
  restockSubscribers: [{ email: String, subscribedAt: { type: Date, default: Date.now } }],
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  focusKeywords: [String],
  seoContent: String
});

const Product = mongoose.model('Product', productSchema);

// Helper function to deduct stock
async function deductStock(items) {
  for (const item of items) {
    try {
      const productId = item._id || item.id;
      if (productId) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stockQuantity: -(item.qty || 1) }
        });
        console.log(`Deducted stock for product ${productId}`);
      }
    } catch (err) {
      console.error("Stock deduction error for product:", item.title, err);
    }
  }
}

const cmsSchema = new mongoose.Schema({
  hero: {
    title: String,
    subTitle: String,
    description: String,
    image: String
  },
  categories: [{
    title: String,
    image: String,
    size: String,
    sale: Boolean
  }],
  specialOffer: {
    title: String,
    subTitle: String,
    description: String,
    image: String,
    productId: String,
    isActive: Boolean
  },
  ninetyNineSale: {
    isActive: { type: Boolean, default: false },
    title: { type: String, default: '₹99 Flash Sale' },
    subTitle: { type: String, default: 'Limited Stock Deal' },
    description: { type: String, default: 'Grab your favorite anti-tarnish jewelry at just ₹99 each!' },
    bannerImage: String,
    guaranteeText: { type: String, default: 'Anti-Tarnish • Waterproof • No Color Fade • 100% Guaranteed' },
    badgeText: { type: String, default: '₹99 Only' }
  },
  settings: {
    announcementText: String,
    showTimer: Boolean,
    timerEnd: String,
    cloudinaryCloudName: String,
    cloudinaryUploadPreset: String,
    businessName: String,
    gstin: String,
    businessPan: String,
    businessAddress: String
  },
  coupons: [{
    code: String,
    discount: Number,
    isActive: Boolean
  }],
  homepageSeo: {
    p1: String,
    p2: String,
    p3: String,
    p4: String
  },
  collectionSeo: {
    type: Map,
    of: {
      h2: String,
      content: String
    },
    default: {}
  }
});

const CMS = mongoose.model('CMS', cmsSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  orderId: String,
  paymentId: String,
  signature: String,
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  items: [{
    id: String,
    title: String,
    price: Number,
    qty: Number,
    variant: String,
    customText: String,
    options: [String]
  }],
  amount: Number,
  status: { type: String, default: 'Pending' },
  trackingId: String,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  excerpt: String,
  content: String,
  image: String,
  author: { type: String, default: 'Satvastones' },
  category: String,
  tags: [String],
  readTime: String,
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  focusKeywords: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

const customerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

const cartSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  items: Array,
  lastUpdated: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false }
});

const Cart = mongoose.model('Cart', cartSchema);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID);


// --- SEO Endpoints ---

app.get('/api/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /aniadmin
Disallow: /api/

Sitemap: https://satvastones.in/api/sitemap.xml
`);
});

app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}, 'title price images updatedAt category');
    const staticPages = [
      { loc: 'https://satvastones.in/', priority: '1.0', changefreq: 'daily' },
      { loc: 'https://satvastones.in/shop', priority: '0.9', changefreq: 'daily' },
      { loc: 'https://satvastones.in/shop/necklaces', priority: '0.8', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/earrings', priority: '0.8', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/rings', priority: '0.8', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/bracelets', priority: '0.8', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/99-sale', priority: '0.8', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/gifts', priority: '0.7', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/name-necklace', priority: '0.7', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/shop/accessories', priority: '0.6', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/shop/pendant', priority: '0.6', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/shop/hampers', priority: '0.6', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/shop/mothers-day', priority: '0.7', changefreq: 'yearly' },
      { loc: 'https://satvastones.in/blogs', priority: '0.6', changefreq: 'weekly' },
      { loc: 'https://satvastones.in/contact', priority: '0.5', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/about', priority: '0.7', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/terms', priority: '0.4', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/privacy', priority: '0.4', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/shipping', priority: '0.5', changefreq: 'monthly' },
      { loc: 'https://satvastones.in/returns', priority: '0.5', changefreq: 'monthly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${page.loc}</loc>\n    <priority>${page.priority}</priority>\n    <changefreq>${page.changefreq}</changefreq>\n  </url>\n`;
    }

    for (const product of products) {
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>https://satvastones.in/product/${product._id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.8</priority>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
    }

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Razorpay Setup ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your-razorpay-key-id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your-razorpay-key-secret',
});

// --- Routes ---

app.get('/api/cms', async (req, res) => {
  try {
    let cms = await CMS.findOne();
    if (!cms) {
      return res.json({ message: 'initialized', hero: {}, categories: [], specialOffer: {}, settings: {}, coupons: [] });
    }
    res.json(cms);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/cms', async (req, res) => {
  try {
    let cms = await CMS.findOne();
    if (cms) {
      // Smart Merge: Don't overwrite the whole object, only the parts sent in the request
      if (req.body.hero) cms.hero = { ...cms.hero, ...req.body.hero };
      if (req.body.specialOffer) cms.specialOffer = { ...cms.specialOffer, ...req.body.specialOffer };
      if (req.body.ninetyNineSale) cms.ninetyNineSale = { ...cms.ninetyNineSale, ...req.body.ninetyNineSale };
      if (req.body.settings) cms.settings = { ...cms.settings, ...req.body.settings };
      if (req.body.categories) cms.categories = req.body.categories;
      if (req.body.coupons) cms.coupons = req.body.coupons;
      
      cms.markModified('hero');
      cms.markModified('specialOffer');
      cms.markModified('ninetyNineSale');
      cms.markModified('settings');
      cms.markModified('categories');
      cms.markModified('coupons');
      
      await cms.save();
    } else {
      cms = new CMS(req.body);
      await cms.save();
    }
    res.json(cms);
  } catch (err) {
    console.error("CMS SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Product ID' });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Blog CRUD ---

app.get('/api/blogs', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status === 'all' ? {} : { isPublished: status !== 'draft' };
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/blogs/published', async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.isPublished && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.reviews.push(req.body);
    // Update average rating
    const total = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Math.round((total / product.reviews.length) * 10) / 10;
    product.reviewsCount = product.reviews.length;
    
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/restock-notify', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    if (!product.restockSubscribers) product.restockSubscribers = [];
    
    const alreadySubscribed = product.restockSubscribers.some((s) => s.email === email);
    if (!alreadySubscribed) {
      product.restockSubscribers.push({ email, subscribedAt: new Date() });
      await product.save();
    }
    
    res.json({ success: true, message: 'You will be notified when this item is back in stock.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/customer/:email', async (req, res) => {
  try {
    const orders = await Order.find({ "customer.email": req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, trackingId }, { returnDocument: 'after' });
    
    if (order) {
      // Use try-catch for email so it doesn't crash the status update if email fails
      try {
        const subject = `Order Update: ${status} - Satvastones`;
        await sendEmail(order.customer.email, subject, emailTemplates.statusUpdate(order, status, trackingId));
      } catch (emailErr) {
        console.error("Non-critical Email Error in status update:", emailErr);
      }
    }
    res.json(order);
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-order', async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: Math.round(amount * 100), // Ensure whole number in Paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}` // Unique receipt ID
  };
  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("CREATE ORDER ERROR: Invalid amount received:", amount);
      return res.status(400).json({ error: "Invalid checkout amount" });
    }

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your-razorpay-key-id') {
      console.error("RAZORPAY ERROR: Missing API Keys in environment variables");
      return res.status(500).json({ error: "Razorpay credentials not configured on server" });
    }

    console.log(`Creating Razorpay order for amount: ₹${amount}`);
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);
    res.status(500).json({ 
      error: error.message, 
      details: "Check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set correctly in Render dashboard." 
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
    
    if (!orderDetails || !orderDetails.customer || !orderDetails.customer.email) {
      console.error("Payment Verification Failed: Missing order details in request body");
      return res.status(400).json({ error: "Missing required order details" });
    }
    
    // Handle COD (Cash on Delivery)
    if (razorpay_signature === 'COD') {
      const orderCount = await Order.countDocuments();
      const orderNumber = `SAT-${1000 + orderCount + 1}`;

      const order = new Order({ 
        ...orderDetails, 
        orderNumber,
        orderId: razorpay_order_id, 
        paymentId: 'COD', 
        signature: 'COD', 
        status: 'Confirmed' 
      });
      await order.save();
      // Deduct stock for COD orders
      await deductStock(orderDetails.items);
      // Clear saved cart after successful order
      await Cart.findOneAndDelete({ email: orderDetails.customer.email });
      
      // Generate and Send Invoice
      try {
        const cms = await CMS.findOne();
        const invoicePdf = await generateInvoice(order, cms?.settings || {});
        sendEmail(orderDetails.customer.email, 'Order Confirmed (COD) & GST Invoice - Satvastones', emailTemplates.orderConfirmation(order), [
          { filename: `Invoice_${order.orderNumber}.pdf`, content: invoicePdf }
        ]);
      } catch (invoiceErr) {
        console.error("Invoice generation failed, sending plain confirmation:", invoiceErr);
        sendEmail(orderDetails.customer.email, 'Order Confirmed (COD) - Satvastones', emailTemplates.orderConfirmation(order));
      }

      sendEmail(process.env.ADMIN_EMAIL || 'anirudh@satvastones.com', 'New COD Order Received!', `<p>New order #${order.orderNumber} received from ${order.customer.name} for ₹${order.amount}</p>`);
      return res.json({ status: 'success', order });
    }

    // Handle Razorpay Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest("hex");
  
    if (expectedSignature === razorpay_signature) {
      const orderCount = await Order.countDocuments();
      const orderNumber = `SAT-${1000 + orderCount + 1}`;

      const order = new Order({ 
        ...orderDetails, 
        orderNumber,
        orderId: razorpay_order_id, 
        paymentId: razorpay_payment_id, 
        signature: razorpay_signature, 
        status: 'Confirmed' 
      });
      await order.save();
      // Deduct stock for Razorpay orders
      await deductStock(orderDetails.items);
      // Clear saved cart after successful order
      await Cart.findOneAndDelete({ email: orderDetails.customer.email });
      
      // Generate and Send Invoice
      try {
        const cms = await CMS.findOne();
        const invoicePdf = await generateInvoice(order, cms?.settings || {});
        sendEmail(orderDetails.customer.email, 'Order Confirmed & GST Invoice - Satvastones', emailTemplates.orderConfirmation(order), [
          { filename: `Invoice_${order.orderNumber}.pdf`, content: invoicePdf }
        ]);
      } catch (invoiceErr) {
        console.error("Invoice generation failed, sending plain confirmation:", invoiceErr);
        sendEmail(orderDetails.customer.email, 'Order Confirmed - Satvastones', emailTemplates.orderConfirmation(order));
      }

      sendEmail(process.env.ADMIN_EMAIL || 'anirudh@satvastones.com', 'New Order Received!', `<p>New order #${order.orderId} received from ${order.customer.name} for ₹${order.amount}</p>`);
  
      res.json({ status: 'success', order });
    } else {
      console.error("Payment Verification Failed: Signature Mismatch");
      res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
    }
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Invalid token' });

    const { email, name, sub: googleId } = payload;
    
    let customer = await Customer.findOne({ email });
    if (!customer) {
      // Create new customer if doesn't exist (Password is random for Google users)
      customer = new Customer({ 
        name, 
        email, 
        password: crypto.randomBytes(16).toString('hex') 
      });
      await customer.save();
      await sendEmail(email, 'Welcome to Satvastones!', emailTemplates.welcome(name));
    }

    const orders = await Order.find({ 'customer.email': email }).sort({ createdAt: -1 });
    // Send Login Notification
    sendEmail(email, 'New Login - Satvastones', emailTemplates.loginNotification(name, new Date().toLocaleString()));
    res.json({ success: true, customer, orders });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// Contact Form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await sendEmail(process.env.ADMIN_EMAIL || 'anirudh@satvastones.com', `New Inquiry from ${name}`, `
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b> ${message}</p>
    `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const customer = new Customer({ name, email, password });
    await customer.save();

    // Send Welcome Email
    await sendEmail(email, 'Welcome to Satvastones!', emailTemplates.welcome(name));

    res.json({ success: true, customer: { name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email, password });
    if (!customer) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Get orders for this customer
    const orders = await Order.find({ 'customer.email': email }).sort({ createdAt: -1 });
    // Send Login Notification
    sendEmail(email, 'New Login - Satvastones', emailTemplates.loginNotification(customer.name, new Date().toLocaleString()));
    res.json({ success: true, customer, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cart Sync
app.post('/api/cart/sync', async (req, res) => {
  try {
    const { email, items } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // If items are empty, the cart is cleared
    if (!items || items.length === 0) {
      await Cart.findOneAndDelete({ email });
      return res.json({ message: 'Cart cleared' });
    }

    await Cart.findOneAndUpdate(
      { email },
      { items, lastUpdated: new Date(), reminderSent: false },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Background Job: Abandoned Cart Recovery (Runs every 1 hour)
setInterval(async () => {
  try {
    console.log('[WATCHDOG] Checking for abandoned carts...');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const abandonedCarts = await Cart.find({
      lastUpdated: { $lt: twoHoursAgo },
      reminderSent: false,
      items: { $exists: true, $not: { $size: 0 } }
    });

    for (const cart of abandonedCarts) {
      const customer = await Customer.findOne({ email: cart.email });
      if (customer) {
        console.log(`[WATCHDOG] Sending recovery email to: ${cart.email}`);
        await sendEmail(cart.email, 'Your Satvastones Bag is Waiting...', emailTemplates.abandonedCart(customer.name));
        cart.reminderSent = true;
        await cart.save();
      }
    }
  } catch (err) {
    console.error('[WATCHDOG ERROR]:', err);
  }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

