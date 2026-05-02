import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from './emailService.js';
import { OAuth2Client } from 'google-auth-library';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
  style: [String],
  reviews: [{
    name: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
});

const Product = mongoose.model('Product', productSchema);

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
  settings: {
    announcementText: String,
    showTimer: Boolean,
    timerEnd: String,
    cloudinaryCloudName: String,
    cloudinaryUploadPreset: String
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
  items: Array,
  amount: Number,
  status: { type: String, default: 'Pending' },
  trackingId: String,
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

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

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);


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
      return res.json({ message: 'initialized', hero: {}, categories: [], specialOffer: {}, settings: {} });
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
      Object.assign(cms, req.body);
      await cms.save();
    } else {
      cms = new CMS(req.body);
      await cms.save();
    }
    res.json(cms);
  } catch (err) {
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

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
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
      // Send dynamic status update email
      const subject = `Order Update: ${status} - Satvastones`;
      await sendEmail(order.customer.email, subject, emailTemplates.statusUpdate(order, status, trackingId));
    }
    res.json(order);
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
      // Clear saved cart after successful order
      await Cart.findOneAndDelete({ email: orderDetails.customer.email });
      // Send emails in background (don't await)
      sendEmail(orderDetails.customer.email, 'Order Confirmed (COD) - Satvastones', emailTemplates.orderConfirmation(order));
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
      // Clear saved cart after successful order
      await Cart.findOneAndDelete({ email: orderDetails.customer.email });
      // Send emails in background (don't await)
      sendEmail(orderDetails.customer.email, 'Order Confirmed - Satvastones', emailTemplates.orderConfirmation(order));
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
      audience: process.env.VITE_GOOGLE_CLIENT_ID
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

