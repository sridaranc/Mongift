import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, PackageSearch, Loader2, ChevronRight } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { MapPin } from 'lucide-react';

interface OrderItemView {
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface OrderView {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  recipientName: string;
  deliveryAddress: string;
  giftMessage: string;
  occasion: string;
  proofOfDeliveryUrl?: string;
  items: OrderItemView[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-purple-100 text-purple-800',
  OutForDelivery: 'bg-orange-100 text-orange-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const STATUS_STEPS = ['Pending', 'Confirmed', 'Assigned', 'OutForDelivery', 'Delivered'];

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/${orderNumber.trim()}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Order not found. Please check the order number.' : 'Failed to fetch order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // SignalR for Push Notifications
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      const conn = new HubConnectionBuilder()
        .withUrl('http://localhost:5119/hubs/notifications')
        .withAutomaticReconnect()
        .build();

      conn.start().then(() => {
        conn.on('ReceiveNotification', (notification) => {
          // If the notification is about this order, we can refresh
          if (notification.message.includes(orderNumber)) {
            // Re-fetch order to get latest status
            api.get(`/orders/${orderNumber.trim()}`).then(res => setOrder(res.data)).catch();
          }
        });
      }).catch(err => console.error("SignalR err:", err));

      return () => { conn.stop(); };
    }, [orderNumber]);
  });

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#e21b5a]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium">Track Order</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <PackageSearch className="w-12 h-12 text-[#e21b5a] mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500 font-light">Enter your order number to see the delivery status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="e.g. MG-20260503-A1B2C3"
              className="w-full border-2 border-gray-200 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#e21b5a] transition-colors uppercase font-mono tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#e21b5a] text-white px-6 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Track
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-8">{error}</div>
        )}

        {/* Order Result */}
        {order && (
          <div className="border border-gray-100 shadow-sm">
            {/* Order Header */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-wrap justify-between items-start gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
                <p className="text-xl font-bold font-mono text-gray-900">{order.orderNumber}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(order.orderDate).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                {order.status}
              </span>
            </div>

            {/* Progress Tracker */}
            <div className="px-6 py-8 border-b border-gray-100">
              <div className="relative flex justify-between">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-[#e21b5a] transition-all duration-700"
                    style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                  />
                </div>
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      i <= currentStep ? 'bg-[#e21b5a] border-[#e21b5a] text-white' : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {i < currentStep ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider text-center max-w-[60px] leading-tight ${i <= currentStep ? 'text-[#e21b5a]' : 'text-gray-400'}`}>
                      {s === 'OutForDelivery' ? 'Out For Delivery' : s === 'Assigned' ? 'Assigned' : s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Tracking Map (Google Maps Mock) */}
            {order.status === 'OutForDelivery' && (
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-2 mb-3 text-[#e21b5a]">
                  <MapPin className="w-5 h-5 animate-bounce" />
                  <span className="text-sm font-bold uppercase tracking-widest">Live Courier Tracking</span>
                </div>
                <div className="w-full h-64 bg-gray-200 rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
                  {/* Mock Map Image / Google Maps Iframe */}
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Trichy,TN&zoom=14&size=800x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:landscape|element:all|color:0xf2f2f2&key=mock')] bg-cover bg-center opacity-50" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl relative">
                      <div className="w-8 h-8 bg-[#e21b5a] rounded-full animate-ping absolute opacity-75"></div>
                      <div className="w-8 h-8 bg-[#e21b5a] rounded-full flex items-center justify-center z-10 text-white"><MapPin className="w-4 h-4" /></div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Courier</p>
                      <p className="text-sm font-bold text-gray-900">Raju V. (ETA: 15 mins)</p>
                    </div>
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold">5km</div>
                  </div>
                </div>
              </div>
            )}

            {/* Proof of Delivery */}
            {order.status === 'Delivered' && order.proofOfDeliveryUrl && (
              <div className="px-6 py-8 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-2 mb-4 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm font-bold uppercase tracking-widest">Proof of Delivery</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm max-w-sm">
                  <img src={`http://localhost:5119${order.proofOfDeliveryUrl}`} alt="Proof of Delivery" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Recipient</p>
                <p className="text-sm text-gray-900 font-medium">{order.recipientName}</p>
                <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
              </div>
              {order.giftMessage && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Gift Message</p>
                  <p className="text-sm text-gray-700 italic">"{order.giftMessage}"</p>
                  {order.occasion && <p className="text-xs text-[#e21b5a] font-bold mt-1">{order.occasion}</p>}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="px-6 py-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Items Ordered</p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-gray-500">${item.unitPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold text-gray-900 border-t border-gray-100 pt-3 mt-2">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <ChatWidget userRole="Customer" />
    </div>
  );
}
