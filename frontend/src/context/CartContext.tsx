import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '../api';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity: number, details: { recipientName: string; occasion: string; giftMessage: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const updateItems = useCallback((newItems: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCartItems(prev => {
      const updated = typeof newItems === 'function' ? newItems(prev) : newItems;
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToCart = useCallback((product: Product, quantity: number, details: { recipientName: string; occasion: string; giftMessage: string }) => {
    updateItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) {
          alert(`Sorry, only ${product.stockQuantity} items left in stock.`);
          return prev;
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      }
      if (quantity > product.stockQuantity) {
        alert(`Sorry, only ${product.stockQuantity} items left in stock.`);
        return prev;
      }
      return [...prev, { product, quantity, ...details }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    updateItems(prev => prev.filter(i => i.product.id !== productId));
  }, [updateItems]);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    updateItems(prev =>
      prev.map(i => {
        if (i.product.id === productId) {
          const newQty = i.quantity + delta;
          if (newQty > i.product.stockQuantity) {
            alert(`Sorry, only ${i.product.stockQuantity} items left in stock.`);
            return i;
          }
          return { ...i, quantity: Math.max(0, newQty) };
        }
        return i;
      }).filter(i => i.quantity > 0)
    );
  }, [updateItems]);

  const clearCart = useCallback(() => updateItems([]), [updateItems]);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
