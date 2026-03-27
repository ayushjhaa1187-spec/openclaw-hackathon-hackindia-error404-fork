import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Play, Link as LinkIcon, Download, Globe, Rocket, ArrowRight, ArrowLeft, Plus, CloudUpload, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'

const SUBJECTS = ['Data Structures', 'Algorithms', 'VLSI Design', 'Digital Logic', 'Marketing Strategy', 'UX Design', 'Thermodynamics', 'Machine Learning']
const TYPES = ['PDF', 'Doc', 'Video', 'Link']

export default function UploadResourceModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const { profile } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const onSubmit = async (data) => {
    try {
      const newResource = {
        ...data,
        uploader_id: profile.id,
        campus_id: profile.campus_id,
        status: 'pending', // Admins verify before release
        is_verified: false,
        download_count: 0,
        url: 'https://example.com/demo.pdf' // Static for demo
      }

      // Simulation: In real app, call vaultService.uploadResource()
      console.log('Resource uploaded:', newResource)
      
      toast.success('Resource submitted for certification! 📄')
      onSuccess?.()
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
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black">V</div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-outfit">Contribute to Vault</h2>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of 3</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-0 flex flex-col flex-1">
          <div className="p-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Step 1: Resource Detail */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-2">Title</label>
                      <input 
                        {...register('title', { required: true, minLength: 5 })}
                        placeholder="e.g. Algorithms & Data Structures Cheat Sheet"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      />
                      {errors.title && <p className="text-rose-500 text-[10px] font-black tracking-widest uppercase">Required (min 5 chars)</p>}
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-2">Subject</label>
                      <select 
                        {...register('subject', { required: true })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm accent-indigo-600"
                      >
                        <option value="">Select a subject...</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Format & Cost */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-2">Resource Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        {TYPES.map(type => (
                          <label key={type} className="relative group cursor-pointer">
                            <input {...register('type', { required: true })} type="radio" value={type} className="peer hidden" />
                            <div className="w-full p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 text-center transition-all">
                              <span className="text-sm font-black text-slate-700 peer-checked:text-indigo-600 uppercase tracking-widest">{type}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-2">Karma Cost (10-100)</label>
                      <input 
                        type="number"
                        {...register('karma_cost', { required: true, min: 10, max: 100 })}
                        defaultValue={20}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      />
                      <p className="text-[10px] text-slate-400 font-bold ml-2">You earn this amount each time someone unlocks your file.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Upload / Link */}
                {step === 3 && (
                  <div className="space-y-6 text-center">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CloudUpload size={48} className="animate-bounce" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 font-outfit uppercase tracking-tighter">Ready to Verify?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      By proceeding, you agree that this material is for peer education only and adheres to institutional academic integrity policies.
                    </p>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 text-left">
                      <ShieldCheck className="text-amber-500 shrink-0" size={20} />
                      <p className="text-[10px] font-bold text-amber-900 leading-normal uppercase tracking-tight">
                        Resources are screened by campus moderators before being published. 
                        False information may result in Karma deductions.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-8 flex gap-4 mt-auto">
            {step > 1 && (
              <Button type="button" variant="ghost" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={nextStep} fullWidth={step === 1} className="flex-1">
                Continue
                <ArrowRight className="ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="flex-1" variant="primary">
                Submit File
                <Rocket className="ml-2" />
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}
