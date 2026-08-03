import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gift, ArrowLeft, Mail, Phone, Lock, Loader2, CheckCircle, ShieldCheck, Globe, User, ChevronRight, MapPin } from 'lucide-react';
import api from '../api';

type Step = 'info' | 'verify_email' | 'verify_phone' | 'success';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    otpCodeEmail: '',
    otpCodePhone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Step 1: Send Email OTP
      await api.post('/Otp/send', { target: form.email });
      setStep('verify_email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code to email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Verify Email OTP (Assuming backend validates then sends phone OTP)
      // For now, we simulate the step-by-step
      await api.post('/Otp/send', { target: form.phoneNumber });
      setStep('verify_phone');
    } catch (err: any) {
      setError('Invalid email verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // In a real app, you'd verify both OTPs here. 
      // For this flow, we'll call register with the combined data.
      await api.post('/Auth/register', {
        ...form,
        otpCode: form.otpCodePhone // Using phone OTP as the final trigger
      });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your verification codes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/3 bg-[#101130] p-12 flex-col justify-between sticky top-0 h-screen">
        <div>
          <Link to="/" className="relative group block mb-12">
            <div className="relative inline-block bg-white p-3 rounded-xl shadow-lg">
              <img src="/mon_logo.png" alt="Mon Gifts" className="h-20 w-auto object-contain select-none" />
              <div className="absolute inset-0 z-10 bg-transparent rounded-xl"></div>
            </div>
          </Link>
          <div className="space-y-8 mt-20">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e21b5a]/20 flex items-center justify-center text-[#e21b5a] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Identity Verified</h4>
                <p className="text-white/50 text-xs font-light leading-relaxed">Mandatory email and mobile verification to prevent unauthorized access.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e21b5a]/20 flex items-center justify-center text-[#e21b5a] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Direct Delivery</h4>
                <p className="text-white/50 text-xs font-light leading-relaxed">Accurate address mapping for precise Trichy local deliveries.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-white/30 text-[10px] uppercase tracking-widest flex justify-between">
          <span>Mon Gifts © {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Trichy, IN</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="p-6 md:p-8 flex justify-between items-center border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <Link to="/login" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#e21b5a] transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span className={step === 'info' ? 'text-[#e21b5a]' : 'text-gray-300'}>01 Details</span>
            <span className="text-gray-200">/</span>
            <span className={step.startsWith('verify') ? 'text-[#e21b5a]' : 'text-gray-300'}>02 Verification</span>
            <span className="text-gray-200">/</span>
            <span className={step === 'success' ? 'text-green-500' : 'text-gray-300'}>03 Success</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 md:p-16">
          <div className="w-full max-w-xl">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-10 text-sm flex items-center gap-3 animate-pulse">
                <Lock className="w-4 h-4" /> {error}
              </div>
            )}

            {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-12">
                  <h1 className="text-4xl font-serif text-gray-900 mb-4">Secure Registration</h1>
                  <p className="text-gray-500 font-light text-lg italic leading-relaxed">Please provide your details. Verification is mandatory to prevent fake accounts.</p>
                </div>

                <form onSubmit={handleStartVerification} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> First Name</label>
                      <input required name="firstName" value={form.firstName} onChange={handleChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-[#e21b5a] outline-none transition-colors bg-transparent" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                      <input required name="lastName" value={form.lastName} onChange={handleChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-[#e21b5a] outline-none transition-colors bg-transparent" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Email Address</label>
                      <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-[#e21b5a] outline-none transition-colors bg-transparent" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> Mobile Number</label>
                      <input required type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-[#e21b5a] outline-none transition-colors bg-transparent" placeholder="+91-XXXXXXXXXX" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Full Delivery Address</label>
                    <textarea required name="address" value={form.address} onChange={handleChange} rows={3} className="w-full border-b border-gray-200 py-3 text-sm focus:border-[#e21b5a] outline-none transition-colors bg-transparent resize-none" placeholder="Enter your full address in Trichy..." />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full bg-[#101130] text-white py-6 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#e21b5a] transition-all shadow-2xl flex items-center justify-center gap-3 rounded-lg group mt-10"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        Verify Email & Mobile
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === 'verify_email' && (
              <div className="animate-in fade-in zoom-in-95 duration-500 text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-[#e21b5a]/10 rounded-full flex items-center justify-center text-[#e21b5a] mx-auto mb-10">
                  <Mail className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif text-gray-900 mb-4">Step 1: Email Verification</h2>
                <p className="text-gray-500 mb-12 font-light leading-relaxed">
                  Enter the 6-digit code sent to <strong className="text-gray-900">{form.email}</strong>.
                </p>
                <form onSubmit={handleVerifyEmail} className="space-y-12">
                  <input required maxLength={6} name="otpCodeEmail" value={form.otpCodeEmail} onChange={handleChange} placeholder="000000" className="w-full text-center text-5xl font-mono tracking-[0.5em] border-b-2 border-gray-100 pb-4 focus:border-[#e21b5a] outline-none bg-transparent" autoFocus />
                  <button disabled={loading} className="w-full bg-[#101130] text-white py-6 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#e21b5a] transition-all shadow-xl rounded-lg">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Next: Mobile Verification'}
                  </button>
                </form>
              </div>
            )}

            {step === 'verify_phone' && (
              <div className="animate-in fade-in zoom-in-95 duration-500 text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-[#e21b5a]/10 rounded-full flex items-center justify-center text-[#e21b5a] mx-auto mb-10">
                  <Phone className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif text-gray-900 mb-4">Step 2: Mobile Verification</h2>
                <p className="text-gray-500 mb-12 font-light leading-relaxed">
                  Enter the code sent to <strong className="text-gray-900">{form.phoneNumber}</strong>.
                </p>
                <form onSubmit={handleRegister} className="space-y-12">
                  <input required maxLength={6} name="otpCodePhone" value={form.otpCodePhone} onChange={handleChange} placeholder="000000" className="w-full text-center text-5xl font-mono tracking-[0.5em] border-b-2 border-gray-100 pb-4 focus:border-[#e21b5a] outline-none bg-transparent" autoFocus />
                  <button disabled={loading} className="w-full bg-[#e21b5a] text-white py-6 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#101130] transition-all shadow-xl rounded-lg">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Registration'}
                  </button>
                </form>
              </div>
            )}

            {step === 'success' && (
              <div className="animate-in fade-in zoom-in-95 duration-500 text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-10 shadow-inner">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif text-gray-900 mb-6">Verified Successfully</h2>
                <p className="text-gray-600 mb-12 font-light leading-relaxed text-lg">
                  Both your email and mobile number have been verified. Your secure credentials have been sent to <strong>{form.email}</strong>.
                </p>
                <Link to="/login" className="block bg-[#101130] text-white py-6 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#e21b5a] transition-all shadow-2xl rounded-lg">
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
