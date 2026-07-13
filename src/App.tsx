import { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, User, ArrowLeft, ArrowRight, ChevronRight, 
  Menu, X, Heart, Shield, Trash2, Home, LayoutGrid
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
import ExitIntentPopup from './components/ExitIntentPopup';
import OrderSuccessPage from './components/OrderSuccessPage';
import { optimizeImage } from './utils/cloudinary';
import { analytics } from './utils/analytics';
import NewHeroBanner from './components/home/NewHeroBanner';
import NewCategoryShowcase from './components/home/NewCategoryShowcase';
import ProductSection from './components/home/ProductSection';
import ShopByTrend from './components/home/ShopByTrend';
import CustomerReviews from './components/home/CustomerReviews';
import ConnectWithUs from './components/home/ConnectWithUs';
import FaqSection from './components/home/FaqSection';
import SaleSection from './components/home/SaleSection';
import NewFooter from './components/home/NewFooter';
import WishlistPage from './components/WishlistPage';
import ShippingPolicy from './components/policies/ShippingPolicy';
import ReturnExchange from './components/policies/ReturnExchange';
import TermsConditions from './components/policies/TermsConditions';
import RefundPolicy from './components/policies/RefundPolicy';
import PrivacyPolicy from './components/policies/PrivacyPolicy';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// EMPTY INITIAL DATA (Everything flows from DB)
const initialCMSData = {
  hero: { title: '', subTitle: '', description: '', image: '' },
  categories: [],
  specialOffer: { title: '', subTitle: '', description: '', image: '', isActive: false },
  ninetyNineSale: { isActive: false, title: '₹99 Flash Sale', subTitle: 'Limited Stock Deal', description: 'Grab your favorite anti-tarnish jewelry at just ₹99 each!', bannerImage: '', guaranteeText: 'Anti-Tarnish • Waterproof • No Color Fade • 100% Guaranteed', badgeText: '₹99 Only' },
  products: [],
  settings: { announcementText: '', showTimer: false, timerEnd: '' },
  coupons: []
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
    <div className="min-h-screen bg-stone-50 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
          <p className="text-sm text-stone-500 mt-1">Manage your orders and account settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Profile Card */}
          <div className="w-full lg:w-80 space-y-4">
            <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f2707f] to-[#d4535f] rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {user.name?.[0] || 'U'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-stone-900 truncate">{user.name}</h2>
                  <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-stone-900">{orders.length}</p>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-stone-900">₹{orders.reduce((acc, o) => acc + (o.amount || 0), 0).toLocaleString()}</p>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider">Spent</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">Active</p>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider">Status</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
              <button onClick={() => onShop()} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-stone-50 transition-colors rounded-t-xl">
                <ShoppingBag className="h-4 w-4 text-stone-400" />
                <span className="text-[11px] font-medium text-stone-700">Continue Shopping</span>
              </button>
              <Link to="/wishlist" className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-stone-50 transition-colors">
                <Heart className="h-4 w-4 text-stone-400" />
                <span className="text-[11px] font-medium text-stone-700">My Wishlist</span>
              </Link>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-red-50 transition-colors rounded-b-xl">
                <X className="h-4 w-4 text-red-400" />
                <span className="text-[11px] font-medium text-red-500">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Activity Section */}
          <div className="flex-1 space-y-6 w-full">
            {/* Orders */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900">Order History</h3>
              </div>
              <div className="divide-y divide-stone-50">
                {loading ? (
                  <div className="p-12 text-center text-[10px] uppercase tracking-widest text-stone-400 animate-pulse">Loading orders...</div>
                ) : orders.length > 0 ? (
                  orders.map(order => (
                    <div 
                      key={order._id} 
                      onClick={() => setSelectedOrder(order)}
                      className="px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-stone-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-stone-800">Order #{order.orderNumber || order._id?.slice(-6)}</p>
                          <p className="text-[9px] text-stone-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-stone-900">₹{order.amount}</p>
                          <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                            order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                            'bg-stone-100 text-stone-500'
                          }`}>
                            {order.status || 'Received'}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-stone-300" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <ShoppingBag className="h-10 w-10 mx-auto text-stone-200 mb-3" />
                    <p className="text-sm font-medium text-stone-500 mb-3">No orders yet</p>
                    <button 
                      onClick={onShop}
                      className="bg-[#f2707f] text-white px-6 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#d4535f] transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
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
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Order Details</h3>
                  <p className="text-[10px] text-stone-400">#{selectedOrder.orderNumber || selectedOrder._id?.slice(-6)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-black p-1"><X className="h-5 w-5" /></button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5 no-scrollbar">
                {/* Status Stepper */}
                <div className="flex justify-between items-center px-2 relative">
                  <div className="absolute top-3 left-0 right-0 h-[2px] bg-stone-100 -z-10" />
                  {['Confirmed', 'Shipped', 'Delivered'].map((step) => {
                    const isCompleted = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(selectedOrder.status) >= ['Confirmed', 'Shipped', 'Delivered'].indexOf(step);
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 bg-white px-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-[#f2707f] text-white' : 'bg-stone-100 text-stone-300'}`}>
                          {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : <span className="w-2 h-2 bg-current rounded-full" />}
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${isCompleted ? 'text-[#f2707f]' : 'text-stone-300'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking */}
                {selectedOrder.trackingId && (
                  <div className="bg-stone-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase">Tracking ID</p>
                      <p className="text-xs font-bold text-stone-800">{selectedOrder.trackingId}</p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-stone-500 mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-stone-800 truncate">{item.title}</p>
                          <p className="text-[9px] text-stone-400">{item.variant || 'Standard'} × {item.qty}</p>
                          {item.customText && <p className="text-[9px] text-[#f2707f] font-bold">Name: {item.customText}</p>}
                        </div>
                        <span className="text-[11px] font-bold text-stone-900 shrink-0">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-stone-100 pt-4 space-y-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-500">Shipping To</span>
                    <span className="text-stone-800 font-medium text-right max-w-[60%]">{selectedOrder.customer?.name}, {selectedOrder.shippingAddress?.city || selectedOrder.customer?.city}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-500">Payment</span>
                    <span className={`font-bold uppercase ${selectedOrder.paymentMethod === 'COD' ? 'text-orange-600' : 'text-green-600'}`}>{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-stone-100 pt-3">
                    <span className="text-stone-900">Total</span>
                    <span className="text-stone-900">₹{selectedOrder.amount}</span>
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

function ProductRouteWrapper({ cmsData, navigateTo, addToCart, handleAddReview, wishlist, toggleWishlist }: any) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = cmsData?.products?.find((p: any) => p.slug === slug || p._id === slug || p.id === slug);

  useEffect(() => {
    if (product) analytics.trackCustom('view_product', { productId: product._id || product.id, title: product.title, price: product.price, category: product.category });
  }, [product?._id]);

  useEffect(() => {
    if (product?.slug && slug !== product.slug) {
      navigate(`/product/${product.slug}`, { replace: true });
    }
  }, [product, slug, navigate]);

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
        isWishlisted={wishlist?.some((w: any) => (w._id || w.id) === (product._id || product.id))}
        onToggleWishlist={() => toggleWishlist(product)}
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
  const [homepageData, setHomepageData] = useState<any>(null);

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
    const location = useLocation();
    const hasFacetParams = ['style', 'material', 'maxPrice', 'minPrice', 'sort', 'color'].some(p => new URLSearchParams(location.search).has(p));
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
        noindex={hasFacetParams}
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
    
    // COD GRADIENT (₹40–₹95, No Free Delivery)
    if (paymentMethod === 'cod') {
      if (isNearby) return 40;
      if (zone === '3') return 50; // Rest of Gujarat
      if (zone === '4') return 65; // Maharashtra
      if (['1', '2', '5'].includes(zone)) return 80; // North/Central
      return 95; // South/East/NE (Max)
    }

    // PREPAID / UPI GRADIENT (₹20–₹75, Free above ₹399)
    if (subtotal > 399) {
      if (['6', '7', '8'].includes(zone)) return 45; // Discounted for far zones
      return 0; // Free for everywhere else
    }

    if (isNearby) return 20;
    if (zone === '3') return 30; // Non-local Gujarat
    if (zone === '4') return 45; // Maharashtra
    if (['1', '2', '5'].includes(zone)) return 60; // North/Central
    return 75; // South/East/NE
  };
  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cmsRes = await fetch(`${API_URL}/cms`);
        const prodRes = await fetch(`${API_URL}/products`);
        const homepageRes = await fetch(`${API_URL}/homepage`);
        
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
        
        if (homepageRes.ok) {
          const homepage = await homepageRes.json();
          setHomepageData(homepage);
        }
      } catch (err) {
        console.log("Using local fallback data. Connect to MongoDB to enable live sync.");
      }
    };
    fetchData();
  }, []);

  // Initialize analytics tracking
  useEffect(() => {
    analytics.init();
    return () => analytics.destroy();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (window.location.pathname !== '/aniadmin') {
      setTimeout(() => analytics.trackPageView(), 300);
    }
  }, [location.pathname]);

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
      const baseId = item._id || item.id;
      const key = `${baseId}|${item.variant || ''}|${item.customText || ''}`;
      const existing = prev.find(p => `${p._id || p.id}|${p.variant || ''}|${p.customText || ''}` === key);
      analytics.trackCustom('add_to_cart', { productId: baseId, title: item.title, price: item.price, variant: item.variant });
      if (existing) {
        return prev.map(p => `${p._id || p.id}|${p.variant || ''}|${p.customText || ''}` === key
          ? { ...p, qty: (p.qty || 1) + (item.qty || 1) }
          : p);
      }
      return [...prev, { ...item, id: baseId, _id: item._id, qty: item.qty || 1 }];
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
      // Strip products (managed separately via /api/products, not part of the CMS document)
      const { products, ...cmsPayload } = newData || {};
      const res = await fetch(`${API_URL}/cms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsPayload)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Save failed (${res.status})`);
      }
      const updated = await res.json();
      setCmsData(prev => ({ ...prev, ...updated }));
    } catch (err) {
      console.error("Failed to update CMS:", err);
      throw err;
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


      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        products={cmsData.products} 
        onSelectProduct={(p) => navigateTo('product', p)} 
      />

      <ExitIntentPopup />

      {/* Announcement Bar - Scrolling marquee */}
      <div className="w-full bg-[#d4535f] overflow-hidden py-2 sm:py-2.5 z-[60]">
        <div className="announcement-scroll">
          {[...Array(2)].map((_, i) => {
            const rawText = cmsData?.settings?.announcementText || 'Free Shipping Above INR 599 | Free Gift On Order Above INR 699 | COD Available | Easy Return | Summer Sale Is Live - Upto 70% Off';
            const items = rawText.split('|').map((s: string) => s.trim()).filter(Boolean);
            return (
              <span key={i} className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                {items.map((item: string, j: number) => (
                  <span key={j} className="flex items-center gap-2 sm:gap-3">
                    <span>{item}</span>
                    {j < items.length - 1 && <span className="w-1 h-1 rounded-full bg-white/70" />}
                  </span>
                ))}
                <span className="w-1 h-1 rounded-full bg-white/70 mr-2 sm:mr-3" />
              </span>
            );
          })}
        </div>
      </div>

      {/* Navigation - Pink Navbar */}
      <nav className="sticky top-0 bg-[#f2707f] z-50 shadow-sm">
        {/* Main Nav Row */}
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-10 py-4 sm:py-5 md:py-6">
          {/* Left: Hamburger (mobile) */}
          <button 
            className="md:hidden p-1 text-white" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Left: Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link to="/shop" className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:text-white/80 transition-colors">
              Shop
            </Link>
            <Link to="/shop?sale=true" className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:text-white/80 transition-colors">
              Hot Deals
            </Link>
            <Link to="/contact" className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:text-white/80 transition-colors">
              Contact
            </Link>
          </div>

          {/* Center: Logo + Brand Name */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="flex items-center gap-2">
              {cmsData?.settings?.useLogo && cmsData?.settings?.logoUrl && (
                <img 
                  src={cmsData.settings.logoUrl} 
                  alt="Satvastones" 
                  className="h-7 sm:h-8 md:h-10 w-auto object-contain brightness-0 invert"
                />
              )}
              <span className="font-logo text-xl sm:text-2xl md:text-3xl text-white tracking-wider italic">
                {cmsData?.settings?.brandName || 'Satvastones'}
              </span>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            <button onClick={() => setIsSearchOpen(true)} className="p-1 text-white hover:text-white/80 transition-colors" aria-label="Search">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5" />
            </button>
            <Link to="/account" aria-label="My Account" className="p-1 text-white hover:text-white/80 transition-colors hidden sm:block">
              <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5" />
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="p-1 text-white hover:text-white/80 transition-colors relative">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 sm:-right-1.5 bg-white text-[#d4535f] text-[7px] font-bold w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" aria-label="Shopping Cart" className="p-1 text-white hover:text-white/80 transition-colors relative">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-right-1.5 bg-white text-[#d4535f] text-[7px] font-bold w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[80] md:hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-pink-100 bg-[#f2707f]">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  {cmsData?.settings?.useLogo && cmsData?.settings?.logoUrl && (
                    <img src={cmsData.settings.logoUrl} alt="Satvastones" className="h-7 w-auto object-contain brightness-0 invert" />
                  )}
                  <span className="font-logo text-xl text-white tracking-wider italic">{cmsData?.settings?.brandName || 'Satvastones'}</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-1 text-white"><X className="h-6 w-6" /></button>
              </div>
              <div className="p-4 space-y-1">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Shop All', path: '/shop' },
                  { label: 'New Arrivals', path: '/shop' },
                  { label: 'Hot Deals', path: '/shop?sale=true' },
                  { label: 'Wishlist', path: '/wishlist' },
                  { label: 'Blogs', path: '/blogs' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Track Order', path: '/account' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2.5 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-700 hover:text-[#d4535f] hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                <Link to="/account" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#D44638] group-hover:text-white transition-all">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">{currentUser ? 'My Account' : 'Sign In'}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">{currentUser ? currentUser.email : 'Member Access'}</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

                  {/* Hero Banner - Full-width auto-carousel */}
                  <NewHeroBanner 
                    banners={homepageData?.banners || []} 
                    onBannerClick={(banner) => {
                      if (banner.linkUrl) {
                        navigateTo('shop', { category: banner.linkUrl });
                      } else if (banner.link) {
                        navigateTo('shop', { category: banner.link });
                      }
                    }}
                  />

                  {/* Category Showcase - Scrollable cards */}
                  <NewCategoryShowcase 
                    categories={cmsData?.categories || []} 
                    onCategoryClick={(cat) => navigateTo('shop', { category: cat })}
                  />

                  {/* Dynamic Product Sections from Admin */}
                  {homepageData?.sections?.map((section: any) => (
                    <ProductSection
                      section={section}
                      onProductClick={(p) => navigateTo('product', p)}
                      onViewAll={() => {
                        if (section.shopLink) {
                          navigateTo('shop', { category: section.shopLink });
                        } else {
                          navigateTo('shop');
                        }
                      }}
                      key={section._id}
                    />
                  ))}

                  {/* Shop By Trend */}
                  <ShopByTrend 
                    trends={homepageData?.trends || []}
                    onTrendClick={(t) => navigateTo('shop')}
                  />

                  {/* Sale Sections */}
                  {(homepageData?.sales || []).map((sale: any) => (
                    <SaleSection 
                      key={sale._id}
                      sale={sale}
                      onProductClick={(p) => navigateTo('product', p)}
                    />
                  ))}

                  {/* Customer Reviews */}
                  <CustomerReviews reviews={homepageData?.reviews || []} />

                  {/* Connect With Us */}
                  <ConnectWithUs />

                  {/* FAQ */}
                  <FaqSection faqs={homepageData?.faqs || []} />

                </>
              } />

              <Route path="/shop" element={<ShopRoute />} />
              <Route path="/shop/:category" element={<ShopRoute />} />
              <Route path="/product/:slug" element={<ProductRouteWrapper cmsData={cmsData} navigateTo={navigateTo} addToCart={addToCart} handleAddReview={handleAddReview} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
              <Route path="/wishlist" element={
                <WishlistPage 
                  wishlist={wishlist} 
                  onRemove={(id) => setWishlist(prev => prev.filter(i => (i._id || i.id) !== id))}
                  onAddToCart={(product) => { addToCart(product); setWishlist(prev => prev.filter(i => (i._id || i.id) !== (product._id || product.id))); }}
                  onProductClick={(p) => navigateTo('product', p)}
                />
              } />
              <Route path="/cart" element={<><SEO title="Your Shopping Bag" description="Review your selected aesthetic jewelry pieces at Satvastones. Secure checkout with UPI, Card & COD available." canonical="https://satvastones.in/cart" keywords={['shopping cart', 'jewelry cart', 'checkout jewelry', 'satvastones cart']} noindex={true} /><CartPage cart={cart} allProducts={cmsData.products || []} onUpdateQty={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, (i.qty || 1) + d)} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onAddToCart={addToCart} onCheckout={() => navigateTo('checkout')} onContinueShopping={() => navigateTo('shop')} /></>} />
              <Route path="/checkout" element={<><SEO title="Secure Checkout" description="Complete your order securely. We accept UPI, Cards, Net Banking & COD." canonical="https://satvastones.in/checkout" noindex={true} /><CheckoutPage cart={cart} currentUser={currentUser} cmsData={cmsData} onBack={() => navigateTo('cart')} onComplete={(order) => { setCart([]); localStorage.removeItem('checkout_form'); navigateTo('order-success', order); }} onLoginRedirect={() => navigateTo('auth')} calculateShipping={calculateShipping} /></>} />
              <Route path="/account" element={currentUser ? <><SEO title="My Account | Satvastones" description="Manage your orders, addresses, and preferences at Satvastones." canonical="https://satvastones.in/account" noindex={true} keywords={['my account', 'order history', 'satvastones account']} /><AccountDashboard user={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('satvastones_user'); navigate('/'); }} onShop={() => navigate('/shop')} /></> : <AuthPage onLogin={(data) => { setCurrentUser(data.customer); if (localStorage.getItem('checkout_pending') === 'true') navigate('/checkout'); else navigate('/account'); }} />} />
              <Route path="/contact" element={<><SEO title="Contact Satvastones | Customer Support" description="Have a question? Reach out to Satvastones customer support. We respond within 24 hours. Email: support@satvastones.in" canonical="https://satvastones.in/contact" keywords={['contact satvastones', 'jewelry support', 'customer care', 'satvastones help']} /><ContactPage /></>} />
              <Route path="/blogs" element={<><SEO title="The Journal | Satvastones Blog" description="Explore style guides, jewelry care tips, and the latest trends in Korean and Western aesthetic jewelry on the Satvastones Journal." canonical="https://satvastones.in/blogs" keywords={['jewelry blog', 'style guide', 'jewelry care tips', 'korean fashion', 'aesthetic jewelry trends']} /><BlogsPage /></>} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/returns" element={<ReturnExchange />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
        <div className="flex items-center justify-around py-1.5 px-2">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-500 hover:text-[#d4535f] transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium">Home</span>
          </Link>
          <Link to="/account" className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-500 hover:text-[#d4535f] transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium">Log in</span>
          </Link>
          <Link to="/shop" className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-500 hover:text-[#d4535f] transition-colors">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[9px] font-medium">Collections</span>
          </Link>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-500 hover:text-[#d4535f] transition-colors relative">
            <Heart className="w-5 h-5" />
            <span className="text-[9px] font-medium">Wishlist</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-500 hover:text-[#d4535f] transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-medium">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-1 bg-[#D44638] text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-14" />

      {/* Footer */}
      <NewFooter />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919016703180"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.374L1.054 31.25l6.118-1.98C9.76 31.022 12.792 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.318 22.594c-.39 1.1-1.932 2.014-3.15 2.28-.834.18-1.924.322-5.592-1.2-4.694-1.916-7.71-6.706-7.94-7.02-.224-.314-1.86-2.476-1.86-4.724 0-2.248 1.18-3.35 1.602-3.82.39-.434.938-.55 1.248-.55.31 0 .62.002.89.016.284.014.664-.106 1.034.788.39.956 1.332 3.24 1.448 3.478.116.238.234.564.078.878-.146.33-.3.48-.556.742-.256.262-.504.464-.762.746-.236.256-.496.53-.21.976.286.446 1.272 2.096 2.73 3.396 1.876 1.672 3.46 2.19 3.948 2.43.39.192.636.16.872-.096.236-.256.998-1.164 1.264-1.564.264-.398.53-.334.894-.2.364.134 2.304 1.086 2.698 1.282.394.196.656.294.752.458.096.164.096.95-.294 2.05z"/>
        </svg>
      </a>
    </>
    )}
    </div>
  );
}
