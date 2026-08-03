import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User as UserIcon, LogOut, Briefcase, Calendar, MapPin, Gift, Loader2, XCircle, Clock, CheckCircle2, Phone } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  recipientName: string;
  items: OrderItem[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(id);
    try {
      await api.post(`/orders/${id}/cancel`);
      alert('Order cancelled successfully.');
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const canCancel = (order: Order) => {
    if (order.status !== 'Pending') return false;
    const orderDate = new Date(order.orderDate).getTime();
    const now = new Date().getTime();
    const ageMins = (now - orderDate) / (1000 * 60);
    return ageMins <= 30;
  };

  const getCancelTimeRemaining = (order: Order) => {
    const orderDate = new Date(order.orderDate).getTime();
    const deadline = orderDate + (30 * 60 * 1000);
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((deadline - now) / (1000 * 60)));
    return remaining;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-[#e21b5a]/10 rounded-full flex items-center justify-center text-[#e21b5a] mb-4">
                  <UserIcon className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-serif text-gray-900">{user.FirstName} {user.LastName}</h2>
                <p className="text-xs font-bold text-[#e21b5a] uppercase tracking-widest mt-1">Verified Member</p>
              </div>
              
              <div className="space-y-5 pt-6 border-t border-gray-50">
                <div className="flex items-start gap-3 text-xs">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-gray-600 truncate">{user.Email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile</p>
                    <p className="text-gray-600">{user.PhoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Address</p>
                    <p className="text-gray-600 leading-relaxed">{user.FullAddress || 'Trichy, Tamil Nadu'}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-10 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content - Order History */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <h2 className="text-xl font-serif text-gray-900 flex items-center gap-3">
                  <Package className="w-5 h-5 text-[#e21b5a]" /> Transaction History
                </h2>
                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">{orders.length} Total</span>
              </div>

              <div className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#e21b5a]" />
                    <p className="text-xs font-bold uppercase tracking-widest">Retrieving your history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Gift className="w-16 h-16 opacity-10 mb-6" />
                    <p className="text-2xl font-serif text-gray-300 mb-2">No Transactions Found</p>
                    <p className="text-sm font-light mb-10">Start your luxury gifting journey with us.</p>
                    <button onClick={() => navigate('/collections')} className="bg-[#101130] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-all rounded-lg shadow-xl">Shop Collection</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {orders.map((order) => {
                      const cancellationAvailable = canCancel(order);
                      const timeRemaining = getCancelTimeRemaining(order);
                      
                      return (
                        <div key={order.id} className="p-8 hover:bg-gray-50/30 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Ref Number</p>
                                <p className="text-lg font-mono font-bold text-gray-900">{order.orderNumber}</p>
                              </div>
                              <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
                              <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Date</p>
                                <p className="text-sm text-gray-900 font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 
                                order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {order.status}
                              </span>
                              
                              {cancellationAvailable && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingId === order.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
                                >
                                  {cancellingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                  Cancel Order ({timeRemaining}m left)
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="md:col-span-2">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-[#e21b5a]" /> Included Items
                              </h4>
                              <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                    <span className="text-gray-700">{item.productName} <span className="text-gray-400 text-[10px] font-bold ml-2">× {item.quantity}</span></span>
                                    <span className="text-gray-900 font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="md:col-span-1">
                              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="space-y-4 mb-6">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Recipient</span>
                                    <span className="text-xs font-bold text-gray-900">{order.recipientName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Location</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Trichy, TN</span>
                                  </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Paid</span>
                                    <span className="text-xl font-bold text-[#e21b5a]">${order.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
