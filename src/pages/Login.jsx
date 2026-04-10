import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  Mail, Lock, Eye, EyeOff, Building2, 
  ArrowRight, ShieldCheck, Zap, Star,
  Globe, GraduationCap
} from 'lucide-react'
import { auth, googleProvider } from '../lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { MOCK_CAMPUSES, MOCK_SKILLS } from '../data/mockData'
import { toast } from 'sonner'
import Button from '../components/ui/Button'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [skillIdx, setSkillIdx] = useState(0)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { initialize } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  // Rotating skills interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillIdx((prev) => (prev + 1) % MOCK_SKILLS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      if (isSignUp) {
        // 1. Firebase Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
        const user = userCredential.user

        // 2. Initial Profile creation in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.uid,
            full_name: data.fullName,
            campus_id: data.campus,
            role: 'student',
            onboarding_completed: false,
            karma_balance: 0
          })

                if (profileError) console.warn('Profile creation failed:', profileError.message)
        toast.success(`Welcome to the Nexus, ${data.fullName}!`)
        navigate('/onboarding')
      } else {
        // 1. Firebase Sign In
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
        const user = userCredential.user

        // 2. Fetch profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.uid)
          .single()

        if (!profile || !profile.onboarding_completed) {
          navigate('/onboarding')
        } else {
          navigate(location.state?.from?.pathname || '/dashboard')
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if profile exists; if not, they need onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.uid)
        .single()

      if (!profile) {
        // Create skeleton profile for Google users
        await supabase.from('profiles').upsert({
          id: user.uid,
          full_name: user.displayName || 'EduSync Peer',
          role: 'student',
          onboarding_completed: false,
          karma_balance: 100 // Updated +100 Karma on signup as per plan
        })
        navigate('/onboarding')
      } else if (!profile.onboarding_completed && profile.role !== 'admin') {
        navigate('/onboarding')
      } else {
        const redirectPath = profile.role === 'admin' ? '/admin' : '/dashboard'
        navigate(redirectPath)
      }
      
      toast.success(`Identity Verified: ${user.email}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white overflow-hidden font-sans">
      {/* LEFT PANEL: Branding & Inspiration */}
      <div className="hidden lg:flex w-[40%] bg-[#080c14] relative items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-[120%] h-full bg-indigo-900 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-full h-full bg-purple-900 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3"
        />

        <div className="relative z-10 w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <blockquote className="font-caveat text-5xl text-white leading-tight mb-4 drop-shadow-2xl">
              "Your knowledge is<br />the new currency."
            </blockquote>
            <cite className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] not-italic opacity-60">EduSync Nexus Phase II</cite>
          </motion.div>

          {/* Rotating Skill Cards */}
          <div className="h-64 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={skillIdx}
                initial={{ x: 50, opacity: 0, scale: 0.9, rotate: -3 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ x: -50, opacity: 0, scale: 0.9, rotate: 3 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-400/20">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_SKILLS[skillIdx].mentor}`} 
                      alt="" 
                      className="w-10 h-10 rounded-xl"
                    />
                  </div>
                  <div className="text-xs">
                    <div className="text-white font-black text-sm">{MOCK_SKILLS[skillIdx].mentor}</div>
                    <div className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{MOCK_SKILLS[skillIdx].campus}</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-white mb-6 font-outfit uppercase tracking-tighter leading-none">
                  Teaching: <span className="text-indigo-400">{MOCK_SKILLS[skillIdx].title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {MOCK_SKILLS[skillIdx].tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-white/50 text-[10px] font-bold border border-white/5">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-xs font-black">{MOCK_SKILLS[skillIdx].karma_cost}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Visual indicator of indices */}
            <div className="flex justify-center gap-2 mt-8">
              {MOCK_SKILLS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === skillIdx ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12 bg-slate-50/30">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl group-hover:rotate-12 transition-transform shadow-2xl shadow-indigo-600/30">
                E
              </div>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">EduSync</span>
            </Link>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] relative mb-4">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all relative z-10 ${!isSignUp ? 'text-indigo-600' : 'text-slate-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-4 text-sm font-black rounded-2xl transition-all relative z-10 ${isSignUp ? 'text-indigo-600' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
              <motion.div
                layoutId="activeTab"
                animate={{ x: isSignUp ? '100%' : '0%' }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute top-1.5 left-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-white rounded-[1.2rem] shadow-lg"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <GraduationCap size={20} />
                    </div>
                    <input
                      {...register('fullName', { required: 'Name is required' })}
                      className="w-full pl-12 pr-4 py-4.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                      placeholder="Arjun Sharma"
                    />
                  </div>
                  {errors.fullName && <p className="text-rose-500 text-[10px] ml-1 font-black uppercase tracking-wider">{errors.fullName.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Institutional Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={20} />
                  </div>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        // Relaxed validation for hackathon testing, but we still prefer .edu.in
                      })}
                      className="w-full pl-12 pr-4 py-4.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                      placeholder="name@campus.edu.in"
                    />
                </div>
                {errors.email && <p className="text-rose-500 text-[10px] ml-1 font-black uppercase tracking-wider">{errors.email.message}</p>}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Select Campus</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                      <Building2 size={20} />
                    </div>
                    <select
                      {...register('campus', { required: 'Select your campus' })}
                      className="w-full pl-12 pr-10 py-4.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none outline-none font-medium cursor-pointer text-slate-900"
                    >
                      <option value="">Pick your institution...</option>
                      {MOCK_CAMPUSES.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.short_code})</option>
                      ))}
                    </select>
                  </div>
                  {errors.campus && <p className="text-rose-500 text-[10px] ml-1 font-black uppercase tracking-wider">{errors.campus.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Password</label>
                  {!isSignUp && (
                    <Link to="#" className="text-[10px] text-indigo-600 font-black uppercase tracking-wider hover:underline">Reset?</Link>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Min 8 characters' }
                    })}
                    className="w-full pl-12 pr-12 py-4.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-[10px] ml-1 font-black uppercase tracking-wider">{errors.password.message}</p>}
              </div>

              {isSignUp && (
                <div className="flex items-start gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <input 
                    type="checkbox" 
                    id="policy" 
                    {...register('agree', { required: true })}
                    className="mt-1 w-4 h-4 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                  />
                  <label htmlFor="policy" className="text-[11px] text-slate-600 font-medium leading-relaxed cursor-pointer">
                    I agree to the <span className="text-indigo-600 font-black underline">Academic Integrity Policy</span>. I understand that fictional campus IDs are for demonstration.
                  </label>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                disabled={isSignUp && !watch('agree')}
                className="py-6 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                {isSignUp ? 'Launch Journey' : 'Access Nexus'}
                {!isLoading && <ArrowRight size={20} className="ml-2" />}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="my-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-50">Secure Access</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-5 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.44-1.32 1.32-3.32 2.32-6.52 2.32-5.16 0-9.44-4.2-9.44-9.36S6.52 2.24 11.68 2.24c2.8 0 4.92 1.08 6.44 2.52l2.32-2.32C18.24 1.04 15.32 0 11.68 0 5.2 0 0 5.2 0 11.68s5.2 11.68 11.68 11.68c3.52 0 6.2-1.16 8.24-3.28 2.12-2.12 2.8-5.12 2.8-7.72 0-.6-.04-1.2-.12-1.76l-10.16 1" />
            </svg>
            Continue with Institution
          </button>
        </div>
      </div>
    </div>
  )
}

