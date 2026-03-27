import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, ChevronRight, Zap, Info, Calendar, Clock, Globe, User, Send, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'

const STEPS = 4

export default function SwapRequestModal({ isOpen, onClose, skill }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { profile, user } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  if (!isOpen) return null

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // 1. Create skill request
      const { error: requestError } = await supabase.from('skill_requests').insert([
        { 
          skill_id: skill.id, 
          requester_id: user.id, 
          message: data.message, 
          proposed_time: data.date, 
          status: 'pending' 
        }
      ])
      if (requestError) throw requestError

      // 2. Insert notification for mentor
      await supabase.from('notifications').insert([
        { 
          user_id: skill.mentor_id, 
          type: 'swap_request', 
          title: 'New Swap Request!', 
          body: `${profile.full_name} wants to learn ${skill.title}.`,
          link: `/dashboard`
        }
      ])

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#fbbf24']
      })

      setStep(4)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-navy/60 backdrop-blur-md"
      />

      <motion.div 
        layoutId="swap-modal"
        className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden font-sans"
      >
        <button onClick={handleClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 z-10 p-2">
           <X size={24} />
        </button>

        <div className="p-8 sm:p-12">
           <AnimatePresence mode="wait">
              {step === 1 && (
                 <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit="hidden">
                    <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2 uppercase tracking-tight">Review Swap</h2>
                    <p className="text-slate-500 font-medium mb-10">Confirm the details of your request to {skill.mentor?.full_name}.</p>
                    
                    <div className="space-y-4 mb-12">
                       <div className="bg-slate-50 p-6 rounded-3xl flex justify-between items-center border border-slate-100">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Skill</p>
                             <h4 className="font-outfit font-black text-xl text-slate-900 uppercase tracking-tighter">{skill.title}</h4>
                          </div>
                          <Badge variant="indigo" className="animate-pulse">Active Swap</Badge>
                       </div>

                       <div className="flex gap-4">
                          <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 leading-none">Karma Cost</p>
                             <div className="flex items-center gap-2">
                                <Zap size={16} className="text-amber-500 fill-current" />
                                <span className="text-2xl font-black text-slate-900">{skill.karma_cost}</span>
                             </div>
                          </div>
                          <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 leading-none">New Balance</p>
                             <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-indigo-600">{(profile?.karma_balance || 0) - skill.karma_cost}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <Button size="lg" className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-tight" onClick={() => setStep(2)}>
                       Proceed to Session Details <ChevronRight size={20} className="ml-1" />
                    </Button>
                 </motion.div>
              )}

              {step === 2 && (
                 <form key="step2" onSubmit={handleSubmit(() => setStep(3))} className="space-y-8">
                    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                       <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2 uppercase tracking-tight">Introduce Yourself</h2>
                       <p className="text-slate-500 font-medium mb-10">Mentors are more likely to accept clear, friendly requests.</p>
                       
                       <textarea 
                          {...register('message', { required: true, minLength: 20 })}
                          placeholder="Hey! I saw your VLSI listing. I'm struggling with CMOS layouts and would love a 1-hour session. I can teach you React in return!"
                          className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-[30px] outline-none focus:border-indigo-600 transition-colors font-medium text-slate-700 resize-none shadow-inner"
                       />
                       {errors.message && <p className="mt-2 text-xs font-bold text-rose-500 px-2 uppercase tracking-widest">Message must be at least 20 chars.</p>}
                       
                       <div className="flex gap-4 mt-12">
                          <Button variant="ghost" className="flex-1 h-16" onClick={() => setStep(1)}>Back</Button>
                          <Button size="lg" className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-tight" type="submit">
                             Propose Time <ChevronRight size={20} className="ml-1" />
                          </Button>
                       </div>
                    </motion.div>
                 </form>
              )}

              {step === 3 && (
                 <form key="step3" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                       <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2 uppercase tracking-tight">When can you meet?</h2>
                       <p className="text-slate-500 font-medium mb-10">Choose your preferred session slot and venue.</p>
                       
                       <div className="space-y-6">
                          <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Proposed Date & Time</label>
                             <input 
                                {...register('date', { required: true })}
                                type="datetime-local"
                                className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-700 focus:border-indigo-600 outline-none appearance-none"
                             />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 rounded-3xl border-2 border-indigo-600 bg-indigo-50/50 flex flex-col items-center gap-3 text-indigo-600 cursor-pointer shadow-lg shadow-indigo-100">
                                <Globe size={24} />
                                <span className="font-black uppercase text-xs tracking-widest">Online Session</span>
                             </div>
                             <div className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 flex flex-col items-center gap-3 text-slate-400 cursor-pointer hover:border-slate-200 transition-all opacity-50 grayscale">
                                <User size={24} />
                                <span className="font-black uppercase text-xs tracking-widest">In Person</span>
                             </div>
                          </div>
                       </div>

                       <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 mt-10">
                          <Info size={20} className="text-amber-500 shrink-0" />
                          <p className="text-xs font-medium text-amber-700 leading-relaxed">
                            <strong>Note:</strong> Most Nexus swaps happen via Google Meet. Link will be shared in Chat once accepted.
                          </p>
                       </div>

                       <div className="flex gap-4 mt-12">
                          <Button variant="ghost" className="flex-1 h-16" onClick={() => setStep(2)}>Back</Button>
                          <Button loading={loading} size="lg" className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-tight" type="submit">
                             Send Request <Send size={20} className="ml-2" />
                          </Button>
                       </div>
                    </motion.div>
                 </form>
              )}

              {step === 4 && (
                 <motion.div 
                   key="step4" variants={fadeInUp} initial="hidden" animate="visible" 
                   className="text-center py-10"
                 >
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-xl shadow-emerald-50">
                       <CheckCircle2 size={48} className="animate-bounce" />
                    </div>
                    <h2 className="text-4xl font-outfit font-black text-slate-900 mb-4 uppercase tracking-tighter">Swap Request Sent!</h2>
                    <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                      We've notified <span className="text-indigo-600 font-bold">{skill.mentor?.full_name}</span>. You'll get an alert as soon as they respond!
                    </p>
                    <Button size="lg" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest" onClick={handleClose}>
                       Great! Back to Dashboard
                    </Button>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
