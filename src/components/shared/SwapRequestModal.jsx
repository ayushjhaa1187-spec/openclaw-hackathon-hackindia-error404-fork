import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Star, MessageSquare, Calendar, Globe, Rocket, ArrowRight, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { karmaService } from '../../services/karmaService'


export default function SwapRequestModal({ skill, onClose }) {
  const [step, setStep] = useState(1)
  const { profile } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const onSubmit = async () => {
    // Check karma
    if (profile.karma_balance < skill.karma_cost) {
      toast.error('Not enough Karma for this swap.')
      return
    }

    try {
      // 1. Insert Request
      const { error: requestError } = await supabase
        .from('skill_requests')
        .insert({
          skill_id: skill.id,
          requester_id: profile.id,
          message: 'Swap requested.',
          status: 'pending'
        })

      if (requestError) throw requestError

      // 2. We don't deduct Karma until it is ACCEPTED by the mentor.
      // But for MVP hackathon, we might just deduct it immediately or leave it pending.
      // Let's just create the request for now and notify.

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      toast.success(`Swap request sent to ${skill.mentor}! 🎉`)
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">E</div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-outfit">Request Skill Swap</h2>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of 4</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step 1: Review */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-4 flex gap-4">
                    <Avatar seed={skill.mentor} size="lg" ring />
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{skill.title}</h4>
                      <div className="text-xs text-slate-500 font-medium">{skill.mentor} • {skill.campus}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <div className="text-[10px] uppercase font-black text-amber-600 tracking-widest mb-1">Swap Cost</div>
                      <div className="text-2xl font-black text-amber-600">{skill.karma_cost} <Star className="inline" size={16} fill="currentColor" /></div>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                      <div className="text-[10px] uppercase font-black text-indigo-600 tracking-widest mb-1">Remaining</div>
                      <div className="text-2xl font-black text-indigo-600">{(profile?.karma_balance || 100) - skill.karma_cost} <Star className="inline" size={16} fill="currentColor" /></div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    <div className="text-xs font-bold text-slate-500 leading-relaxed">
                      "You're requesting a skill session with a peer from another campus. Maintain institutional integrity."
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Message */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <MessageSquare size={16} />
                    </div>
                    <h4 className="font-black text-slate-900 italic">Introduce Yourself</h4>
                  </div>
                  <textarea 
                    {...register('message', { required: true, minLength: 20 })}
                    rows="4"
                    placeholder="Hey Priya! I'm Arjun from NIT-N. I saw your VLSI session and I'd love to learn from you. I can help you with React Hooks in return..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-medium text-sm leading-relaxed"
                  />
                  {errors.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">At least 20 characters required.</p>}
                </div>
              )}

              {/* Step 3: Propose Time */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <h4 className="font-black text-slate-900 italic">When are you free?</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Today', 'Tomorrow', 'This Weekend', 'Monday'].map(t => (
                      <button key={t} type="button" className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 text-sm font-black text-slate-700 hover:text-indigo-600 transition-all text-center">
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-[10px] font-black uppercase text-slate-400">
                    Session Format: Online (Google Meet)
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div className="text-center py-6">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <Star className="text-indigo-600 animate-pulse" size={48} fill="currentColor" />
                    <motion.div 
                      animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 ring-4 ring-indigo-500 rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit">Ready to Nexus?</h3>
                  <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                    By submitting this request, you agree to trade knowledge across campus nodes.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex gap-4">
          {step > 1 && (
            <Button variant="ghost" onClick={prevStep} className="flex-1">
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={nextStep} fullWidth={step === 1} className="flex-1">
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)} className="flex-1" variant="primary">
              Submit Request
              <Rocket className="ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
