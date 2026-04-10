
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  User, BookOpen, GraduationCap, Laptop,
  ArrowRight, ArrowLeft, CheckCircle2,
  Zap, Star, Rocket, Plus, X, Award
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { MOCK_CAMPUSES } from '../data/mockData'
import { toast } from 'sonner'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import confetti from 'canvas-confetti'

const SKILL_SUGGESTIONS = [
  'Python', 'DSA', 'Machine Learning', 'React', 'Node.js', 'UI/UX Design',
  'VLSI', 'Embedded Systems', 'Robotics', 'ROS2', 'Calculus', 'Physics',
  'Organic Chemistry', 'Economics', 'Data Science', 'Git & DevOps'
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [selectedCanTeach, setSelectedCanTeach] = useState([])
  const [selectedWantLearn, setSelectedWantLearn] = useState([])
  const [customSkill, setCustomSkill] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { user, profile, updateProfile } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: profile?.full_name || '',
      department: profile?.department || '',
      yearOfStudy: profile?.year_of_study || 1,
      bio: profile?.bio || ''
    }
  })

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0, scale: 0.95 })
  }

  const nextStep = () => {
    setDirection(1)
    setStep(s => s + 1)
  }


  const prevStep = () => {
    setDirection(-1)
    setStep(s => s - 1)
  }

  const toggleSkill = (skill, list, setList) => {
    if (list.includes(skill)) {
      setList(list.filter(s => s !== skill))
    } else if (list.length < 8) {
      setList([...list, skill])
    }
  }

  const onFinish = async (data) => {
    setIsSubmitting(true)
    try {
      // CRITICAL FIX: Guard against undefined user/uid
      if (!user || !user.uid) {
        toast.error('Authentication error. Please log in again.')
        setIsSubmitting(false)
        navigate('/login')
        return
      }
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          full_name: data.fullName,
          department: data.department,
          year_of_study: parseInt(data.yearOfStudy, 10),
          bio: data.bio,
          learning_goals: selectedWantLearn,
          teaching_skills: selectedCanTeach,
          onboarding_completed: true,
          karma_balance: 100
        })

      if (error) throw error
        
      
  confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      })
      updateProfile({
        ...data,
        learning_goals: selectedWantLearn,
        teaching_skills: selectedCanTeach,
        onboarding_completed: true,
        karma_balance: 100
      })

      toast.success(`Profile Activated! Welcome to the Nexus, ${data.fullName.split(' ')[0]}.`)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      toast.error(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-10 px-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Activation Phase</span>
              <h3 className="text-white font-black text-xl font-outfit">Step {step} of 5</h3>
            </div>
            <span className="text-white/40 font-black text-sm uppercase tracking-widest">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 min-h-[550px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              {/* STEP 1: WELCOME */}
              {step === 1 && (
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-10 relative"
                  >
                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full" />
                    <Avatar size="2xl" seed={profile?.full_name || 'new-user'} ring />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl border-4 border-[#0f172a]">
                      <Rocket size={24} />
                    </div>
                  </motion.div>
                  <h1 className="text-4xl font-black text-white mb-6 font-outfit leading-tight tracking-tighter">
                    Greetings, {profile?.full_name?.split(' ')[0] || 'Seeker'}! <br />
                    The Nexus awaits. 🌌
                  </h1>
                  <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium max-w-sm">
                    In just 4 steps, we will synchronize your interests and unlock your potential within the campus network.
                  </p>
                  <Button onClick={nextStep} fullWidth size="lg" className="py-6 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 active:scale-95">
                    Begin Synchronization
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP 2: PROFILE DETAILS */}
              {step === 2 && (
                <div className="flex flex-col h-full">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-white mb-3 font-outfit tracking-tight">Identify Yourself</h2>
                    <p className="text-slate-400 font-medium">Your academic coordinates in the system.</p>
                  </div>
                  <div className="space-y-8 flex-1">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest ml-1">Focus Area</label>
                        <select
                          {...register('department', { required: true })}
                          className="w-full px-5 py-4.5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-indigo-500 outline-none text-white font-bold transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900">Choose...</option>
                          {['Computer Sci', 'Electronics', 'Mechanical', 'Aerospace', 'Mathematics', 'B-School', 'Design', 'Other'].map(d => (
                            <option key={d} value={d} className="bg-slate-900">{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest ml-1">Current Cycle</label>
                        <select
                          {...register('yearOfStudy', { required: true })}
                          className="w-full px-5 py-4.5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-indigo-500 outline-none text-white font-bold transition-all appearance-none cursor-pointer"
                        >
                          {[1, 2, 3, 4].map(y => (
                            <option key={y} value={y} className="bg-slate-900">Year {y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Public Intel (Bio)</label>
                        <span className="text-[10px] text-white/20 font-black">{watch('bio')?.length || 0}/120</span>
                      </div>
                      <textarea
                        {...register('bio', { maxLength: 120, required: true })}
                        rows="4"
                        placeholder="e.g., Aspiring VLSI designer. Love building flight controllers and teaching Python basics."
                        className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium transition-all resize-none shadow-inner placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={prevStep} className="flex-1 py-4.5 text-white/40 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">Go Back</button>
                    <Button onClick={nextStep} className="flex-[2] py-5 rounded-2xl shadow-xl shadow-indigo-600/10">Continue Protocol</Button>
                  </div>
                </div>
              )}

              {/* STEP 3: SKILLS TO TEACH */}
              {step === 3 && (
                <div className="flex flex-col h-full">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-white mb-3 font-outfit tracking-tight">Share Your Light</h2>
                    <p className="text-slate-400 font-medium">Select skills you can mentor others in. (Min 1, Max 8)</p>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-wrap gap-3 mb-10">
                      {SKILL_SUGGESTIONS.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill, selectedCanTeach, setSelectedCanTeach)}
                          className={`
                            px-5 py-3 rounded-2xl text-sm font-black transition-all border-2
                            ${selectedCanTeach.includes(skill)
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/20'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}
                          `}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest ml-1">Custom Listing</div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (customSkill) {
                                toggleSkill(customSkill, selectedCanTeach, setSelectedCanTeach)
                                setCustomSkill('')
                              }
                            }
                          }}
                          placeholder="Proprietary skill..."
                          className="flex-1 px-6 py-4.5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-indigo-500 outline-none text-white font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSkill) {
                              toggleSkill(customSkill, selectedCanTeach, setSelectedCanTeach)
                              setCustomSkill('')
                            }
                          }}
                          className="p-4.5 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all border border-white/10"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={prevStep} className="flex-1 py-4.5 text-white/40 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">Go Back</button>
                    <Button onClick={nextStep} disabled={selectedCanTeach.length === 0} className="flex-[2] py-5 rounded-2xl shadow-xl shadow-indigo-600/10">Synchronize Values</Button>
                  </div>
                </div>
              )}

              {/* STEP 4: SKILLS TO LEARN */}
              {step === 4 && (
                <div className="flex flex-col h-full">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-white mb-3 font-outfit tracking-tight">Seek Awareness</h2>
                    <p className="text-slate-400 font-medium">What knowledge do you wish to acquire?</p>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-wrap gap-3 mb-10">
                      {SKILL_SUGGESTIONS.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill, selectedWantLearn, setSelectedWantLearn)}
                          className={`
                            px-5 py-3 rounded-2xl text-sm font-black transition-all border-2
                            ${selectedWantLearn.includes(skill)
                              ? 'bg-purple-600 border-purple-400 text-white shadow-xl shadow-purple-600/30 ring-4 ring-purple-500/20'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}
                          `}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={prevStep} className="flex-1 py-4.5 text-white/40 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">Go Back</button>
                    <Button onClick={nextStep} disabled={selectedWantLearn.length === 0} className="flex-[2] py-5 rounded-2xl shadow-xl shadow-purple-600/10">Set Learning Loop</Button>
                  </div>
                </div>
              )}

              {/* STEP 5: KARMA INTRO */}
              {step === 5 && (
                <div className="flex flex-col h-full text-center">
                  <div className="mb-12">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20 rotate-12"
                    >
                      <Award size={48} className="text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-white mb-4 font-outfit tracking-tight">The Karma Economy</h2>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                      Knowledge is free, but commitment has value. <br />
                      Behold your starting balance.
                    </p>
                  </div>
                  <div className="flex-1 space-y-6">
                    <motion.div
                      className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Zap size={120} fill="currentColor" />
                      </div>

                      <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em] mb-2">Synchronized Funds</div>
                        <div className="flex items-center gap-3">
                          <Star className="text-amber-500" size={32} fill="currentColor" />
                          <span className="text-6xl font-black text-white font-outfit tracking-tighter">100</span>
                        </div>
                        <div className="text-white/40 font-bold mt-2">Karma Credits</div>
                      </div>
                      <div className="mt-10 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
                        />
                      </div>
                    </motion.div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-left">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
                          <Zap size={16} fill="currentColor" />
                        </div>
                        <div className="text-[10px] font-black text-white mb-1 uppercase tracking-wider">Teach</div>
                        <p className="text-[10px] text-slate-500 leading-tight font-medium">Earn credit by sharing what you know.</p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-left">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-3">
                          <BookOpen size={16} />
                        </div>
                        <div className="text-[10px] font-black text-white mb-1 uppercase tracking-wider">Learn</div>
                        <p className="text-[10px] text-slate-500 leading-tight font-medium">Redeem credits for knowledge & vault access.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10">
                    <Button
                      onClick={handleSubmit(onFinish)}
                      fullWidth
                      size="lg"
                      isLoading={isSubmitting}
                      className="py-6 rounded-2xl text-lg group bg-gradient-to-r from-indigo-600 to-purple-600 border-none hover:scale-[1.02] shadow-2xl shadow-indigo-600/20"
                    >
                      Enter The Nexus
                      <Rocket className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
    }
