import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from './emailService.js';

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
    timerDays: Number
  }
});

const CMS = mongoose.model('CMS', cmsSchema);

const orderSchema = new mongoose.Schema({
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
  let cms = await CMS.findOne();
  if (cms) {
    Object.assign(cms, req.body);
    await cms.save();
  } else {
    cms = new CMS(req.body);
    await cms.save();
  }
  res.json(cms);
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
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
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, trackingId }, { new: true });
    
    if (order && status === 'Shipped') {
      await sendEmail(order.customer.email, 'Order Shipped - Satvastones', emailTemplates.shippingUpdate(order));
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-order', async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'your-razorpay-key-secret')
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const order = new Order({ 
      ...orderDetails, 
      orderId: razorpay_order_id, 
      paymentId: razorpay_payment_id, 
      signature: razorpay_signature, 
      status: 'Confirmed' 
    });
    await order.save();

    await sendEmail(orderDetails.customer.email, 'Order Confirmed - Satvastones', emailTemplates.orderConfirmation(order));
    await sendEmail(process.env.ADMIN_EMAIL || 'anirudh@satvastones.com', 'New Order Received!', `<p>New order #${order.orderId} received from ${order.customer.name} for ₹${order.amount}</p>`);

    res.json({ status: 'success', order });
  } else {
    res.status(400).json({ status: 'failure' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await Customer.findOne({ email, password });
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
    res.json({ success: true, customer, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
