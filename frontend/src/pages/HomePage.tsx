import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Gift, Truck, Shield, Clock } from 'lucide-react';
import api from '../api';
import type { Category, Product } from '../api';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    api.get('/categories').then(r => {
      setCategories(r.data);
      setLoadingCats(false);
    }).catch(() => setLoadingCats(false));

    api.get('/products?pageSize=8').then(r => {
      setFeatured(r.data.data);
      setLoadingProducts(false);
    }).catch(() => setLoadingProducts(false));
  }, []);

  const benefits = [
    { icon: Truck, title: '24h Delivery', desc: 'Lightning fast delivery to your door' },
    { icon: Shield, title: 'Secure Checkout', desc: 'Your payment is always protected' },
    { icon: Clock, title: 'Same Day', desc: 'Order before 2pm for same day delivery' },
    { icon: Gift, title: 'Gift Wrapping', desc: 'Every order beautifully wrapped' },
  ];

  const testimonials = [
    { name: 'Sarah L.', role: 'Birthday Surprise', content: 'The flowers were absolutely stunning and arrived exactly on time. My mother was so happy!' },
    { name: 'Michael T.', role: 'Corporate Gift', content: 'Professional service and high-quality hampers. Perfect for our clients.' },
    { name: 'Emily R.', role: 'Anniversary', content: 'The personalized message and premium wrapping made our day special. Highly recommend!' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[700px] bg-gray-900 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0"
        >
          <img src="/hero_gift.png" alt="Luxury gift" className="w-full h-full object-cover opacity-60" />
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/4 left-10 w-64 h-64 bg-[#e21b5a] rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-1/4 right-10 w-80 h-80 bg-pink-500 rounded-full blur-[120px]"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-10 md:px-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            className="max-w-2xl text-white relative z-10"
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-[#e21b5a] text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2 mb-8 shadow-lg"
            >
              Since 1975 • Premium Gifting
            </motion.span>
            <h1 className="text-6xl md:text-8xl font-serif mb-8 leading-[1.1] tracking-tight">
              Gifts that <br />
              <span className="italic text-[#f5d0d8]">Express your Heart.</span>
            </h1>
            <p className="text-xl opacity-80 mb-12 font-light max-w-lg leading-relaxed">
              Curated luxury gifts and artisanal floral arrangements from Mon Giftss, designed to create moments that last a lifetime.
            </p>
            <div className="flex gap-6 flex-wrap">
              <Link to="/collections" className="group relative overflow-hidden bg-white text-gray-900 px-10 py-5 text-sm font-bold tracking-widest uppercase transition-all shadow-2xl">
                <span className="relative z-10 flex items-center gap-2">
                  Shop Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gray-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween" }}
                />
              </Link>
              <Link to="/track" className="border border-white/30 backdrop-blur-sm text-white px-10 py-5 text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-gray-900 transition-all">
                Track Order
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
        >
          <span className="text-[10px] uppercase tracking-widest text-white">Scroll</span>
          <div className="w-px h-10 bg-white/50" />
        </motion.div>
      </div>

      {/* Benefits Strip - Glassmorphism */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          {benefits.map(({ icon: Icon, title, desc }, i) => (
            <motion.div 
              key={title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center md:items-start text-center md:text-left gap-4"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#e21b5a]">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-1">{title}</p>
                <p className="text-xs text-gray-500 font-light leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#e21b5a] text-[10px] font-bold tracking-[0.3em] uppercase mb-4"
          >
            Curated Occasions
          </motion.p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900">Shop by Collection</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            className="h-1 bg-[#e21b5a] mx-auto mt-6"
          />
        </div>

        {loadingCats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat, i) => (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/collections?categoryId=${cat.id}`} className="group block aspect-[4/5] bg-gray-50 relative overflow-hidden">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Gift className="w-12 h-12" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-white font-serif text-2xl font-bold mb-2">{cat.name}</span>
                    <span className="text-white/60 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explore Collection</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div className="text-center md:text-left">
              <p className="text-[#e21b5a] text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Trending Now</p>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900">Featured Gifts</h2>
            </div>
            <Link to="/collections" className="group text-sm font-bold text-[#e21b5a] flex items-center gap-2 border-b-2 border-[#e21b5a] pb-1">
              Shop All Gifts <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {featured.map((product, i) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#e21b5a] text-[10px] font-bold tracking-[0.3em] uppercase mb-8">Testimonials</p>
          <div className="grid md:grid-cols-3 gap-12">
            {testimonials.map((t, i) => (
              <motion.div 
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="mb-6 text-[#e21b5a]/20">
                  <svg width="40" height="30" viewBox="0 0 40 30" fill="currentColor">
                    <path d="M0 15V0H15V15H7.5C7.5 19.1421 10.8579 22.5 15 22.5V30C6.71573 30 0 23.2843 0 15ZM25 15V0H40V15H32.5C32.5 19.1421 35.8579 22.5 40 22.5V30C31.7157 30 25 23.2843 25 15Z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-light italic mb-8 leading-relaxed">"{t.content}"</p>
                <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-28 bg-[#fdf8f9]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-12 md:p-20 shadow-2xl relative overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e21b5a]/5 rounded-bl-full" />
            
            <h2 className="text-4xl font-serif text-gray-900 mb-6">Join the Circle</h2>
            <p className="text-gray-500 font-light mb-10 max-w-lg mx-auto leading-relaxed">
              Subscribe to receive exclusive offers, gifting inspiration, and new collection previews directly in your inbox.
            </p>
            
            <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-6 py-4 bg-gray-50 border-none text-sm focus:ring-1 focus:ring-[#e21b5a] outline-none transition-all"
              />
              <button className="bg-[#e21b5a] text-white px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest">Unsubscribe at any time</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
