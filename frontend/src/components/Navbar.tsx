import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Bell, CheckCircle2, Clock } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden text-gray-500 hover:text-[#e21b5a] transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Brand Logo */}
      <Link to="/" className="flex items-center relative group">
        <div className="relative">
          <img 
            src="/mon_logo.png" 
            alt="Mon Gifts" 
            className="h-12 md:h-16 w-auto object-contain select-none" 
            onContextMenu={(e) => e.preventDefault()}
            draggable="false"
          />
          <div className="absolute inset-0 z-10 bg-transparent" onContextMenu={(e) => e.preventDefault()}></div>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-10">
        <Link to="/collections" className="text-[10px] font-bold text-gray-400 hover:text-[#e21b5a] uppercase tracking-widest transition-colors">Collections</Link>
        <Link to="/collections?type=flowers" className="text-[10px] font-bold text-gray-400 hover:text-[#e21b5a] uppercase tracking-widest transition-colors">Flowers</Link>
        <Link to="/collections?type=hampers" className="text-[10px] font-bold text-gray-400 hover:text-[#e21b5a] uppercase tracking-widest transition-colors">Hampers</Link>
        <Link to="/collections?type=gifts" className="text-[10px] font-bold text-gray-400 hover:text-[#e21b5a] uppercase tracking-widest transition-colors">Gifts</Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {localStorage.getItem('token') ? (
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-400 hover:text-[#e21b5a] relative transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e21b5a] text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[9px] font-bold text-[#e21b5a] uppercase tracking-widest hover:underline">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-gray-300">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] uppercase tracking-widest">No notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-[#e21b5a]/10 text-[#e21b5a]' : 'bg-gray-100 text-gray-400'}`}>
                              {n.title.includes('Order') ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 mb-1">{n.title}</p>
                              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-2">{n.message}</p>
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/dashboard" className="text-gray-400 hover:text-[#e21b5a] transition-colors flex items-center gap-1" title="Account">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-widest">Account</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-[10px] font-bold text-gray-400 hover:text-[#e21b5a] uppercase tracking-widest">Login</Link>
            <Link to="/register" className="text-[10px] font-bold bg-[#e21b5a] text-white px-4 py-2 rounded-full uppercase tracking-widest hover:bg-[#101130] transition-all">Register</Link>
          </div>
        )}
        
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-cart'))}
          className="text-gray-400 hover:text-[#e21b5a] relative transition-colors"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#101130] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
