import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, ChevronRight, Gift, Truck, ArrowLeft } from 'lucide-react';
import api from '../api';
import type { Product } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OCCASIONS = ['Birthday', "Mother's Day", 'Anniversary', 'Graduation', 'Wedding', 'Congratulations', 'Get Well', 'Condolences', 'Thank You', 'Housewarming'];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<Product>(`/products/${id}`)
      .then(r => {
        setProduct(r.data);
        // Fetch related products from same category
        return api.get(`/products?categoryId=${r.data.categoryId}&pageSize=4`);
      })
      .then(r => {
        setRelated(r.data.data.filter((p: Product) => p.id !== id));
        setLoading(false);
      })
      .catch(e => {
        setError(e.response?.status === 404 ? 'Product not found.' : 'Failed to load product.');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty, { recipientName, occasion, giftMessage });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-[#e21b5a] rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-xl mx-auto text-center py-40 px-6">
        <Gift className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-gray-900 mb-2">{error || 'Product not found'}</h2>
        <Link to="/collections" className="text-[#e21b5a] underline font-bold">← Back to Collections</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#e21b5a]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/collections" className="hover:text-[#e21b5a]">Collections</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/collections?categoryId=${product.categoryId}`} className="hover:text-[#e21b5a]">{product.categoryName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link to="/collections" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#e21b5a] mb-10 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          {/* Image */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full md:w-1/2 flex-shrink-0">
            <div className="aspect-[4/5] bg-gray-50 overflow-hidden sticky top-24">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Gift className="w-24 h-24" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full md:w-1/2 flex flex-col">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">SKU: {product.id.substring(0, 8).toUpperCase()}</p>
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#e21b5a] bg-[#e21b5a]/10 px-3 py-1 mb-4 w-fit">{product.categoryName}</span>

            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 leading-tight">{product.name}</h1>

            <div className="mb-6">
              <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-0.5">(${(product.price * 1.09).toFixed(2)} incl. GST)</p>
              <p className="text-xs text-[#e21b5a] underline mt-2 cursor-pointer">Shipping calculated at checkout</p>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-8 font-light">{product.description}</p>

            {/* Personalization */}
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="Enter recipient's name"
                  maxLength={60}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#e21b5a] transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{recipientName.length}/60</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">Occasion *</label>
                <select
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#e21b5a] transition-colors bg-white"
                >
                  <option value="">Select an occasion</option>
                  {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">Gift Message</label>
                <textarea
                  value={giftMessage}
                  onChange={e => setGiftMessage(e.target.value)}
                  placeholder="Write a personal message..."
                  rows={3}
                  maxLength={300}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#e21b5a] transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{giftMessage.length}/300</p>
              </div>
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex items-stretch gap-4 mb-6">
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-3 font-bold text-sm min-w-[50px] text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}
                  disabled={qty >= product.stockQuantity}
                  className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                  product.stockQuantity === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : added
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 text-white hover:bg-[#e21b5a]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stockQuantity === 0 ? 'Sold Out' : added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>

            {/* Delivery info */}
            <div className="bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#e21b5a] flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-bold text-gray-800 mb-0.5">Earliest delivery for this product:</p>
                <p>Today, 8:00 PM onwards</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add-ons section */}
        <AddonsSection />

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-serif text-gray-900 mb-8 flex items-center justify-between">
              You May Also Like
              <Link to="/collections" className="text-xs font-bold text-[#e21b5a] uppercase tracking-widest hover:underline">Explore More</Link>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

function AddonsSection() {
  const [addons, setAddons] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch categories to find "Add-ons" ID
    api.get('/categories').then(res => {
      const addonCat = res.data.find((c: any) => c.name.toLowerCase().includes('add') || c.name.toLowerCase().includes('gift'));
      if (addonCat) {
        api.get(`/products?categoryId=${addonCat.id}&pageSize=4`).then(pRes => {
          setAddons(pRes.data.data);
        });
      }
    });
  }, []);

  if (addons.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-gray-100">
      <div className="flex flex-col items-center text-center mb-10">
        <h2 className="text-3xl font-serif text-gray-900 mb-3 italic">Make it more special...</h2>
        <p className="text-gray-500 font-light max-w-md">Our curated selection of premium add-ons to complement your choice.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {addons.map(p => (
          <div key={p.id} className="group relative bg-gray-50 border border-gray-100 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-[#e21b5a]/5">
            <div className="aspect-square bg-white mb-4 overflow-hidden">
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 mb-1 truncate uppercase tracking-widest">{p.name}</h4>
            <p className="text-sm font-bold text-[#e21b5a] mb-4">${p.price.toFixed(2)}</p>
            <button
              onClick={() => addToCart(p, 1, { recipientName: '', occasion: '', giftMessage: '' })}
              className="w-full bg-white border border-gray-900 text-gray-900 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
