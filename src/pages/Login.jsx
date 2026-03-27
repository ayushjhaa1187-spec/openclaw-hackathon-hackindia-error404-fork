import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  Mail, Lock, Eye, EyeOff, Building2, 
  ArrowRight, ShieldCheck, Zap, Star,
  Globe, GraduationCap
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { MOCK_CAMPUSES, MOCK_SKILLS } from '../data/mockData'
import { toast } from 'sonner'
import Button from '../components/ui/Button'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { initialize } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      if (isSignUp) {
        // Sign Up logic
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
            }
          }
        })

        if (signUpError) throw signUpError

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              full_name: data.fullName,
              campus_id: data.campus,
              role: 'student',
              onboarding_completed: false
            })

          if (profileError) throw profileError
          
          toast.success('Account created! Let\'s set up your profile.')
          navigate('/onboarding')
        }
      } else {
        // Sign In logic
        const { data: loginData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        })

        if (signInError) throw signInError

        if (loginData.user) {
          await initialize()
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', loginData.user.id)
            .single()

          if (profile && !profile.onboarding_completed) {
            navigate('/onboarding')
          } else {
            navigate(location.state?.from?.pathname || '/dashboard')
          }
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/onboarding'
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT PANEL: Branding & Inspiration */}
      <div className="hidden lg:flex w-[40%] bg-[#0f172a] relative items-center justify-center p-12 overflow-hidden">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"
        />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <blockquote className="font-caveat text-4xl text-white leading-tight mb-4">
              "Every skill you share<br />comes back tenfold."
            </blockquote>
            <cite className="text-slate-400 font-sans not-italic">— The EduSync Philosophy</cite>
          </motion.div>

          {/* Floating Preview Cards */}
          <div className="space-y-6 max-w-sm mx-auto">
            {MOCK_SKILLS.slice(0, 3).map((skill, idx) => (
              <motion.div
                key={skill.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.2, type: "spring" }}
                className={`bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl text-left transform rotate-${idx % 2 === 0 ? '2' : '-2'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${skill.mentor}`} alt="" />
                  </div>
                  <div className="text-xs">
                    <div className="text-white font-bold">{skill.mentor}</div>
                    <div className="text-indigo-400">{skill.campus}</div>
                  </div>
                </div>
                <div className="text-white font-bold mb-2">{skill.title}</div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex gap-1">
                    {skill.tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/10 rounded-full text-white/60">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Zap size={10} fill="currentColor" />
                    <span>{skill.karma_cost}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform shadow-xl shadow-indigo-600/20">
                E
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">EduSync</span>
            </Link>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl relative mb-8">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${!isSignUp ? 'text-indigo-600' : 'text-slate-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${isSignUp ? 'text-indigo-600' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
              <motion.div
                animate={{ x: isSignUp ? '100%' : '0%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-1.5 left-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-white rounded-xl shadow-md"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      {...register('fullName', { required: 'Name is required' })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Arjun Sharma"
                    />
                  </div>
                  {errors.fullName && <p className="text-rose-500 text-xs ml-1 font-medium">{errors.fullName.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@.*\.edu\.in$/i,
                        message: 'Please use your college email (@campus.edu.in)'
                      }
                    })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="yourname@northvale.edu.in"
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs ml-1 font-medium">{errors.email.message}</p>}
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Your Campus</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                      {...register('campus', { required: 'Please select your campus' })}
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 appearance-none outline-none"
                    >
                      <option value="">Select Campus...</option>
                      {MOCK_CAMPUSES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.campus && <p className="text-rose-500 text-xs ml-1 font-medium">{errors.campus.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  {!isSignUp && (
                    <Link to="#" className="text-xs text-indigo-600 font-bold hover:underline">Forgot Password?</Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Min 8 characters' }
                    })}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs ml-1 font-medium">{errors.password.message}</p>}
              </div>

              {isSignUp && (
                <div className="flex items-start gap-3 mt-4">
                  <input 
                    type="checkbox" 
                    id="policy" 
                    {...register('agree', { required: true })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <label htmlFor="policy" className="text-xs text-slate-500 leading-normal">
                    I agree to the <span className="text-indigo-600 font-bold underline">Academic Integrity Policy</span> and campus code of conduct.
                  </label>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                disabled={isSignUp && !watch('agree')}
                className="mt-4"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
                {!isLoading && <ArrowRight size={20} />}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.44-1.32 1.32-3.32 2.32-6.52 2.32-5.16 0-9.44-4.2-9.44-9.36S6.52 2.24 11.68 2.24c2.8 0 4.92 1.08 6.44 2.52l2.32-2.32C18.24 1.04 15.32 0 11.68 0 5.2 0 0 5.2 0 11.68s5.2 11.68 11.68 11.68c3.52 0 6.2-1.16 8.24-3.28 2.12-2.12 2.8-5.12 2.8-7.72 0-.6-.04-1.2-.12-1.76l-10.16 1" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
