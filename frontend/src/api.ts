import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5119/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
}

export interface ProductsResponse {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  recipientName: string;
  occasion: string;
  giftMessage: string;
}

export interface OrderRequest {
  items: { productId: string; quantity: number }[];
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  giftMessage?: string;
  occasion?: string;
  deliveryDate?: string;
  preferredSlot?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: { productName: string; unitPrice: number; quantity: number; subtotal: number }[];
}
