import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEmail, emailTemplates, generateInvoice } from './emailService.js';
import { OAuth2Client } from 'google-auth-library';
import compression from 'compression';
import { slugify, ensureUniqueSlug } from './src/lib/utils.ts';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// Reverse Proxy: Route public SEO-facing paths to the Next.js deployment
const nextjsManagedPaths = [
  '/',
  '/shop',
  '/shop/*',
  '/products/*',
  '/blog',
  '/blog/*',
  '/about',
  '/contact',
];

nextjsManagedPaths.forEach((route) => {
  app.use(
    route,
    createProxyMiddleware({
      target: process.env.NEXTJS_APP_PRODUCTION_URL,
      changeOrigin: true,
      logLevel: 'error',
    })
  );
});

// Serve Vite SPA static assets for non-proxied routes
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: Serve index.html for all remaining frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
  video: String,
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
  slug: { type: String, unique: true, sparse: true },
  metaTitle: String,
  metaDescription: String,
  focusKeywords: [String],
  seoContent: String,
  specifications: [{ key: String, value: String }]
});

const Product = mongoose.model('Product', productSchema);

// --- Redirect Schema (tracks retired slugs for 301 forwarding) ---
const redirectSchema = new mongoose.Schema({
  fromSlug: { type: String, required: true, unique: true, index: true },
  toSlug: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  createdAt: { type: Date, default: Date.now },
});
const Redirect = mongoose.model('Redirect', redirectSchema);

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

// --- WhatsApp / n8n Webhook ---
// Fires after order creation. n8n receives this and sends WhatsApp via WAHA API.
async function sendOrderWebhook(order) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'order.created',
        orderNumber: order.orderNumber,
        customer: order.customer,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        items: (order.items || []).map(i => ({
          title: i.title,
          qty: i.qty,
          price: i.price
        })),
        phone: order.customer?.phone,
        createdAt: order.createdAt
      })
    });
  } catch (err) {
    console.error('n8n webhook error:', err.message);
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
    businessAddress: String,
    logoUrl: String,
    useLogo: { type: Boolean, default: false },
    brandName: { type: String, default: 'Satvastones' },
    seoTitle: String,
    seoDescription: String,
    seoH1: { type: String, default: 'SatvaStones — Premium Aesthetic Korean & Western Jewelry Online' },
    shopPageTitle: String,
    shopPageDescription: String,
    connectPhone: { type: String, default: '+91-90167-03180' },
    connectEmail: { type: String, default: 'support@satvastones.in' },
    connectTagline: { type: String, default: 'Loved by customers across India. We always try to bring the best experience to customers when shopping at Satvastones.' }
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
  },
  faqs: [{
    question: String,
    answer: String
  }]
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
  discountAmount: Number,
  couponCode: String,
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

// --- Homepage Banner Schema ---
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', bannerSchema);

// --- Homepage Section Schema (e.g., "Viral Hand Stacks", "Waist Chain Belts") ---
const homepageSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  badge: { type: String, default: 'Hot Selling' },
  shopLink: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);

// --- Trend Schema (e.g., "Office Girl", "Dreamy Girl") ---
const trendSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});
const Trend = mongoose.model('Trend', trendSchema);

// --- Customer Review Schema ---
const customerReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 5 },
  title: String,
  comment: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const CustomerReview = mongoose.model('CustomerReview', customerReviewSchema);

// --- FAQ Schema ---
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Faq = mongoose.model('Faq', faqSchema);

// --- Sale Schema ---
const saleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  discountPercent: { type: Number, default: 0 },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  bgColor: { type: String, default: '#f2707f' },
  createdAt: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', saleSchema);

