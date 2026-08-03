import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Gift, LogOut, Package, Tag, ClipboardList, 
  CheckCircle, AlertCircle, Loader2, Users, Shield, 
  BarChart3, LayoutDashboard, Settings, Bell, Search, 
  Filter, MoreHorizontal, MapPin, TrendingUp, TrendingDown,
  ShoppingBag, ArrowUpRight, ArrowDownRight, RefreshCcw
} from 'lucide-react';
import ChatWidget from './components/ChatWidget';
import api from './api';

type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'users' | 'roles' | 'reports';

interface AnalyticsSummary { totalRevenue: number; totalOrders: number; totalCustomers: number; lowStockItems: number; }
interface SalesStat { productName: string; totalSales: number; totalRevenue: number; }
interface Order { id: string; orderNumber: string; status: string; totalAmount: number; orderDate: string; recipientName: string; assignedStaffId?: string; }
interface Category { id: string; name: string; description: string; imageUrl: string; }
interface Product { id: string; name: string; price: number; stockQuantity: number; categoryName: string; categoryId?: string; imageUrl: string; }
interface User { id: string; firstName: string; lastName: string; email: string; isActive: boolean; roles: string[]; phoneNumber?: string; fullAddress?: string; jobTitle?: string; companyName?: string; }

const COLORS = ['#e21b5a', '#101130', '#f472b6', '#3b82f6', '#10b981', '#f59e0b'];

