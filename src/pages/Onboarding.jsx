import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  User, BookOpen, GraduationCap, Laptop, 
  ArrowRight, ArrowLeft, CheckCircle2, 
  Zap, Star, Rocket, Plus, X
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
  const [avatarPreview, setAvatarPreview] = useState(null)
  
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
    enter: (direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -40 : 40, opacity: 0 })
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

  const addCustomSkill = (list, setList) => {
    if (customSkill && !list.includes(customSkill) && list.length < 8) {
      setList([...list, customSkill])
      setCustomSkill('')
    }
  }

  const onFinish = async (data) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          department: data.department,
          year_of_study: parseInt(data.yearOfStudy),
          bio: data.bio,
          avatar_url: avatarPreview || profile?.avatar_url,
          onboarding_completed: true,
          karma_balance: 100 // Starting bonus
        })
        .eq('id', user.id)

      if (error) throw error

      // Insert skills
      if (selectedCanTeach.length > 0) {
        const skillsToInsert = selectedCanTeach.map(s => ({
          title: s,
          category: 'Other',
          mentor_id: user.id,
          campus_id: profile?.campus_id,
          status: 'active'
        }))
        await supabase.from('skills').insert(skillsToInsert)
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      })

      updateProfile({ ...data, onboarding_completed: true, karma_balance: 100 })
      toast.success(`Welcome to EduSync, ${data.fullName.split(' ')[0]}! 🚀`)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      toast.error(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">
            <span>Step {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-12 min-h-[500px] flex flex-col border border-slate-100">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {/* STEP 1: WELCOME */}
              {step === 1 && (
                <div className="flex flex-col items-center text-center">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="mb-8"
                  >
                    <Avatar size="2xl" seed={profile?.full_name || 'new-user'} ring />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg ring-4 ring-white">
                      <Rocket size={20} />
                    </div>
                  </motion.div>
                  <h1 className="text-3xl font-black text-slate-900 mb-4 font-outfit">Hey {profile?.full_name?.split(' ')[0] || 'User'}! Welcome to EduSync 🎉</h1>
                  <p className="text-slate-500 text-lg leading-relaxed mb-12">
                    Let's set up your profile in 4 quick steps so we can find the right people for you.
                  </p>
                  <Button onClick={nextStep} fullWidth size="lg">
                    Let's Go
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP 2: PROFILE DETAILS */}
              {step === 2 && (
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 font-outfit">Your Profile</h2>
                    <p className="text-slate-500">Help the community get to know you.</p>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div className="flex items-center gap-6 mb-4">
                      <Avatar size="xl" src={avatarPreview} seed={profile?.full_name} ring border />
                      <div className="flex-1">
                        <label className="text-sm font-bold text-slate-700 block mb-2">Profile Picture</label>
                        <input 
                          type="file" 
                          id="avatar" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setAvatarPreview(URL.createObjectURL(e.target.files[0]))
                            }
                          }}
                        />
                        <label htmlFor="avatar" className="text-xs text-indigo-600 font-bold px-4 py-2 border-2 border-indigo-100 rounded-xl hover:bg-indigo-50 cursor-pointer transition-all inline-block">
                          Change Photo
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Department</label>
                        <select 
                          {...register('department', { required: true })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="">Select...</option>
                          {['CS', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Chemistry', 'Other'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Year</label>
                        <select 
                          {...register('yearOfStudy', { required: true })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {[1, 2, 3, 4].map(y => (
                            <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between pl-1">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">About You</label>
                        <span className="text-[10px] text-slate-400 font-bold">{watch('bio')?.length || 0}/100</span>
                      </div>
                      <textarea 
                        {...register('bio', { maxLength: 100 })}
                        rows="3"
                        placeholder="I love tinkering with drones and build React apps..."
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
                    <Button onClick={nextStep} className="flex-1">Continue</Button>
                  </div>
                </div>
              )}

              {/* STEP 3: SKILLS TO TEACH */}
              {step === 3 && (
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 font-outfit">Skills You Can Teach</h2>
                    <p className="text-slate-500">Pick what you can mentor others in. Max 8.</p>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-8">
                      {SKILL_SUGGESTIONS.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill, selectedCanTeach, setSelectedCanTeach)}
                          className={`
                            px-4 py-2 rounded-xl text-sm font-bold transition-all border
                            ${selectedCanTeach.includes(skill) 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
                          `}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Other Skill</div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomSkill(selectedCanTeach, setSelectedCanTeach)}
                          placeholder="e.g. Arabic, Chess, CAD..."
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                          onClick={() => addCustomSkill(selectedCanTeach, setSelectedCanTeach)}
                          className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
                    <Button onClick={nextStep} disabled={selectedCanTeach.length === 0} className="flex-1">Continue</Button>
                  </div>
                </div>
              )}

              {/* STEP 4: SKILLS TO LEARN */}
              {step === 4 && (
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 font-outfit">What You Want to Learn</h2>
                    <p className="text-slate-500">We'll use this to match you with mentors.</p>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-8">
                      {SKILL_SUGGESTIONS.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill, selectedWantLearn, setSelectedWantLearn)}
                          className={`
                            px-4 py-2 rounded-xl text-sm font-bold transition-all border
                            ${selectedWantLearn.includes(skill) 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
                          `}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Other Skill</div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomSkill(selectedWantLearn, setSelectedWantLearn)}
                          placeholder="What else do you want to learn?"
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                          onClick={() => addCustomSkill(selectedWantLearn, setSelectedWantLearn)}
                          className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
                    <Button onClick={nextStep} disabled={selectedWantLearn.length === 0} className="flex-1">Continue</Button>
                  </div>
                </div>
              )}

              {/* STEP 5: KARMA INTRO */}
              {step === 5 && (
                <div className="flex flex-col h-full">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 font-outfit">Here's how Karma works 💫</h2>
                    <p className="text-slate-500">The engine that powers the EduSync Nexus.</p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                          <Star size={20} fill="currentColor" />
                        </div>
                        <div className="text-sm font-black text-indigo-900">You start with 100 Karma</div>
                      </div>
                      <div className="h-1.5 w-full bg-indigo-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                      <p className="text-[11px] text-indigo-700 mt-3 font-medium">Enough to unlock your first few resources right away.</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center"
                        >
                          <Zap size={20} fill="currentColor" />
                        </motion.div>
                        <div className="text-sm font-black text-emerald-900">Teach to Earn</div>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                        Complete a skill session and earn between 50-200 Karma based on complexity. The more you help, the more you learn.
                      </p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      className="bg-amber-50 border border-amber-100 p-5 rounded-2xl"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
                        >
                          <Star size={20} fill="currentColor" />
                        </motion.div>
                        <div className="text-sm font-black text-amber-900">Spend to Grow</div>
                      </div>
                      <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                        Spend your earned Karma to learn new skills or unlock study guides in the Vault. No money. Just knowledge.
                      </p>
                    </motion.div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      onClick={handleSubmit(onFinish)} 
                      fullWidth 
                      size="lg" 
                      isLoading={isSubmitting}
                      className="group"
                    >
                      Enter EduSync
                      <Rocket className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
