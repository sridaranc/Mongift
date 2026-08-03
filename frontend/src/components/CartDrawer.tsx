import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Minus, Plus, Trash2, Lock, ShoppingCart, CheckCircle, Loader2, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api';
import type { OrderRequest } from '../api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CartDrawerProps {
  // Props removed as drawer now manages its own state via global events
}

type Step = 'cart' | 'checkout' | 'otp' | 'payment' | 'processing' | 'success';

interface CheckoutForm {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryDate: string;
  preferredSlot: string;
}

const DELIVERY_SLOTS = [
  { id: 'morning', label: 'Morning (9:00 AM - 12:00 PM)', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon (1:00 PM - 5:00 PM)', icon: '⛅' },
  { id: 'evening', label: 'Evening (6:00 PM - 10:00 PM)', icon: '🌙' },
];

const stripePromise = loadStripe('pk_test_mockkey');

const CheckoutForm = ({ total, handlePlaceOrder, onSuccess }: { total: number, handlePlaceOrder: () => Promise<string | undefined>, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    try {
      const clientSecret = await handlePlaceOrder();
      if (!clientSecret) {
        setProcessing(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed.');
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 flex-grow flex flex-col">
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Card Information</label>
        <div className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm focus-within:border-[#e21b5a] outline-none">
          <CardElement options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#101130',
                fontFamily: 'monospace',
                '::placeholder': { color: '#9ca3af' }
              },
              invalid: { color: '#ef4444' }
            }
          }} />
        </div>
        {error && <p className="text-red-500 text-xs mt-2 font-bold">{error}</p>}
      </div>
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-[#e21b5a] text-white py-5 rounded-2xl text-xs font-bold tracking-widest uppercase hover:bg-[#101130] transition-all shadow-2xl shadow-[#e21b5a]/20 disabled:opacity-50 mt-auto"
      >
        {processing ? 'Processing...' : `Authorize $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

export default function CartDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setOpen(prev => !prev);
    window.addEventListener('toggle-cart', handleToggle);
    return () => window.removeEventListener('toggle-cart', handleToggle);
  }, []);
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [otpTarget, setOtpTarget] = useState<'phone' | 'email'>('phone');
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [estimation, setEstimation] = useState<{ distance: number; minutes: number } | null>(null);
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; percent: number; max: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  
  const [form, setForm] = useState<CheckoutForm>({
    recipientName: '', recipientPhone: '', recipientEmail: '',
    deliveryAddress: '', deliveryCity: 'Trichy', deliveryPostalCode: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    preferredSlot: 'afternoon'
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === 'deliveryAddress') {
      calculateEstimation(e.target.value);
    }
  };

  const calculateEstimation = (address: string) => {
    const isTrichy = address.toLowerCase().includes('trichy') || address.toLowerCase().includes('tiruchirappalli');
    if (isTrichy && address.length > 10) {
      // Mock calculation: 5km = 120 mins
      const mockDistance = Math.floor(Math.random() * 4) + 1; // 1-5km
      const mins = (mockDistance * 24);
      setEstimation({ distance: mockDistance, minutes: mins });
    } else {
      setEstimation(null);
    }
  };

  const handleSendOtp = async (target: 'phone' | 'email' = 'email') => {
    const val = target === 'phone' ? form.recipientPhone : form.recipientEmail;
    if (!val) { setError(`Please enter your ${target} first.`); return; }
    
    // Final Region Check
    const isTrichy = form.deliveryAddress.toLowerCase().includes('trichy') || form.deliveryAddress.toLowerCase().includes('tiruchirappalli');
    if (!isTrichy) {
      setError('We currently only deliver within the Trichy (5km) region.');
      return;
    }

    setError('');
    try {
      await api.post('/otp/send', { target: val });
      setOtpTarget(target);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to send OTP to ${target}.`);
    }
  };

  const handleVerifyOtp = async () => {
    const val = otpTarget === 'phone' ? form.recipientPhone : form.recipientEmail;
    if (!otpCode) { setError('Please enter the OTP code.'); return; }
    setError('');
    try {
      await api.post('/otp/verify', { target: val, code: otpCode });
      setOtpCode('');
      setOtpCode('');
      setStep('payment');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    try {
      const res = await api.get(`/promo/${promoCode.trim()}/validate`);
      setPromoApplied({
        code: res.data.code,
        percent: res.data.discountPercentage,
        max: res.data.maxDiscountAmount
      });
    } catch (err: any) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
      setPromoApplied(null);
    }
  };

  let finalTotal = cartTotal;
  let discountAmount = 0;
  if (promoApplied) {
    discountAmount = cartTotal * (promoApplied.percent / 100);
    if (discountAmount > promoApplied.max) discountAmount = promoApplied.max;
    finalTotal -= discountAmount;
  }

  const handleProcessPayment = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    const giftMessage = cartItems[0]?.giftMessage || '';
    const occasion = cartItems[0]?.occasion || '';

    const payload = {
      items: cartItems.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      ...form,
      giftMessage,
      occasion,
      promoCode: promoApplied?.code || null
    };

    try {
      const res = await api.post('/orders', payload);
      setOrderNumber(res.data.orderNumber);
      
      // If we are confirming via Stripe, we return the client secret
      // and handle the success in the form's logic or here after confirmCardPayment.
      // For simplicity, we just return the secret and let CheckoutForm handle Stripe,
      // but if Stripe succeeds, we need to show the success step.
      return res.data.clientSecret;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
      return undefined;
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      setForm({
        recipientName: '', recipientPhone: '', recipientEmail: '', deliveryAddress: '', deliveryCity: 'Trichy', deliveryPostalCode: '',
        deliveryDate: new Date().toISOString().split('T')[0], preferredSlot: 'afternoon'
      });
      setOtpCode('');
      setOtpTarget('phone');
      setEstimation(null);
    }
    setOpen(false);
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#101130]/60 z-50 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-white z-50 shadow-2xl flex flex-col rounded-l-[40px] overflow-hidden border-l border-white/10"
          >
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-serif text-[#101130]">
                  {step === 'cart' ? 'My Cart' : step === 'success' ? 'Experience Confirmed' : 'Luxury Checkout'}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Mon Gifts Trichy Hub</p>
              </div>
              <button onClick={handleClose} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#e21b5a] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {step === 'cart' && (
                <div className="p-10">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6"><ShoppingCart className="w-10 h-10 opacity-20" /></div>
                      <p className="font-serif text-xl text-gray-300">Your cart is empty.</p>
                      <button onClick={handleClose} className="mt-6 text-[#e21b5a] text-xs font-bold uppercase tracking-widest hover:underline">Start Shopping</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {cartItems.map((item, idx) => (
                        <div key={`${item.product.id}-${idx}`} className="flex gap-6 pb-8 border-b border-gray-50 group">
                          <div className="w-28 h-32 bg-gray-50 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                            {item.product.imageUrl ? (
                              <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200"><Gift className="w-10 h-10" /></div>
                            )}
                          </div>
                          <div className="flex-grow flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-gray-900 leading-snug pr-4">{item.product.name}</h4>
                              <button onClick={() => removeFromCart(item.product.id)} className="text-gray-200 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-lg font-bold text-[#e21b5a] mb-4">${item.product.price.toFixed(2)}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50">
                                <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 py-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"><Minus className="w-3 h-3" /></button>
                                <span className="text-xs font-bold w-8 text-center text-gray-700">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 py-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 'checkout' && (
                <div className="p-10 space-y-12">
                  {error && <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest">{error}</div>}
                  
                  <section>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#101130] text-white flex items-center justify-center text-[8px]">01</div>
                      Delivery Details
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Recipient Name</label>
                          <input name="recipientName" required value={form.recipientName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm focus:border-[#e21b5a] outline-none" placeholder="Enter name..." />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Phone Number</label>
                          <input type="tel" name="recipientPhone" required value={form.recipientPhone} onChange={handleChange} placeholder="+91" className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm focus:border-[#e21b5a] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Email</label>
                          <input type="email" name="recipientEmail" required value={form.recipientEmail} onChange={handleChange} placeholder="customer@email.com" className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm focus:border-[#e21b5a] outline-none" />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Delivery Address (Trichy Only)</label>
                        <div className="relative">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e21b5a]" />
                          <input name="deliveryAddress" required value={form.deliveryAddress} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl text-sm focus:border-[#e21b5a] outline-none" placeholder="e.g. 12/4, Main Guard Gate, Trichy" />
                        </div>
                      </div>

                      {/* Distance Estimation Alert */}
                      {estimation && (
                        <div className="bg-[#101130] p-6 rounded-[24px] text-white flex items-center justify-between shadow-xl shadow-[#101130]/10 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-[#e21b5a]" /></div>
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Estimate Hub-to-Door</p>
                              <p className="text-sm font-bold">{estimation.minutes} Minutes ({estimation.distance}km)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-[#e21b5a] text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase">Priority Hub</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="pt-8 border-t border-gray-50">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#101130] text-white flex items-center justify-center text-[8px]">02</div>
                      Choose Slot
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {DELIVERY_SLOTS.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setForm(f => ({ ...f, preferredSlot: slot.id }))}
                          className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${form.preferredSlot === slot.id ? 'border-[#e21b5a] bg-[#e21b5a]/5 shadow-sm' : 'border-gray-50 bg-gray-50/30'}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xl">{slot.icon}</span>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${form.preferredSlot === slot.id ? 'text-[#e21b5a]' : 'text-gray-400'}`}>{slot.label}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.preferredSlot === slot.id ? 'border-[#e21b5a]' : 'border-gray-200'}`}>
                            {form.preferredSlot === slot.id && <div className="w-1.5 h-1.5 bg-[#e21b5a] rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* ... Rest of steps (otp, payment, success) remain but with improved styling ... */}
              {step === 'otp' && (
                <div className="p-10 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mb-8"><Lock className="w-8 h-8 text-[#e21b5a]" /></div>
                  <h3 className="text-3xl font-serif text-[#101130] mb-4">Identity Verification</h3>
                  <p className="text-sm text-gray-400 font-light mb-12 leading-relaxed">
                    We've sent a 6-digit secure code to <br /><span className="font-bold text-gray-900">{otpTarget === 'phone' ? form.recipientPhone : form.recipientEmail}</span>.
                  </p>
                  <input
                    type="text" maxLength={6} placeholder="000000"
                    value={otpCode} onChange={e => setOtpCode(e.target.value)}
                    className="w-full border-b-2 border-gray-100 text-center text-5xl font-mono tracking-[0.3em] focus:border-[#e21b5a] outline-none mb-12 pb-4 bg-transparent"
                  />
                  <button onClick={handleVerifyOtp} className="w-full bg-[#101130] text-white py-5 rounded-2xl text-xs font-bold tracking-widest uppercase hover:bg-[#e21b5a] transition-all shadow-xl">Confirm Security Code</button>
                </div>
              )}

              {step === 'payment' && (
                <div className="p-10 h-full flex flex-col">
                  <div className="mb-12">
                    <h3 className="text-3xl font-serif text-[#101130] mb-2">Secure Authorization</h3>
                    <p className="text-sm text-gray-400">Total payable: <span className="text-[#e21b5a] font-bold">${finalTotal.toFixed(2)}</span></p>
                  </div>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm 
                      total={finalTotal} 
                      handlePlaceOrder={async () => {
                        const secret = await handlePlaceOrder();
                        return secret;
                      }}
                      onSuccess={() => {
                        clearCart();
                        setStep('success');
                      }}
                    />
                  </Elements>
                </div>
              )}

              {step === 'processing' && (
                <div className="p-10 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 border-4 border-[#e21b5a]/20 border-t-[#e21b5a] rounded-full animate-spin mb-8"></div>
                  <h3 className="text-2xl font-serif text-[#101130] mb-2">Securing Authorization</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Please do not refresh this page...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="p-10 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mb-8"><CheckCircle className="w-10 h-10 text-green-500" /></div>
                  <h3 className="text-4xl font-serif text-[#101130] mb-4">Gift Confirmed</h3>
                  <p className="text-sm text-gray-400 font-light mb-12 max-w-xs mx-auto">Your elegant surprise is now being prepared at our Trichy hub for delivery on <span className="text-gray-900 font-bold">{new Date(form.deliveryDate).toLocaleDateString()}</span>.</p>
                  <div className="w-full bg-[#101130] p-8 rounded-[32px] text-white mb-8">
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Reference Tracking</p>
                    <p className="text-4xl font-bold font-mono tracking-tighter text-[#e21b5a]">{orderNumber}</p>
                  </div>
                  <button onClick={handleClose} className="w-full py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#e21b5a] transition-colors">Return to Collections</button>
                </div>
              )}
            </div>

            {/* Sticky Actions */}
            {step === 'cart' && cartItems.length > 0 && (
              <div className="p-10 border-t border-gray-50 bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoCode} 
                      onChange={e => setPromoCode(e.target.value.toUpperCase())} 
                      placeholder="PROMO CODE" 
                      className="flex-1 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#e21b5a] font-mono"
                    />
                    <button onClick={handleApplyPromo} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#e21b5a] transition-colors">Apply</button>
                  </div>
                  {promoError && <p className="text-red-500 text-[10px] mt-2 font-bold">{promoError}</p>}
                  {promoApplied && <p className="text-green-600 text-[10px] mt-2 font-bold uppercase tracking-widest">Promo Applied: {promoApplied.percent}% OFF (Max ${promoApplied.max})</p>}
                </div>
                <div className="flex justify-between items-center mb-8 border-t border-gray-50 pt-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Grand total</p>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-serif text-[#101130]">${finalTotal.toFixed(2)}</p>
                      {promoApplied && <p className="text-lg font-serif text-gray-400 line-through mb-1">${cartTotal.toFixed(2)}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Hub Location</p>
                    <p className="text-sm font-bold text-[#e21b5a]">Trichy (Hub-01)</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full bg-[#101130] text-white py-6 rounded-[24px] text-xs font-bold tracking-widest uppercase hover:bg-[#e21b5a] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <Lock className="w-4 h-4" /> Begin Luxury Checkout
                </button>
              </div>
            )}

            {step === 'checkout' && (
              <div className="p-10 border-t border-gray-50 bg-white flex gap-4">
                <button onClick={() => setStep('cart')} className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all">Previous</button>
                <button
                  onClick={() => handleSendOtp('email')}
                  className="flex-[2] bg-[#101130] text-white py-5 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-[#e21b5a] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  Secure Verification <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
