import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5119${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, { recipientName: '', occasion: '', giftMessage: '' });
  };

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col">
      <div className="aspect-[4/5] bg-gray-100 mb-3 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Gift className="w-12 h-12" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-gray-800 border border-gray-100">
          {product.categoryName}
        </div>

        {/* Out of stock overlay */}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5">Sold Out</span>
          </div>
        )}

        {/* Low stock badge */}
        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
          <div className="absolute bottom-2 right-2 bg-[#e21b5a] text-white text-[10px] font-bold px-2 py-1">
            Only {product.stockQuantity} left
          </div>
        )}

        {/* Quick add button */}
        {product.stockQuantity > 0 && (
          <motion.button
            onClick={handleQuickAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10/12 bg-gray-900 text-white text-xs font-bold tracking-widest uppercase py-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Quick Add
          </motion.button>
        )}
      </div>

      <div className="flex-grow flex flex-col">
        <p className="text-[10px] text-gray-400 mb-1">SKU: {product.id.substring(0, 8).toUpperCase()}</p>
        <h3 className="text-sm font-serif text-gray-900 mb-1.5 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-gray-900 font-bold text-sm">${product.price.toFixed(2)}</p>
        <p className="text-gray-400 text-xs">(${(product.price * 1.09).toFixed(2)} incl. GST)</p>
      </div>
    </Link>
  );
}
