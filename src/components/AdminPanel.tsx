import React, { useState } from 'react';
import { 
  Settings, Package, ShoppingCart, Users, Image as ImageIcon, 
  Type, Plus, Trash2, Edit3, Save, X, Timer, Zap, ArrowLeft, 
  CheckCircle, Clock, ChevronRight, UploadCloud, TrendingUp, ShoppingBag,
  Menu
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
    title: '', price: 0, oldPrice: 0, rating: 5, reviews: 0, images: [], category: 'NECKLACES', customOptions: [] 
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [tempCMSData, setTempCMSData] = useState<any>(cmsData);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    if (activeTab === 'orders') {
      fetch(`${API_URL}/orders`)
        .then(res => res.json())
        .then(data => setOrders(data));
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

  const saveProduct = (product: any) => {
    onUpdateProduct(product, 'edit');
    setEditingProduct(null);
  };

  const addProduct = (product: any) => {
    onUpdateProduct(product, 'add');
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
        fixed inset-y-0 left-0 w-72 bg-stone-900 text-white flex flex-col z-[80] transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:w-64 md:sticky md:top-0 md:h-screen
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
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
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
                title: '', price: 0, oldPrice: 0, rating: 5, reviews: 0, images: [], category: 'NECKLACES', customOptions: [] 
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
                      value={tempCMSData.hero.title}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, title: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Hero Sub Title</label>
                    <input 
                      type="text" 
                      value={tempCMSData.hero.subTitle}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, hero: { ...tempCMSData.hero, subTitle: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Hero Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempCMSData.hero.image}
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
                  {tempCMSData.categories.map((cat: any, idx: number) => (
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

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Image</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Price</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-stone-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {cmsData.products.map((product: any) => (
                    <tr key={product._id} className="hover:bg-stone-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-16 bg-stone-100 overflow-hidden">
                          <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold uppercase text-stone-900">{product.title}</p>
                        <p className="text-[9px] text-stone-400 mt-1">ID: #{product._id ? product._id.slice(-6) : product.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase bg-stone-100 px-2 py-1">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-stone-900">₹{product.price}</p>
                        <p className="text-[9px] text-stone-400 line-through">₹{product.oldPrice}</p>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => setEditingProduct(product)} className="text-stone-400 hover:text-black transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => removeProduct(product)} className="text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SETTINGS TAB */}
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
                      value={tempCMSData.settings.announcementText}
                      onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, announcementText: e.target.value }})}
                      className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden" 
                    />
                  </div>
                  <div className="flex items-center gap-4 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempCMSData.settings.showTimer}
                        onChange={(e) => setTempCMSData({ ...tempCMSData, settings: { ...tempCMSData.settings, showTimer: e.target.checked }})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </label>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900 flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Show Timer
                    </span>
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
              {orders && orders.length > 0 ? orders.map((order: any) => (
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-500">Category</label>
                <select 
                  value={editingProduct ? editingProduct.category : newProduct.category}
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full border border-stone-200 p-3 text-sm focus:border-black outline-hidden"
                >
                  {['NECKLACES', 'EARRINGS', 'RINGS', 'PENDANT', 'GIFTS', 'HAMPERS', 'ACCESSORIES', "MOTHER'S DAY"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                        <div className="w-12 h-16 bg-white overflow-hidden shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase">{item.title}</p>
                          <p className="text-[9px] text-stone-400 uppercase mt-1">QTY: {item.qty || 1}</p>
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
    </div>
  );
}
