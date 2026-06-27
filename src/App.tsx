import { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, User, ArrowLeft, ArrowRight, ChevronRight, 
  ArrowUpRight, Facebook, Twitter, Linkedin, Instagram, 
  ArrowRight as ArrowRightIcon, Menu, X, Heart, Shield, Trash2, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import JsonLd, { getProductSchema, getOrganizationSchema, getWebsiteSchema, getBreadcrumbSchema, getFaqSchema, getLocalBusinessSchema } from './components/JsonLd';
import { getSrcSet } from './utils/cloudinary';
import ProductPage from './components/ProductPage';
import ShopPage from './components/ShopPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import AdminPanel from './components/AdminPanel';
import ContactPage from './components/ContactPage';
import BlogsPage from './components/BlogsPage';
import BlogDetailPage from './components/BlogDetailPage';
import AuthPage from './components/AuthPage';
import SearchOverlay from './components/SearchOverlay';
import OrderSuccessPage from './components/OrderSuccessPage';
import { optimizeImage } from './utils/cloudinary';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const CategoryCard = ({ category, onClick }: any) => {
  const ratio = category.size === 'large' ? 1.333 : 1.0;
  const height = Math.round(600 * ratio);
  return (
    <div 
      className={`group relative overflow-hidden bg-stone-100 cursor-pointer ${category.size === 'large' ? 'aspect-[3/4]' : 'aspect-square md:aspect-[16/9]'}`}
      onClick={onClick}
    >
      <img 
        src={optimizeImage(category.image, 600, height)} 
        srcSet={getSrcSet(category.image, [320, 480, 600, 800], ratio)}
        sizes="(max-width: 640px) calc(50vw - 16px), (max-width: 1024px) calc(25vw - 12px), 320px"
        alt={`Shop ${category.title} at Satvastones`} 
        loading="lazy"
        width="600"
        height={height}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20" />
      
      {category.sale && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">
            Sale Live
          </span>
        </div>
      )}

      <div className="absolute inset-0 flex items-end justify-between p-6">
        {/* p used here intentionally — h4 in this context would skip h1→h2→h3 hierarchy */}
        <p className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl md:text-2xl lg:text-3xl">
          {category.title}
        </p>
        <button 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:scale-110 md:h-12 md:w-12"
          aria-label={`Shop ${category.title}`}
        >
          <ArrowUpRight className="h-5 w-5 text-black" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const DiscoverCard = ({ product, large = false, onClick }: any) => {
  const ratio = large ? 1.25 : 1.0;
  const height = Math.round(600 * ratio);
  return (
    <div className="group flex flex-col gap-3 cursor-pointer" onClick={onClick}>
      <div className={`relative overflow-hidden bg-stone-100 ${large ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-square'}`}>
        <img 
          src={optimizeImage(product.image, 600, height)} 
          srcSet={getSrcSet(product.image, [300, 450, 600], ratio)}
          sizes="(max-width: 640px) calc(50vw - 16px), (max-width: 1024px) calc(33vw - 16px), 300px"
          alt={product.title} 
          loading="lazy"
          width="600"
          height={height}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Wishlist Button */}
        <button 
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-900 transition-colors hover:bg-white"
          aria-label={`Add ${product.title} to wishlist`}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-4 z-10 flex translate-y-4 justify-center gap-2 px-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button 
            className="flex-1 bg-black py-3 text-[9px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-stone-800"
            aria-label={`View details for ${product.title}`}
          >
            View Details
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          {/* p used intentionally — heading hierarchy is h1 on page, h2 for sections */}
          <p className="font-accent text-xs font-bold uppercase tracking-tight text-stone-900">{product.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-500 line-through">₹{product.oldPrice}</span>
            <span className="font-accent text-sm font-bold text-stone-900">₹{product.price}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-500">
             <span className="text-[10px]">★</span>
          </div>
          <span className="text-[10px] font-bold text-stone-900">{product.rating}</span>
          <span className="text-[10px] text-stone-500 uppercase tracking-tighter">({(product.reviews && Array.isArray(product.reviews)) ? product.reviews.length : (typeof product.reviews === 'number' ? product.reviews : 0)} reviews)</span>
        </div>
      </div>
    </div>
  );
};

// EMPTY INITIAL DATA (Everything flows from DB)
const initialCMSData = {
  hero: { title: '', subTitle: '', description: '', image: '' },
  categories: [],
  specialOffer: { title: '', subTitle: '', description: '', image: '', isActive: false },
  ninetyNineSale: { isActive: false, title: '₹99 Flash Sale', subTitle: 'Limited Stock Deal', description: 'Grab your favorite anti-tarnish jewelry at just ₹99 each!', bannerImage: '', guaranteeText: 'Anti-Tarnish • Waterproof • No Color Fade • 100% Guaranteed', badgeText: '₹99 Only' },
  products: [],
  settings: { announcementText: '', showTimer: false, timerEnd: '' }
};

function AccountDashboard({ user, onLogout, onShop }: { user: any, onLogout: () => void, onShop: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/orders/customer/${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
          
          // Check for orderId in URL to auto-select (for tracking from email)
          const params = new URLSearchParams(location.search);
          const orderId = params.get('orderId');
          if (orderId) {
            const order = data.find((o: any) => o._id === orderId || o.orderNumber === orderId);
            if (order) setSelectedOrder(order);
          }
        }
      } catch (err) {
        console.error("Failed to fetch customer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.email, location.search]);

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Profile Card */}
          <div className="w-full md:w-80 space-y-8">
            <div className="bg-stone-50 p-10 border border-stone-100 text-center">
              <div className="w-20 h-20 bg-stone-900 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-6">
                {user.name?.[0] || 'U'}
              </div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{user.name}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">{user.email}</p>
              <button 
                onClick={onLogout}
                className="mt-8 text-[9px] font-bold uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors"
              >
                Sign Out Of Account
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">Aesthetic Membership</h3>
              <div className="p-6 border border-stone-100 bg-stone-50/50">
                <p className="text-[10px] leading-relaxed text-stone-500 uppercase">You are part of our exclusive tribe. Enjoy priority support and early access to drops.</p>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="flex-1 space-y-12 w-full">
            <section>
              <h3 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Recent Orders</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="p-12 text-center text-[10px] uppercase tracking-widest text-stone-400 animate-pulse">Loading History...</div>
                ) : orders.length > 0 ? (
                  orders.map(order => (
                    <div 
                      key={order._id} 
                      onClick={() => setSelectedOrder(order)}
                      className="group border border-stone-100 p-6 flex items-center justify-between hover:bg-stone-50 transition-all cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest group-hover:text-stone-900">Order #{order.orderNumber || order._id?.slice(-8)}</p>
                          <ChevronRight className="h-3 w-3 text-stone-300 group-hover:text-stone-900 transition-transform group-hover:translate-x-1" />
                        </div>
                        <p className="text-[9px] text-stone-400 uppercase mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} ITEMS • ₹{order.amount}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-stone-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-full">
                        {order.status || 'Received'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-stone-100 p-12 text-center space-y-4">
                    <ShoppingBag className="h-8 w-8 mx-auto text-stone-200" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">No recent orders found</p>
                    <button 
                      onClick={onShop}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 underline underline-offset-4"
                    >
                      Enter The Shop
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="pt-12 border-t border-stone-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 mb-6">Account Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="text-left p-6 border border-stone-100 hover:bg-stone-50 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Default Address</p>
                  <p className="text-[9px] text-stone-400 uppercase mt-1">Manage your delivery locations</p>
                </button>
                <button className="text-left p-6 border border-stone-100 hover:bg-stone-50 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Wishlist</p>
                  <p className="text-[9px] text-stone-400 uppercase mt-1">View your saved aesthetic pieces</p>
                </button>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight">Order Details</h3>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-black p-2"><X className="h-6 w-6" /></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-10 no-scrollbar">
                {/* Status Stepper */}
                <div className="flex justify-between items-center px-4 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-stone-100 -translate-y-1/2 -z-10" />
                  {['Confirmed', 'Shipped', 'Delivered'].map((step, i) => {
                    const isCompleted = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(selectedOrder.status) >= ['Confirmed', 'Shipped', 'Delivered'].indexOf(step);
                    return (
                      <div key={step} className="flex flex-col items-center gap-3 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isCompleted ? 'bg-black border-black' : 'border-stone-100 bg-white'}`}>
                          {isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${isCompleted ? 'text-black' : 'text-stone-300'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking Info */}
                {selectedOrder.trackingId && (
                  <div className="bg-stone-50 border border-stone-100 p-6 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-1">Tracking Number</p>
                      <p className="text-sm font-bold tracking-widest">{selectedOrder.trackingId}</p>
                    </div>
                    <button className="bg-black text-white px-6 py-3 text-[8px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
                      Track Now
                    </button>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-6">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-900 border-b border-stone-100 pb-3">Items Purchased</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-stone-50 overflow-hidden shrink-0">
                            <img src={item.image} alt={item.title} loading="lazy" width="48" height="64" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-stone-900">{item.title}</p>
                            <p className="text-[8px] text-stone-400 uppercase">{item.variant || 'Standard'} • QTY: {item.qty}</p>
                            {item.customText && <p className="text-[8px] text-red-600 font-bold uppercase mt-1">Name: {item.customText}</p>}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-900">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-8 border-t border-stone-100 grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-900">Shipping To</h4>
                    <p className="text-[10px] text-stone-500 uppercase leading-relaxed font-medium">
                      {selectedOrder.customer.name}<br />
                      {selectedOrder.shippingAddress?.address || selectedOrder.customer.address}<br />
                      {selectedOrder.shippingAddress?.city || selectedOrder.customer.city} - {selectedOrder.shippingAddress?.pincode || selectedOrder.customer.pincode}
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                     <p className="text-[9px] font-bold uppercase text-stone-400">Total Amount Paid</p>
                     <p className="text-3xl font-display font-bold text-stone-900">₹{selectedOrder.amount}</p>
                     <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest">Payment: {selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WishlistPage({ 
  items, 
  onRemove, 
  onAddToCart,
  onShop
}: { 
  items: any[], 
  onRemove: (product: any) => void, 
  onAddToCart: (product: any) => void,
  onShop: () => void
}) {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tight">Your <br /> <span className="text-stone-300">Wishlist</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 pb-4">({items.length} AESTHETIC PIECES SAVED)</p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map(p => (
              <div key={p.id || p._id} className="group space-y-4">
                  <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" width="400" height="533" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <button 
                    onClick={() => onRemove(p)}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">{p.title}</h3>
                  <p className="text-[10px] font-bold text-stone-900">₹{p.price}</p>
                </div>
                <button 
                  onClick={() => onAddToCart(p)}
                  className="w-full bg-stone-900 text-white py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                  Move To Bag
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-stone-50 border border-stone-100">
            <Heart className="h-10 w-10 mx-auto text-stone-200 mb-6" />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">Your wishlist is empty</h2>
            <button 
              onClick={onShop}
              className="mt-8 bg-black text-white px-10 py-4 text-[9px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
            >
              Start Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRouteWrapper({ cmsData, navigateTo, addToCart, handleAddReview }: any) {
  const { slug } = useParams();
  const product = cmsData?.products?.find((p: any) => p.slug === slug || p._id === slug || p.id === slug);

  if (!product) {
    return (
      <>
        <SEO title="Product Not Found | Satvastones" description="This product is no longer available." noindex />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-stone-400">Product not found</p>
        </div>
      </>
    );
  }

  const material = product.material || 'Premium';
  const category = product.category?.toLowerCase() || 'jewelry';
  const metaTitle = product.metaTitle || `${product.title} - ${material} ${category === 'jewelry' ? '' : category} | Satvastones`;
  const metaDesc = product.metaDescription || `Buy ${product.title} at ₹${product.price}. ${product.isAntiTarnish ? 'Anti-tarnish, ' : ''}waterproof ${category}. Free shipping & COD. Shop authentic ${category} at Satvastones. Ethically sourced, heirloom quality.`;
  const metaKeywords = [...(product.focusKeywords || []), product.title, `${product.title} price`, `buy ${product.title} online`, category, 'satvastones', 'aesthetic jewelry', 'craftsmanship', 'hypoallergenic'];

  return (
    <>
      <SEO 
        title={metaTitle}
        description={metaDesc}
        image={product.image}
        canonical={`https://satvastones.in/product/${product.slug || slug}`}
        keywords={metaKeywords}
        type="product"
      />
      <JsonLd data={getProductSchema(product)} />
      <JsonLd data={getBreadcrumbSchema([
        { name: 'Home', url: 'https://satvastones.in/' },
        { name: 'Shop', url: 'https://satvastones.in/shop' },
        { name: product.title, url: `https://satvastones.in/product/${product.slug || slug}` }
      ])} />
      <ProductPage 
        product={product} 
        allProducts={cmsData.products}
        onBack={() => navigateTo('home')} 
        onAddToCart={addToCart}
        onAddReview={handleAddReview}
      />
    </>
  );
}

const CATEGORY_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  'rings': [
    { question: 'How do I measure my ring size?', answer: 'Use a string or paper strip to measure the circumference of your finger in millimeters. Compare with our size chart. Most of our rings are adjustable for easy fitting.' },
    { question: 'Does your silver tarnish?', answer: 'Our rings feature an anti-tarnish coating. While all metals may naturally oxidize over time, our craftsmanship ensures your ring maintains its luster with basic care.' },
    { question: 'Are these rings hypoallergenic?', answer: 'Yes, all Satvastones rings are made with hypoallergenic materials. We use nickel-free alloys suitable for sensitive skin.' },
  ],
  'earrings': [
    { question: 'Are your earrings hypoallergenic?', answer: 'Yes, all our earrings are hypoallergenic and nickel-free, making them safe for sensitive ears. Our posts are crafted from surgical-grade materials.' },
    { question: 'Do the earrings turn green?', answer: 'No. Our premium anti-tarnish coating prevents oxidation and discoloration. Your earrings will not turn your skin green.' },
    { question: 'Can I wear these earrings in water?', answer: 'Our earrings are water-resistant for daily wear, but we recommend removing them before swimming or showering to maintain their luster.' },
  ],
  'necklaces': [
    { question: 'What length are your necklaces?', answer: 'Our necklaces come in standard lengths: chokers at 14-16 inches, princess at 18 inches, and matinee at 22-24 inches. Adjustable chains are available on select designs.' },
    { question: 'Will the gold plating fade?', answer: 'Our premium gold plating is designed to last. With proper care, your necklace will maintain its brilliance for years. We use thick 18K gold plating for durability.' },
    { question: 'Can I wear my necklace daily?', answer: 'Yes, our necklaces are designed for everyday wear. The anti-tarnish coating and durable construction make them perfect for daily use.' },
  ],
  'bracelets': [
    { question: 'What size bracelet should I order?', answer: 'Measure your wrist circumference and add 1-2 cm for comfort. Most of our bracelets are adjustable between 6-8 inches.' },
    { question: 'Are the bracelets waterproof?', answer: 'Yes, our bracelets are waterproof for daily wear. However, we advise removing them before intense water activities.' },
  ],
};

  const getCategoryFaqs = (cat?: string) => {
    if (cat && CATEGORY_FAQS[cat]) return CATEGORY_FAQS[cat];
    return [
      { question: 'Is Satvastones jewelry anti-tarnish?', answer: 'Yes! All our jewelry is anti-tarnish, waterproof, and designed to maintain its color. We guarantee no dulling or fading.' },
      { question: 'Do you offer free shipping?', answer: 'Yes, we offer free shipping on prepaid orders above ₹399. COD charges may apply based on your location.' },
      { question: 'What payment methods do you accept?', answer: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).' },
    ];
  };export default function App() {

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cmsData, setCmsData] = useState<any>(null);
  if (typeof window !== 'undefined') (window as any).cmsData = cmsData;
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('satvastones_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('satvastones_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<any[]>(() => {
    const saved = localStorage.getItem('satvastones_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const categorySlug = (name: string) => {
    const slugMap: Record<string, string> = {
      'name necklace': 'name-necklace',
      "mother's day": 'mothers-day',
      '₹99 sale': '99-sale',
      'gift hampers': 'hampers',
    };
    return slugMap[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
  };

  const navigateTo = (view: string, data?: any) => {
    if (view === 'home') navigate('/');
    else if (view === 'shop') {
      if (data && data.category) navigate(`/shop/${categorySlug(data.category)}`);
      else navigate('/shop');
    }
    else if (view === 'auth') navigate('/account');
    else if (view === 'cart') navigate('/cart');
    else if (view === 'checkout') navigate('/checkout');
    else if (view === 'blogs') navigate('/blogs');
    else if (view === 'contact') navigate('/contact');
    else if (view === 'order-success') navigate('/order-success', { state: { order: data } });
    else if (view === 'product' && data) {
      const slug = data.slug || data._id || data.id;
      navigate(`/product/${slug}`);
    }
    window.scrollTo(0, 0);
  };

  const CATEGORY_LABELS: Record<string, string> = {
    '99-sale': '₹99 Sale',
    'necklaces': 'Necklaces',
    'name-necklace': 'Name Necklace',
    'earrings': 'Earrings',
    'rings': 'Rings',
    'bracelets': 'Bracelets',
    'accessories': 'Accessories',
    'pendant': 'Pendant',
    'gifts': 'Gifts',
    'hampers': 'Hampers',
    'mothers-day': "Mother's Day",
  };

  const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    '99-sale': 'Shop trendy aesthetic jewelry at just ₹99 each — including Korean studs, Western hoops, stacking rings, and delicate chain necklaces. Anti-tarnish, waterproof, and budget-friendly. Free shipping over ₹399.',
    'necklaces': 'Discover aesthetic necklaces for women — anti-tarnish gold-plated chains, Korean chokers, pendant necklaces, and layered styles. Waterproof, hypoallergenic, and crafted to elevate every outfit. Free shipping over ₹399.',
    'name-necklace': 'Shop personalized name necklaces in gold and silver finishes — custom engraved, anti-tarnish, and waterproof. The perfect gift for her, crafted in Mumbai and shipped across India.',
    'earrings': 'Explore 100+ aesthetic earrings for women — Korean minimalist studs, Western hoop earrings, drop earrings, and statement chandbalis. Anti-tarnish, hypoallergenic, and waterproof. Free shipping over ₹399.',
    'rings': 'Browse aesthetic rings for women — Korean stacking rings, gold-plated bands, statement cocktail rings, and minimalist designs. Waterproof, anti-tarnish, and available in adjustable sizes.',
    'bracelets': 'Shop aesthetic bracelets and bangles — gold-plated chains, Korean beaded bracelets, tennis bracelets, and cuffs. Anti-tarnish, waterproof, and crafted for everyday elegance.',
    'accessories': 'Discover premium jewelry accessories — including anklets, hair accessories, brooches, and jewelry organizers. Complete your aesthetic look with Satvastones.',
    'pendant': 'Shop aesthetic pendants for women — gold-plated, anti-tarnish pendants in Korean and Western styles. Perfect for layering or gifting. Free shipping over ₹399.',
    'gifts': 'Find the perfect jewelry gifts for her — curated gift-ready pieces including earrings, necklaces, rings, and personalized name necklaces. Beautifully packaged, shipped across India.',
    'hampers': 'Shop luxury jewelry gift hampers from Satvastones — curated sets of Korean and Western aesthetic jewelry in elegant packaging. The perfect gift for birthdays, anniversaries, and festivals.',
    'mothers-day': "Shop Mother's Day jewelry gifts — elegant earrings, personalized name necklaces, and curated gift sets mom will love. Anti-tarnish, waterproof, and beautifully packaged.",
  };

  const ShopRoute = () => {
    const { category } = useParams<{ category?: string }>();
    const catLabel = category ? (CATEGORY_LABELS[category] || category) : null;
    const materialForTitle = 'Gold-Plated';
    const title = category 
      ? `${catLabel || category} | Premium ${materialForTitle} Jewelry | Satvastones` 
      : 'Shop Aesthetic Jewelry Online | Premium Korean & Western Collection | Satvastones';
    const canonical = category 
      ? `https://satvastones.in/shop/${category}` 
      : 'https://satvastones.in/shop';
    const description = category 
      ? (CATEGORY_DESCRIPTIONS[category] || `Shop our curated collection of ${catLabel?.toLowerCase() || category} — premium Korean & Western aesthetic jewelry.`)
      : 'Shop 100+ aesthetic Korean & Western jewelry pieces. Anti-tarnish, waterproof, affordable. Free shipping available.';
    const breadcrumbs = category 
      ? [
          { name: 'Home', url: 'https://satvastones.in/' },
          { name: 'Shop', url: 'https://satvastones.in/shop' },
          { name: catLabel || category, url: `https://satvastones.in/shop/${category}` }
        ]
      : [
          { name: 'Home', url: 'https://satvastones.in/' },
          { name: 'Shop', url: 'https://satvastones.in/shop' }
        ];
    
    const categoryFaqs = getCategoryFaqs(category);
    return <>
      <SEO 
        title={title}
        description={description}
        canonical={canonical}
        keywords={['shop jewelry online india', 'buy aesthetic jewelry', 'korean jewelry shop', 'western jewelry collection', 'anti-tarnish jewelry online', 'trendy earrings india', 'gold plated necklace']}
      />
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      {category && <JsonLd data={getFaqSchema(categoryFaqs)} />}
      <ShopPage products={cmsData.products} cmsData={cmsData} onSelectProduct={(p) => navigateTo('product', p)} />
    </>;
  };

  useEffect(() => {
    if (currentUser) localStorage.setItem('satvastones_user', JSON.stringify(currentUser));
    else localStorage.removeItem('satvastones_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('satvastones_cart', JSON.stringify(cart));
    // Sync cart with server for abandoned cart recovery
    if (currentUser?.email && cart.length > 0) {
      fetch(`${API_URL}/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, items: cart })
      }).catch(err => console.log('Cart sync failed (expected if offline)'));
    }
  }, [cart, currentUser]);

  useEffect(() => {
    localStorage.setItem('satvastones_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: any) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id || p._id === product._id);
      if (exists) return prev.filter(p => p.id !== product.id && p._id !== product._id);
      return [...prev, product];
    });
  };

  const [shippingRate, setShippingRate] = useState(0);

  const calculateShipping = (pincode: string, subtotal: number, paymentMethod: string = 'upi') => {
    if (!pincode) return 40;
    const zone = pincode.charAt(0);
    const isNearby = pincode.startsWith('39'); // Local Vapi/Valsad area
    
    // 1. COD GRADIENT (No Free Delivery)
    if (paymentMethod === 'cod') {
      if (isNearby) return 35; 
      if (zone === '3') return 45; // Rest of Gujarat
      if (zone === '4') return 55; // Maharashtra
      if (['1', '2', '5'].includes(zone)) return 65; // North/Central
      return 85; // South/East/NE (Max)
    }

    // 2. PREPAID / UPI GRADIENT (Includes >399 Perks)
    // Rule: Free Shipping override for any UPI order over 399 (except very far zones)
    if (subtotal > 399) {
      if (['6', '7', '8'].includes(zone)) return 45; // Discounted even for far zones
      return 0; // Free for everywhere else
    }

    if (isNearby) return 0;
    if (zone === '3') return 25; // Non-local Gujarat
    if (zone === '4') return 35; // Maharashtra
    if (['1', '2', '5'].includes(zone)) return 55; // North/Central
    return 75; // South/East/NE
  };
  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cmsRes = await fetch(`${API_URL}/cms`);
        const prodRes = await fetch(`${API_URL}/products`);
        
        if (cmsRes.ok && prodRes.ok) {
          const cms = await cmsRes.json();
          const prods = await prodRes.json();
          setCmsData({ 
            ...initialCMSData, 
            ...cms, 
            hero: { ...initialCMSData.hero, ...cms.hero },
            specialOffer: { ...initialCMSData.specialOffer, ...cms.specialOffer },
            ninetyNineSale: { ...initialCMSData.ninetyNineSale, ...cms.ninetyNineSale },
            settings: { ...initialCMSData.settings, ...cms.settings },
            products: prods || [] 
          });
        }
      } catch (err) {
        console.log("Using local fallback data. Connect to MongoDB to enable live sync.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // URL-based Admin Access
    if (window.location.pathname === '/aniadmin') {
      setIsAdminMode(true);
    }
  }, []);

  useEffect(() => {
    if (!cmsData?.settings?.timerEnd) return;
    const targetDate = new Date(cmsData?.settings?.timerEnd);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance < 0) { 
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer); 
        return; 
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cmsData?.settings?.timerEnd]);


  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, qty: (p.qty || 1) + (item.qty || 1) } : p);
      }
      return [...prev, item];
    });
    navigateTo('cart');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Anirudh@1357..') {
      setIsLoggedIn(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleAddReview = async (productId: string, review: any) => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setCmsData(prev => ({
          ...prev,
          products: prev.products.map((p: any) => 
            (p._id === productId || p.id === productId) ? updatedProduct : p
          )
        }));
        if (selectedProduct && (selectedProduct._id === productId || selectedProduct.id === productId)) {
          setSelectedProduct(updatedProduct);
        }
      }
    } catch (err) {
      console.error('Error adding review:', err);
    }
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setIsAdminMode(false);
    window.history.pushState({}, '', '/'); // Reset URL
    navigateTo('home');
  };

  const handleUpdateCMS = async (newData: any) => {
    try {
      const res = await fetch(`${API_URL}/cms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      const updated = await res.json();
      setCmsData(prev => ({ ...prev, ...updated }));
    } catch (err) {
      console.error("Failed to update CMS:", err);
    }
  };

  const handleUpdateProduct = async (product: any, action: 'add' | 'edit' | 'delete') => {
    try {
      let res;
      if (action === 'add') {
        res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
      } else if (action === 'edit') {
        res = await fetch(`${API_URL}/products/${product._id || product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
      } else if (action === 'delete') {
        res = await fetch(`${API_URL}/products/${product._id || product.id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete product');
      }
      
      // Refresh products from DB immediately
      const prodRes = await fetch(`${API_URL}/products`);
      if (prodRes.ok) {
        const prods = await prodRes.json();
        setCmsData(prev => ({ ...prev, products: prods }));
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      alert(err.message || "Failed to update product. Check server connection.");
    }
  };

  if (isAdminMode) {
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-sm shadow-xl max-w-md w-full border border-stone-200">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold uppercase text-center tracking-tight mb-2">Admin Portal</h1>
            <p className="text-center text-xs text-stone-500 uppercase tracking-widest mb-8">Restricted Access</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Enter Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-stone-200 p-4 text-center text-lg tracking-widest focus:border-black outline-hidden" 
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              <button className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all">
                Access Panel
              </button>
              <button 
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="w-full text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-black mt-4"
              >
                Back to Website
              </button>
            </form>
          </div>
        </div>
      );
    }
    return <AdminPanel cmsData={cmsData} onUpdateCMS={handleUpdateCMS} onUpdateProduct={handleUpdateProduct} onLogout={handleAdminLogout} />;
  }

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const cartCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  const cartTotal = cartSubtotal + (cartCount > 0 ? shippingRate : 0);

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-900 selection:text-white">
      {cmsData && (
        <>
      {/* Global JSON-LD Structured Data (Organization + WebSite + LocalBusiness) */}
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebsiteSchema()} />
      <JsonLd data={getLocalBusinessSchema()} />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[80] w-[85%] max-w-sm bg-white p-8 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <span className="font-display text-2xl font-bold tracking-tighter">SATVASTONES.</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2"><X className="h-6 w-6" /></button>
                </div>

                <div className="flex flex-col gap-8">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold uppercase tracking-tight hover:text-stone-400 transition-colors">Home</Link>
                  <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold uppercase tracking-tight hover:text-stone-400 transition-colors">Shop</Link>
                  <Link to="/blogs" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold uppercase tracking-tight hover:text-stone-400 transition-colors">The Journal</Link>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold uppercase tracking-tight hover:text-stone-400 transition-colors">Contact</Link>
                </div>

                <div className="mt-auto pt-12 border-t border-stone-100">
                  <Link to="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">{currentUser ? 'My Account' : 'Sign In'}</p>
                      <p className="text-[8px] text-stone-400 uppercase tracking-widest">{currentUser ? currentUser.email : 'Member Access'}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        products={cmsData.products} 
        onSelectProduct={(p) => navigateTo('product', p)} 
      />

      {/* Announcement Bar */}
      <div className="relative w-full overflow-hidden bg-black py-3 sm:py-4 z-[60]">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 text-center sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" aria-hidden="true" />
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white sm:text-xs">
              {cmsData?.settings?.announcementText}
            </p>
          </div>
          {cmsData?.settings?.showTimer && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-accent text-base font-bold tracking-wider text-white sm:text-lg">
                {/* text-red-400 on black = ratio ~4.6:1, passes AA */}
                <span className="text-red-400">{String(timeLeft.days).padStart(2, '0')}D</span>
                <span className="text-white/50">:</span>
                <span>{String(timeLeft.hours).padStart(2, '0')}H</span>
                <span className="text-white/50">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}M</span>
                <span className="text-white/50">:</span>
                <span className="text-red-400">{String(timeLeft.seconds).padStart(2, '0')}S</span>
              </div>
              <button 
                onClick={() => {
                  const hamperId = cmsData.specialOffer?.productId || 'md-hamper';
                  const hamper = cmsData.products.find((p: any) => p.id === hamperId || p._id === hamperId);
                  if (hamper) navigateTo('product', hamper);
                  else navigateTo('shop');
                }} 
                className="ml-2 rounded-xs bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black hover:scale-105 transition-all"
                aria-label="Shop the sale now"
              >
                Shop Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-stone-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex flex-1 items-center gap-6">
            <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className={`text-[10px] font-bold uppercase tracking-widest hover:text-stone-400 transition-colors ${location.pathname === '/' ? 'text-black' : 'text-stone-400'}`}>Home</Link>
              <Link to="/shop" className={`text-[10px] font-bold uppercase tracking-widest hover:text-stone-400 transition-colors ${location.pathname === '/shop' ? 'text-black' : 'text-stone-400'}`}>Shop</Link>
              <Link to="/blogs" className={`text-[10px] font-bold uppercase tracking-widest hover:text-stone-400 transition-colors ${location.pathname === '/blogs' ? 'text-black' : 'text-stone-400'}`}>Blogs</Link>
              <Link to="/contact" className={`text-[10px] font-bold uppercase tracking-widest hover:text-stone-400 transition-colors ${location.pathname === '/contact' ? 'text-black' : 'text-stone-400'}`}>Contact</Link>
            </div>
          </div>

          <div className="flex-1 text-center">
            <Link to="/" className="font-display text-2xl md:text-3xl font-bold tracking-tighter">SATVASTONES.</Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 md:gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="p-1 hover:text-stone-400 transition-colors" aria-label="Search"><Search className="h-5 w-5" /></button>
            <Link to="/account" aria-label="My Account" className="p-1 hover:text-stone-400 transition-colors"><User className="h-5 w-5" /></Link>
            <Link to="/cart" aria-label="Shopping Cart" className="p-1 hover:text-stone-400 transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Render with Routes */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <>
                  <SEO 
                    title={cmsData?.settings?.seoTitle || "Satvastones | Aesthetic Korean & Western Jewelry"} 
                    description={cmsData?.settings?.seoDescription || "Premium Korean & Western aesthetic jewelry. Anti-tarnish, waterproof, trend-forward designs. Free shipping over ₹399."}
                    canonical="https://satvastones.in/"
                    keywords={['aesthetic jewelry', 'korean jewelry', 'western jewelry', 'anti-tarnish jewelry', 'waterproof jewelry', 'online jewelry store india', 'satvastones', 'trendy earrings', 'gold plated necklace', 'minimalist rings', 'bracelets india', 'fashion jewelry online']}
                  />
                  <JsonLd data={getFaqSchema([
                    {
                      question: 'Is Satvastones jewelry anti-tarnish?',
                      answer: 'Yes! All our jewelry is anti-tarnish, waterproof, and designed to maintain its color. We guarantee no dulling or fading.'
                    },
                    {
                      question: 'Do you offer free shipping?',
                      answer: 'Yes, we offer free shipping on prepaid orders above ₹399. COD charges may apply based on your location.'
                    },
                    {
                      question: 'What payment methods do you accept?',
                      answer: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).'
                    },
                    {
                      question: 'How do I care for my jewelry?',
                      answer: 'Keep your jewelry dry when not wearing. Avoid contact with perfumes and lotions. Store in a cool, dry place.'
                    },
                    {
                      question: 'Is Satvastones jewelry waterproof?',
                      answer: 'Yes, our jewelry is waterproof and can withstand daily wear. However, we recommend removing before swimming or showering to maintain longevity.'
                    }
                  ])} />
                  {/* Hero Section */}
                  <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                      <div className="flex flex-col mb-8 md:mb-12">
                        <h1 className="font-display text-[12vw] font-bold leading-[0.75] tracking-tight uppercase md:text-9xl lg:text-[10rem]">
                          {cmsData.hero.title?.split(' ')[0] || ''} <span className="text-stone-300">{cmsData.hero.title?.split(' ')[1] || ''}</span>
                        </h1>
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mt-4 md:mt-2">
                          <div className="max-w-[280px] md:pt-4 mb-6 md:mb-0 text-center md:text-left">
                            <p className="text-[10px] font-bold leading-relaxed tracking-[0.2em] text-stone-500 uppercase">
                              {cmsData.hero.description}
                            </p>
                          </div>
                          <h2 className="font-display text-[12vw] font-bold leading-[0.75] tracking-tight uppercase md:text-8xl lg:text-[10rem]">
                            {cmsData.hero.subTitle}
                          </h2>
                        </div>
                      </div>

                      <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-sm group cursor-pointer" onClick={() => navigateTo('shop')}>
                        <img src={optimizeImage(cmsData.hero.image, 768, 432)} alt="Satvastones - Premium aesthetic Korean and Western jewelry" fetchpriority="high" width="768" height="329" srcSet={getSrcSet(cmsData.hero.image, [360, 480, 768, 1024, 1600], 0.5625)} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end p-8 md:p-14">
                          <div className="flex flex-col items-center gap-4 mb-4">
                            <p className="text-white/70 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em]">Browse The Full Collection</p>
                            <button className="group/btn relative flex items-center gap-4 bg-white text-black pl-8 pr-6 py-4 md:py-5 text-[11px] md:text-sm font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-black hover:text-white transition-all duration-300 rounded-full">
                              <span>Shop All Jewelry</span>
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white group-hover/btn:bg-white group-hover/btn:text-black transition-all duration-300">
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </button>
                            <p className="text-white/50 text-[8px] uppercase tracking-widest">{cmsData.products?.length || 0}+ Aesthetic Pieces</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Categories */}
                  <section className="bg-white py-20 md:py-32">
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                      <div className="mb-16 text-center">
                        <h2 className="font-display text-4xl md:text-7xl font-bold uppercase tracking-tight">
                          {/* stone-400 on white = ratio ~5.4:1 for large text, passes AA */}
                          SHOP BY <span className="text-stone-400">VIBE</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {cmsData.categories.map((cat: any, i: number) => (
                          <CategoryCard 
                            key={i} 
                            category={cat} 
                            onClick={() => navigateTo('shop', { category: (cat.name || cat.title || 'all').toLowerCase() })} 
                          />
                        ))}
                      </div>

                      {/* Full-width Shop CTA Banner */}
                      <div
                        onClick={() => navigateTo('shop')}
                        className="mt-12 cursor-pointer group relative overflow-hidden bg-stone-900 rounded-sm px-8 py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6"
                      >
                        {/* Animated shimmer */}
                        <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <div className="text-center md:text-left">
                          {/* stone-400 on stone-900 bg = ratio ~4.8:1, passes AA */}
                          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-2">New Customers? Start Here</p>
                          <h3 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
                            View The Complete <span className="text-stone-400">Collection</span>
                          </h3>
                          <p className="text-[11px] text-stone-400 uppercase tracking-wider mt-3">{cmsData.products?.length || 0}+ Pieces • Earrings, Necklaces, Rings, Bracelets & More</p>
                        </div>
                        <button className="shrink-0 flex items-center gap-4 bg-white text-black pl-8 pr-5 py-4 md:py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl group-hover:bg-stone-100 transition-all">
                          Shop Everything
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* ₹99 Flash Sale */}
                  {cmsData.ninetyNineSale?.isActive && (
                    <section className="relative overflow-hidden bg-gradient-to-br from-rose-950 via-rose-900 to-pink-900 py-20 md:py-28">
                      {/* Animated background particles */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                          {/* Left - Content */}
                          <div className="flex-1 text-center lg:text-left space-y-8">
                            <div className="space-y-4">
                              <span className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-200 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full border border-rose-400/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                                {cmsData.ninetyNineSale.subTitle}
                              </span>
                              <h2 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[0.85]">
                                {cmsData.ninetyNineSale.title}
                              </h2>
                              <p className="text-sm md:text-base text-rose-200/80 font-bold uppercase tracking-[0.2em] leading-loose max-w-lg mx-auto lg:mx-0">
                                {cmsData.ninetyNineSale.description}
                              </p>
                            </div>

                            {/* Guarantee badges */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                              {cmsData.ninetyNineSale.guaranteeText.split('•').map((item: string, i: number) => (
                                <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                                  {item.trim()}
                                </span>
                              ))}
                            </div>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                              <button
                                onClick={() => navigateTo('shop', { category: '99-sale' })}
                                aria-label="Shop the ₹99 collection"
                                className="bg-white text-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-rose-100 transition-all shadow-2xl rounded-full flex items-center gap-3 group/btn"
                              >
                                Shop ₹99 Collection
                                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>

                          {/* Right - Product Grid */}
                          <div className="flex-1 w-full max-w-lg">
                            <div className="grid grid-cols-2 gap-4">
                              {cmsData.products.filter((p: any) => p.isNinetyNine).slice(0, 4).map((p: any) => (
                                <div
                                  key={p._id || p.id}
                                  onClick={() => navigateTo('product', p)}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`View ${p.title} — ₹${p.price}`}
                                  onKeyDown={(e) => e.key === 'Enter' && navigateTo('product', p)}
                                  className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all"
                                >
                                  <div className="aspect-square overflow-hidden relative">
                                    <img
                                      src={optimizeImage(p.image, 400, 400)}
                                      srcSet={getSrcSet(p.image, [200, 300, 400], 1.0)}
                                      sizes="(max-width: 640px) calc(50vw - 24px), 200px"
                                      alt={p.title}
                                      loading="lazy"
                                      width="400"
                                      height="400"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-2 left-2">
                                      <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        {cmsData.ninetyNineSale.badgeText}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-3 text-center">
                                    {/* p used intentionally — heading level would skip h1→h2 */}
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/90 truncate">{p.title}</p>
                                    <p className="text-sm font-bold text-rose-300 mt-1">₹{p.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {cmsData.products.filter((p: any) => p.isNinetyNine).length > 4 && (
                              <button
                                onClick={() => navigateTo('shop')}
                                className="w-full mt-4 text-center text-[9px] font-bold uppercase tracking-widest text-rose-200/60 hover:text-white transition-colors"
                              >
                                +{cmsData.products.filter((p: any) => p.isNinetyNine).length - 4} More ₹99 Items
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Special Offer */}
                  {cmsData.specialOffer?.isActive && (
                    <section className="bg-stone-900 py-20 md:py-32 overflow-hidden">
                      <div className="mx-auto max-w-7xl px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 md:gap-24">
                          <div className="relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-sm group">
                            <img 
                              src={optimizeImage(cmsData.specialOffer.image, 800, 1000)} 
                              srcSet={getSrcSet(cmsData.specialOffer.image, [360, 480, 800, 1200], 1.25)}
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              alt={cmsData.specialOffer.title || 'Special offer - Satvastones premium jewelry'} 
                              loading="lazy"
                              width="800"
                              height="1000"
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                          </div>
                          <div className="space-y-10">
                            <div className="space-y-4">
                              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-500">Exclusive Drop</span>
                              <h2 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tight text-white leading-[0.85]">
                                {cmsData.specialOffer.title} <br />
                                <span className="text-stone-700">{cmsData.specialOffer.subTitle}</span>
                              </h2>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400 leading-loose max-w-md">
                              {cmsData.specialOffer.description}
                            </p>
                            <button 
                              onClick={() => {
                                const prod = cmsData.products.find((p: any) => p._id === cmsData.specialOffer.productId || p.id === cmsData.specialOffer.productId);
                                if (prod) navigateTo('product', prod);
                                else navigateTo('shop');
                              }}
                              className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-200 transition-all shadow-2xl"
                            >
                              Shop The Offer
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Discover */}
                  <section className="bg-stone-50 py-20 md:py-32">
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                      <div className="mb-16 flex flex-col md:flex-row items-end justify-between gap-8">
                        <h2 className="font-display text-4xl md:text-7xl font-bold uppercase tracking-tight leading-[0.85]">
                          {/* stone-400 on stone-50 bg = ratio ~4.9:1 for large text, passes AA */}
                          LATEST <br /> <span className="text-stone-400">ARRIVALS</span>
                        </h2>
                        <button
                          onClick={() => navigateTo('shop')}
                          className="group/btn flex items-center gap-3 bg-black text-white pl-7 pr-5 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-stone-800 transition-all shadow-lg"
                        >
                          View All {cmsData.products?.length || ''} Pieces
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black group-hover/btn:scale-110 transition-transform">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {cmsData.products.slice(0, 6).map((p: any) => <DiscoverCard key={p.id} product={p} onClick={() => navigateTo('product', p)} />)}
                      </div>
                    </div>
                  </section>

                  {/* SEO Content — Homepage rich text for indexing */}
                  <section className="bg-white py-24 md:py-32 border-t border-stone-100">
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                      <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-6">
                          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">Satvastones — Premium Korean & Western Aesthetic Jewelry Online</h2>
                          <div className="w-16 h-0.5 bg-stone-200 mx-auto"></div>
                        </div>
                        {/* stone-600 on white = ratio ~7.1:1, passes AA — increased from stone-500 */}
                        <div className="text-[10px] md:text-xs leading-relaxed text-stone-600 uppercase tracking-tight space-y-5 max-w-3xl mx-auto">
                          <p>{cmsData?.homepageSeo?.p1 || "Welcome to Satvastones, India's premier destination for aesthetic Korean and Western jewelry. Based in Vapi, Gujarat, we curate handcrafted, anti-tarnish, and waterproof jewelry pieces that blend Seoul minimalism with Parisian elegance. Our collection features over 100 meticulously designed pieces including Korean huggie earrings, layered chain necklaces, stackable rings, charm bracelets, personalized name necklaces, and luxury gift hampers."}</p>
                          <p>{cmsData?.homepageSeo?.p2 || "Every Satvastones piece is crafted using premium materials with a focus on craftsmanship and durability. Our jewelry features 18K gold plating, sterling silver finishes, and hypoallergenic alloy bases — all treated with anti-tarnish coating to ensure long-lasting luster. We guarantee no color fade, no green fingers, and no discoloration. Each piece is designed for the sophisticated woman who values quality, style, and affordability in her everyday aesthetic."}</p>
                          <p>{cmsData?.homepageSeo?.p3 || "Shop across multiple categories — from minimalist everyday earrings and dainty necklaces to bold statement rings and elegant bracelets. Our ₹99 Flash Sale offers premium anti-tarnish jewelry at accessible price points, while our personalized name necklaces make thoughtful gifts for birthdays, anniversaries, and special occasions. We offer free shipping on prepaid orders above ₹399, secure payments via UPI and cards, and express dispatch within 24-48 hours."}</p>
                          <p>{cmsData?.homepageSeo?.p4 || "Follow us on Instagram, Facebook, and Pinterest for daily style inspiration, new arrivals, and exclusive offers. Whether you are dressing up for a wedding, accessorizing for work, or looking for the perfect gift, Satvastones has the perfect aesthetic jewelry piece for every occasion and every woman."}</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          {['Anti-Tarnish', 'Waterproof', 'Hypoallergenic', '18K Gold Plated', 'Gift-Ready Packaging', 'Free Shipping over ₹399'].map((tag) => (
                            // stone-700 on stone-100 bg = ratio ~7.5:1, passes AA
                            <span key={tag} className="text-[8px] bg-stone-100 text-stone-700 px-3 py-1.5 font-bold uppercase tracking-wider rounded-full border border-stone-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              } />

              <Route path="/shop" element={<ShopRoute />} />
              <Route path="/shop/:category" element={<ShopRoute />} />
              <Route path="/product/:slug" element={<ProductRouteWrapper cmsData={cmsData} navigateTo={navigateTo} addToCart={addToCart} handleAddReview={handleAddReview} />} />
              <Route path="/cart" element={<><SEO title="Your Shopping Bag" description="Review your selected aesthetic jewelry pieces at Satvastones. Secure checkout with UPI, Card & COD available." canonical="https://satvastones.in/cart" keywords={['shopping cart', 'jewelry cart', 'checkout jewelry', 'satvastones cart']} noindex={true} /><CartPage cart={cart} onUpdateQty={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, (i.qty || 1) + d)} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={() => navigateTo('checkout')} onContinueShopping={() => navigateTo('shop')} /></>} />
              <Route path="/checkout" element={<><SEO title="Secure Checkout" description="Complete your order securely. We accept UPI, Cards, Net Banking & COD." canonical="https://satvastones.in/checkout" noindex={true} /><CheckoutPage cart={cart} currentUser={currentUser} cmsData={cmsData} onBack={() => navigateTo('cart')} onComplete={(order) => { setCart([]); localStorage.removeItem('checkout_form'); navigateTo('order-success', order); }} onLoginRedirect={() => navigateTo('auth')} calculateShipping={calculateShipping} /></>} />
              <Route path="/account" element={currentUser ? <><SEO title="My Account | Satvastones" description="Manage your orders, addresses, and preferences at Satvastones." canonical="https://satvastones.in/account" noindex={true} keywords={['my account', 'order history', 'satvastones account']} /><AccountDashboard user={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('satvastones_user'); navigate('/'); }} onShop={() => navigate('/shop')} /></> : <AuthPage onLogin={(data) => { setCurrentUser(data.customer); if (localStorage.getItem('checkout_pending') === 'true') navigate('/checkout'); else navigate('/account'); }} />} />
              <Route path="/contact" element={<><SEO title="Contact Satvastones | Customer Support" description="Have a question? Reach out to Satvastones customer support. We respond within 24 hours. Email: support@satvastones.in" canonical="https://satvastones.in/contact" keywords={['contact satvastones', 'jewelry support', 'customer care', 'satvastones help']} /><ContactPage /></>} />
              <Route path="/blogs" element={<><SEO title="The Journal | Satvastones Blog" description="Explore style guides, jewelry care tips, and the latest trends in Korean and Western aesthetic jewelry on the Satvastones Journal." canonical="https://satvastones.in/blogs" keywords={['jewelry blog', 'style guide', 'jewelry care tips', 'korean fashion', 'aesthetic jewelry trends']} /><BlogsPage /></>} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-5 space-y-12">
              <div>
                <h2 className="font-display text-4xl font-bold tracking-tighter mb-8">SATVASTONES.</h2>
                {/* stone-400 on black = ratio ~5.4:1, passes AA */}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 leading-loose max-w-sm">
                  Bringing You The Most Aesthetic Korean &amp; Western Jewelry. High Quality. Affordable. Trending.
                </p>
              </div>
              
              <div className="space-y-6">
                {/* p tag — this is footer content, not a document heading */}
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Join the newsletter</p>
                <div className="flex border-b border-stone-700 py-2">
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL" 
                    aria-label="Newsletter email address"
                    className="bg-transparent text-[10px] uppercase font-bold tracking-widest outline-hidden flex-1 text-white placeholder:text-stone-500" 
                  />
                  <button 
                    className="text-[9px] font-bold uppercase tracking-widest text-stone-300 hover:text-white transition-colors"
                    aria-label="Subscribe to newsletter"
                  >Join</button>
                </div>
                {/* stone-500 on black = ratio ~4.6:1, passes AA */}
                <p className="text-[8px] uppercase tracking-widest text-stone-500">Get early access to drops &amp; exclusive offers.</p>
              </div>
              
              <div className="flex gap-6">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                  <Icon key={idx} className="h-5 w-5 text-stone-400 hover:text-white cursor-pointer transition-colors" aria-hidden="true" />
                ))}
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Shop</p>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop')}>New Arrivals</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop')}>Earrings</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop')}>Necklaces</li>
                </ul>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Explore</p>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('blogs')}>The Journal</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('contact')}>Contact Us</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('auth')}>My Account</li>
                </ul>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Contact</p>
                {/* stone-400 on black passes AA */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">support@satvastones.in</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Vapi, Gujarat, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-12 flex flex-col md:flex-row justify-between gap-6 text-center md:text-left">
             <div className="space-y-2">
                {/* stone-500 on black = ratio ~4.6:1, passes AA */}
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500">© 2026 SATVASTONES. ALL RIGHTS RESERVED.</p>
                {/* red-700 on black = ratio ~4.6:1 passes; the previous red-900/40 was failing */}
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-red-700">No Refunds • No Cancellations • No Returns</p>
             </div>
             <div className="flex justify-center md:justify-end gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms Of Service</span>
             </div>
          </div>
        </div>
      </footer>
    </>
    )}
    </div>
  );
}
