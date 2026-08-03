import { Link } from 'react-router-dom';
import { Gift, Phone, MapPin, Clock, Share2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center mb-8 relative group">
            <div className="relative">
              <img 
                src="/mon_logo.png" 
                alt="Mon Gifts" 
                className="h-32 md:h-40 w-auto object-contain bg-white p-4 rounded-2xl shadow-lg select-none" 
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
              />
              <div className="absolute inset-0 z-10 bg-transparent rounded-2xl" onContextMenu={(e) => e.preventDefault()}></div>
            </div>
          </div>
          <p className="text-sm font-light leading-relaxed mb-6">
            Trichy's trusted gift delivery service. Premium hampers, flowers, and curated gifts delivered within 24 hours across Tamil Nadu.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-[#e21b5a] transition-colors rounded-full">
              <Share2 className="w-4 h-4 text-white" />
            </a>
            <a href="#" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-[#e21b5a] transition-colors rounded-full">
              <Mail className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {/* Shop Links — fully dynamic from nav structure */}
        <div>
          <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-5">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/collections" className="hover:text-white transition-colors">All Collections</Link></li>
            <li><Link to="/collections?type=flowers" className="hover:text-white transition-colors">Shop Flowers</Link></li>
            <li><Link to="/collections?type=gifts" className="hover:text-white transition-colors">Shop Gifts</Link></li>
            <li><Link to="/collections?type=hampers" className="hover:text-white transition-colors">Shop Hampers</Link></li>
            <li><Link to="/collections?type=birthday" className="hover:text-white transition-colors">Birthday Gifts</Link></li>
            <li><Link to="/collections?type=anniversary" className="hover:text-white transition-colors">Anniversary</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-5">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/track" className="hover:text-white transition-colors">Track Your Order</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Delivery Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Corporate Gifting</a></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-5">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 text-[#e21b5a] flex-shrink-0" /><span>Mon–Sat: 8:30am – 6pm<br />Closed on Sundays & PH</span></li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#e21b5a] flex-shrink-0" /><span>+91-6379171588</span></li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-[#e21b5a] flex-shrink-0" /><span>Trichy, Tamil Nadu<br />India</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Mon Gifts. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
