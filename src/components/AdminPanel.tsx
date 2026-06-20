import React, { useState } from 'react';
import Barcode from 'react-barcode';
import QRCode from 'react-qrcode-logo';
import { 
  Settings, Package, ShoppingCart, Users, Image as ImageIcon, 
  Type, Plus, Trash2, Edit3, Save, X, Timer, Zap, ArrowLeft, 
  CheckCircle, Clock, ChevronRight, UploadCloud, TrendingUp, ShoppingBag,
  Menu, ShieldCheck, Search, Barcode as BarcodeIcon
} from 'lucide-react';
import { openUploadWidget } from '../utils/cloudinary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState<any>({ 
    title: '', price: 0, oldPrice: 0, rating: 5, reviewsCount: 0, reviews: [], images: [], category: 'necklaces', customOptions: [], variants: [], isFeatured: false, isAntiTarnish: false, isNinetyNine: false, metaTitle: '', metaDescription: '', focusKeywords: [], seoContent: '' 
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [tempCMSData, setTempCMSData] = useState<any>(cmsData);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showSkuLabel, setShowSkuLabel] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogForm, setBlogForm] = useState<any>({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: 'SATVASTONES', readTime: '5 min read', isPublished: false });

  // Fetch Blogs
  React.useEffect(() => {
    if (activeTab === 'blogs') {
      fetch(`${API_URL}/blogs`)
        .then(res => res.json())
        .then(data => setBlogs(data))
        .catch(err => console.error("Failed to fetch blogs:", err));
    }
  }, [activeTab]);

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = editingBlog || blogForm;
      const url = editingBlog ? `${API_URL}/blogs/${editingBlog._id}` : `${API_URL}/blogs`;
      const method = editingBlog ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const saved = await res.json();
        if (editingBlog) {
          setBlogs(prev => prev.map(b => b._id === saved._id ? saved : b));
        } else {
          setBlogs(prev => [saved, ...prev]);
        }
        setShowBlogForm(false);
        setEditingBlog(null);
        setBlogForm({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: 'SATVASTONES', readTime: '5 min read', isPublished: false });
      }
    } catch (err) {
      console.error("Failed to save blog:", err);
    }
  };

  const handleEditBlog = (post: any) => {
    setEditingBlog(post);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const res = await fetch(`${API_URL}/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
    }
  };

  // Check DB Connection
  React.useEffect(() => {
    fetch(`${API_URL}/cms`)
      .then(res => res.ok ? setDbStatus('connected') : setDbStatus('error'))
      .catch(() => setDbStatus('error'));
  }, []);

  // Sync temp data when cmsData changes from parent
  React.useEffect(() => {
    setTempCMSData(cmsData);
  }, [cmsData]);

  // Fetch Orders when tab changes
  React.useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      fetch(`${API_URL}/orders`)
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    }
  }, [activeTab]);

  const updateOrderStatus = async (orderId: string, status: string, trackingId?: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingId })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm('Permanently delete this order? This will remove it from all revenue figures and analytics.')) {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setOrders(prev => prev.filter(o => o._id !== orderId));
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error("Failed to delete order:", err);
      }
    }
  };

  const saveProduct = async (product: any) => {
    // Ensure primary image is set
    const updatedProduct = {
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : product.image
    };
    await onUpdateProduct(updatedProduct, 'edit');
    setEditingProduct(null);
  };

  const addProduct = async (product: any) => {
    // Ensure primary image is set
    const updatedProduct = {
      ...product,
      image: product.images && product.images.length > 0 ? product.images[0] : ''
    };
    await onUpdateProduct(updatedProduct, 'add');
    setNewProduct(null);
  };

  const removeProduct = (product: any) => {
    if (window.confirm('Delete this product?')) {
      onUpdateProduct(product, 'delete');
    }
  };

  const handleSaveCMS = async () => {
    setIsSaving(true);
    await onUpdateCMS(tempCMSData);
    setIsSaving(false);
    alert('Changes saved successfully!');
  };

  const cloudinaryConfig = {
    cloudName: cmsData.settings.cloudinaryCloudName,
    uploadPreset: cmsData.settings.cloudinaryUploadPreset
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-stone-900 text-white p-4 flex justify-between items-center sticky top-0 z-[60]">
        <h2 className="font-display text-lg font-bold tracking-tighter uppercase">Satva Admin</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 top-0 w-72 bg-stone-900 text-white flex flex-col z-[100] transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'left-0' : '-left-full'}
        md:relative md:left-0 md:flex md:w-64 md:sticky md:h-screen
      `}>
        <div className="p-8 border-b border-stone-800">
          <h2 className="font-display text-2xl font-bold tracking-tighter">SATVA ADMIN</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <p className="text-[9px] text-stone-500 uppercase tracking-widest">
              {dbStatus === 'connected' ? 'Database Live' : 'Database Offline'}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'content', icon: ImageIcon, label: 'Home Content' },
            { id: 'special', icon: Zap, label: 'Special Offer' },
            { id: 'ninetyNine', icon: Timer, label: '₹99 Sale' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'blogs', icon: Edit3, label: 'Blogs' },
            { id: 'coupons', icon: CheckCircle, label: 'Coupons' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === tab.id ? 'bg-white text-black' : 'hover:bg-stone-800 text-stone-400'}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-950/30 transition-all rounded-sm"
          >
            <X className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-stone-900">{activeTab}</h1>
            <p className="text-[10px] md:text-xs text-stone-500 uppercase tracking-widest mt-2">Manage your website {activeTab} here</p>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => setNewProduct({ 
                title: '', price: 0, oldPrice: 0, rating: 5, reviewsCount: 0, reviews: [], images: [], category: 'necklaces', customOptions: [], variants: [], isFeatured: false, isAntiTarnish: false, isNinetyNine: false, metaTitle: '', metaDescription: '', focusKeywords: [], seoContent: '' 
              })}
              className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          )}
        </header>

        {/* Tab Content */}
        <div className="bg-white rounded-sm shadow-sm border border-stone-200">
          
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (() => {
          const totalSales = orders.reduce((acc, o) => acc + (o.amount || 0), 0);
          const totalOrders = orders.length;
          const avgOrder = totalOrders > 0 ? (totalSales / totalOrders).toFixed(0) : 0;
          
          return (
            <div className="p-8 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-stone-50 p-8 border border-stone-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Revenue</p>
                  <h4 className="font-display text-4xl font-bold tracking-tighter">₹{totalSales.toLocaleString()}</h4>
                </div>
                <div className="bg-stone-50 p-8 border border-stone-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Orders</p>
                  <h4 className="font-display text-4xl font-bold tracking-tighter">{totalOrders}</h4>
                </div>
                <div className="bg-stone-50 p-8 border border-stone-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Avg. Order Value</p>
                  <h4 className="font-display text-4xl font-bold tracking-tighter">₹{avgOrder}</h4>
                </div>
              </div>

              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Recent Sales Activity</h3>
                <div className="overflow-x-auto -mx-8 px-8">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-stone-400">Order ID</th>
                        <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-stone-400">Customer</th>
                        <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-stone-400">Amount</th>
                        <th className="py-4 text-[9px] font-bold uppercase tracking-widest text-stone-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id || order._id} className="group">
                          <td className="py-4 text-[10px] font-bold uppercase tracking-tight text-stone-900">#{order.orderId?.slice(-8) || 'N/A'}</td>
                          <td className="py-4">
                            <p className="text-[10px] font-bold uppercase">{order.customer?.name}</p>
                            <p className="text-[9px] text-stone-400 uppercase">{order.customer?.city}</p>
                          </td>
                          <td className="py-4 text-[10px] font-bold uppercase text-stone-900">₹{order.amount}</td>
                          <td className="py-4 text-[9px] text-stone-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Low Stock Radar */}
              <section className="pt-12 border-t border-stone-100">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 mb-6 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Stock Radar: Low Inventory Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(cmsData?.products || [])
                    .filter((p: any) => (p.stockQuantity || 0) < 5)
                    .map((p: any) => (
                      <div key={p._id} className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-sm">
                        <div className="w-12 h-16 bg-white overflow-hidden shrink-0 shadow-sm">
                          <img src={p.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-stone-900 leading-tight">{p.title}</p>
                          <p className="text-[9px] font-bold uppercase text-red-600 mt-1 font-accent">STOCK: {p.stockQuantity || 0} LEFT</p>
                          <p className="text-[8px] text-stone-400 mt-0.5 uppercase tracking-tighter font-mono">SKU: {p.sku || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  {(cmsData?.products || []).filter((p: any) => (p.stockQuantity || 0) < 5).length === 0 && (
                    <div className="col-span-full py-12 text-center bg-stone-50 border border-stone-100 italic text-[10px] text-stone-300 uppercase tracking-widest">
                      <ShieldCheck className="h-6 w-6 mx-auto mb-3 text-stone-200" />
                      All inventory levels are healthy.
                    </div>
                  )}
                </div>
              </section>
            </div>
          );
        })()}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
            <div className="p-8 space-y-12">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Type className="h-4 w-4" /> Hero Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Hero Main Title</label>
                    <input 
                      type="text" 
                      value={tempCMSData?.hero?.title || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, title: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Hero Sub Title</label>
                    <input 
                      type="text" 
                      value={tempCMSData?.hero?.subTitle || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, subTitle: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Hero Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempCMSData?.hero?.image || ''}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, image: e.target.value }})}
                        className="flex-1 border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                      />
                      <button 
                        onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, image: url }}), cloudinaryConfig)}
                        className="bg-stone-100 hover:bg-stone-200 px-4 flex items-center gap-2 text-[10px] font-bold uppercase"
                      >
                        <UploadCloud className="h-4 w-4" /> Upload
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-12 border-t border-stone-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Category Tiles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(tempCMSData?.categories || []).map((cat: any, idx: number) => (
                    <div key={idx} className="p-4 border border-stone-100 bg-stone-50 space-y-4">
                      <div className="aspect-square bg-stone-200 overflow-hidden relative group/img">
                        <img src={cat.image} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => openUploadWidget((url) => {
                            const updated = [...tempCMSData.categories];
                            updated[idx].image = url;
                            setTempCMSData({ ...tempCMSData, categories: updated });
                          }, cloudinaryConfig)}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-[10px] font-bold uppercase"
                        >
                          <UploadCloud className="h-4 w-4" /> Replace
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={cat.title}
                        onChange={(e) => {
                          const updated = [...tempCMSData.categories];
                          updated[idx].title = e.target.value;
                          setTempCMSData({ ...tempCMSData, categories: updated });
                        }}
                        className="w-full text-[10px] font-bold uppercase border-b border-transparent focus:border-black bg-transparent py-1 outline-hidden"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <div className="pt-8 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="bg-stone-900 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Content Changes'}
                </button>
              </div>
            </div>
          )}
          
          {/* SPECIAL OFFER TAB */}
          {activeTab === 'special' && (
            <div className="p-8 space-y-12">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Live Campaign Banner
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 py-4 col-span-full">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempCMSData.specialOffer?.isActive}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, isActive: e.target.checked }})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900">Banner Visible on Home</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Banner Main Title</label>
                    <input 
                      type="text" 
                      value={tempCMSData.specialOffer?.title}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, title: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Highlight Word (Subtitle)</label>
                    <input 
                      type="text" 
                      value={tempCMSData.specialOffer?.subTitle}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, subTitle: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Campaign Description</label>
                    <textarea 
                      rows={3}
                      value={tempCMSData.specialOffer?.description}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, description: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden resize-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Banner Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempCMSData.specialOffer?.image}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, image: e.target.value }})}
                        className="flex-1 border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                      />
                      <button 
                        onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, image: url }}), cloudinaryConfig)}
                        className="bg-stone-100 hover:bg-stone-200 px-4 flex items-center gap-2 text-[10px] font-bold uppercase"
                      >
                        <UploadCloud className="h-4 w-4" /> Upload
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Linked Product ID (e.g. md-hamper)</label>
                    <input 
                      type="text" 
                      value={tempCMSData.specialOffer?.productId}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, specialOffer: { ...tempCMSData.specialOffer, productId: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="bg-stone-900 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Special Offer Changes'}
                </button>
              </div>
            </div>
          )}
          {/* ₹99 SALE TAB */}
          {activeTab === 'ninetyNine' && (
            <div className="p-8 space-y-12">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Timer className="h-4 w-4" /> ₹99 Flash Sale Campaign
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 py-4 col-span-full">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempCMSData.ninetyNineSale?.isActive}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, isActive: e.target.checked }})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900">Sale Section Visible on Home & Shop Pages</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Section Title</label>
                    <input 
                      type="text" 
                      value={tempCMSData.ninetyNineSale?.title || '₹99 Flash Sale'}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, title: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Subtitle</label>
                    <input 
                      type="text" 
                      value={tempCMSData.ninetyNineSale?.subTitle || 'Limited Stock Deal'}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, subTitle: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Sale Description</label>
                    <textarea 
                      rows={2}
                      value={tempCMSData.ninetyNineSale?.description || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, description: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden resize-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Banner Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempCMSData.ninetyNineSale?.bannerImage || ''}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, bannerImage: e.target.value }})}
                        className="flex-1 border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                      />
                      <button 
                        onClick={() => openUploadWidget((url) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, bannerImage: url }}), cloudinaryConfig)}
                        className="bg-stone-100 hover:bg-stone-200 px-4 flex items-center gap-2 text-[10px] font-bold uppercase"
                      >
                        <UploadCloud className="h-4 w-4" /> Upload
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Badge Text (e.g. ₹99 Only)</label>
                    <input 
                      type="text" 
                      value={tempCMSData.ninetyNineSale?.badgeText || '₹99 Only'}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, badgeText: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Guarantee Text</label>
                    <input 
                      type="text" 
                      value={tempCMSData.ninetyNineSale?.guaranteeText || 'Anti-Tarnish • Waterproof • No Color Fade • 100% Guaranteed'}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, ninetyNineSale: { ...tempCMSData.ninetyNineSale, guaranteeText: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                </div>
              </section>

              {/* Manage ₹99 Products */}
              <section className="pt-12 border-t border-stone-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Package className="h-4 w-4" /> ₹99 Sale Products ({tempCMSData?.products?.filter((p: any) => p.isNinetyNine).length || 0})
                </h3>
                <p className="text-[10px] text-stone-500 mb-4 uppercase tracking-wider">Toggle products below or use the "₹99 Sale" toggle in the product editor to mark items for this sale.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50">
                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-stone-400">Product</th>
                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-stone-400">Price</th>
                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-stone-400">In ₹99 Sale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(tempCMSData?.products || []).map((p: any) => (
                        <tr key={p._id} className="hover:bg-stone-50 transition-all">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 bg-stone-100 overflow-hidden shrink-0">
                                <img src={p.image} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-bold uppercase text-stone-900">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[10px] font-bold">₹{p.price}</td>
                          <td className="px-4 py-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={p.isNinetyNine || false}
                                onChange={(e) => {
                                  const updatedProducts = tempCMSData.products.map((prod: any) => 
                                    prod._id === p._id ? { ...prod, isNinetyNine: e.target.checked } : prod
                                  );
                                  setTempCMSData({ ...tempCMSData, products: updatedProducts });
                                }}
                                className="sr-only peer" 
                              />
                              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0.5px] after:left-[0.5px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="pt-8 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="bg-stone-900 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save ₹99 Sale Changes'}
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, SKU, or category..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 focus:border-black outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProductSearch(prev => prev === 'isNinetyNine' ? '' : 'isNinetyNine')}
                    className={`px-3 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${productSearch === 'isNinetyNine' ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-200 text-stone-500 hover:border-stone-900'}`}
                  >
                    ₹99 Sale
                  </button>
                  <button 
                    onClick={() => setNewProduct({ title: '', price: 0, oldPrice: 0, rating: 5, reviewsCount: 0, reviews: [], images: [], category: 'necklaces', customOptions: [], variants: [], sku: '', isFeatured: false, isAntiTarnish: false, isNinetyNine: false, metaTitle: '', metaDescription: '', focusKeywords: [], seoContent: '' })}
                    className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black"
                  >
                    <Plus className="h-3 w-3" /> Add New Product
                  </button>
                </div>
              </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Image</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Details & SKU</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Price</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-stone-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(cmsData?.products || [])
                    .filter((p: any) => {
                      if (productSearch === 'isNinetyNine') return p.isNinetyNine;
                      return p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
                        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
                        p.category.toLowerCase().includes(productSearch.toLowerCase());
                    })
                    .map((product: any) => (
                    <tr key={product._id} className="hover:bg-stone-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-16 bg-stone-100 overflow-hidden">
                          <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold uppercase text-stone-900">{product.title}</p>
                        <p className="text-[9px] text-stone-400 mt-1 font-mono uppercase">SKU: {product.sku || 'NOT SET'}</p>
                        {product.isNinetyNine && (
                          <span className="inline-block mt-1 text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 uppercase tracking-widest rounded-xs">₹99 Sale</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase bg-stone-100 px-2 py-1">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-stone-900">₹{product.price}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            (product.stockQuantity || 0) <= 0 ? 'bg-red-500' : 
                            (product.stockQuantity || 0) < 5 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                          }`} />
                          <span className="text-[9px] font-bold uppercase text-stone-400">Stock: {product.stockQuantity || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => setShowSkuLabel(product)} className="text-stone-400 hover:text-blue-500 transition-colors" title="Print SKU Label"><BarcodeIcon className="h-4 w-4" /></button>
                        <button onClick={() => setEditingProduct(product)} className="text-stone-400 hover:text-black transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => removeProduct(product)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-8 max-w-4xl">
              <div className="bg-white p-8 border border-stone-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight">Active Coupons</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Manage discount codes for your customers</p>
                  </div>
                  <button 
                    onClick={() => {
                      const code = window.prompt('Enter Coupon Code:');
                      const discount = window.prompt('Enter Discount Percentage (0-100):');
                      if (code && discount) {
                        setTempCMSData({
                          ...tempCMSData,
                          coupons: [...(tempCMSData.coupons || []), { code: code.toUpperCase(), discount: parseInt(discount), isActive: true }]
                        });
                      }
                    }}
                    className="flex items-center gap-2 bg-stone-900 text-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black"
                  >
                    <Plus className="h-3 w-3" /> Add Coupon
                  </button>
                </div>

                <div className="grid gap-4">
                  {(tempCMSData.coupons || []).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100 group">
                      <div className="flex items-center gap-4">
                        <div className="bg-stone-900 text-white px-3 py-1 text-xs font-bold font-accent tracking-tighter">
                          {c.code}
                        </div>
                        <div className="text-[10px] font-bold uppercase text-stone-900">
                          {c.discount}% Discount
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newCoupons = [...tempCMSData.coupons];
                          newCoupons.splice(i, 1);
                          setTempCMSData({ ...tempCMSData, coupons: newCoupons });
                        }}
                        className="text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {(!tempCMSData.coupons || tempCMSData.coupons.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed border-stone-100">
                      <Zap className="h-8 w-8 text-stone-100 mx-auto mb-4" />
                      <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">No active coupons</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-8">
                <button 
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="bg-stone-900 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3"
                >
                  {isSaving ? 'Processing...' : 'Save Coupon Changes'} <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 space-y-12">
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Offer Strip
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Announcement Text</label>
                    <input 
                      type="text" 
                      value={tempCMSData?.settings?.announcementText || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, announcementText: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="flex items-center gap-4 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempCMSData?.settings?.showTimer || false}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, showTimer: e.target.checked }})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900 flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Show Timer
                    </span>
                  </div>
                  {tempCMSData?.settings?.showTimer && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Timer End Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={tempCMSData?.settings?.timerEnd || ''}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, timerEnd: e.target.value }})}
                        className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                      />
                      <p className="text-[9px] text-stone-400 uppercase italic">Select when the current campaign or offer should end.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="pt-12 border-t border-stone-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> GST & Billing Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Business Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Satvastones Jewelry Studio"
                      value={tempCMSData.settings.businessName || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, businessName: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Official GSTIN</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 24XXXXX0000X1Z5"
                      value={tempCMSData.settings.gstin || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, gstin: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Business PAN</label>
                    <input 
                      type="text" 
                      placeholder="e.g. XXXXX0000X"
                      value={tempCMSData.settings.businessPan || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, businessPan: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Business Address (For Invoice)</label>
                    <textarea 
                      placeholder="Enter full legal address..."
                      value={tempCMSData.settings.businessAddress || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, businessAddress: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden min-h-[80px]" 
                    />
                  </div>
                </div>
              </section>

              <section className="pt-12 border-t border-stone-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" /> Image Upload (Cloudinary)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Cloud Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. djx98xyz"
                      value={tempCMSData.settings.cloudinaryCloudName || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, cloudinaryCloudName: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Upload Preset</label>
                    <input 
                      type="text" 
                      placeholder="e.g. unsigned_preset"
                      value={tempCMSData.settings.cloudinaryUploadPreset || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, cloudinaryUploadPreset: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                </div>
                <p className="text-[9px] text-stone-400 mt-4 italic uppercase tracking-tighter">Enter your Cloudinary details here to enable image uploads across the site.</p>
              </section>

              <section className="pt-12 border-t border-stone-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" /> Logo & SEO
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Website Logo URL</label>
                    <input 
                      type="text" 
                      placeholder="https://your-logo-url.com/logo.png"
                      value={tempCMSData.settings.logoUrl || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, logoUrl: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                    <p className="text-[9px] text-stone-400 italic">Upload your logo to Cloudinary and paste the URL here</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">SEO Title</label>
                    <input 
                      type="text" 
                      placeholder="Satvastones | Aesthetic Korean & Western Jewelry"
                      value={tempCMSData.settings.seoTitle || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, seoTitle: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">SEO Description</label>
                    <textarea 
                      placeholder="Discover our curated collection of aesthetic Korean and Western jewelry..."
                      value={tempCMSData.settings.seoDescription || ''}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, seoDescription: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden min-h-[80px]" 
                    />
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={handleSaveCMS}
                  disabled={isSaving}
                  className="bg-stone-900 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="p-8 space-y-6">
              <div className="relative max-w-md mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search by Order ID, Name, or Phone..." 
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-stone-200 focus:border-black outline-hidden bg-white shadow-sm"
                />
              </div>

              {orders && orders.length > 0 ? orders
                .filter((o: any) => 
                  o._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  o.customer?.phone?.includes(orderSearch) ||
                  (o.orderNumber && o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()))
                )
                .map((order: any) => (
                <div 
                  key={order._id || order.id || Math.random()} 
                  onClick={() => setSelectedOrder(order)}
                  className="group bg-white border border-stone-100 p-6 flex items-center justify-between hover:border-black transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-stone-50 flex items-center justify-center rounded-full">
                      <ShoppingBag className="h-5 w-5 text-stone-300" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest">{order.customer?.name || 'Guest Customer'}</p>
                      <p className="text-[9px] text-stone-400 uppercase tracking-tight">
                        #{order._id?.slice(-6) || order.id?.slice(-6) || 'ORDER'} • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'New'} • {order.paymentMethod || 'PREPAID'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[11px] font-bold">₹{order.amount || 0}</p>
                      <p className={`text-[9px] uppercase font-bold tracking-widest ${order.paymentMethod === 'COD' ? 'text-orange-600' : 'text-green-600'}`}>
                        {order.paymentMethod === 'COD' ? 'Pending (COD)' : 'Paid'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <Clock className="h-3 w-3" /> {order.status || 'Received'}
                    </span>
                    <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-black transition-colors" />
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 text-stone-300 uppercase text-xs tracking-widest italic">No orders found yet...</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Product Modal */}
      {(editingProduct || newProduct) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => { setEditingProduct(null); setNewProduct(null); }} className="text-stone-400 hover:text-black"><X className="h-6 w-6" /></button>
            </header>
            <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 no-scrollbar">
              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-500">Product Title</label>
                <input 
                  type="text" 
                  value={editingProduct ? editingProduct.title : newProduct.title}
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, title: e.target.value}) : setNewProduct({...newProduct, title: e.target.value})}
                  className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-500">Price (₹)</label>
                <input 
                  type="number" 
                  value={editingProduct ? editingProduct.price : newProduct.price}
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: Number(e.target.value)}) : setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-500">Old Price (₹)</label>
                <input 
                  type="number" 
                  value={editingProduct ? editingProduct.oldPrice : newProduct.oldPrice}
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)}) : setNewProduct({...newProduct, oldPrice: Number(e.target.value)})}
                  className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-500">Product Description</label>
                <textarea 
                  rows={3}
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden resize-none" 
                  placeholder="Describe the aesthetic and materials..."
                />
              </div>
              <div className="col-span-full space-y-4">
                <label className="text-[10px] font-bold uppercase text-stone-500">Product Images (Gallery)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(editingProduct ? editingProduct.images : newProduct.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-stone-100 border border-stone-200 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          const currentImages = editingProduct ? [...editingProduct.images] : [...newProduct.images];
                          currentImages.splice(idx, 1);
                          editingProduct ? setEditingProduct({...editingProduct, images: currentImages}) : setNewProduct({...newProduct, images: currentImages});
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => openUploadWidget((url) => {
                      const currentImages = editingProduct ? [...editingProduct.images] : [...(newProduct.images || [])];
                      currentImages.push(url);
                      editingProduct ? setEditingProduct({...editingProduct, images: currentImages}) : setNewProduct({...newProduct, images: currentImages});
                    }, cloudinaryConfig)}
                    className="aspect-square border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 hover:border-stone-400 transition-all text-stone-400 hover:text-stone-600"
                  >
                    <UploadCloud className="h-5 w-5" />
                    <span className="text-[8px] font-bold uppercase">Add Image</span>
                  </button>
                </div>
              </div>

              <div className="col-span-full space-y-4">
                <label className="text-[10px] font-bold uppercase text-stone-500">Custom Options (Colors / Choices)</label>
                <div className="flex flex-wrap gap-2">
                  {(editingProduct ? editingProduct.customOptions : newProduct.customOptions || []).map((opt: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-sm border border-stone-200">
                      <span className="text-[10px] font-bold uppercase tracking-tight">{opt}</span>
                      <button 
                         onClick={() => {
                          const currentOpts = editingProduct ? [...editingProduct.customOptions] : [...newProduct.customOptions];
                          currentOpts.splice(idx, 1);
                          editingProduct ? setEditingProduct({...editingProduct, customOptions: currentOpts}) : setNewProduct({...newProduct, customOptions: currentOpts});
                        }}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Royal Gold" 
                      id="new-opt-input"
                      className="border border-stone-200 px-3 py-1.5 text-[10px] uppercase outline-hidden"
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value.trim();
                          if (val) {
                            const currentOpts = editingProduct ? [...editingProduct.customOptions] : [...(newProduct.customOptions || [])];
                            currentOpts.push(val);
                            editingProduct ? setEditingProduct({...editingProduct, customOptions: currentOpts}) : setNewProduct({...newProduct, customOptions: currentOpts});
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <p className="text-[9px] text-stone-400 italic">Press Enter to add an option. These will appear as choices on the product page.</p>
              </div>

              {/* Color Variants with Images */}
              <div className="col-span-full space-y-6 border-t border-stone-100 pt-8 mt-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-bold uppercase text-stone-900 tracking-widest">Color-Specific Image Variants</label>
                   <button 
                     onClick={() => {
                        const currentVariants = editingProduct ? [...(editingProduct.variants || [])] : [...(newProduct.variants || [])];
                        currentVariants.push({ color: 'NEW COLOR', images: [] });
                        editingProduct ? setEditingProduct({...editingProduct, variants: currentVariants}) : setNewProduct({...newProduct, variants: currentVariants});
                     }}
                     className="px-4 py-2 bg-stone-100 text-[10px] font-bold uppercase hover:bg-stone-200 transition-all rounded-sm"
                   >
                     + Add Color Variant
                   </button>
                </div>

                <div className="space-y-8">
                  {(editingProduct ? editingProduct.variants : newProduct.variants || []).map((variant: any, vIdx: number) => (
                    <div key={vIdx} className="p-6 bg-stone-50 border border-stone-200 rounded-sm space-y-4">
                       <div className="flex justify-between items-center gap-4">
                          <input 
                            type="text" 
                            value={variant.color}
                            onChange={(e) => {
                              const currentVariants = editingProduct ? [...editingProduct.variants] : [...newProduct.variants];
                              currentVariants[vIdx].color = e.target.value.toUpperCase();
                              editingProduct ? setEditingProduct({...editingProduct, variants: currentVariants}) : setNewProduct({...newProduct, variants: currentVariants});
                            }}
                            className="bg-white border border-stone-200 px-3 py-2 text-[10px] font-bold uppercase outline-hidden focus:border-black w-full max-w-xs"
                          />
                          <button 
                            onClick={() => {
                              const currentVariants = editingProduct ? [...editingProduct.variants] : [...newProduct.variants];
                              currentVariants.splice(vIdx, 1);
                              editingProduct ? setEditingProduct({...editingProduct, variants: currentVariants}) : setNewProduct({...newProduct, variants: currentVariants});
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {variant.images.map((img: string, iIdx: number) => (
                            <div key={iIdx} className="relative aspect-square bg-white border border-stone-100 group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => {
                                  const currentVariants = editingProduct ? [...editingProduct.variants] : [...newProduct.variants];
                                  currentVariants[vIdx].images.splice(iIdx, 1);
                                  editingProduct ? setEditingProduct({...editingProduct, variants: currentVariants}) : setNewProduct({...newProduct, variants: currentVariants});
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => openUploadWidget((url) => {
                              const currentVariants = editingProduct ? [...editingProduct.variants] : [...newProduct.variants];
                              currentVariants[vIdx].images.push(url);
                              editingProduct ? setEditingProduct({...editingProduct, variants: currentVariants}) : setNewProduct({...newProduct, variants: currentVariants});
                            }, cloudinaryConfig)}
                            className="aspect-square border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 hover:border-stone-400 transition-all text-stone-400 hover:text-stone-600 bg-white"
                          >
                            <UploadCloud className="h-4 w-4" />
                            <span className="text-[7px] font-bold uppercase">Upload</span>
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-stone-400 italic">Configure color-specific galleries here. When a user chooses a color, the main gallery will switch to these images.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Product SKU / Serial Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SS-RING-01"
                    value={editingProduct ? (editingProduct.sku || '') : (newProduct.sku || '')}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, sku: e.target.value.toUpperCase()}) : setNewProduct({...newProduct, sku: e.target.value.toUpperCase()})}
                    className="w-full border border-stone-200 p-3 text-sm font-mono focus:border-black outline-hidden"
                  />
                  <p className="text-[9px] text-stone-400 uppercase italic">Unique identifier for physical barcode system.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Material Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 18K Gold Plated"
                    value={editingProduct ? (editingProduct.material || '') : (newProduct.material || '')}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, material: e.target.value}) : setNewProduct({...newProduct, material: e.target.value})}
                    className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Stock Quantity</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={editingProduct ? (editingProduct.stockQuantity || 0) : (newProduct.stockQuantity || 0)}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stockQuantity: Number(e.target.value)}) : setNewProduct({...newProduct, stockQuantity: Number(e.target.value)})}
                    className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Category</label>
                  <select 
                    value={editingProduct ? editingProduct.category : newProduct.category}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden"
                  >
                    {['necklaces', 'name necklace', 'earrings', 'rings', 'bracelets', 'pendant', 'gifts', 'hampers', 'accessories', "mother's day"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingProduct ? editingProduct.isFeatured : newProduct.isFeatured}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, isFeatured: e.target.checked}) : setNewProduct({...newProduct, isFeatured: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Mark as Featured (Show at top of Shop)</span>
              </div>

              {/* ₹99 Sale Toggle */}
              <div className="flex items-center gap-4 py-2 border border-stone-100 bg-rose-50 px-4 rounded-sm">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingProduct ? (editingProduct.isNinetyNine || false) : (newProduct.isNinetyNine || false)}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, isNinetyNine: e.target.checked}) : setNewProduct({...newProduct, isNinetyNine: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
                    ₹99 Sale Product
                  </span>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider mt-0.5">Shows this product in the ₹99 Flash Sale section on home & shop pages</p>
                </div>
              </div>

              {/* Anti-Tarnish Toggle */}
              <div className="flex items-center gap-4 py-2 border border-stone-100 bg-stone-50 px-4 rounded-sm">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingProduct ? (editingProduct.isAntiTarnish || false) : (newProduct.isAntiTarnish || false)}
                    onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, isAntiTarnish: e.target.checked}) : setNewProduct({...newProduct, isAntiTarnish: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    Anti-Tarnish Jewelry
                  </span>
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider mt-0.5">Displays an 'Anti-Tarnish' badge on the product card & detail page</p>
                </div>
              </div>

              {/* SEO Section */}
              <div className="col-span-full border-t border-stone-100 pt-8 mt-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Search className="h-4 w-4" /> SEO & Search Optimization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Meta Title (browser tab / search result)</label>
                    <input 
                      type="text" 
                      placeholder={editingProduct ? `Auto: ${editingProduct.title} | Satvastones` : 'Auto-generated from product name'}
                      value={editingProduct ? (editingProduct.metaTitle || '') : (newProduct.metaTitle || '')}
                      onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, metaTitle: e.target.value}) : setNewProduct({...newProduct, metaTitle: e.target.value})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                    <p className="text-[9px] text-stone-400 italic">Leave empty to auto-generate from product title.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Focus Keywords (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. anti-tarnish earrings, gold plated jewelry"
                      value={editingProduct ? ((editingProduct.focusKeywords || []).join(', ')) : ((newProduct.focusKeywords || []).join(', '))}
                      onChange={(e) => {
                        const keywords = e.target.value.split(',').map((k: string) => k.trim()).filter(Boolean);
                        editingProduct ? setEditingProduct({...editingProduct, focusKeywords: keywords}) : setNewProduct({...newProduct, focusKeywords: keywords});
                      }}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                    <p className="text-[9px] text-stone-400 italic">These keywords help search engines understand your product.</p>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Meta Description (search snippet)</label>
                    <textarea 
                      rows={2}
                      placeholder={editingProduct ? `Auto: Buy ${editingProduct.title} at ₹${editingProduct.price}. Anti-tarnish, waterproof jewelry.` : 'Auto-generated from product details'}
                      value={editingProduct ? (editingProduct.metaDescription || '') : (newProduct.metaDescription || '')}
                      onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, metaDescription: e.target.value}) : setNewProduct({...newProduct, metaDescription: e.target.value})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden resize-none" 
                    />
                    <p className="text-[9px] text-stone-400 italic">150-160 characters recommended. Leave empty to auto-generate.</p>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">SEO Content (HTML — overrides "About This Piece" section)</label>
                    <textarea 
                      rows={8}
                      placeholder="Custom product-specific SEO content with HTML. Include unique keywords, detailed description, and style notes. Leave empty for auto-generated content."
                      value={editingProduct ? (editingProduct.seoContent || '') : (newProduct.seoContent || '')}
                      onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, seoContent: e.target.value}) : setNewProduct({...newProduct, seoContent: e.target.value})}
                      className="w-full border border-stone-200 p-3 text-sm font-mono focus:border-black outline-hidden resize-none" 
                    />
                    <p className="text-[9px] text-stone-400 italic">Custom HTML content that replaces the generic "About This Piece" section on the product page. Great for per-product SEO.</p>
                  </div>
                </div>
              </div>
            </div>
            <footer className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-4">
              <button 
                onClick={() => { setEditingProduct(null); setNewProduct(null); }}
                className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-black"
              >
                Cancel
              </button>
              <button 
                onClick={() => editingProduct ? saveProduct(editingProduct) : addProduct(newProduct)}
                className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </footer>
          </div>
        </div>
      )}
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Order Details</h2>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">ID: #{selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-black"><X className="h-6 w-6" /></button>
            </header>
            
            <div className="p-8 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Customer Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Customer Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-stone-400">Name</p>
                      <p className="text-sm font-bold text-stone-900 uppercase">{selectedOrder.customer?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-stone-400">Email & Phone</p>
                      <p className="text-sm font-bold text-stone-900 uppercase">{selectedOrder.customer?.email || 'N/A'}</p>
                      <p className="text-sm font-bold text-stone-900 uppercase">{selectedOrder.customer?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-stone-400">Shipping Address</p>
                      <p className="text-sm font-bold text-stone-900 uppercase leading-relaxed">
                        {selectedOrder.customer?.address || 'N/A'}, {selectedOrder.customer?.city || 'N/A'}<br />
                        Pincode: {selectedOrder.customer?.pincode || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Fulfillment Status
                  </h3>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {['Confirmed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                        <button 
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder._id, status, selectedOrder.trackingId)}
                          className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all ${
                            selectedOrder.status === status ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-stone-100 space-y-4">
                       <div>
                         <p className="text-[9px] font-bold uppercase text-stone-400 mb-2">Tracking ID</p>
                         <input 
                           type="text" 
                           placeholder="ENTER TRACKING ID"
                           defaultValue={selectedOrder.trackingId}
                           onBlur={(e) => updateOrderStatus(selectedOrder._id, selectedOrder.status, e.target.value)}
                           className="w-full border border-stone-200 p-3 text-[11px] font-bold uppercase tracking-widest focus:border-black outline-hidden"
                         />
                       </div>
                       <div>
                         <p className="text-[9px] font-bold uppercase text-stone-400 mb-2">Total Paid</p>
                         <p className="text-3xl font-display font-bold text-stone-900">₹{selectedOrder.amount}</p>
                       </div>
                       <div className="pt-4">
                         <button 
                           onClick={() => deleteOrder(selectedOrder._id)}
                           className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100 w-full justify-center"
                         >
                           <Trash2 className="h-3 w-3" /> Delete Order Record
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">Items Ordered</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-white overflow-hidden shrink-0 border border-stone-100 shadow-sm">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-stone-900">{item.title} <span className="text-stone-400 font-normal ml-2">x{item.qty}</span></p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {item.variant && <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 font-bold uppercase tracking-widest">{item.variant}</span>}
                            {item.options && item.options.map((opt: string) => (
                              <span key={opt} className="text-[9px] bg-stone-50 text-stone-400 px-2 py-0.5 border border-stone-100 font-bold uppercase tracking-widest">{opt}</span>
                            ))}
                          </div>
                          {item.customText && (
                            <div className="mt-3 bg-red-600 text-white p-2.5 rounded-sm inline-flex flex-col gap-1 shadow-lg shadow-red-100">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">PERSONALIZATION</span>
                              <span className="text-[12px] font-black uppercase tracking-widest leading-none">{item.customText}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-bold">₹{item.price * (item.qty || 1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'blogs' && (
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">Blog Management</h2>
            <button 
              onClick={() => { setEditingBlog(null); setShowBlogForm(true); }}
              className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
            >
              New Post
            </button>
          </div>

          {showBlogForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowBlogForm(false) }}>
              <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">{editingBlog ? 'Edit Post' : 'New Post'}</h3>
                  <button onClick={() => setShowBlogForm(false)} className="text-stone-400 hover:text-black"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleBlogSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Title</label>
                    <input type="text" required value={editingBlog ? editingBlog.title : (blogForm?.title || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, title: e.target.value}) : setBlogForm({...blogForm, title: e.target.value})} className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Slug</label>
                    <input type="text" required value={editingBlog ? editingBlog.slug : (blogForm?.slug || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')}) : setBlogForm({...blogForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} className="w-full border border-stone-200 p-3 text-sm font-mono focus:border-black outline-hidden" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Excerpt</label>
                    <textarea rows={2} required value={editingBlog ? editingBlog.excerpt : (blogForm?.excerpt || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, excerpt: e.target.value}) : setBlogForm({...blogForm, excerpt: e.target.value})} className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Content (HTML)</label>
                    <textarea rows={12} required value={editingBlog ? editingBlog.content : (blogForm?.content || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, content: e.target.value}) : setBlogForm({...blogForm, content: e.target.value})} className="w-full border border-stone-200 p-3 text-sm font-mono focus:border-black outline-hidden" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Cover Image URL</label>
                      <input type="url" value={editingBlog ? editingBlog.image : (blogForm?.image || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, image: e.target.value}) : setBlogForm({...blogForm, image: e.target.value})} className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Category</label>
                      <input type="text" value={editingBlog ? editingBlog.category : (blogForm?.category || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, category: e.target.value}) : setBlogForm({...blogForm, category: e.target.value})} className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Author</label>
                      <input type="text" value={editingBlog ? editingBlog.author : (blogForm?.author || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, author: e.target.value}) : setBlogForm({...blogForm, author: e.target.value})} className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Read Time</label>
                      <input type="text" placeholder="5 min read" value={editingBlog ? editingBlog.readTime : (blogForm?.readTime || '')} onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, readTime: e.target.value}) : setBlogForm({...blogForm, readTime: e.target.value})} className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editingBlog ? editingBlog.isPublished : (blogForm?.isPublished || false)} 
                      onChange={(e) => editingBlog ? setEditingBlog({...editingBlog, isPublished: e.target.checked}) : setBlogForm({...blogForm, isPublished: e.target.checked})}
                      className="w-4 h-4" 
                    />
                    <span className="text-[10px] font-bold uppercase text-stone-500">Published</span>
                  </label>
                  <div className="flex gap-4 pt-4 border-t border-stone-100">
                    <button type="submit" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
                      {editingBlog ? 'Update Post' : 'Create Post'}
                    </button>
                    <button type="button" onClick={() => setShowBlogForm(false)} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-black transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {blogs.map((post: any) => (
              <div key={post._id} className="flex items-center justify-between p-4 bg-white border border-stone-100 hover:border-stone-200 transition-all">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-stone-50 overflow-hidden shrink-0">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{post.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${post.isPublished ? 'text-green-600' : 'text-stone-300'}`}>{post.isPublished ? 'Published' : 'Draft'}</span>
                      <span className="text-[9px] text-stone-400">{post.category || 'Uncategorized'}</span>
                      <span className="text-[9px] text-stone-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button onClick={() => handleEditBlog(post)} className="p-2 text-stone-400 hover:text-black transition-all"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteBlog(post._id)} className="p-2 text-stone-400 hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {(!blogs || blogs.length === 0) && (
              <div className="text-center py-16 border border-dashed border-stone-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">No blog posts yet</p>
                <p className="text-[9px] text-stone-300 mt-2">Create your first journal entry to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* SKU Label Modal (Barcode Concept) */}
      {showSkuLabel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-sm shadow-2xl max-w-sm w-full text-center space-y-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Inventory Label</span>
              <button onClick={() => setShowSkuLabel(null)} className="text-stone-400 hover:text-black"><X className="h-4 w-4" /></button>
            </div>
            
            <div className="border-2 border-black p-6 space-y-4">
              <p className="font-display text-xl font-bold tracking-tight">SATVASTONES.</p>
              <div className="bg-stone-50 py-4 font-mono text-xl font-bold tracking-[0.5em] border-y border-stone-100">
                {showSkuLabel.sku || 'NO SKU SET'}
              </div>
              <div className="w-full flex flex-col items-center py-4 bg-white">
                <Barcode 
                  value={`${showSkuLabel.sku || 'NOSKU'}|${showSkuLabel.title?.substring(0,15) || ''}|${showSkuLabel.price || ''}|${showSkuLabel.category || ''}`} 
                  format="CODE128" 
                  width={1} 
                  height={50} 
                  displayValue={true}
                  fontSize={10}
                  margin={5}
                  background="#ffffff"
                />
                <div className="mt-3 text-left w-full">
                  <p className="text-[10px] font-bold text-stone-800">SKU: {showSkuLabel.sku || 'NOSKU'}</p>
                  <p className="text-[8px] text-stone-500 uppercase">{showSkuLabel.title}</p>
                  <p className="text-[8px] text-stone-400">₹{showSkuLabel.price} | {showSkuLabel.category} | {showSkuLabel.material}</p>
                  <p className="text-[8px] text-stone-400">Stock: {showSkuLabel.stockQuantity || 0}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.print()}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
            >
              Print Physical Label
            </button>
            <p className="text-[8px] text-stone-400 uppercase">Attach this to your physical product packaging.</p>
          </div>
        </div>
      )}
    </div>
  );
}
