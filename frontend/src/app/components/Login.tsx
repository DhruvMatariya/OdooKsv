import { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, ChevronDown, Phone, Mail, Globe, FileText, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, roleLabels, type UserRole, type SignupData } from '../context/AuthContext';
import { cn } from './ui/utils';

type AuthView = 'login' | 'signup' | 'forgot';

const countries = [
  'India', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'Germany', 'France', 'Singapore', 'UAE', 'Japan', 'Other'
];

const roles: Array<{ value: UserRole; label: string; desc: string }> = [
  { value: 'admin', label: 'Admin', desc: 'Manage the entire platform' },
  { value: 'vendor', label: 'Vendor', desc: 'Submit quotations and track orders' },
];

export function Login() {
  const { login, signup } = useAuth();
  const [view, setView] = useState<AuthView>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState<Partial<SignupData>>({ role: 'vendor' });
  const [signupPwd, setSignupPwd] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [direction, setDirection] = useState(0); // 1 for forward, -1 for backward

  // Forgot
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim()) { setLoginError('Email is required'); return; }
    if (!password) { setLoginError('Password is required'); return; }
    setLoginLoading(true);
    const result = await login(email, password);
    setLoginLoading(false);
    if (!result.success) setLoginError(result.error || 'Login failed');
  };



  const updateSignup = (field: keyof SignupData, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    setSignupErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!signupData.firstName?.trim()) errs.firstName = 'Required';
    if (!signupData.lastName?.trim()) errs.lastName = 'Required';
    if (!signupData.email?.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) errs.email = 'Invalid email';
    if (!signupData.phone?.trim()) errs.phone = 'Required';

    if (Object.keys(errs).length) {
      setSignupErrors(errs);
      return false;
    }
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setDirection(1);
      setSignupStep(2);
    }
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setSignupStep(1);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!signupData.country) errs.country = 'Please select a country';

    // Role-specific validation
    if (signupData.role === 'vendor') {
      if (!signupData.companyName?.trim()) {
        errs.companyName = 'Required';
      }
      if (!signupData.gstNumber?.trim()) {
        errs.gstNumber = 'Required';
      }
    }

    if (!signupPwd) errs.password = 'Required';
    else if (signupPwd.length < 8) errs.password = 'Min 8 characters';

    if (Object.keys(errs).length) { setSignupErrors(errs); return; }

    setSignupLoading(true);
    setSignupError('');
    const result = await signup({ ...signupData as SignupData, password: signupPwd });
    setSignupLoading(false);
    
    if (!result.success) {
      setSignupError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#EBF7F6]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Left gradient panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #003330 0%, #004643 50%, #00706A 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">VendorBridge</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white font-bold leading-tight" style={{ fontSize: 38 }}>
              Intelligent<br />Procurement<br />Platform
            </h2>
            <p className="text-white/70 mt-4 text-sm leading-relaxed max-w-xs">
              End-to-end vendor management, RFQ workflows, and automated invoice generation — built for modern procurement teams.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'RFQs Published', value: '18,500+' },
              { label: 'Active Vendors', value: '2,400+' },
              { label: 'Purchase Orders', value: '45,000+' },
              { label: 'Faster Approvals', value: '3× faster' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <p className="text-white/80 text-sm italic">"VendorBridge cut our procurement cycle from 3 weeks to 5 days."</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">AK</div>
              <div>
                <p className="text-white text-xs font-medium">Ankit Kumar</p>
                <p className="text-white/60 text-xs">CPO, InfraTech Solutions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2024 VendorBridge Corp. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">

          {/* ─── LOGIN ─── */}
          {view === 'login' && (
            <div className="bg-white rounded-2xl border border-[#C8E0DE]/60 shadow-lg overflow-hidden">
              {/* Card header with logo */}
              <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-[#D8EDEB]"
                style={{ background: 'linear-gradient(180deg, #EBF7F6 0%, #ffffff 100%)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 8px 24px rgba(0,70,67,0.3)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="font-bold text-[#0D1F1E]" style={{ fontSize: 22 }}>VendorBridge</h1>
                <p className="text-[#527270] text-sm mt-1">Sign in to your account</p>
              </div>

              <form onSubmit={handleLogin} className="px-8 py-6 space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FDECEA] border border-[#C0392B]/30 rounded-lg text-[#C0392B] text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                    </svg>
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. james@vendorbridge.in"
                      autoComplete="email"
                      className="w-full pl-9 pr-4 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/50 focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-9 pr-10 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/50 focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#527270] hover:text-[#0D1F1E] transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <button type="button" onClick={() => setView('forgot')} className="text-xs text-[#004643] hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 14px rgba(0,70,67,0.35)' }}>
                  {loginLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>



              <div className="px-8 pb-7 text-center">
                <p className="text-sm text-[#527270]">
                  New to VendorBridge?{' '}
                  <button onClick={() => { setView('signup'); setSignupStep(1); }} className="text-[#004643] font-medium hover:underline">Create account</button>
                </p>
              </div>
            </div>
          )}

          {/* ─── SIGNUP ─── */}
          {view === 'signup' && (
            <div className="bg-white rounded-2xl border border-[#C8E0DE]/60 shadow-lg overflow-hidden min-h-[580px] flex flex-col">
              <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-[#D8EDEB]"
                style={{ background: 'linear-gradient(180deg, #EBF7F6 0%, #ffffff 100%)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 8px 24px rgba(0,70,67,0.3)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="font-bold text-[#0D1F1E]" style={{ fontSize: 22 }}>Create Account</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn('w-2 h-2 rounded-full transition-colors duration-300', signupStep === 1 ? 'bg-[#004643]' : 'bg-[#C8E0DE]')} />
                  <div className={cn('w-2 h-2 rounded-full transition-colors duration-300', signupStep === 2 ? 'bg-[#004643]' : 'bg-[#C8E0DE]')} />
                  <p className="text-[#527270] text-sm ml-1">{signupStep === 1 ? 'Step 1: Basic Details' : 'Step 2: Security & Info'}</p>
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  {signupStep === 1 ? (
                    <motion.form
                      key="step1"
                      custom={direction}
                      initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: direction < 0 ? 50 : -50, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      onSubmit={handleNextStep}
                      className="px-8 py-6 space-y-4"
                    >
                      {signupError && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FDECEA] border border-[#C0392B]/30 rounded-lg text-[#C0392B] text-sm">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                          </svg>
                          {signupError}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">First Name</label>
                          <input type="text" value={signupData.firstName || ''} onChange={e => updateSignup('firstName', e.target.value)}
                            placeholder="John" className={cn('w-full px-3 py-2 border rounded-lg text-sm transition-all outline-none', signupErrors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Last Name</label>
                          <input type="text" value={signupData.lastName || ''} onChange={e => updateSignup('lastName', e.target.value)}
                            placeholder="Doe" className={cn('w-full px-3 py-2 border rounded-lg text-sm transition-all outline-none', signupErrors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20')} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                          <input type="email" value={signupData.email || ''} onChange={e => updateSignup('email', e.target.value)}
                            placeholder="john@example.com" className={cn('w-full pl-9 pr-4 py-2 border rounded-lg text-sm transition-all outline-none', signupErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20')} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                          <input type="tel" value={signupData.phone || ''} onChange={e => updateSignup('phone', e.target.value)}
                            placeholder="+91 98765 43210" className={cn('w-full pl-9 pr-4 py-2 border rounded-lg text-sm transition-all outline-none', signupErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20')} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Select Role</label>
                        <div className="grid grid-cols-2 gap-2">
                          {roles.map(r => (
                            <button key={r.value} type="button" onClick={() => updateSignup('role', r.value)}
                              className={cn('text-left p-3 rounded-xl border transition-all', signupData.role === r.value ? 'bg-[#EBF7F6] border-[#004643] ring-1 ring-[#004643]' : 'bg-white border-[#C8E0DE] hover:border-[#004643]')}>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-[#0D1F1E]">{r.label}</p>
                                <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center', signupData.role === r.value ? 'border-[#004643] bg-[#004643]' : 'border-[#C8E0DE]')}>
                                  {signupData.role === r.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        {signupErrors.role && <p className="text-[10px] text-red-500 mt-1 ml-1">{signupErrors.role}</p>}
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-[#527270] mb-3">Public registration is available for Vendors and Admins.</p>
                      </div>

                      <button type="submit"
                        className="w-full py-2.5 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 14px rgba(0,70,67,0.35)' }}>
                        Next Step <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="step2"
                      custom={direction}
                      initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: direction < 0 ? 50 : -50, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      onSubmit={handleSignup}
                      className="px-8 py-6 space-y-4"
                    >
                      {signupError && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FDECEA] border border-[#C0392B]/30 rounded-lg text-[#C0392B] text-sm">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                          </svg>
                          {signupError}
                        </div>
                      )}
                      {/* Vendor Specific Fields */}
                      {signupData.role === 'vendor' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Company Name <span className="text-[#C0392B]">*</span></label>
                            <input type="text" value={signupData.companyName || ''} onChange={e => updateSignup('companyName', e.target.value)}
                              placeholder="Acme Corp"
                              className={cn('w-full px-3 py-2.5 border rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/50 focus:outline-none focus:ring-2 transition-all',
                                signupErrors.companyName ? 'border-[#C0392B] focus:ring-[#C0392B]/20' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-[#004643]/20')} />
                            {signupErrors.companyName && <p className="text-[#C0392B] text-xs mt-1">{signupErrors.companyName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">GST Number <span className="text-[#C0392B]">*</span></label>
                            <input type="text" value={signupData.gstNumber || ''} onChange={e => updateSignup('gstNumber', e.target.value)}
                              placeholder="22AAAAA0000A1Z5"
                              className={cn('w-full px-3 py-2.5 border rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/50 focus:outline-none focus:ring-2 transition-all',
                                signupErrors.gstNumber ? 'border-[#C0392B] focus:ring-[#C0392B]/20' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-[#004643]/20')} />
                            {signupErrors.gstNumber && <p className="text-[#C0392B] text-xs mt-1">{signupErrors.gstNumber}</p>}
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Country <span className="text-[#C0392B]">*</span></label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                          <select value={signupData.country || ''} onChange={e => updateSignup('country', e.target.value)}
                            className={cn('w-full appearance-none pl-9 pr-8 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 transition-all',
                              signupErrors.country ? 'border-[#C0392B] focus:ring-[#C0392B]/20' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-[#004643]/20',
                              !signupData.country ? 'text-[#527270]/60' : 'text-[#0D1F1E]')}>
                            <option value="">Select country</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270] pointer-events-none" />
                        </div>
                        {signupErrors.country && <p className="text-[#C0392B] text-xs mt-1">{signupErrors.country}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Password <span className="text-[#C0392B]">*</span></label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                          <input type={showSignupPwd ? 'text' : 'password'} value={signupPwd} onChange={e => setSignupPwd(e.target.value)}
                            placeholder="Min. 8 characters"
                            className={cn('w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm placeholder:text-[#527270]/50 focus:outline-none focus:ring-2 transition-all',
                              signupErrors.password ? 'border-[#C0392B] focus:ring-[#C0392B]/20' : 'border-[#C8E0DE] focus:border-[#004643] focus:ring-[#004643]/20')} />
                          <button type="button" onClick={() => setShowSignupPwd(!showSignupPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#527270]">
                            {showSignupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {signupErrors.password && <p className="text-[#C0392B] text-xs mt-1">{signupErrors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">
                          Additional Info <span className="text-[#527270] font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-4 h-4 text-[#527270]" />
                          <textarea rows={2} value={signupData.additionalInfo || ''} onChange={e => updateSignup('additionalInfo', e.target.value)}
                            placeholder="Company name, department, or any other relevant info..."
                            className="w-full pl-9 pr-4 py-2.5 border border-[#C8E0DE] rounded-lg text-sm text-[#0D1F1E] placeholder:text-[#527270]/50 focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all resize-none" />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={handlePrevStep}
                          className="flex-1 py-2.5 rounded-lg font-medium text-sm text-[#527270] border border-[#C8E0DE] hover:bg-[#F5F9F8] transition-all flex items-center justify-center gap-2">
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="submit" disabled={signupLoading}
                          className="flex-[2] py-2.5 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 14px rgba(0,70,67,0.35)' }}>
                          {signupLoading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <>Create Account <ArrowRight className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-8 pb-7 text-center border-t border-[#D8EDEB] pt-4">
                <p className="text-sm text-[#527270]">
                  Already have an account?{' '}
                  <button onClick={() => { setView('login'); setSignupStep(1); }} className="text-[#004643] font-medium hover:underline">Sign in</button>
                </p>
              </div>
            </div>
          )}

          {/* ─── FORGOT PASSWORD ─── */}
          {view === 'forgot' && (
            <div className="bg-white rounded-2xl border border-[#C8E0DE]/60 shadow-lg overflow-hidden">
              <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-[#D8EDEB]"
                style={{ background: 'linear-gradient(180deg, #EBF7F6 0%, #ffffff 100%)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 8px 24px rgba(0,70,67,0.3)' }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="font-bold text-[#0D1F1E]" style={{ fontSize: 22 }}>{forgotSent ? 'Check Your Email' : 'Reset Password'}</h1>
                <p className="text-[#527270] text-sm mt-1 text-center">
                  {forgotSent ? `Reset link sent to ${forgotEmail}` : 'We\'ll send you a reset link'}
                </p>
              </div>

              <div className="px-8 py-6">
                {!forgotSent ? (
                  <form onSubmit={e => { e.preventDefault(); setForgotSent(true); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full pl-9 pr-4 py-2.5 border border-[#C8E0DE] rounded-lg text-sm placeholder:text-[#527270]/50 focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                      </div>
                    </div>
                    <button type="submit"
                      className="w-full py-2.5 rounded-lg font-medium text-sm text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
                      Send Reset Link
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-[#D4EEEC] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-[#00706A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#527270]">Didn't get it? <button className="text-[#004643] hover:underline">Resend link</button></p>
                  </div>
                )}
                <button onClick={() => { setView('login'); setForgotSent(false); }}
                  className="flex items-center justify-center gap-1 text-sm text-[#527270] hover:text-[#0D1F1E] w-full mt-4">
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
