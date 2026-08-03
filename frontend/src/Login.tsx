import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import api from './api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/Auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#e21b5a] relative overflow-hidden flex-col justify-between p-16">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/30"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border border-white/30"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-white/30"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center relative group">
            <div className="relative">
              <img 
                src="/mon_logo.png" 
                alt="Mon Gifts" 
                className="h-40 md:h-56 w-auto object-contain bg-white p-4 rounded-2xl shadow-lg select-none" 
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
              />
              <div className="absolute inset-0 z-10 bg-transparent rounded-2xl" onContextMenu={(e) => e.preventDefault()}></div>
            </div>
          </Link>
          <p className="text-white/60 text-sm tracking-wider mt-4">Admin Portal</p>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-4xl font-serif mb-6 leading-tight">
            Manage your<br />gift collection<br />with ease.
          </h2>
          <p className="text-white/70 font-light leading-relaxed max-w-md">
            Add products, manage categories, and oversee your entire 24-hour gift delivery operation from one elegant dashboard.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 text-white/60 text-sm">
          <div>
            <p className="text-white font-bold text-2xl font-serif">24h</p>
            <p>Fast Delivery</p>
          </div>
          <div>
            <p className="text-white font-bold text-2xl font-serif">100%</p>
            <p>Secure</p>
          </div>
          <div>
            <p className="text-white font-bold text-2xl font-serif">∞</p>
            <p>Collections</p>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12 justify-center">
            <div className="relative">
              <img 
                src="/mon_logo.png" 
                alt="Mon Gifts" 
                className="h-32 w-auto object-contain select-none" 
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
              />
              <div className="absolute inset-0 z-10 bg-transparent" onContextMenu={(e) => e.preventDefault()}></div>
            </div>
          </div>

          <h1 className="text-3xl font-serif text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 font-light mb-10">Sign in to the Admin Portal to continue.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#e21b5a] transition-colors bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-[#e21b5a] transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e21b5a] text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-10 p-4 bg-gray-50 border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Default Admin Credentials</p>
            <p className="text-xs text-gray-700 font-mono">superadmin@giftdelivery.com</p>
            <p className="text-xs text-gray-700 font-mono">SuperSecurePassword123!</p>
          </div>

          <p className="text-center mt-8">
            <a href="/" className="text-sm text-[#e21b5a] hover:underline font-medium">← Back to Mon Gifts Store</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
