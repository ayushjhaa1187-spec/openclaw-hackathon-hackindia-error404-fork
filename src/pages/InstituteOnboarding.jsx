import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, GraduationCap, ShieldCheck, Zap, 
  ArrowRight, Check, Globe, Users, BookOpen,
  Mail, Phone, MapPin, FileText
} from 'lucide-react'
import Button from '../components/ui/Button'

const STEPS = [
  { id: 1, title: 'Institution Info', icon: Building2 },
  { id: 2, title: 'Verification', icon: ShieldCheck },
  { id: 3, title: 'Admin Setup', icon: GraduationCap },
  { id: 4, title: 'Federation', icon: Zap }
]

export default function InstituteOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    verificationDoc: null
  })

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full z-10">
        
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2 relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    currentStep >= step.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                      : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}>
                    {currentStep > step.id ? <Check size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    currentStep >= step.id ? 'text-indigo-400' : 'text-slate-600'
                  }`}>{step.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-white/10 mx-4 mt-[-20px]">
                    <motion.div 
                      className="h-full bg-indigo-600"
                      initial={{ width: '0%' }}
                      animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-[3rem] p-8 lg:p-12 backdrop-blur-xl"
        >
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-3xl font-black text-white font-outfit mb-2">Register Your Campus</h2>
                <p className="text-slate-400 text-sm italic">Join the global federation of student-led knowledge economies.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Institute Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-indigo-600 transition-all" placeholder="Doon University..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Official Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-indigo-600 transition-all" placeholder="www.campus.edu.in" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Campus Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-indigo-600 transition-all" placeholder="City, State, Country" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-3xl font-black text-white font-outfit mb-2">Academic Verification</h2>
                <p className="text-slate-400 text-sm italic">Upload credentials to verify institutional authority.</p>
              </div>
              <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-indigo-600/50 transition-all group cursor-pointer">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="text-slate-400 group-hover:text-indigo-400" size={32} />
                </div>
                <div className="text-white font-bold mb-1">Click to upload verification PDF</div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">AIACTE / UGC / Ministry Authorization</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-3xl font-black text-white font-outfit mb-2">Campus Administrator</h2>
                <p className="text-slate-400 text-sm italic">Set up the primary governance contact for your campus.</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-indigo-600 transition-all" placeholder="Administrator Name" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-indigo-600 transition-all" placeholder="Official Admin Email (@campus.edu)" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-indigo-600 transition-all" placeholder="Contact Number" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-8 py-8">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-emerald-500" size={48} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white font-outfit mb-4">Request Submitted!</h2>
                <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your campus onboarding request is being reviewed by the EduSync Federation. 
                  Initial synchronization takes <span className="text-white font-bold">24-48 hours</span>.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400 tracking-widest">
                  <Globe size={14} />
                  Pending Federation Propagation
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-12">
            <button 
              onClick={prevStep}
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                currentStep === 1 || currentStep === 4 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'
              }`}
            >
              Back
            </button>
            {currentStep < 4 ? (
              <Button onClick={nextStep} variant="primary" icon={ArrowRight} className="px-10 h-14">
                Continue
              </Button>
            ) : (
              <Button variant="outline" className="px-10 h-14" href="/">
                Return to Hub
              </Button>
            )}
          </div>
        </motion.div>

        {/* Info Footer */}
        <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <Zap size={12} className="text-amber-500" />
            Instant Knowledge Sync
          </div>
          <div className="w-1 h-1 bg-slate-800 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-indigo-500" />
            Campus Verification Protocol
          </div>
        </div>

      </div>
    </div>
  )
}
