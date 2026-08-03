import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { CartProvider } from './context/CartContext'
import HomePage from './pages/HomePage'
import CollectionsPage from './pages/CollectionsPage'
import ProductPage from './pages/ProductPage'
import TrackOrderPage from './pages/TrackOrderPage'
import Login from './Login'
import Admin from './Admin'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CartDrawer from './components/CartDrawer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <CartDrawer />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
