import React, { useState } from 'react';
import Barcode from 'react-barcode';
import {
  Settings, Package, ShoppingCart, Users, Image as ImageIcon,
  Type, Plus, Trash2, Edit3, Save, X, Timer, Zap, ArrowLeft,
  CheckCircle, Clock, ChevronRight, UploadCloud, TrendingUp, ShoppingBag,
  Menu, ShieldCheck, Search, Barcode as BarcodeIcon, Video, BarChart3,
  Layout, Star, HelpCircle, GripVertical, User, Phone, LogOut,
  DollarSign, AlertTriangle, Grid, List
} from 'lucide-react';
import { openUploadWidget } from '../utils/cloudinary';
import AnalyticsDashboard from './AnalyticsDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SIDEBAR_TABS = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'content', icon: Layout, label: 'Home Content' },
  { id: 'banners', icon: ImageIcon, label: 'Hero Banners' },
  { id: 'homepage-sections', icon: Grid, label: 'Product Sections' },
  { id: 'trends', icon: TrendingUp, label: 'Trends' },
  { id: 'reviews', icon: Star, label: 'Reviews' },
  { id: 'faqs', icon: HelpCircle, label: 'FAQs' },
  { id: 'sales', icon: Zap, label: 'Sale Sections' },
  { id: 'special', icon: Timer, label: 'Special Offer' },
  { id: 'ninetyNine', icon: Timer, label: '\u20B999 Sale' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'orders', icon: ShoppingBag, label: 'Orders' },
  { id: 'blogs', icon: Edit3, label: 'Blogs' },
  { id: 'coupons', icon: DollarSign, label: 'Coupons' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const CATEGORIES = ['necklaces', 'name necklace', 'earrings', 'rings', 'bracelets', 'pendant', 'gifts', 'hampers', 'accessories', "mother's day"];
const ORDER_STATUSES = ['Confirmed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminPanel({
  cmsData,
  onUpdateCMS,
  onUpdateProduct,
  onLogout
}: {
  cmsData: any,
  onUpdateCMS: (data: any) => void,
  onUpdateProduct: (product: any, action: 'add' | 'edit' | 'delete') => void,
  onLogout: () => void
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showSkuLabel, setShowSkuLabel] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Homepage management states
  const [banners, setBanners] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  const [bannerForm, setBannerForm] = useState<any>({ title: '', image: '', link: '', sortOrder: 0, isActive: true });
  const [sectionForm, setSectionForm] = useState<any>({ title: '', sortOrder: 0, isActive: true, productIds: [], badge: 'Hot Selling', shopLink: '' });
  const [trendForm, setTrendForm] = useState<any>({ title: '', image: '', link: '', sortOrder: 0, isActive: true, productIds: [] });
  const [reviewForm, setReviewForm] = useState<any>({ name: '', rating: 5, title: '', comment: '', sortOrder: 0, isActive: true });
  const [faqForm, setFaqForm] = useState<any>({ question: '', answer: '', sortOrder: 0, isActive: true });
  const [saleForm, setSaleForm] = useState<any>({ title: '', subtitle: '', discountPercent: 0, productIds: [], isActive: true, bgColor: '#f2707f' });

  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingTrend, setEditingTrend] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [editingSale, setEditingSale] = useState<any>(null);

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showTrendForm, setShowTrendForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogForm, setBlogForm] = useState<any>({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: 'SATVASTONES', readTime: '5 min read', isPublished: false });

  const [tempCMSData, setTempCMSData] = useState<any>(null);
  const cmsInitialized = React.useRef(false);

  React.useEffect(() => {
    if (cmsData && !cmsInitialized.current && tempCMSData === null) {
      setTempCMSData(cmsData);
      cmsInitialized.current = true;
    }
  }, [cmsData, tempCMSData]);

  React.useEffect(() => {
    fetch(`${API_URL}/cms`)
      .then(res => res.ok ? setDbStatus('connected') : setDbStatus('error'))
      .catch(() => setDbStatus('error'));
  }, []);

  React.useEffect(() => {
    if (['banners', 'homepage-sections', 'trends', 'reviews', 'faqs', 'sales'].includes(activeTab)) {
      Promise.all([
        fetch(`${API_URL}/banners`).then(r => r.json()),
        fetch(`${API_URL}/homepage-sections`).then(r => r.json()),
        fetch(`${API_URL}/trends`).then(r => r.json()),
        fetch(`${API_URL}/customer-reviews`).then(r => r.json()),
        fetch(`${API_URL}/faqs`).then(r => r.json()),
        fetch(`${API_URL}/sales`).then(r => r.json()),
        fetch(`${API_URL}/products`).then(r => r.json()),
      ]).then(([b, s, t, r, f, sa, p]) => {
        setBanners(b || []); setSections(s || []); setTrends(t || []);
        setCustomerReviews(r || []); setFaqs(f || []); setSales(sa || []); setAllProducts(p || []);
      }).catch(err => console.error("Failed to fetch homepage data:", err));
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (activeTab === 'blogs') {
      fetch(`${API_URL}/blogs`).then(r => r.json()).then(data => setBlogs(data)).catch(() => {});
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      fetch(`${API_URL}/orders`).then(r => r.json()).then(data => setOrders(data)).catch(() => {});
    }
  }, [activeTab]);

  const cloudinaryConfig = {
    cloudName: cmsData?.settings?.cloudinaryCloudName || '',
    uploadPreset: cmsData?.settings?.cloudinaryUploadPreset || ''
  };

  // CRUD helpers
  const crudApi = (endpoint: string) => ({
    save: async (data: any, isEdit: boolean) => {
      const url = isEdit ? `${API_URL}/${endpoint}/${data._id}` : `${API_URL}/${endpoint}`;
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.ok ? res.json() : null;
    },
    del: async (id: string) => { await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' }); }
  });

  const bannersApi = crudApi('banners');
  const sectionsApi = crudApi('homepage-sections');
  const trendsApi = crudApi('trends');
  const reviewsApi = crudApi('customer-reviews');
  const faqsApi = crudApi('faqs');
  const salesApi = crudApi('sales');

  const resetForm = (setter: any, defaults: any) => { setter(defaults); };

  const handleSaveCMS = async () => {
    setIsSaving(true);
    try { await onUpdateCMS(tempCMSData); alert('Changes saved successfully!'); }
    catch (err: any) { alert('Failed to save: ' + (err?.message || 'Unknown error')); }
    finally { setIsSaving(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingId?: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingId })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
      }
    } catch (err) { console.error("Failed to update status:", err); }
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm('Permanently delete this order?')) {
      try { await fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE' }).then(() => { setOrders(prev => prev.filter(o => o._id !== orderId)); setSelectedOrder(null); }); }
      catch (err) { console.error("Failed to delete order:", err); }
    }
  };

  const saveProduct = async (product: any) => {
    await onUpdateProduct({ ...product, image: product.images?.[0] || product.image }, 'edit');
    setEditingProduct(null);
  };

  const addProduct = async (product: any) => {
    await onUpdateProduct({ ...product, image: product.images?.[0] || '' }, 'add');
    setNewProduct(null);
  };

  const removeProduct = (product: any) => { if (window.confirm('Delete this product?')) onUpdateProduct(product, 'delete'); };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = editingBlog || blogForm;
      const url = editingBlog ? `${API_URL}/blogs/${editingBlog._id}` : `${API_URL}/blogs`;
      const method = editingBlog ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const saved = await res.json();
        setBlogs(prev => editingBlog ? prev.map(b => b._id === saved._id ? saved : b) : [saved, ...prev]);
        setShowBlogForm(false); setEditingBlog(null);
        setBlogForm({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: 'SATVASTONES', readTime: '5 min read', isPublished: false });
      }
    } catch (err) { console.error("Failed to save blog:", err); }
  };

  const handleEditBlog = (post: any) => { setEditingBlog(post); setShowBlogForm(true); };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try { await fetch(`${API_URL}/blogs/${id}`, { method: 'DELETE' }); setBlogs(prev => prev.filter(b => b._id !== id)); }
    catch (err) { console.error("Failed to delete blog:", err); }
  };

  // Input helper
  const Input = ({ label, ...props }: any) => (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</label>}
      <input {...props} className={`w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all ${props.className || ''}`} />
    </div>
  );

  const Select = ({ label, options, ...props }: any) => (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</label>}
      <select {...props} className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all bg-white">
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const Textarea = ({ label, ...props }: any) => (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</label>}
      <textarea {...props} className={`w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all resize-none ${props.className || ''}`} />
    </div>
  );

  const Toggle = ({ checked, onChange, label }: any) => (
    <label className="relative inline-flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-10 h-5.5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-stone-900" />
      {label && <span className="text-xs font-semibold text-stone-700">{label}</span>}
    </label>
  );

  const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white rounded-xl border border-stone-100 shadow-sm ${className}`}>{children}</div>
  );

  const Badge = ({ children, color = 'stone' }: any) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${color}-100 text-${color}-700`}>{children}</span>
  );

  const PageHeader = ({ title, action }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Manage your website {activeTab} here</p>
      </div>
      {action}
    </div>
  );

  const renderSidebar = () => (
    <aside className={`
      fixed inset-y-0 left-0 w-64 bg-stone-900 text-white flex flex-col z-50 transition-transform duration-300
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:relative lg:translate-x-0 lg:flex lg:h-screen
    `}>
      <div className="p-6 border-b border-stone-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">SATVA ADMIN</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-[10px] text-stone-500 uppercase tracking-widest">
              {dbStatus === 'connected' ? 'Live' : dbStatus === 'checking' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-stone-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {SIDEBAR_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition-all">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );

  const renderDashboard = () => {
    const totalSales = orders.reduce((acc, o) => acc + (o.amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders > 0 ? (totalSales / totalOrders).toFixed(0) : 0;
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
    const lowStockCount = (cmsData?.products || []).filter((p: any) => (p.stockQuantity || 0) < 5).length;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold">Welcome back, Admin</h2>
          <p className="text-stone-400 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Total Revenue', value: `\u20B9${totalSales.toLocaleString()}`, sub: 'All time', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600' },
            { icon: ShoppingBag, label: 'Total Orders', value: totalOrders.toString(), sub: 'All time', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', badge: 'bg-blue-50 text-blue-600' },
            { icon: BarChart3, label: 'Avg. Order Value', value: `\u20B9${avgOrder}`, sub: 'Per order', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badge: 'bg-purple-50 text-purple-600' },
            { icon: Timer, label: 'Orders Today', value: todayOrders.toString(), sub: 'Last 24h', iconBg: 'bg-orange-50', iconColor: 'text-orange-600', badge: 'bg-orange-50 text-orange-600' },
          ].map((stat, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className={`text-[10px] font-bold ${stat.badge} px-2.5 py-1 rounded-full uppercase`}>{stat.label.split(' ')[0]}</span>
              </div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-xs text-stone-400 mt-1">{stat.sub}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-700">Recent Orders</h3>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-stone-500 hover:text-stone-900 uppercase tracking-wider">View All</button>
            </div>
            <div className="divide-y divide-stone-50">
              {orders.slice(0, 5).map(order => (
                <div key={order._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors" onClick={() => { setActiveTab('orders'); setSelectedOrder(order); }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{order.customer?.name || 'Guest'}</p>
                      <p className="text-[11px] text-stone-400">#{order._id?.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900">\u20B9{order.amount?.toLocaleString()}</p>
                    <p className="text-[11px] text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="py-12 text-center text-xs text-stone-400">No orders yet</p>}
            </div>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-700">Low Stock</h3>
              {lowStockCount > 0 && <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{lowStockCount}</span>}
            </div>
            <div className="divide-y divide-stone-50 max-h-80 overflow-y-auto">
              {(cmsData?.products || []).filter((p: any) => (p.stockQuantity || 0) < 5).map((p: any) => (
                <div key={p._id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-12 bg-stone-100 rounded overflow-hidden shrink-0">
                    <img src={p.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{p.title}</p>
                    <p className="text-xs font-bold text-red-500">{p.stockQuantity || 0} left</p>
                  </div>
                </div>
              ))}
              {lowStockCount === 0 && (
                <div className="py-8 text-center">
                  <ShieldCheck className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-stone-400">All stock healthy</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderContentTab = () => (
    <div className="space-y-10">
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <Type className="h-4 w-4" /> Hero Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Main Title" value={tempCMSData?.hero?.title || ''} onChange={e => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, title: e.target.value }})} />
          <Input label="Subtitle" value={tempCMSData?.hero?.subTitle || ''} onChange={e => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, subTitle: e.target.value }})} />
          <div className="col-span-full space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Hero Image</label>
            <div className="flex gap-3">
              <input value={tempCMSData?.hero?.image || ''} onChange={e => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, image: e.target.value }})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-stone-900 outline-none" placeholder="Image URL" />
              <button onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, image: url }}), cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Upload</button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" /> Category Tiles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(tempCMSData?.categories || []).map((cat: any, idx: number) => (
            <div key={idx} className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
              <div className="aspect-square bg-stone-100 relative group">
                <img src={cat.image} className="w-full h-full object-cover" />
                <button onClick={() => openUploadWidget(url => { const u = [...tempCMSData.categories]; u[idx].image = url; setTempCMSData({ ...tempCMSData, categories: u }); }, cloudinaryConfig)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider"><UploadCloud className="h-5 w-5 mr-2" /> Replace</button>
              </div>
              <div className="p-3">
                <input value={cat.title} onChange={e => { const u = [...tempCMSData.categories]; u[idx].title = e.target.value; setTempCMSData({ ...tempCMSData, categories: u }); }} className="w-full text-xs font-bold uppercase bg-transparent border-b border-transparent focus:border-stone-900 py-1 outline-none" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <button onClick={handleSaveCMS} disabled={isSaving} className="bg-stone-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50">
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSpecialOffer = () => (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <Zap className="h-4 w-4" /> Live Campaign Banner
        </h3>
        <div className="flex items-center gap-4">
          <Toggle checked={tempCMSData?.specialOffer?.isActive || false} onChange={e => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, isActive: e.target.checked }})} label="Visible on Homepage" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Banner Title" value={tempCMSData?.specialOffer?.title || ''} onChange={e => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, title: e.target.value }})} />
          <Input label="Highlight Word" value={tempCMSData?.specialOffer?.subTitle || ''} onChange={e => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, subTitle: e.target.value }})} />
          <Textarea label="Description" rows={3} value={tempCMSData?.specialOffer?.description || ''} onChange={e => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, description: e.target.value }})} className="col-span-full" />
          <div className="col-span-full space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Banner Image</label>
            <div className="flex gap-3">
              <input value={tempCMSData?.specialOffer?.image || ''} onChange={e => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, image: e.target.value }})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900" placeholder="Image URL" />
              <button onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, image: url }}), cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Upload</button>
            </div>
          </div>
          <Input label="Linked Product ID" value={tempCMSData?.specialOffer?.productId || ''} onChange={e => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, productId: e.target.value }})} />
        </div>
      </Card>
      <div className="flex justify-end">
        <button onClick={handleSaveCMS} disabled={isSaving} className="bg-stone-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50">
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderNinetyNineSale = () => (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <Timer className="h-4 w-4" /> \u20B999 Flash Sale Campaign
        </h3>
        <div className="flex items-center gap-4">
          <Toggle checked={tempCMSData?.ninetyNineSale?.isActive || false} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, isActive: e.target.checked }})} label="Visible on Home & Shop Pages" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Section Title" value={tempCMSData?.ninetyNineSale?.title || ''} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, title: e.target.value }})} />
          <Input label="Subtitle" value={tempCMSData?.ninetyNineSale?.subTitle || ''} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, subTitle: e.target.value }})} />
          <Textarea label="Description" rows={2} value={tempCMSData?.ninetyNineSale?.description || ''} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, description: e.target.value }})} className="col-span-full" />
          <div className="col-span-full space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Banner Image</label>
            <div className="flex gap-3">
              <input value={tempCMSData?.ninetyNineSale?.bannerImage || ''} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, bannerImage: e.target.value }})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900" />
              <button onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, bannerImage: url }}), cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Upload</button>
            </div>
          </div>
          <Input label="Badge Text" value={tempCMSData?.ninetyNineSale?.badgeText || ''} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, badgeText: e.target.value }})} />
          <Input label="Guarantee Text" value={tempCMSData?.ninetyNineSale?.guaranteeText || ''} onChange={e => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, guaranteeText: e.target.value }})} className="col-span-full" />
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <Package className="h-4 w-4" /> \u20B999 Products ({(tempCMSData?.products || []).filter((p: any) => p.isNinetyNine).length || 0})
        </h3>
        <div className="overflow-x-auto rounded-lg border border-stone-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-stone-400 tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-stone-400 tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-stone-400 tracking-wider">In Sale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {(tempCMSData?.products || []).map((p: any) => (
                <tr key={p._id} className="hover:bg-stone-50 transition-all">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-stone-100 rounded overflow-hidden shrink-0">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold">\u20B9{p.price}</td>
                  <td className="px-4 py-3 text-right">
                    <Toggle checked={p.isNinetyNine || false} onChange={e => {
                      const updated = tempCMSData.products.map((prod: any) => prod._id === p._id ? { ...prod, isNinetyNine: e.target.checked } : prod);
                      setTempCMSData({ ...tempCMSData, products: updated });
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end">
        <button onClick={handleSaveCMS} disabled={isSaving} className="bg-stone-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50">
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderProducts = () => {
    const filtered = (cmsData?.products || []).filter((p: any) => {
      if (productSearch === 'isNinetyNine') return p.isNinetyNine;
      const q = productSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.sku?.toLowerCase() || '').includes(q) || p.category.toLowerCase().includes(q);
    });

    return (
      <div className="space-y-6">
        <Card>
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input type="text" placeholder="Search by name, SKU, or category..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:border-stone-900 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setProductSearch(prev => prev === 'isNinetyNine' ? '' : 'isNinetyNine')} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${productSearch === 'isNinetyNine' ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-200 text-stone-500 hover:border-stone-900'}`}>Sale</button>
              <button onClick={() => setNewProduct({ title: '', price: 0, oldPrice: 0, rating: 5, reviewsCount: 0, reviews: [], images: [], category: 'necklaces', customOptions: [], variants: [], sku: '', isFeatured: false, isAntiTarnish: false, isNinetyNine: false, metaTitle: '', metaDescription: '', focusKeywords: [], seoContent: '', specifications: [] })} className="bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-black flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Add Product</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase text-stone-400 tracking-wider">Image</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase text-stone-400 tracking-wider">Name & SKU</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase text-stone-400 tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase text-stone-400 tracking-wider">Price</th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase text-stone-400 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((product: any) => (
                  <tr key={product._id} className="hover:bg-stone-50 transition-all">
                    <td className="px-5 py-3.5">
                      <div className="w-12 h-14 bg-stone-100 rounded overflow-hidden">
                        <img src={product.image} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-bold text-stone-800">{product.title}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-mono">SKU: {product.sku || 'NOT SET'}</p>
                      {product.isNinetyNine && <span className="inline-block mt-1 text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded">Sale</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold uppercase bg-stone-100 px-2.5 py-1 rounded">{product.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-bold text-stone-900">\u20B9{product.price}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${(product.stockQuantity || 0) <= 0 ? 'bg-red-500' : (product.stockQuantity || 0) < 5 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] text-stone-400">{product.stockQuantity || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button onClick={() => setShowSkuLabel(product)} className="p-1.5 text-stone-400 hover:text-blue-600 transition-colors" title="SKU Label"><BarcodeIcon className="h-4 w-4" /></button>
                      <button onClick={() => setEditingProduct(product)} className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => removeProduct(product)} className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-8">
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><Zap className="h-4 w-4" /> Announcement Bar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Announcement Text" placeholder="Use | to separate items" value={tempCMSData?.settings?.announcementText || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, announcementText: e.target.value }})} className="col-span-full" />
          <Toggle checked={tempCMSData?.settings?.showTimer || false} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, showTimer: e.target.checked }})} label="Show Timer" />
          {tempCMSData?.settings?.showTimer && (
            <Input label="Timer End Date" type="datetime-local" value={tempCMSData?.settings?.timerEnd || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, timerEnd: e.target.value }})} />
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> GST & Billing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Business Name" value={tempCMSData?.settings?.businessName || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, businessName: e.target.value }})} />
          <Input label="GSTIN" value={tempCMSData?.settings?.gstin || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, gstin: e.target.value }})} />
          <Input label="PAN" value={tempCMSData?.settings?.businessPan || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, businessPan: e.target.value }})} />
          <Textarea label="Business Address" rows={3} value={tempCMSData?.settings?.businessAddress || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, businessAddress: e.target.value }})} className="col-span-full" />
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Cloudinary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Cloud Name" value={tempCMSData?.settings?.cloudinaryCloudName || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, cloudinaryCloudName: e.target.value }})} />
          <Input label="Upload Preset" value={tempCMSData?.settings?.cloudinaryUploadPreset || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, cloudinaryUploadPreset: e.target.value }})} />
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Logo & SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <Toggle checked={tempCMSData?.settings?.useLogo || false} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, useLogo: e.target.checked }})} label={tempCMSData?.settings?.useLogo ? 'Show Logo Image' : 'Show Brand Name'} />
            {!tempCMSData?.settings?.useLogo ? (
              <Input label="Brand Name" value={tempCMSData?.settings?.brandName || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, brandName: e.target.value }})} />
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Logo URL</label>
                <div className="flex gap-3">
                  <input value={tempCMSData?.settings?.logoUrl || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, logoUrl: e.target.value }})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900" placeholder="Logo URL" />
                  <button onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, logoUrl: url }}), cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase"><UploadCloud className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Input label="SEO Title" value={tempCMSData?.settings?.seoTitle || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, seoTitle: e.target.value }})} />
            <Textarea label="SEO Description" rows={2} value={tempCMSData?.settings?.seoDescription || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, seoDescription: e.target.value }})} />
            <Input label="Homepage H1" value={tempCMSData?.settings?.seoH1 || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, seoH1: e.target.value }})} />
            <Input label="Shop Page Title" value={tempCMSData?.settings?.shopPageTitle || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, shopPageTitle: e.target.value }})} />
            <Textarea label="Shop Page Description" rows={2} value={tempCMSData?.settings?.shopPageDescription || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, shopPageDescription: e.target.value }})} />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Phone" value={tempCMSData?.settings?.connectPhone || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, connectPhone: e.target.value }})} />
          <Input label="Email" value={tempCMSData?.settings?.connectEmail || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, connectEmail: e.target.value }})} />
          <Textarea label="Tagline" rows={2} value={tempCMSData?.settings?.connectTagline || ''} onChange={e => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, connectTagline: e.target.value }})} className="col-span-full" />
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><Search className="h-4 w-4" /> Category SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['necklaces', 'name-necklace', 'earrings', 'rings', 'bracelets', 'accessories', 'pendant', 'gifts', 'hampers', 'mothers-day'].map(slug => (
            <div key={slug} className="border border-stone-100 rounded-xl p-4 space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">{slug.replace(/-/g, ' ')}</h4>
              <input placeholder="SEO Title (h2)" value={tempCMSData?.collectionSeo?.[slug]?.h2 || ''} onChange={e => setTempCMSData({ ...tempCMSData, collectionSeo: { ...tempCMSData.collectionSeo, [slug]: { ...(tempCMSData.collectionSeo?.[slug] || {}), h2: e.target.value }}})} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-stone-900" />
              <textarea placeholder="Meta Description" rows={2} value={tempCMSData?.collectionSeo?.[slug]?.content || ''} onChange={e => setTempCMSData({ ...tempCMSData, collectionSeo: { ...tempCMSData.collectionSeo, [slug]: { ...(tempCMSData.collectionSeo?.[slug] || {}), content: e.target.value }}})} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-stone-900 resize-none" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><HelpCircle className="h-4 w-4" /> FAQ (JSON-LD)</h3>
        {(tempCMSData?.faqs || []).map((faq: any, idx: number) => (
          <div key={idx} className="border border-stone-100 rounded-xl p-4 space-y-3 relative">
            <button onClick={() => { const u = [...(tempCMSData.faqs || [])]; u.splice(idx, 1); setTempCMSData({ ...tempCMSData, faqs: u }); }} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-[10px] font-bold uppercase"><X className="h-4 w-4" /></button>
            <input placeholder="Question" value={faq.question || ''} onChange={e => { const u = [...(tempCMSData.faqs || [])]; u[idx] = { ...u[idx], question: e.target.value }; setTempCMSData({ ...tempCMSData, faqs: u }); }} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-900" />
            <textarea placeholder="Answer" rows={2} value={faq.answer || ''} onChange={e => { const u = [...(tempCMSData.faqs || [])]; u[idx] = { ...u[idx], answer: e.target.value }; setTempCMSData({ ...tempCMSData, faqs: u }); }} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-900 resize-none" />
          </div>
        ))}
        <button onClick={() => setTempCMSData({ ...tempCMSData, faqs: [...(tempCMSData.faqs || []), { question: '', answer: '' }] })} className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Add FAQ</button>
      </Card>

      <div className="flex justify-end">
        <button onClick={handleSaveCMS} disabled={isSaving} className="bg-stone-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50">
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  const renderOrders = () => {
    const filtered = (orders || []).filter((o: any) =>
      o._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.phone?.includes(orderSearch)
    );

    return (
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input type="text" placeholder="Search by Order ID, Name, or Phone..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:border-stone-900 outline-none" />
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? filtered.map((order: any) => (
            <Card key={order._id} className="p-5 hover:border-stone-300 cursor-pointer transition-all" onClick={() => setSelectedOrder(order)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{order.customer?.name || 'Guest'}</p>
                    <p className="text-xs text-stone-400">#{order._id?.slice(-6)} &bull; {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'New'} &bull; {order.paymentMethod || 'PREPAID'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900">\u20B9{order.amount?.toLocaleString()}</p>
                    {order.couponCode && <p className="text-[10px] font-bold text-amber-600 uppercase">Coupon: {order.couponCode}</p>}
                    <p className={`text-[10px] font-bold uppercase ${order.paymentMethod === 'COD' ? 'text-orange-600' : 'text-emerald-600'}`}>{order.paymentMethod === 'COD' ? 'Pending' : 'Paid'}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : order.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-stone-100 text-stone-500'}`}>
                    {order.status || 'Received'}
                  </span>
                  <ChevronRight className="h-5 w-5 text-stone-300" />
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center py-20 text-stone-300 text-sm italic">No orders found...</div>
          )}
        </div>
      </div>
    );
  };

  // Generic CRUD tab renderer
  const renderCrudTab = (
    items: any[],
    title: string,
    formTitle: string,
    form: any,
    setForm: any,
    editing: any,
    setEditing: any,
    showForm: boolean,
    setShowForm: any,
    resetDefaults: any,
    onSave: (data: any, isEdit: boolean) => void,
    onDelete: (id: string) => void,
    renderItem: (item: any) => React.ReactNode,
    renderForm: () => React.ReactNode
  ) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-700">{title}</h3>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(resetDefaults); }} className="bg-stone-900 text-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-black flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {(showForm || editing) && (
        <Card className="p-6 border border-stone-200 space-y-5">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">{editing ? 'Edit' : 'New'} {formTitle}</h4>
          {renderForm()}
          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(editing ? { ...form, _id: editing._id } : form, !!editing)} className="bg-stone-900 text-white px-6 py-2.5 text-[10px] font-bold uppercase rounded-lg hover:bg-black">{editing ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-stone-400 px-4 py-2.5 text-[10px] font-bold uppercase">Cancel</button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item._id} className="p-4 hover:border-stone-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="flex-1">{renderItem(item)}</div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditing(item); setForm(item); setShowForm(true); }} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => onDelete(item._id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center py-12 text-stone-400 text-xs">No {title.toLowerCase()} yet.</p>}
      </div>
    </div>
  );

  // Banners
  const handleBannerSave = async (data: any, isEdit: boolean) => { const saved = await bannersApi.save(data, isEdit); if (saved) { setBanners(prev => isEdit ? prev.map(b => b._id === saved._id ? saved : b) : [saved, ...prev]); setShowBannerForm(false); setEditingBanner(null); setBannerForm({ title: '', image: '', link: '', sortOrder: 0, isActive: true }); } };
  const handleBannerDelete = async (id: string) => { if (window.confirm('Delete this banner?')) { await bannersApi.del(id); setBanners(prev => prev.filter(b => b._id !== id)); } };

  const renderBanners = () => renderCrudTab(
    banners, 'Hero Banners', 'Banner', bannerForm, setBannerForm, editingBanner, setEditingBanner,
    showBannerForm, setShowBannerForm, { title: '', image: '', link: '', sortOrder: 0, isActive: true },
    handleBannerSave, handleBannerDelete,
    (item) => (
      <div className="flex items-center gap-4">
        {item.image && <img src={item.image} className="w-20 h-14 rounded object-cover" />}
        <div>
          <p className="text-sm font-bold text-stone-800">{item.title}</p>
          <p className="text-xs text-stone-400">Order: {item.sortOrder} | {item.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      </div>
    ),
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Title" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} className="col-span-full" />
        <div className="col-span-full space-y-1.5">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Image</label>
          <div className="flex gap-3">
            <input value={bannerForm.image} onChange={e => setBannerForm({...bannerForm, image: e.target.value})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900" />
            <button onClick={() => openUploadWidget(url => setBannerForm({...bannerForm, image: url}), cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase"><UploadCloud className="h-4 w-4" /></button>
          </div>
        </div>
        <Input label="Link URL" value={bannerForm.link} onChange={e => setBannerForm({...bannerForm, link: e.target.value})} />
        <Input label="Sort Order" type="number" value={bannerForm.sortOrder} onChange={e => setBannerForm({...bannerForm, sortOrder: parseInt(e.target.value) || 0})} />
        <Toggle checked={bannerForm.isActive} onChange={e => setBannerForm({...bannerForm, isActive: e.target.checked})} label="Active" />
      </div>
    )
  );

  // Sections
  const handleSectionSave = async (data: any, isEdit: boolean) => { const saved = await sectionsApi.save(data, isEdit); if (saved) { setSections(prev => isEdit ? prev.map(s => s._id === saved._id ? saved : s) : [saved, ...prev]); setShowSectionForm(false); setEditingSection(null); setSectionForm({ title: '', sortOrder: 0, isActive: true, productIds: [], badge: 'Hot Selling', shopLink: '' }); } };
  const handleSectionDelete = async (id: string) => { if (window.confirm('Delete this section?')) { await sectionsApi.del(id); setSections(prev => prev.filter(s => s._id !== id)); } };

  const renderSections = () => renderCrudTab(
    sections, 'Product Sections', 'Section', sectionForm, setSectionForm, editingSection, setEditingSection,
    showSectionForm, setShowSectionForm, { title: '', sortOrder: 0, isActive: true, productIds: [], badge: 'Hot Selling', shopLink: '' },
    handleSectionSave, handleSectionDelete,
    (item) => (
      <div>
        <p className="text-sm font-bold text-stone-800">{item.title}</p>
        <p className="text-xs text-stone-400">{item.productIds?.length || 0} products | Badge: {item.badge} | Order: {item.sortOrder} | {item.isActive ? 'Active' : 'Inactive'}</p>
      </div>
    ),
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Section Title" value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} className="col-span-full" />
        <Input label="Badge Text" value={sectionForm.badge} onChange={e => setSectionForm({...sectionForm, badge: e.target.value})} />
        <Input label="Shop Link Category" value={sectionForm.shopLink || ''} onChange={e => setSectionForm({...sectionForm, shopLink: e.target.value})} />
        <Input label="Sort Order" type="number" value={sectionForm.sortOrder} onChange={e => setSectionForm({...sectionForm, sortOrder: parseInt(e.target.value) || 0})} />
        <Toggle checked={sectionForm.isActive} onChange={e => setSectionForm({...sectionForm, isActive: e.target.checked})} label="Active" />
        <div className="col-span-full space-y-1.5">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Select Products ({sectionForm.productIds.length})</label>
          <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-2 space-y-1 bg-stone-50">
            {allProducts.map((p) => (
              <label key={p._id} className="flex items-center gap-2.5 p-2 hover:bg-white rounded-lg cursor-pointer text-xs">
                <input type="checkbox" checked={sectionForm.productIds.includes(p._id)} onChange={e => { if (e.target.checked) setSectionForm({...sectionForm, productIds: [...sectionForm.productIds, p._id]}); else setSectionForm({...sectionForm, productIds: sectionForm.productIds.filter((id: string) => id !== p._id)}); }} />
                <img src={p.image} className="w-7 h-7 rounded object-cover" />
                <span>{p.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  );

  // Trends
  const handleTrendSave = async (data: any, isEdit: boolean) => { const saved = await trendsApi.save(data, isEdit); if (saved) { setTrends(prev => isEdit ? prev.map(t => t._id === saved._id ? saved : t) : [saved, ...prev]); setShowTrendForm(false); setEditingTrend(null); setTrendForm({ title: '', image: '', link: '', sortOrder: 0, isActive: true, productIds: [] }); } };
  const handleTrendDelete = async (id: string) => { if (window.confirm('Delete this trend?')) { await trendsApi.del(id); setTrends(prev => prev.filter(t => t._id !== id)); } };

  const renderTrends = () => renderCrudTab(
    trends, 'Shop By Trend', 'Trend', trendForm, setTrendForm, editingTrend, setEditingTrend,
    showTrendForm, setShowTrendForm, { title: '', image: '', link: '', sortOrder: 0, isActive: true, productIds: [] },
    handleTrendSave, handleTrendDelete,
    (item) => (
      <div className="flex items-center gap-4">
        {item.image && <img src={item.image} className="w-16 h-20 rounded object-cover" />}
        <div>
          <p className="text-sm font-bold text-stone-800">{item.title}</p>
          <p className="text-xs text-stone-400">Order: {item.sortOrder} | {item.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      </div>
    ),
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Trend Title" value={trendForm.title} onChange={e => setTrendForm({...trendForm, title: e.target.value})} className="col-span-full" />
        <div className="col-span-full space-y-1.5">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Cover Image</label>
          <div className="flex gap-3">
            <input value={trendForm.image} onChange={e => setTrendForm({...trendForm, image: e.target.value})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900" />
            <button onClick={() => openUploadWidget(url => setTrendForm({...trendForm, image: url}), cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase"><UploadCloud className="h-4 w-4" /></button>
          </div>
        </div>
        <Input label="Link URL" value={trendForm.link} onChange={e => setTrendForm({...trendForm, link: e.target.value})} />
        <Input label="Sort Order" type="number" value={trendForm.sortOrder} onChange={e => setTrendForm({...trendForm, sortOrder: parseInt(e.target.value) || 0})} />
        <Toggle checked={trendForm.isActive} onChange={e => setTrendForm({...trendForm, isActive: e.target.checked})} label="Active" />
      </div>
    )
  );

  // Reviews
  const handleReviewSave = async (data: any, isEdit: boolean) => { const saved = await reviewsApi.save(data, isEdit); if (saved) { setCustomerReviews(prev => isEdit ? prev.map(r => r._id === saved._id ? saved : r) : [saved, ...prev]); setShowReviewForm(false); setEditingReview(null); setReviewForm({ name: '', rating: 5, title: '', comment: '', sortOrder: 0, isActive: true }); } };
  const handleReviewDelete = async (id: string) => { if (window.confirm('Delete this review?')) { await reviewsApi.del(id); setCustomerReviews(prev => prev.filter(r => r._id !== id)); } };

  const renderReviews = () => renderCrudTab(
    customerReviews, 'Customer Reviews', 'Review', reviewForm, setReviewForm, editingReview, setEditingReview,
    showReviewForm, setShowReviewForm, { name: '', rating: 5, title: '', comment: '', sortOrder: 0, isActive: true },
    handleReviewSave, handleReviewDelete,
    (item) => (
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-stone-800">{item.name}</p>
          <span className="text-yellow-500 text-xs">{'★'.repeat(item.rating)}</span>
        </div>
        <p className="text-xs font-semibold text-stone-600 mt-0.5">{item.title}</p>
        <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{item.comment}</p>
      </div>
    ),
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Customer Name" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Rating</label>
          <select value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900">
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </div>
        <Input label="Review Title" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} className="col-span-full" />
        <Textarea label="Comment" rows={3} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="col-span-full" />
        <Input label="Sort Order" type="number" value={reviewForm.sortOrder} onChange={e => setReviewForm({...reviewForm, sortOrder: parseInt(e.target.value) || 0})} />
        <Toggle checked={reviewForm.isActive} onChange={e => setReviewForm({...reviewForm, isActive: e.target.checked})} label="Active" />
      </div>
    )
  );

  // FAQs
  const handleFaqSave = async (data: any, isEdit: boolean) => { const saved = await faqsApi.save(data, isEdit); if (saved) { setFaqs(prev => isEdit ? prev.map(f => f._id === saved._id ? saved : f) : [saved, ...prev]); setShowFaqForm(false); setEditingFaq(null); setFaqForm({ question: '', answer: '', sortOrder: 0, isActive: true }); } };
  const handleFaqDelete = async (id: string) => { if (window.confirm('Delete this FAQ?')) { await faqsApi.del(id); setFaqs(prev => prev.filter(f => f._id !== id)); } };

  const renderFaqs = () => renderCrudTab(
    faqs, 'Frequently Asked Questions', 'FAQ', faqForm, setFaqForm, editingFaq, setEditingFaq,
    showFaqForm, setShowFaqForm, { question: '', answer: '', sortOrder: 0, isActive: true },
    handleFaqSave, handleFaqDelete,
    (item) => (
      <div>
        <p className="text-sm font-bold text-stone-800">{item.question}</p>
        <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{item.answer}</p>
      </div>
    ),
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Question" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="col-span-full" />
        <Textarea label="Answer" rows={3} value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="col-span-full" />
        <Input label="Sort Order" type="number" value={faqForm.sortOrder} onChange={e => setFaqForm({...faqForm, sortOrder: parseInt(e.target.value) || 0})} />
        <Toggle checked={faqForm.isActive} onChange={e => setFaqForm({...faqForm, isActive: e.target.checked})} label="Active" />
      </div>
    )
  );



  // Sales
  const handleSaleSave = async (data: any, isEdit: boolean) => { const saved = await salesApi.save(data, isEdit); if (saved) { setSales(prev => isEdit ? prev.map(s => s._id === saved._id ? saved : s) : [saved, ...prev]); setShowSaleForm(false); setEditingSale(null); setSaleForm({ title: '', subtitle: '', discountPercent: 0, productIds: [], isActive: true, bgColor: '#f2707f' }); } };
  const handleSaleDelete = async (id: string) => { if (window.confirm('Delete this sale?')) { await salesApi.del(id); setSales(prev => prev.filter(s => s._id !== id)); } };

  const renderSales = () => renderCrudTab(
    sales, 'Sale Sections', 'Sale', saleForm, setSaleForm, editingSale, setEditingSale,
    showSaleForm, setShowSaleForm, { title: '', subtitle: '', discountPercent: 0, productIds: [], isActive: true, bgColor: '#f2707f' },
    handleSaleSave, handleSaleDelete,
    (item) => (
      <div>
        <p className="text-sm font-bold text-stone-800">{item.title}</p>
        {item.subtitle && <p className="text-xs text-stone-400">{item.subtitle}</p>}
        <p className="text-xs text-stone-400 mt-1">{item.productIds?.length || 0} products | {item.discountPercent || 0}% off | {item.isActive ? 'Active' : 'Inactive'}</p>
      </div>
    ),
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Title" value={saleForm.title} onChange={e => setSaleForm({...saleForm, title: e.target.value})} />
        <Input label="Subtitle" value={saleForm.subtitle} onChange={e => setSaleForm({...saleForm, subtitle: e.target.value})} />
        <Input label="Discount %" type="number" value={saleForm.discountPercent} onChange={e => setSaleForm({...saleForm, discountPercent: parseInt(e.target.value) || 0})} />
        <Toggle checked={saleForm.isActive} onChange={e => setSaleForm({...saleForm, isActive: e.target.checked})} label="Active" />
        <div className="col-span-full space-y-1.5">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Select Products ({saleForm.productIds.length})</label>
          <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-2 space-y-1 bg-stone-50">
            {allProducts.map(p => (
              <label key={p._id} className="flex items-center gap-2.5 p-2 hover:bg-white rounded-lg cursor-pointer text-xs">
                <input type="checkbox" checked={saleForm.productIds.includes(p._id)} onChange={e => { if (e.target.checked) setSaleForm({...saleForm, productIds: [...saleForm.productIds, p._id]}); else setSaleForm({...saleForm, productIds: saleForm.productIds.filter((id: string) => id !== p._id)}); }} />
                <img src={p.image} className="w-7 h-7 rounded object-cover" />
                <span>{p.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  );

  const renderCoupons = () => (
    <Card className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Active Coupons</h2>
          <p className="text-xs text-stone-400 mt-1">Manage discount codes for your customers</p>
        </div>
        <button onClick={() => {
          const code = window.prompt('Enter Coupon Code:');
          const discount = window.prompt('Enter Discount Percentage:');
          if (code && discount) {
            const current = tempCMSData?.coupons || [];
            const updated = [...current, { code: code.toUpperCase(), discount: parseInt(discount), isActive: true }];
            setTempCMSData({ ...tempCMSData, coupons: updated });
            onUpdateCMS({ coupons: updated });
          }
        }} className="bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase rounded-lg hover:bg-black flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" /> Add Coupon
        </button>
      </div>
      <div className="grid gap-3">
        {(tempCMSData?.coupons || []).map((c: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-stone-900 text-white px-3.5 py-1.5 text-sm font-bold rounded-lg tracking-tight">{c.code}</div>
              <span className="text-xs font-bold text-stone-700">{c.discount}% OFF</span>
            </div>
            <button onClick={() => {
              const current = [...(tempCMSData?.coupons || [])];
              current.splice(i, 1);
              setTempCMSData({ ...tempCMSData, coupons: current });
              onUpdateCMS({ coupons: current });
            }} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {(!tempCMSData?.coupons || tempCMSData.coupons.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-xl">
            <DollarSign className="h-8 w-8 text-stone-200 mx-auto mb-3" />
            <p className="text-xs text-stone-300 font-bold uppercase">No active coupons</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderBlogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-700">Blog Posts</h3>
        <button onClick={() => { setEditingBlog(null); setShowBlogForm(true); setBlogForm({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: 'SATVASTONES', readTime: '5 min read', isPublished: false }); }} className="bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase rounded-lg hover:bg-black flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" /> New Post
        </button>
      </div>

      {showBlogForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowBlogForm(false); }}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold">{editingBlog ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setShowBlogForm(false)} className="text-stone-400 hover:text-stone-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleBlogSubmit} className="space-y-5">
              <Input label="Title" value={editingBlog ? editingBlog.title : blogForm.title} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, title: e.target.value}) : setBlogForm({...blogForm, title: e.target.value})} required />
              <Input label="Slug" value={editingBlog ? editingBlog.slug : blogForm.slug} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')}) : setBlogForm({...blogForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
              <Textarea label="Excerpt" rows={2} value={editingBlog ? editingBlog.excerpt : blogForm.excerpt} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, excerpt: e.target.value}) : setBlogForm({...blogForm, excerpt: e.target.value})} required />
              <Textarea label="Content (HTML)" rows={10} value={editingBlog ? editingBlog.content : blogForm.content} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, content: e.target.value}) : setBlogForm({...blogForm, content: e.target.value})} required className="font-mono text-xs" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Cover Image</label>
                  <div className="flex gap-3">
                    <input type="url" value={editingBlog ? editingBlog.image : blogForm.image} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, image: e.target.value}) : setBlogForm({...blogForm, image: e.target.value})} className="flex-1 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-stone-900" placeholder="Image URL" />
                    <button type="button" onClick={() => openUploadWidget(url => { editingBlog ? setEditingBlog({...editingBlog, image: url}) : setBlogForm({...blogForm, image: url}) }, cloudinaryConfig)} className="bg-stone-100 hover:bg-stone-200 px-4 rounded-lg text-xs font-bold uppercase"><UploadCloud className="h-4 w-4" /></button>
                  </div>
                </div>
                <Input label="Category" value={editingBlog ? editingBlog.category : blogForm.category} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, category: e.target.value}) : setBlogForm({...blogForm, category: e.target.value})} />
                <Input label="Author" value={editingBlog ? editingBlog.author : blogForm.author} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, author: e.target.value}) : setBlogForm({...blogForm, author: e.target.value})} />
                <Input label="Read Time" value={editingBlog ? editingBlog.readTime : blogForm.readTime} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, readTime: e.target.value}) : setBlogForm({...blogForm, readTime: e.target.value})} placeholder="5 min read" />
              </div>
              <Toggle checked={editingBlog ? editingBlog.isPublished : blogForm.isPublished} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, isPublished: e.target.checked}) : setBlogForm({...blogForm, isPublished: e.target.checked})} label="Published" />
              <div className="flex gap-4 pt-4 border-t border-stone-100">
                <button type="submit" className="bg-stone-900 text-white px-8 py-3 text-[10px] font-bold uppercase rounded-lg hover:bg-black">{editingBlog ? 'Update' : 'Create'} Post</button>
                <button type="button" onClick={() => setShowBlogForm(false)} className="text-xs font-bold text-stone-400 hover:text-stone-900">Cancel</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="space-y-2">
        {blogs.map((post: any) => (
          <Card key={post._id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                  <img src={post.image} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-800 truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold uppercase ${post.isPublished ? 'text-emerald-600' : 'text-stone-300'}`}>{post.isPublished ? 'Published' : 'Draft'}</span>
                    <span className="text-[10px] text-stone-400">{post.category || 'Uncategorized'}</span>
                    <span className="text-[10px] text-stone-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button onClick={() => handleEditBlog(post)} className="p-2 text-stone-400 hover:text-stone-900"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteBlog(post._id)} className="p-2 text-stone-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        ))}
        {blogs.length === 0 && <div className="text-center py-16 border-2 border-dashed border-stone-100 rounded-xl"><p className="text-xs font-bold text-stone-400">No blog posts yet</p></div>}
      </div>
    </div>
  );

  const renderProductEditor = () => {
    if (!editingProduct && !newProduct) return null;
    const p = editingProduct || newProduct;
    const setP = (val: any) => editingProduct ? setEditingProduct(val) : setNewProduct(val);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-8 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
            <h2 className="text-xl font-bold text-stone-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={() => { setEditingProduct(null); setNewProduct(null); }} className="text-stone-400 hover:text-stone-900 p-1"><X className="h-6 w-6" /></button>
          </div>
          <div className="p-8 overflow-y-auto flex-1 space-y-8 no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Product Title" value={p.title} onChange={e => setP({...p, title: e.target.value})} className="col-span-full" />
              <Input label="Price" type="number" value={p.price} onChange={e => setP({...p, price: Number(e.target.value)})} />
              <Input label="Old Price" type="number" value={p.oldPrice || 0} onChange={e => setP({...p, oldPrice: Number(e.target.value)})} />
              <Textarea label="Description" rows={3} value={p.description || ''} onChange={e => setP({...p, description: e.target.value})} className="col-span-full" />

              {/* Images */}
              <div className="col-span-full space-y-3">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {(p.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => { const imgs = [...p.images]; imgs.splice(idx, 1); setP({...p, images: imgs }); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => openUploadWidget(url => setP({...p, images: [...(p.images || []), url] }), cloudinaryConfig)} className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-stone-400 transition-all text-stone-400 hover:text-stone-600">
                    <UploadCloud className="h-6 w-6" />
                    <span className="text-[9px] font-bold uppercase">Add Image</span>
                  </button>
                </div>
              </div>

              {/* Video */}
              <div className="col-span-full space-y-3">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Product Video</label>
                <div className="flex items-center gap-4">
                  {p.video ? (
                    <div className="relative w-28 aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group">
                      <video src={p.video} className="w-full h-full object-cover" muted />
                      <button onClick={() => setP({...p, video: ''})} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <div className="w-28 aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1">
                      <Video className="h-5 w-5 text-stone-400" />
                      <span className="text-[9px] font-bold text-stone-400">No Video</span>
                    </div>
                  )}
                  <button onClick={() => openUploadWidget(url => setP({...p, video: url }), cloudinaryConfig, 'video')} className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 border border-stone-200"><UploadCloud className="h-4 w-4" /> Upload Video</button>
                </div>
              </div>

              {/* Custom Options */}
              <div className="col-span-full space-y-3">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Custom Options</label>
                <div className="flex flex-wrap gap-2">
                  {(p.customOptions || []).map((opt: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold">
                      {opt}
                      <button onClick={() => { const opts = [...p.customOptions]; opts.splice(idx, 1); setP({...p, customOptions: opts }); }} className="text-stone-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <input placeholder="e.g. Royal Gold" onKeyDown={(e: any) => { if (e.key === 'Enter' && e.target.value.trim()) { setP({...p, customOptions: [...(p.customOptions || []), e.target.value.trim()] }); e.target.value = ''; }}} className="border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-stone-900" />
                </div>
              </div>

              {/* Color Variants */}
              <div className="col-span-full space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Color Variants</label>
                  <button onClick={() => setP({...p, variants: [...(p.variants || []), { color: 'NEW', images: [] }] })} className="text-[10px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Add Variant</button>
                </div>
                <div className="space-y-4">
                  {(p.variants || []).map((variant: any, vIdx: number) => (
                    <div key={vIdx} className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <input value={variant.color} onChange={e => { const v = [...p.variants]; v[vIdx].color = e.target.value.toUpperCase(); setP({...p, variants: v }); }} className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold uppercase outline-none focus:border-stone-900 w-full max-w-xs" />
                        <button onClick={() => { const v = [...p.variants]; v.splice(vIdx, 1); setP({...p, variants: v }); }} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {variant.images.map((img: string, iIdx: number) => (
                          <div key={iIdx} className="relative aspect-square bg-white border border-stone-100 rounded-lg overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={() => { const v = [...p.variants]; v[vIdx].images.splice(iIdx, 1); setP({...p, variants: v }); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="h-2.5 w-2.5" /></button>
                          </div>
                        ))}
                        <button onClick={() => openUploadWidget(url => { const v = [...p.variants]; v[vIdx].images.push(url); setP({...p, variants: v }); }, cloudinaryConfig)} className="aspect-square border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center hover:border-stone-400 text-stone-400"><UploadCloud className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-stone-100">
                <Input label="SKU" value={p.sku || ''} onChange={e => setP({...p, sku: e.target.value.toUpperCase()})} placeholder="SS-RING-01" />
                <Input label="Material" value={p.material || ''} onChange={e => setP({...p, material: e.target.value})} placeholder="18K Gold Plated" />
                <Input label="Stock Quantity" type="number" value={p.stockQuantity || 0} onChange={e => setP({...p, stockQuantity: Number(e.target.value)})} />
                <Select label="Category" options={CATEGORIES} value={p.category || 'necklaces'} onChange={e => setP({...p, category: e.target.value})} />
              </div>

              {/* Toggles */}
              <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 border border-stone-100 rounded-xl">
                  <Toggle checked={p.isFeatured || false} onChange={e => setP({...p, isFeatured: e.target.checked})} />
                  <span className="text-[10px] font-bold">Featured</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <Toggle checked={p.isNinetyNine || false} onChange={e => setP({...p, isNinetyNine: e.target.checked})} />
                  <span className="text-[10px] font-bold text-rose-700">\u20B999 Sale</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <Toggle checked={p.isAntiTarnish || false} onChange={e => setP({...p, isAntiTarnish: e.target.checked})} />
                  <span className="text-[10px] font-bold text-emerald-700">Anti-Tarnish</span>
                </div>
              </div>

              {/* Specifications */}
              <div className="col-span-full space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Specifications</label>
                  <button onClick={() => setP({...p, specifications: [...(p.specifications || []), { key: '', value: '' }] })} className="text-[10px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Add Spec</button>
                </div>
                <div className="space-y-2">
                  {(p.specifications || []).map((spec: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input placeholder="Key (e.g. Metal)" value={spec.key} onChange={e => { const s = [...p.specifications]; s[idx] = { ...s[idx], key: e.target.value }; setP({...p, specifications: s }); }} className="w-2/5 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold uppercase outline-none focus:border-stone-900" />
                      <input placeholder="Value (e.g. 18K Gold)" value={spec.value} onChange={e => { const s = [...p.specifications]; s[idx] = { ...s[idx], value: e.target.value }; setP({...p, specifications: s }); }} className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold uppercase outline-none focus:border-stone-900" />
                      <button onClick={() => { const s = [...p.specifications]; s.splice(idx, 1); setP({...p, specifications: s }); }} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="col-span-full space-y-5 pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><Search className="h-4 w-4" /> SEO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Meta Title" value={p.metaTitle || ''} onChange={e => setP({...p, metaTitle: e.target.value})} placeholder="Auto-generated from title" />
                  <Input label="Focus Keywords" value={(p.focusKeywords || []).join(', ')} onChange={e => setP({...p, focusKeywords: e.target.value.split(',').map((k: string) => k.trim()).filter(Boolean)})} placeholder="comma separated" />
                  <Textarea label="Meta Description" rows={2} value={p.metaDescription || ''} onChange={e => setP({...p, metaDescription: e.target.value})} className="col-span-full" />
                  <Textarea label="SEO Content (HTML)" rows={6} value={p.seoContent || ''} onChange={e => setP({...p, seoContent: e.target.value})} className="col-span-full font-mono text-xs" placeholder="Custom HTML that replaces 'About This Piece' section" />
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex justify-end gap-4">
            <button onClick={() => { setEditingProduct(null); setNewProduct(null); }} className="px-6 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-900">Cancel</button>
            <button onClick={() => editingProduct ? saveProduct(editingProduct) : addProduct(newProduct)} className="bg-stone-900 text-white px-8 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black flex items-center gap-2"><Save className="h-4 w-4" /> Save</button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Order Details</h2>
              <p className="text-xs text-stone-400 font-mono mt-0.5">#{selectedOrder._id}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-900 p-1"><X className="h-6 w-6" /></button>
          </div>
          <div className="p-8 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2"><Users className="h-4 w-4" /> Customer</h3>
                <div className="space-y-3">
                  <div><p className="text-[10px] font-bold text-stone-400 uppercase">Name</p><p className="text-sm font-bold text-stone-800">{selectedOrder.customer?.name || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-bold text-stone-400 uppercase">Email & Phone</p><p className="text-sm">{selectedOrder.customer?.email || 'N/A'}</p><p className="text-sm">{selectedOrder.customer?.phone || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-bold text-stone-400 uppercase">Address</p><p className="text-sm font-bold text-stone-800">{selectedOrder.customer?.address || 'N/A'}, {selectedOrder.customer?.city || 'N/A'}, Pincode: {selectedOrder.customer?.pincode || 'N/A'}</p></div>
                </div>
              </div>
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Fulfillment</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map(status => (
                      <button key={status} onClick={() => updateOrderStatus(selectedOrder._id, status, selectedOrder.trackingId)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${selectedOrder.status === status ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>{status}</button>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-stone-100 space-y-4">
                    <Input label="Tracking ID" value={selectedOrder.trackingId || ''} onChange={(e) => updateOrderStatus(selectedOrder._id, selectedOrder.status, e.target.value)} placeholder="Enter tracking ID" className="font-mono" />
                    {selectedOrder.couponCode && (
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Coupon: <span className="text-amber-600">{selectedOrder.couponCode}</span></p>
                        {selectedOrder.discountAmount && <p className="text-xs text-stone-400">Discount: -\u20B9{selectedOrder.discountAmount}</p>}
                      </div>
                    )}
                    <div><p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Total</p><p className="text-3xl font-bold text-stone-900">\u20B9{selectedOrder.amount?.toLocaleString()}</p></div>
                    <button onClick={() => deleteOrder(selectedOrder._id)} className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all border border-red-100 w-full justify-center"><Trash2 className="h-3.5 w-3.5" /> Delete Order</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Items ({selectedOrder.items?.length || 0})</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-white rounded-lg overflow-hidden border border-stone-100">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{item.title} <span className="text-stone-400 font-normal">x{item.qty}</span></p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {item.variant && <span className="text-[10px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded font-bold uppercase">{item.variant}</span>}
                          {(item.options || []).map((opt: string) => <span key={opt} className="text-[10px] bg-stone-50 text-stone-400 px-2.5 py-0.5 rounded border border-stone-100 font-bold uppercase">{opt}</span>)}
                        </div>
                        {item.customText && (
                          <div className="mt-2 bg-red-600 text-white p-2.5 rounded-lg inline-flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase opacity-80">PERSONALIZATION</span>
                            <span className="text-sm font-black uppercase tracking-widest">{item.customText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold">\u20B9{item.price * (item.qty || 1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkuLabel = () => {
    if (!showSkuLabel) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full text-center space-y-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Inventory Label</span>
            <button onClick={() => setShowSkuLabel(null)} className="text-stone-400 hover:text-stone-900"><X className="h-4 w-4" /></button>
          </div>
          <div className="border-2 border-stone-900 p-6 space-y-4 rounded-xl">
            <p className="font-bold text-xl tracking-tight">SATVASTONES.</p>
            <div className="bg-stone-50 py-4 font-mono text-xl font-bold tracking-widest border-y border-stone-100">
              {showSkuLabel.sku || 'NO SKU'}
            </div>
            <div className="w-full flex flex-col items-center py-4">
              <Barcode value={`${showSkuLabel.sku || 'NOSKU'}|${showSkuLabel.title?.substring(0,15) || ''}|${showSkuLabel.price || ''}|${showSkuLabel.category || ''}`} format="CODE128" width={1} height={50} displayValue={true} fontSize={10} margin={5} background="#ffffff" />
              <div className="mt-3 text-left w-full space-y-1">
                <p className="text-xs font-bold text-stone-800">SKU: {showSkuLabel.sku || 'NOSKU'}</p>
                <p className="text-[10px] text-stone-500">{showSkuLabel.title}</p>
                <p className="text-[10px] text-stone-400">\u20B9{showSkuLabel.price} | {showSkuLabel.category} | {showSkuLabel.material}</p>
                <p className="text-[10px] text-stone-400">Stock: {showSkuLabel.stockQuantity || 0}</p>
              </div>
            </div>
          </div>
          <button onClick={() => window.print()} className="w-full bg-stone-900 text-white py-4 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all">Print Label</button>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Mobile header */}
      <header className="lg:hidden bg-stone-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <h2 className="font-bold text-lg tracking-tight">SATVA ADMIN</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="p-1"><Menu className="h-6 w-6" /></button>
      </header>

      {/* Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {renderSidebar()}

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto min-h-screen">
        <PageHeader title={activeTab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} />

        <div className="space-y-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'banners' && renderBanners()}
          {activeTab === 'homepage-sections' && renderSections()}
          {activeTab === 'trends' && renderTrends()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'faqs' && renderFaqs()}
          {activeTab === 'sales' && renderSales()}
          {activeTab === 'special' && renderSpecialOffer()}
          {activeTab === 'ninetyNine' && renderNinetyNineSale()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'blogs' && renderBlogs()}
          {activeTab === 'coupons' && renderCoupons()}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {renderProductEditor()}
      {renderOrderDetail()}
      {renderSkuLabel()}
    </div>
  );
}
