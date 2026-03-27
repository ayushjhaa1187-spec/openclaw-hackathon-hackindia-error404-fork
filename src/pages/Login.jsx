import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LayoutDashboard, Compass, BookOpen, ArrowRight, Github } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { MOCK_CAMPUSES, MOCK_SKILLS } from '../data/mockData'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

export default function Login() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const handleSignIn = async (data) => {
    setLoading(true)
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) throw error

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile && !profile.onboarding_completed) {
        navigate('/onboarding')
      } else {
        navigate(location.state?.from?.pathname || '/dashboard')
      }
      toast.success('Welcome back to EduSync!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (data) => {
    setLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            campus_id: data.campus
          }
        }
      })

      if (error) throw error

      // Create profile entry
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: user.id, 
          full_name: data.fullName, 
          campus_id: data.campus,
          karma_balance: 100 
        }
      ])

      if (profileError) throw profileError

      toast.success('Account created successfully! Let\'s set up your profile.')
      navigate('/onboarding')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* LEFT PANEL — Desktop Branding */}
      <div className="hidden lg:flex w-2/5 bg-navy relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-purple-600 rounded-full blur-[120px] opacity-15" />
        
        <div className="relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-caveat text-5xl text-white leading-tight max-w-sm mb-6"
          >
            "Every skill you share <br /> comes back tenfold."
          </motion.h2>
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">— The EduSync Philosophy</p>
        </div>

        {/* Floating cards */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           {MOCK_SKILLS.slice(0, 3).map((skill, i) => (
             <motion.div 
               key={i}
               animate={{ 
                 y: [0, -15, 0],
                 rotate: [i * 5 - 5, i * 5 - 2, i * 5 - 5] 
               }}
               transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
               className={`absolute bg-white rounded-2xl p-4 shadow-2xl w-48 border border-white/10`}
               style={{ 
                 top: (25 + i * 25) + '%', 
                 left: (i % 2 === 0 ? '15%' : '55%') 
               }}
             >
               <div className="w-8 h-8 rounded-lg bg-indigo-100 mb-3 flex items-center justify-center text-indigo-600 font-bold">E</div>
               <p className="text-navy font-bold text-sm tracking-tight mb-2 truncate">{skill.title}</p>
               <Badge variant="indigo" className="text-[10px] uppercase font-black tracking-widest">{skill.category}</Badge>
             </motion.div>
           ))}
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="max-w-md w-full">
           <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">E</div>
             <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">EduSync</span>
           </Link>

           <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl mb-10 w-fit">
              <button 
                onClick={() => setIsSignIn(true)}
                className={`relative px-8 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${isSignIn ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {isSignIn && (
                   <motion.div layoutId="tab-indicator" className="absolute inset-0 bg-white shadow-md rounded-xl z-0" />
                )}
                <span className="relative z-10">Sign In</span>
              </button>
              <button 
                onClick={() => setIsSignIn(false)}
                className={`relative px-8 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${!isSignIn ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {!isSignIn && (
                   <motion.div layoutId="tab-indicator" className="absolute inset-0 bg-white shadow-md rounded-xl z-0" />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
           </div>

           <AnimatePresence mode="wait">
             {isSignIn ? (
                <motion.form 
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSubmit(handleSignIn)}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Email Address</label>
                    <input 
                      {...register('email', { required: 'Email is required' })}
                      type="email" 
                      placeholder="your@college.edu.in"
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {errors.email && <p className="mt-2 text-sm text-rose-500 font-bold">{errors.email.message}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                       <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Password</label>
                       <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input 
                        {...register('password', { required: 'Password is required' })}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-2 text-sm text-rose-500 font-bold">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" loading={loading} className="w-full h-14 text-lg">Sign In to Discovery</Button>
                </motion.form>
             ) : (
                <motion.form 
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmit(handleSignUp)}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Full Name</label>
                    <input 
                      {...register('fullName', { required: 'Name is required' })}
                      type="text" 
                      placeholder="Arjun Sharma"
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Institutional Email</label>
                    <input 
                      {...register('email', { 
                        required: 'Institutional email is required',
                        pattern: { 
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.in$/, 
                          message: 'Please use your college email (ending in .edu.in)' 
                        }
                      })}
                      type="email" 
                      placeholder="yourname@northvale.edu.in"
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {errors.email && <p className="mt-2 text-sm text-rose-500 font-bold">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Campus</label>
                    <select 
                      {...register('campus', { required: 'Selecting a campus is required' })}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select your institution</option>
                      {MOCK_CAMPUSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Password</label>
                      <input 
                        {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 chars' } })}
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Confirm</label>
                      <input 
                        {...register('confirmPassword', { 
                          validate: val => val === watch('password') || 'Passwords do not match'
                        })}
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" required className="mt-1.5 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                    <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">I agree to the <span className="text-indigo-600 font-bold underline">Academic Integrity Policy</span> and Terms of Service.</span>
                  </label>

                  <Button type="submit" loading={loading} className="w-full h-14 text-lg">Create My Account</Button>
                </motion.form>
             )}
           </AnimatePresence>

           <div className="mt-10 relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
             <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-400 px-2 bg-white w-fit mx-auto">or continue with</div>
           </div>

           <button className="mt-8 w-full h-14 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-slate-700">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
             Continue with Google
           </button>
        </div>
      </div>
    </div>
  )
}
