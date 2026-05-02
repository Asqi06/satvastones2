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
import JsonLd, { getProductSchema } from './components/JsonLd';
import ProductPage from './components/ProductPage';
import ShopPage from './components/ShopPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import AdminPanel from './components/AdminPanel';
import ContactPage from './components/ContactPage';
import BlogsPage from './components/BlogsPage';
import AuthPage from './components/AuthPage';
import SearchOverlay from './components/SearchOverlay';
import { optimizeImage } from './utils/cloudinary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const CategoryCard = ({ category, onClick }: any) => (
  <div 
    className={`group relative overflow-hidden bg-stone-100 cursor-pointer ${category.size === 'large' ? 'aspect-[3/4]' : 'aspect-square md:aspect-[16/9]'}`}
    onClick={onClick}
  >
    <img 
      src={optimizeImage(category.image, 800)} 
      alt={category.title} 
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
      <h4 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl md:text-2xl lg:text-3xl">
        {category.title}
      </h4>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:scale-110 md:h-12 md:w-12">
        <ArrowUpRight className="h-5 w-5 text-black" />
      </button>
    </div>
  </div>
);

const DiscoverCard = ({ product, large = false, onClick }: any) => (
  <div className="group flex flex-col gap-3 cursor-pointer" onClick={onClick}>
    <div className={`relative overflow-hidden bg-stone-100 ${large ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-square'}`}>
      <img 
        src={optimizeImage(product.image, 600)} 
        alt={product.title} 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Wishlist Button */}
      <button className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-900 transition-colors hover:bg-white">
        <Heart className="h-4 w-4" />
      </button>

      {/* Hover Actions */}
      <div className="absolute inset-x-0 bottom-4 z-10 flex translate-y-4 justify-center gap-2 px-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button className="flex-1 bg-black py-3 text-[9px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-stone-800">
          View Details
        </button>
      </div>
    </div>

    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h4 className="font-accent text-xs font-bold uppercase tracking-tight text-stone-900">{product.title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 line-through">₹{product.oldPrice}</span>
          <span className="font-accent text-sm font-bold text-stone-900">₹{product.price}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex text-yellow-400">
           <span className="text-[10px]">★</span>
        </div>
        <span className="text-[10px] font-bold text-stone-900">{product.rating}</span>
        <span className="text-[10px] text-stone-400 uppercase tracking-tighter">({(product.reviews && Array.isArray(product.reviews)) ? product.reviews.length : (typeof product.reviews === 'number' ? product.reviews : 0)} reviews)</span>
      </div>
    </div>
  </div>
);

// EMPTY INITIAL DATA (Everything flows from DB)
const initialCMSData = {
  hero: { title: '', subTitle: '', description: '', image: '' },
  categories: [],
  specialOffer: { title: '', subTitle: '', description: '', image: '', isActive: false },
  products: [],
  settings: { announcementText: '', showTimer: false, timerEnd: '' }
};

function AccountDashboard({ user, onLogout, onShop }: { user: any, onLogout: () => void, onShop: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/orders/customer/${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch customer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.email]);

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
                    <div key={order._id} className="border border-stone-100 p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Order #{order.orderNumber || order._id?.slice(-8)}</p>
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
                  <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
  const { id } = useParams();
  const product = cmsData?.products?.find((p: any) => p._id === id || p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-stone-400">Product not found</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={product.title} 
        description={product.description || `Buy ${product.title} at Satvastones. High quality aesthetic jewelry.`}
        image={product.image}
        canonical={`https://satvastones.in/product/${id}`}
      />
      <JsonLd data={getProductSchema(product)} />
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

export default function App() {

  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cmsData, setCmsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigateTo = (view: string, data?: any) => {
    if (view === 'home') navigate('/');
    else if (view === 'shop') navigate('/shop');
    else if (view === 'auth') navigate('/account');
    else if (view === 'cart') navigate('/cart');
    else if (view === 'checkout') navigate('/checkout');
    else if (view === 'blogs') navigate('/blogs');
    else if (view === 'contact') navigate('/contact');
    else if (view === 'order-success') navigate('/order-success');
    else if (view === 'product' && data) {
      const id = data._id || data.id;
      navigate(`/product/${id}`);
    }
    window.scrollTo(0, 0);
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

  const calculateShipping = (pincode: string, subtotal: number) => {
    if (subtotal > 1500) return 0; // Free delivery above 1500
    if (!pincode) return 70; // Default
    if (pincode.startsWith('396')) return 0; // Local Vapi & Gunjan (FREE)
    
    // If order is less than 329, delivery starts at 25
    if (subtotal < 329) return 25;
    
    if (pincode.startsWith('3')) return 40; // Gujarat
    return 70; // Rest of India
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
            settings: { ...initialCMSData.settings, ...cms.settings },
            products: prods || [] 
          });
        }
      } catch (err) {
        console.log("Using local fallback data. Connect to MongoDB to enable live sync.");
      } finally {
        setIsLoading(false);
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
    const targetDate = new Date(cmsData.settings.timerEnd);
    
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

  if (!cmsData) return <div className="min-h-screen bg-white flex items-center justify-center font-display text-4xl animate-pulse">SATVASTONES.</div>;

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
    return (
      <AdminPanel 
        cmsData={cmsData} 
        onUpdateCMS={handleUpdateCMS} 
        onUpdateProduct={handleUpdateProduct}
        onLogout={handleAdminLogout} 
      />
    );
  }
  if (isLoading || !cmsData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <div className="font-display text-4xl font-bold tracking-tighter animate-pulse">SATVASTONES.</div>
        <div className="w-48 h-0.5 bg-stone-100 relative overflow-hidden">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 bg-black"
          />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Curating Your Experience</p>
      </div>
    );
  }

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const cartTotal = cartSubtotal + shippingRate;
  const cartCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);

  return (
    <div className="min-h-screen bg-white font-accent selection:bg-black selection:text-white">
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
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white sm:text-xs">
              {cmsData.settings.announcementText}
            </p>
          </div>
          {cmsData.settings.showTimer && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-accent text-base font-bold tracking-wider text-white sm:text-lg">
                <span className="text-red-500">{String(timeLeft.days).padStart(2, '0')}D</span>
                <span className="text-white/30">:</span>
                <span>{String(timeLeft.hours).padStart(2, '0')}H</span>
                <span className="text-white/30">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}M</span>
                <span className="text-white/30">:</span>
                <span className="text-red-500">{String(timeLeft.seconds).padStart(2, '0')}S</span>
              </div>
              <button 
                onClick={() => {
                  const hamperId = cmsData.specialOffer?.productId || 'md-hamper';
                  const hamper = cmsData.products.find((p: any) => p.id === hamperId || p._id === hamperId);
                  if (hamper) navigateTo('product', hamper);
                  else navigateTo('shop');
                }} 
                className="ml-2 rounded-xs bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black hover:scale-105 transition-all"
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
            <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <button onClick={() => setIsSearchOpen(true)} className="p-1 hover:text-stone-400 transition-colors"><Search className="h-5 w-5" /></button>
            <Link to="/account" className="p-1 hover:text-stone-400 transition-colors"><User className="h-5 w-5" /></Link>
            <Link to="/cart" className="p-1 hover:text-stone-400 transition-colors relative">
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
                    title="Satvastones | Aesthetic Korean & Western Jewelry" 
                    description="Elevate your vibe with our premium Korean and Western jewelry collection. Free shipping on orders over ₹1500."
                  />
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
                        <img src={optimizeImage(cmsData.hero.image, 1600)} alt="Hero" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-8">
                          <button className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-2xl">
                            Enter The Shop
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Categories */}
                  <section className="bg-white py-20 md:py-32">
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                      <div className="mb-16 text-center">
                        <h2 className="font-display text-4xl md:text-7xl font-bold uppercase tracking-tight">
                          SHOP BY <span className="text-stone-300">VIBE</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {cmsData.categories.map((cat: any, i: number) => <CategoryCard key={i} category={cat} onClick={() => navigateTo('shop')} />)}
                      </div>
                    </div>
                  </section>

                  {/* Discover */}
                  <section className="bg-stone-50 py-20 md:py-32">
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                      <div className="mb-16 flex flex-col md:flex-row items-end justify-between gap-8">
                        <h2 className="font-display text-4xl md:text-7xl font-bold uppercase tracking-tight leading-[0.85]">
                          LATEST <br /> <span className="text-stone-300">ARRIVALS</span>
                        </h2>
                        <button onClick={() => navigateTo('shop')} className="px-10 py-4 border border-stone-300 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                          View Collection
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {cmsData.products.slice(0, 6).map((p: any) => <DiscoverCard key={p.id} product={p} onClick={() => navigateTo('product', p)} />)}
                      </div>
                    </div>
                  </section>
                </>
              } />

              <Route path="/shop" element={<><SEO title="Shop Aesthetic Jewelry" /><ShopPage products={cmsData.products} onSelectProduct={(p) => navigateTo('product', p)} /></>} />
              <Route path="/product/:id" element={<ProductRouteWrapper cmsData={cmsData} navigateTo={navigateTo} addToCart={addToCart} handleAddReview={handleAddReview} />} />
              <Route path="/cart" element={<><SEO title="Your Bag" /><CartPage cart={cart} onUpdateQty={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, (i.qty || 1) + d)} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={() => navigateTo('checkout')} onContinueShopping={() => navigateTo('shop')} /></>} />
              <Route path="/checkout" element={<><SEO title="Checkout" /><CheckoutPage cart={cart} currentUser={currentUser} onBack={() => navigateTo('cart')} onComplete={() => { setCart([]); localStorage.removeItem('checkout_form'); navigateTo('order-success'); }} onLoginRedirect={() => navigateTo('auth')} calculateShipping={calculateShipping} /></>} />
              <Route path="/account" element={currentUser ? <><SEO title="My Account" /><AccountDashboard user={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('satvastones_user'); navigate('/'); }} onShop={() => navigate('/shop')} /></> : <AuthPage onLogin={(data) => { setCurrentUser(data.customer); if (localStorage.getItem('checkout_pending') === 'true') navigate('/checkout'); else navigate('/account'); }} />} />
              <Route path="/contact" element={<><SEO title="Contact" /><ContactPage /></>} />
              <Route path="/blogs" element={<><SEO title="The Journal" /><BlogsPage /></>} />
              <Route path="/order-success" element={<div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4"><h1>Success!</h1><button onClick={() => navigate('/')}>Back Home</button></div>} />
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 leading-loose max-w-sm">
                  Bringing You The Most Aesthetic Korean & Western Jewelry. High Quality. Affordable. Trending.
                </p>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em]">Join the newsletter</h4>
                <div className="flex border-b border-stone-800 py-2">
                  <input type="email" placeholder="YOUR EMAIL" className="bg-transparent text-[10px] uppercase font-bold tracking-widest outline-hidden flex-1" />
                  <button className="text-[9px] font-bold uppercase tracking-widest hover:text-stone-400 transition-colors">Join</button>
                </div>
                <p className="text-[8px] uppercase tracking-widest text-stone-600">Get early access to drops & exclusive offers.</p>
              </div>
              
              <div className="flex gap-6">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                  <Icon key={idx} className="h-5 w-5 text-stone-500 hover:text-white cursor-pointer" />
                ))}
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Shop</h4>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <li className="hover:text-white cursor-pointer" onClick={() => navigateTo('shop')}>New Arrivals</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigateTo('shop')}>Earrings</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigateTo('shop')}>Necklaces</li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Explore</h4>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <li className="hover:text-white cursor-pointer" onClick={() => navigateTo('blogs')}>The Journal</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigateTo('contact')}>Contact Us</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => navigateTo('auth')}>My Account</li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Contact</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">hello@satvastones.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-12 flex flex-col md:flex-row justify-between gap-6 text-center md:text-left">
             <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-600">© 2024 SATVASTONES. ALL RIGHTS RESERVED.</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-red-900/40">No Refunds • No Cancellations • No Returns</p>
             </div>
             <div className="flex justify-center md:justify-end gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-stone-600">
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer">Terms Of Service</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