// --- Analytics Schema ---
const analyticsEventSchema = new mongoose.Schema({
  sessionId: { type: String, index: true },
  eventType: { type: String, index: true },
  page: String,
  timestamp: { type: Date, default: Date.now, index: true },
  data: { type: mongoose.Schema.Types.Mixed },
  metadata: { type: mongoose.Schema.Types.Mixed }
});
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

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
    const [products, blogs] = await Promise.all([
      Product.find({}, 'title slug image price images updatedAt category'),
      Blog.find({ isPublished: true }, 'title slug image updatedAt category')
    ]);
    const staticPages = [
      'https://satvastones.in/',
      'https://satvastones.in/shop',
      'https://satvastones.in/shop/necklaces',
      'https://satvastones.in/shop/earrings',
      'https://satvastones.in/shop/rings',
      'https://satvastones.in/shop/bracelets',
      'https://satvastones.in/shop/99-sale',
      'https://satvastones.in/shop/gifts',
      'https://satvastones.in/shop/name-necklace',
      'https://satvastones.in/shop/accessories',
      'https://satvastones.in/shop/pendant',
      'https://satvastones.in/shop/hampers',
      'https://satvastones.in/shop/mothers-day',
      'https://satvastones.in/blogs',
      'https://satvastones.in/contact',
      'https://satvastones.in/about',
      'https://satvastones.in/terms',
      'https://satvastones.in/privacy',
      'https://satvastones.in/shipping',
      'https://satvastones.in/returns',
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    for (const loc of staticPages) {
      xml += `  <url>\n    <loc>${loc}</loc>\n  </url>\n`;
    }

    for (const product of products) {
      if (!product.slug) continue;
      const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>https://satvastones.in/product/${product.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n`;
      if (product.image) {
        xml += `    <image:image>\n      <image:loc>${product.image}</image:loc>\n    </image:image>\n`;
      }
      xml += '  </url>\n';
    }

    for (const blog of blogs) {
      const lastMod = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>https://satvastones.in/blog/${blog.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n  </url>\n`;
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
    let cms = await CMS.findOne().lean();
    if (!cms) {
      return res.json({ message: 'initialized', hero: {}, categories: [], specialOffer: {}, settings: {}, coupons: [], homepageSeo: {}, collectionSeo: {}, faqs: [] });
    }
    res.json(cms);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/cms', async (req, res) => {
  try {
    const existing = await CMS.findOne().lean();
    const updateData = {};
    if (req.body.hero) updateData.hero = { ...(existing?.hero || {}), ...req.body.hero };
    if (req.body.specialOffer) updateData.specialOffer = { ...(existing?.specialOffer || {}), ...req.body.specialOffer };
    if (req.body.ninetyNineSale) updateData.ninetyNineSale = { ...(existing?.ninetyNineSale || {}), ...req.body.ninetyNineSale };
    if (req.body.settings) updateData.settings = { ...(existing?.settings || {}), ...req.body.settings };
    if (req.body.categories) updateData.categories = req.body.categories;
    if (req.body.coupons !== undefined) updateData.coupons = req.body.coupons;
    if (req.body.homepageSeo) updateData.homepageSeo = req.body.homepageSeo;
    if (req.body.collectionSeo) updateData.collectionSeo = req.body.collectionSeo;
    if (req.body.faqs !== undefined) updateData.faqs = req.body.faqs;

    const cms = await CMS.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: false }
    ).lean();
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

async function followRedirect(slug, maxHops = 5) {
  if (await Product.findOne({ slug })) return null;
  const redirect = await Redirect.findOne({ fromSlug: slug });
  if (!redirect) return null;
  let finalSlug = redirect.toSlug;
  let hops = 0;
  while (hops < maxHops) {
    const next = await Redirect.findOne({ fromSlug: finalSlug });
    if (!next) break;
    finalSlug = next.toSlug;
    hops++;
  }
  return finalSlug;
}

app.get('/api/products/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    let product = await Product.findOne({ slug });
    if (product) return res.json(product);
    const redirected = await followRedirect(slug);
    if (redirected) {
      product = await Product.findOne({ slug: redirected });
      if (product) return res.json(product);
    }
    if (mongoose.Types.ObjectId.isValid(slug)) {
      product = await Product.findById(slug);
      if (product) return res.json(product);
    }
    res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/redirects/:slug', async (req, res) => {
  try {
    const redirected = await followRedirect(req.params.slug);
    if (redirected) return res.json({ fromSlug: req.params.slug, toSlug: redirected, redirect: true });
    res.json({ fromSlug: req.params.slug, redirect: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.title) {
      data.slug = await ensureUniqueSlug(slugify(data.title), (slug) => Product.findOne({ slug }));
    }
    const product = new Product(data);
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
    const data = { ...req.body };
    if (data.title) {
      const existing = await Product.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Product not found' });
      // Only auto-generate slug if title changed and no explicit slug provided
      if (!data.slug && data.title !== existing.title) {
        const newSlug = await ensureUniqueSlug(slugify(data.title), (slug) => Product.findOne({ slug, _id: { $ne: existing._id } }));
        // Record redirect from old slug to new slug
        if (newSlug !== existing.slug) {
          await Redirect.findOneAndUpdate(
            { fromSlug: existing.slug },
            { fromSlug: existing.slug, toSlug: newSlug, productId: existing._id },
            { upsert: true }
          );
          data.slug = newSlug;
        }
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Migration endpoint: backfill slugs for existing products without one
app.post('/api/migrate-slugs', async (req, res) => {
  try {
    const products = await Product.find({ slug: { $exists: false } });
    let updated = 0;
    for (const product of products) {
      if (product.title) {
        product.slug = await ensureUniqueSlug(slugify(product.title), (slug) => Product.findOne({ slug, _id: { $ne: product._id } }));
        await product.save();
        updated++;
      }
    }
    res.json({ message: `Updated ${updated} products with slugs` });
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

// --- Coupon Validation (per-user) ---
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!code) return res.json({ valid: false, error: 'Coupon code is required' });

    const cms = await CMS.findOne();
    const coupons = cms?.coupons || [];
    const coupon = coupons.find((c) => c.code === code.toUpperCase() && c.isActive);

    if (!coupon) return res.json({ valid: false, error: 'Invalid or expired coupon code' });

    // Check if this user has already used this coupon
    if (email) {
      const existingOrder = await Order.findOne({ 'customer.email': email, couponCode: code.toUpperCase() });
      if (existingOrder) return res.json({ valid: false, error: 'You have already used this coupon code' });
    }

    res.json({ valid: true, coupon: { code: coupon.code, discount: coupon.discount } });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
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

    // Enforce per-user coupon usage: reject if coupon already used by this customer
    if (orderDetails.couponCode) {
      const existingOrder = await Order.findOne({
        'customer.email': orderDetails.customer.email,
        couponCode: orderDetails.couponCode
      });
      if (existingOrder) {
        return res.status(400).json({ error: `Coupon ${orderDetails.couponCode} has already been used by this account` });
      }
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
      sendOrderWebhook(order);
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
  
      sendOrderWebhook(order);
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

// --- Analytics Routes ---

// --- Banner CRUD ---
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/banners/active', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/banners', async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.json(banner);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json(banner);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Homepage Sections CRUD ---
app.get('/api/homepage-sections', async (req, res) => {
  try {
    const sections = await HomepageSection.find().sort({ sortOrder: 1 }).populate('productIds');
    res.json(sections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/homepage-sections/active', async (req, res) => {
  try {
    const sections = await HomepageSection.find({ isActive: true }).sort({ sortOrder: 1 }).populate('productIds');
    res.json(sections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/homepage-sections', async (req, res) => {
  try {
    const section = new HomepageSection(req.body);
    await section.save();
    res.json(section);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/homepage-sections/:id', async (req, res) => {
  try {
    const section = await HomepageSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/homepage-sections/:id', async (req, res) => {
  try {
    await HomepageSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Trends CRUD ---
app.get('/api/trends', async (req, res) => {
  try {
    const trends = await Trend.find().sort({ sortOrder: 1 }).populate('productIds');
    res.json(trends);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/trends/active', async (req, res) => {
  try {
    const trends = await Trend.find({ isActive: true }).sort({ sortOrder: 1 }).populate('productIds');
    res.json(trends);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trends', async (req, res) => {
  try {
    const trend = new Trend(req.body);
    await trend.save();
    res.json(trend);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trends/:id', async (req, res) => {
  try {
    const trend = await Trend.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trend) return res.status(404).json({ error: 'Trend not found' });
    res.json(trend);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trends/:id', async (req, res) => {
  try {
    await Trend.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Customer Reviews CRUD ---
app.get('/api/customer-reviews', async (req, res) => {
  try {
    const reviews = await CustomerReview.find().sort({ sortOrder: 1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/customer-reviews/active', async (req, res) => {
  try {
    const reviews = await CustomerReview.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/customer-reviews', async (req, res) => {
  try {
    const review = new CustomerReview(req.body);
    await review.save();
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/customer-reviews/:id', async (req, res) => {
  try {
    const review = await CustomerReview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/customer-reviews/:id', async (req, res) => {
  try {
    await CustomerReview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- FAQ CRUD ---
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ sortOrder: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/faqs/active', async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/faqs', async (req, res) => {
  try {
    const faq = new Faq(req.body);
    await faq.save();
    res.json(faq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/faqs/:id', async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json(faq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/faqs/:id', async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Sale Routes ---
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find().populate('productIds').sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sales/active', async (req, res) => {
  try {
    const sales = await Sale.find({ isActive: true }).populate('productIds').sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sales', async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.json(sale);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/sales/:id', async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Homepage Data (single endpoint for all homepage data) ---
app.get('/api/homepage', async (req, res) => {
  try {
    const [banners, sections, trends, reviews, faqs, sales] = await Promise.all([
      Banner.find({ isActive: true }).sort({ sortOrder: 1 }),
      HomepageSection.find({ isActive: true }).sort({ sortOrder: 1 }).populate('productIds'),
      Trend.find({ isActive: true }).sort({ sortOrder: 1 }).populate('productIds'),
      CustomerReview.find({ isActive: true }).sort({ sortOrder: 1 }),
      Faq.find({ isActive: true }).sort({ sortOrder: 1 }),
      Sale.find({ isActive: true }).populate('productIds').sort({ createdAt: -1 })
    ]);
    res.json({ banners, sections, trends, reviews, faqs, sales });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/analytics/events — batch insert events
app.post('/api/analytics/events', async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events) || events.length === 0) return res.json({ success: true });

    const docs = events.map((e) => ({
      sessionId: e.sessionId,
      eventType: e.eventType,
      page: e.page,
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      data: e.data || {},
      metadata: {
        userAgent: req.headers['user-agent'] || '',
        referrer: req.headers['referer'] || '',
        ip: req.ip || req.connection?.remoteAddress || '',
      }
    }));

    await AnalyticsEvent.insertMany(docs);
    res.json({ success: true, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/stats — aggregated dashboard stats
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const totalEvents = await AnalyticsEvent.countDocuments({});
    const totalPageViews = await AnalyticsEvent.countDocuments({ eventType: 'page_view' });
    const totalClicks = await AnalyticsEvent.countDocuments({ eventType: 'click' });

    // Unique sessions
    const sessions = await AnalyticsEvent.distinct('sessionId');
    const totalSessions = sessions.length;

    // Page views per page
    const pageViewsPerPage = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'page_view' } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Click heatmap — most clicked elements per page
    const clickHeatmap = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'click', 'data.selector': { $exists: true } } },
      { $group: { _id: { page: '$page', selector: '$data.selector' }, count: { $sum: 1 }, texts: { $addToSet: '$data.text' } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    // Scroll depth distribution
    const scrollDepths = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'scroll' } },
      { $group: { _id: '$data.depth', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Conversion funnel
    const funnel = await AnalyticsEvent.aggregate([
      { $match: { eventType: { $in: ['page_view', 'view_product', 'add_to_cart', 'checkout_start', 'purchase'] } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    // Events in last 24 hours
    const last24h = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Sessions in last 24h
    const recentSessions = await AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      totals: { events: totalEvents, pageViews: totalPageViews, clicks: totalClicks, sessions: totalSessions },
      last24h: { events: last24h, sessions: recentSessions.length },
      pageViewsPerPage,
      clickHeatmap,
      scrollDepths,
      funnel
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/events — paginated raw events
app.get('/api/analytics/events', async (req, res) => {
  try {
    const { page = '1', limit = '50', eventType, sessionId } = req.query;
    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (sessionId) filter.sessionId = sessionId;

    const total = await AnalyticsEvent.countDocuments(filter);
    const events = await AnalyticsEvent.find(filter)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Merge metadata into each event for frontend
    const merged = events.map((e) => ({ ...e, ...(e.metadata || {}) }));

    res.json({ events: merged, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/sessions — recent sessions with summary
app.get('/api/analytics/sessions', async (req, res) => {
  try {
    const sessions = await AnalyticsEvent.aggregate([
      { $group: {
        _id: '$sessionId',
        firstEvent: { $min: '$timestamp' },
        lastEvent: { $max: '$timestamp' },
        events: { $sum: 1 },
        pageViews: { $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } },
        clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] } },
        pages: { $addToSet: '$page' }
      }},
      { $sort: { lastEvent: -1 } },
      { $limit: 50 }
    ]);

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/analytics/events — clear all analytics data
app.delete('/api/analytics/events', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (sessionId) {
      await AnalyticsEvent.deleteMany({ sessionId });
    } else {
      await AnalyticsEvent.deleteMany({});
    }
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