export default function Admin() {
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userRoles = currentUser?.roles || [];
  
  const isDelivery = userRoles.includes('Delivery') && !userRoles.includes('Admin') && !userRoles.includes('SuperAdmin');
  const isManager = userRoles.includes('SalesPerson') || userRoles.includes('Manager');
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('SuperAdmin');

  const [tab, setTab] = useState<Tab>(isDelivery ? 'orders' : 'dashboard');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{id?: string, name: string, permissions?: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserRole, setNewUserRole] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<{id?: string, name: string, permissions?: string} | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [modalStatus, setModalStatus] = useState<string>('');
  const [podFile, setPodFile] = useState<File | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard' || tab === 'reports') {
        const [sum, sales] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/sales-stats')
        ]);
        setSummary(sum.data);
        setSalesStats(sales.data);
      }
      if (tab === 'orders') {
        const res = await api.get('/orders');
        setOrders(res.data.data);
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
      }
      if (tab === 'products') {
        const res = await api.get('/products?pageSize=100');
        setProducts(res.data.data);
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
      }
      if (tab === 'categories') {
        const res = await api.get('/categories');
        setCategories(res.data);
      }
      if (tab === 'users' || tab === 'roles') {
        const [usersRes, rolesRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/roles')
        ]);
        setUsers(usersRes.data);
        setAvailableRoles(rolesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const sidebarBtn = (t: Tab, label: string, Icon: any) => (
    <button 
      onClick={() => { setTab(t); setShowProductForm(false); setShowCategoryForm(false); }}
      className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-2xl ${
        tab === t ? 'bg-[#e21b5a] text-white shadow-xl shadow-[#e21b5a]/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/images/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url as string;
  };

  const handleSaveCategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name') as string;
    const description = fd.get('description') as string;
    const imageFile = (e.target.image as HTMLInputElement).files?.[0];
    
    let imageUrl = editingCategory?.imageUrl || '';
    if (imageFile) {
      try { imageUrl = await uploadImage(imageFile); } catch { alert('Image upload failed'); return; }
    }
    
    const payload = { name, description, imageUrl };
    try {
      if (editingCategory?.id) {
        await api.put(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleSaveProduct = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name') as string;
    const description = fd.get('description') as string;
    const price = parseFloat(fd.get('price') as string);
    const stockQuantity = parseInt(fd.get('stockQuantity') as string);
    const categoryId = fd.get('categoryId') as string;
    const imageFile = (e.target.image as HTMLInputElement).files?.[0];
    
    let imageUrl = editingProduct?.imageUrl || '';
    if (imageFile) {
      try { imageUrl = await uploadImage(imageFile); } catch { alert('Image upload failed'); return; }
    }

    const payload = { name, description, price, stockQuantity, imageUrl, categoryId };
    try {
      if (editingProduct?.id) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      role: fd.get('role') as string || '',
      phoneNumber: fd.get('phoneNumber') as string,
      fullAddress: fd.get('fullAddress') as string,
      pincode: fd.get('pincode') as string || '',
      jobTitle: fd.get('jobTitle') as string || '',
      companyName: fd.get('companyName') as string || '',
    };
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post('/admin/users', payload);
      }
      setShowUserForm(false);
      setEditingUser(null);
      setNewUserRole('');
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save user';
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        const errorDetails = errors.map((e: any) => e.description || e).join('\n');
        alert(`${message}\n\n${errorDetails}`);
      } else {
        alert(message);
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.post(`/admin/users/${id}/toggle-status`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string, message?: string, staffId?: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { 
        status: newStatus, 
        message: message || '', 
        assignedStaffId: staffId || null 
      });

      if (newStatus === 'Delivered' && podFile) {
        const formData = new FormData();
        formData.append('file', podFile);
        await api.post(`/orders/${id}/pod`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setUpdatingOrder(null);
      setStatusUpdateMessage('');
      setAssignedStaffId('');
      setPodFile(null);
      setModalStatus('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      alert('Password reset instructions and new credentials have been sent to their email.');
    } catch (err) {
      alert('Failed to initiate password reset.');
    }
  };

  const handleSaveRole = async (e: any) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const perms: any[] = [];
    
    // Page-based CRUD
    ['orders', 'inventory', 'users'].forEach(page => {
      const crud = {
        page,
        create: data[`perm_${page}_create`] === 'on',
        read: data[`perm_${page}_read`] === 'on',
        update: data[`perm_${page}_update`] === 'on',
        delete: data[`perm_${page}_delete`] === 'on',
      };
      if (crud.create || crud.read || crud.update || crud.delete) {
        perms.push(crud);
      }
    });

    // Notifications
    const notifications = {
      type: 'notifications',
      email: data['perm_notif_email'] === 'on',
      otp: data['perm_notif_otp'] === 'on',
    };
    perms.push(notifications);
    
    const payload = {
      name: data.name,
      permissions: JSON.stringify(perms)
    };

    try {
      if (editingRole?.id) {
        await api.put(`/admin/roles/${editingRole.id}`, payload);
      } else {
        await api.post('/admin/roles', payload);
      }
      setShowRoleForm(false);
      setEditingRole(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/admin/roles/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex font-sans">
      {/* Premium Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-8 sticky top-0 h-screen shrink-0">
        <div className="mb-12 px-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-[#101130] p-2.5 rounded-xl">
              <img src="/mon_logo.png" className="h-6 w-auto brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 tracking-tighter">MON GIFTS</h1>
              <p className="text-[9px] text-[#e21b5a] font-bold uppercase tracking-widest">Command Center</p>
            </div>
          </Link>
        </div>

        <nav className="flex-grow space-y-1">
          {(!isDelivery) && sidebarBtn('dashboard', 'Overview', LayoutDashboard)}
          {sidebarBtn('orders', 'Transactions', ClipboardList)}
          {(!isDelivery) && sidebarBtn('products', 'Inventory', Package)}
          {(!isDelivery) && sidebarBtn('categories', 'Collections', Tag)}
          {(!isDelivery) && sidebarBtn('reports', 'Analytics', BarChart3)}
          {isAdmin && sidebarBtn('users', 'Personnel', Users)}
          {isAdmin && sidebarBtn('roles', 'Permissions', Shield)}
        </nav>

        <div className="pt-8 mt-8 border-t border-gray-50">
          <div className="bg-gray-50 p-4 rounded-2xl mb-6">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-bold text-gray-900 uppercase">Live Hub-01</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-50 rounded-2xl transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Experience */}
      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Link to="/admin" className="hover:text-gray-900">Admin</Link>
              <span>/</span>
              <span className="text-[#e21b5a]">{tab}</span>
            </div>
            <h2 className="text-4xl font-serif text-gray-900 capitalize">{tab}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-2 flex gap-1 shadow-sm">
              <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#e21b5a] hover:bg-gray-50 rounded-xl transition-all">
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="w-12 h-12 bg-[#101130] rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#101130]/20 uppercase">
              {currentUser?.firstName?.[0] || 'A'}{currentUser?.lastName?.[0] || 'D'}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-300">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#e21b5a]" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Synchronizing Intelligence...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            
            {/* OVERVIEW TAB */}
            {tab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><TrendingUp className="w-6 h-6" /></div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+18%</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">${summary?.totalRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Revenue</p>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-[#e21b5a]/5 rounded-2xl flex items-center justify-center text-[#e21b5a]"><ShoppingBag className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{summary?.totalOrders}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Success Orders</p>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-[#101130]/5 rounded-2xl flex items-center justify-center text-[#101130]"><Users className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{summary?.totalCustomers}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified Members</p>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><AlertCircle className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{summary?.lowStockItems}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory Alerts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-serif">Product Performance</h3>
                      <button className="text-[10px] font-bold text-[#e21b5a] uppercase tracking-widest">View Full Report</button>
                    </div>
                    <div className="space-y-8">
                      {salesStats.slice(0, 5).map((stat, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between items-end mb-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{stat.productName}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{stat.totalSales} Units Sold</p>
                            </div>
                            <p className="text-sm font-bold text-[#e21b5a]">${stat.totalRevenue.toLocaleString()}</p>
                          </div>
                          <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-1000 ease-out rounded-full" 
                              style={{ 
                                width: `${(stat.totalRevenue / (salesStats[0]?.totalRevenue || 1)) * 100}%`,
                                backgroundColor: COLORS[i % COLORS.length]
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#101130] p-10 rounded-[40px] text-white overflow-hidden relative">
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Platform Efficiency</p>
                        <p className="text-4xl font-bold mb-8 tracking-tighter">94.2%</p>
                        <div className="flex items-center gap-3 text-xs font-bold text-green-400">
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Performance Optimized</span>
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#e21b5a] rounded-full blur-[80px] opacity-20"></div>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest border-b border-gray-50 pb-4">Team Activity</h3>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><CheckCircle className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">Inventory Sync</p>
                            <p className="text-[10px] text-gray-400">2 mins ago by Supervisor</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-[#e21b5a]/5 rounded-xl flex items-center justify-center text-[#e21b5a]"><Package className="w-5 h-5" /></div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">New Batch Uploaded</p>
                            <p className="text-[10px] text-gray-400">1 hr ago by Admin</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* PRODUCTS TAB */}
            {tab === 'products' && (
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="text-xl font-serif">Inventory Management</h3>
                  {!showProductForm && (
                    <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="bg-[#101130] text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Experience
                    </button>
                  )}
                </div>
                
                {showProductForm ? (
                  <div className="p-8">
                    <form onSubmit={handleSaveProduct} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Name</label>
                          <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                          <select name="categoryId" defaultValue={editingProduct?.categoryId} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price ($)</label>
                          <input type="number" step="0.01" name="price" defaultValue={editingProduct?.price} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stock Quantity</label>
                          <input type="number" name="stockQuantity" defaultValue={editingProduct?.stockQuantity} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                          <textarea name="description" defaultValue={editingProduct?.description} rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a] resize-none"></textarea>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Image</label>
                          <input type="file" name="image" accept="image/*" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                          {editingProduct?.imageUrl && <img src={editingProduct.imageUrl} className="h-20 mt-2 rounded-lg" />}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{editingProduct ? `Editing: ${editingProduct.name}` : 'New Product'}</p>
                        <div className="flex gap-4">
                          <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                          <button type="submit" className="px-6 py-3 bg-[#e21b5a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#101130] transition-all">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                    <tr>
                      <th className="px-10 py-6">Identity</th>
                      <th className="px-6 py-6">Category</th>
                      <th className="px-6 py-6">Financials</th>
                      <th className="px-6 py-6">Availability</th>
                      <th className="px-6 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                              {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Gift className="w-6 h-6" /></div>}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">SKU-{p.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-xs text-gray-500 font-bold uppercase tracking-widest">{p.categoryName}</td>
                        <td className="px-6 py-6 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${p.stockQuantity <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${p.stockQuantity <= 5 ? 'text-red-600' : 'text-gray-400'}`}>
                              {p.stockQuantity} in stock
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className="text-xs font-bold text-blue-500 hover:underline mr-4">Edit</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            )}

            {/* CATEGORIES TAB */}
            {tab === 'categories' && (
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="text-xl font-serif">Collections Management</h3>
                  {!showCategoryForm && (
                    <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }} className="bg-[#101130] text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Collection
                    </button>
                  )}
                </div>
                
                {showCategoryForm ? (
                  <div className="p-8">
                    <form onSubmit={handleSaveCategory} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Collection Name</label>
                          <input name="name" defaultValue={editingCategory?.name} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                          <textarea name="description" defaultValue={editingCategory?.description} rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]"></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Collection Image</label>
                          <input type="file" name="image" accept="image/*" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                          {editingCategory?.imageUrl && <img src={editingCategory.imageUrl} className="h-20 mt-2 rounded-lg" />}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{editingCategory ? `Editing: ${editingCategory.name}` : 'New Collection'}</p>
                        <div className="flex gap-4">
                          <button type="button" onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                          <button type="submit" className="px-6 py-3 bg-[#e21b5a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#101130] transition-all">{editingCategory ? 'Save Changes' : 'Create Collection'}</button>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                    <tr>
                      <th className="px-10 py-6">Collection Identity</th>
                      <th className="px-6 py-6">Description</th>
                      <th className="px-6 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                              {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag className="w-6 h-6" /></div>}
                            </div>
                            <p className="text-sm font-bold text-gray-900">{c.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-xs text-gray-500 max-w-xs truncate">{c.description}</td>
                        <td className="px-6 py-6 text-right">
                          <button onClick={() => { setEditingCategory(c); setShowCategoryForm(true); }} className="text-xs font-bold text-blue-500 hover:underline mr-4">Edit</button>
                          <button onClick={() => handleDeleteCategory(c.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {tab === 'orders' && (
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="text-xl font-serif">Logistics Hub</h3>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"><Filter className="w-4 h-4" /> Filter</button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#101130] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-all"><ArrowDownRight className="w-4 h-4" /> Export</button>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                    <tr>
                      <th className="px-10 py-6">Ref Number</th>
                      <th className="px-6 py-6">Recipient</th>
                      <th className="px-6 py-6">Financials</th>
                      <th className="px-6 py-6">Current Phase</th>
                      <th className="px-6 py-6 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-10 py-6 font-mono text-sm font-bold text-[#e21b5a]">{o.orderNumber}</td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-bold text-gray-900">{o.recipientName}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            <MapPin className="w-3 h-3" /> Trichy Region
                            {o.assignedStaffId && <span className="ml-2 text-blue-500">Assigned</span>}
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-gray-900">${o.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 
                              o.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                              o.status === 'Assigned' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                              o.status === 'OutForDelivery' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                              'bg-gray-50 text-gray-500 border-gray-100'
                            }`}>
                              {o.status === 'OutForDelivery' ? 'Out For Delivery' : o.status}
                            </span>
                            <button 
                              onClick={() => {
                                setUpdatingOrder(o);
                                setAssignedStaffId(o.assignedStaffId || '');
                              }} 
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#e21b5a] transition-all"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right text-[10px] text-gray-400 font-bold uppercase">{new Date(o.orderDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Status Update Modal */}
                {updatingOrder && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                      <div className="p-10">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-2xl font-serif text-gray-900 mb-1">Update Order</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{updatingOrder.orderNumber}</p>
                          </div>
                          <button onClick={() => {
                            setUpdatingOrder(null);
                            setPodFile(null);
                            setModalStatus('');
                          }} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                            <LogOut className="w-5 h-5 rotate-180" />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Update Status</label>
                            <select 
                              value={modalStatus || updatingOrder.status}
                              onChange={(e) => setModalStatus(e.target.value)}
                              id="modalStatus"
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e21b5a] transition-all"
                            >
                              {!isDelivery && <option value="Pending">Pending</option>}
                              {!isDelivery && <option value="Confirmed">Confirmed</option>}
                              {!isDelivery && <option value="Assigned">Assigned</option>}
                              <option value="OutForDelivery">Out For Delivery</option>
                              <option value="Delivered">Delivered</option>
                              {!isDelivery && <option value="Cancelled">Cancelled</option>}
                            </select>
                          </div>

                          {(modalStatus || updatingOrder.status) === 'Delivered' && (
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Proof of Delivery</label>
                              <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus-within:border-[#e21b5a] transition-all flex items-center">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#e21b5a] file:text-white hover:file:bg-[#101130] file:transition-all cursor-pointer text-gray-500"
                                />
                              </div>
                            </div>
                          )}

                          {!isDelivery && (
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Assign Personnel</label>
                              <select 
                                value={assignedStaffId}
                                onChange={(e) => setAssignedStaffId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e21b5a] transition-all"
                              >
                                <option value="">Unassigned</option>
                                {users.filter(u => u.roles.includes('Delivery') || u.roles.includes('Admin')).map(u => (
                                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.roles[0]})</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Notification Message</label>
                            <textarea 
                              placeholder="Add a custom message for the customer..."
                              value={statusUpdateMessage}
                              onChange={(e) => setStatusUpdateMessage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e21b5a] transition-all min-h-[100px] resize-none"
                            ></textarea>
                            <p className="mt-2 text-[10px] text-gray-400">This message will be sent to the customer via Email and SMS.</p>
                          </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                          <button 
                            onClick={() => {
                              setUpdatingOrder(null);
                              setPodFile(null);
                              setModalStatus('');
                            }}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                          >
                            Discard
                          </button>
                          <button 
                            onClick={() => {
                              const s = (document.getElementById('modalStatus') as HTMLSelectElement).value;
                              handleUpdateOrderStatus(updatingOrder.id, s, statusUpdateMessage, assignedStaffId);
                            }}
                            className="flex-1 py-4 bg-[#e21b5a] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#e21b5a]/20 hover:bg-[#101130] transition-all"
                          >
                            Update & Notify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PERSONNEL TAB */}
            {tab === 'users' && (
              <div className="space-y-10">
                {showUserForm && (
                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="text-xl font-serif mb-8">{editingUser ? `Edit: ${editingUser.firstName} ${editingUser.lastName}` : 'Enroll New Personnel / User'}</h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">First Name</label>
                        <input name="firstName" defaultValue={editingUser?.firstName} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
                        <input name="lastName" defaultValue={editingUser?.lastName} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                        <input type="email" name="email" defaultValue={editingUser?.email} disabled={!!editingUser} required={!editingUser} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a] disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{editingUser ? 'New Password (leave blank to keep)' : 'Temporary Password'}</label>
                        <input type="password" name="password" required={!editingUser} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                        <input type="tel" name="phoneNumber" defaultValue={editingUser?.phoneNumber} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                      </div>
                      <div>
                        <select name="role" value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]">
                          <option value="">Select Role</option>
                          <option value="Customer">Default Customer</option>
                          {availableRoles.filter(r => r.name !== 'Customer').map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pincode / Zip</label>
                        <input name="pincode" defaultValue={editingUser?.pincode} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Address</label>
                        <textarea name="fullAddress" defaultValue={editingUser?.fullAddress} required rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a] resize-none"></textarea>
                      </div>

                      {/* Dynamic Staff Information */}
                      {newUserRole !== '' && newUserRole !== 'Customer' && (
                        <>
                          <div className="col-span-2 mt-4 pt-4 border-t border-gray-50">
                            <h4 className="text-sm font-bold text-[#101130] uppercase tracking-widest mb-4">Professional Information</h4>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Job Title</label>
                            <input name="jobTitle" defaultValue={editingUser?.jobTitle} required={newUserRole !== ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Company Name</label>
                            <input name="companyName" defaultValue={editingUser?.companyName} required={newUserRole !== ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                          </div>
                        </>
                      )}

                      <div className="col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-50 mt-2">
                        <button type="button" onClick={() => { setShowUserForm(false); setEditingUser(null); setNewUserRole(''); }} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                        <button type="submit" className="px-6 py-3 bg-[#101130] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-all">{editingUser ? 'Save Changes' : 'Create Account'}</button>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {users.map(u => (
                    <div key={u.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative group hover:border-[#e21b5a] transition-all flex flex-col justify-between">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[#101130] text-white rounded-[24px] flex items-center justify-center text-2xl font-serif mb-6 shadow-xl shadow-[#101130]/20">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                        <h4 className="text-lg font-serif text-gray-900 mb-1">{u.firstName} {u.lastName}</h4>
                        <p className="text-xs text-gray-400">{u.email}</p>
                        {u.phoneNumber && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{u.phoneNumber}</p>}
                        
                        {(u.jobTitle || u.companyName) && (
                          <div className="mt-3 mb-4 text-[10px] text-gray-500 font-medium">
                            <p>{u.jobTitle}</p>
                            <p className="font-bold text-gray-800">{u.companyName}</p>
                          </div>
                        )}
                        {!u.jobTitle && !u.companyName && <div className="mb-8"></div>}
                        
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                          {u.roles?.length ? u.roles.map(r => (
                            <span key={r} className="bg-gray-50 text-gray-500 text-[9px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest border border-gray-100">{r}</span>
                          )) : <span className="bg-gray-50 text-gray-400 text-[9px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest border border-gray-100">Customer</span>}
                        </div>
                      </div>
                      
                      <div className="w-full flex flex-col gap-3">
                        <button onClick={() => handleResetPassword(u.email)} className="w-full bg-blue-50 text-blue-600 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all">Reset Password</button>
                        <div className="w-full pt-4 border-t border-gray-50 flex gap-3">
                          <button onClick={() => { 
                            setEditingUser(u); 
                            const role = u.roles?.[0] || '';
                            setNewUserRole(role === 'Customer' ? '' : role); 
                            setShowUserForm(true); 
                          }} className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:text-[#e21b5a] transition-all">Edit</button>
                          <button onClick={() => handleToggleStatus(u.id)} className={`flex-1 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${u.isActive ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {u.isActive ? 'Suspend' : 'Reinstate'}
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="flex-1 bg-red-50 text-red-500 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!showUserForm && (
                    <button onClick={() => { setEditingUser(null); setNewUserRole(''); setShowUserForm(true); }} className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-[40px] p-10 flex flex-col items-center justify-center text-gray-300 hover:border-[#e21b5a] hover:text-[#e21b5a] transition-all group min-h-[300px]">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-100 flex items-center justify-center mb-4 group-hover:border-[#e21b5a]"><Plus className="w-8 h-8" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Enroll Personnel</p>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ROLES TAB */}
            {tab === 'roles' && (
              <div className="space-y-10">
                {showRoleForm && (
                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="text-xl font-serif mb-8">{editingRole ? 'Update Role' : 'Create New Role'}</h3>
                    <form onSubmit={handleSaveRole} className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Role Name</label>
                        <input name="name" defaultValue={editingRole?.name} disabled={editingRole?.name === 'SuperAdmin'} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e21b5a]" />
                      </div>
                      <div>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['orders', 'inventory', 'users'].map(page => {
                              const pagePerms = (() => {
                                try {
                                  const p = JSON.parse(editingRole?.permissions || "[]");
                                  return p.find((item: any) => item.page === page) || {};
                                } catch { return {}; }
                              })();
                              
                              return (
                                <div key={page} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-[#101130]">{page} Access</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    {['create', 'read', 'update', 'delete'].map(action => (
                                      <label key={action} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-[#e21b5a]">
                                        <input type="checkbox" name={`perm_${page}_${action}`} defaultChecked={pagePerms[action]} className="w-3.5 h-3.5 rounded border-gray-300 text-[#e21b5a] focus:ring-[#e21b5a]" />
                                        <span className="capitalize">{action}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-[#101130] p-6 rounded-2xl text-white">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-white/50">Notification & Workflow Controls</p>
                            <div className="flex gap-8">
                              {['email', 'otp'].map(type => {
                                const notifPerms = (() => {
                                  try {
                                    const p = JSON.parse(editingRole?.permissions || "[]");
                                    return p.find((item: any) => item.type === 'notifications') || {};
                                  } catch { return {}; }
                                })();
                                return (
                                  <label key={type} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#e21b5a] transition-colors">
                                    <input type="checkbox" name={`perm_notif_${type}`} defaultChecked={notifPerms[type]} className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#e21b5a] focus:ring-[#e21b5a]" />
                                    {type} Notification
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-4 pt-4 border-t border-gray-50 mt-4">
                        <button type="button" onClick={() => { setShowRoleForm(false); setEditingRole(null); }} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                        <button type="submit" className="px-6 py-3 bg-[#101130] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-all">Save Role</button>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {availableRoles.map(r => (
                    <div key={r.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative group hover:border-[#e21b5a] transition-all flex flex-col justify-between">
                      <div>
                        <h4 className="text-2xl font-serif text-gray-900 mb-2">{r.name}</h4>
                        <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Permissions Overview</p>
                        <div className="flex flex-col gap-3 mb-8">
                          {(() => {
                            try {
                              const perms = JSON.parse(r.permissions || "[]");
                              if (!perms.length) return <p className="text-xs text-gray-400">No specific permissions.</p>;
                              
                              return (
                                <div className="space-y-4">
                                  {perms.filter((p: any) => p.page).map((p: any) => (
                                    <div key={p.page} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">{p.page}</p>
                                      <div className="flex flex-wrap gap-2">
                                        {['create', 'read', 'update', 'delete'].map(action => p[action] && (
                                          <span key={action} className="text-[8px] font-bold bg-[#101130] text-white px-2 py-0.5 rounded uppercase">{action}</span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  {perms.find((p: any) => p.type === 'notifications') && (
                                    <div className="bg-[#e21b5a]/5 p-3 rounded-xl border border-[#e21b5a]/10">
                                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#e21b5a] mb-2">Notifications</p>
                                      <div className="flex gap-3">
                                        {perms.find((p: any) => p.type === 'notifications').email && <span className="text-[8px] font-bold text-gray-700">EMAIL</span>}
                                        {perms.find((p: any) => p.type === 'notifications').otp && <span className="text-[8px] font-bold text-gray-700">OTP</span>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch { return null; }
                          })()}
                        </div>
                      </div>
                      <div className="w-full flex flex-col gap-3">
                        <div className="w-full pt-4 border-t border-gray-50 flex gap-4">
                          <button onClick={() => { setEditingRole(r); setShowRoleForm(true); }} className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:text-[#e21b5a] transition-all">Edit</button>
                          {r.name !== 'SuperAdmin' && (
                            <button onClick={() => r.id && handleDeleteRole(r.id)} className="flex-1 bg-red-50 text-red-500 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!showRoleForm && (
                    <button onClick={() => { setEditingRole(null); setShowRoleForm(true); }} className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-[40px] p-10 flex flex-col items-center justify-center text-gray-300 hover:border-[#e21b5a] hover:text-[#e21b5a] transition-all group min-h-[300px]">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-100 flex items-center justify-center mb-4 group-hover:border-[#e21b5a]"><Plus className="w-8 h-8" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Create New Role</p>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {tab === 'reports' && (
              <div className="space-y-12">
                <div className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-serif mb-12">Sales Distribution by Volume</h3>
                  <div className="flex items-end gap-10 h-80 px-10">
                    {salesStats.slice(0, 8).map((stat, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative flex flex-col justify-end h-full">
                          <div 
                            className="w-full rounded-t-2xl transition-all duration-700 ease-out group-hover:brightness-110" 
                            style={{ 
                              height: `${(stat.totalSales / (salesStats[0]?.totalSales || 1)) * 100}%`,
                              backgroundColor: COLORS[i % COLORS.length]
                            }} 
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {stat.totalSales} units
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-6 text-center line-clamp-1 w-full" title={stat.productName}>{stat.productName}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-serif mb-8">Purchase vs Sale (Mock)</h3>
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Cost of Goods</span>
                        <span className="text-sm font-bold text-red-500">$12,400</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Retail Revenue</span>
                        <span className="text-sm font-bold text-green-500">${summary?.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-lg font-serif">Gross Profit</span>
                        <span className="text-2xl font-bold text-[#e21b5a]">${(summary?.totalRevenue! - 12400).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#101130] p-10 rounded-[40px] text-white flex flex-col justify-center items-center text-center">
                    <TrendingUp className="w-16 h-16 text-[#e21b5a] mb-6" />
                    <h3 className="text-2xl font-serif mb-4">Growth Projection</h3>
                    <p className="text-sm text-white/50 font-light leading-relaxed max-w-xs">Based on current sales velocity, your Trichy hub is projected to grow by 24% next quarter.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
      <ChatWidget userRole="Admin" />
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}
