import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Rocket, Sparkles, Zap, ShieldCheck, 
  ArrowRight, CheckCircle2, Info, LayoutDashboard,
  Globe, Tags, AlignLeft, CreditCard
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import Button from '../components/ui/Button'

const CATEGORIES = ['Engineering', 'Design', 'Business', 'Arts', 'Languages', 'Science', 'Writing', 'Tech']

export default function ListSkill() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    tags: '',
    karma_cost: 50,
    is_nexus: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from('skills').insert({
        mentor_id: profile.id,
        campus_id: profile.campus_id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        karma_cost: parseInt(formData.karma_cost),
        is_nexus: formData.is_nexus,
        status: 'active'
      })

      if (error) throw error

      toast.success('Skill listed successfully in the Nexus!')
      navigate('/explore')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-24 lg:pb-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Protocol Delta</div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter mb-4">List Your Expertise</h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
          Initialize a new knowledge node in the EduSync Nexus. Shares are peer-verified and earn you Karma points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100 border border-slate-100 space-y-10">
              {/* Step 1: Core Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">01</div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Core Protocol</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-2">Skill Title</label>
                    <div className="relative group">
                      <Rocket className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Advanced React Architecture or VLSI Design"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-2">Category Sector</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none font-bold text-slate-900 transition-all appearance-none"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-2">Karma Exchange Rate</label>
                      <div className="relative group">
                        <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          type="number"
                          min="0"
                          max="1000"
                          value={formData.karma_cost}
                          onChange={(e) => setFormData({...formData, karma_cost: e.target.value})}
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none font-bold text-slate-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Description & Tags */}
              <div className="space-y-6 pt-10 border-t border-slate-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">02</div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Metadata & Context</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-2">Deep Briefing</label>
                    <div className="relative group">
                      <AlignLeft className="absolute left-5 top-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <textarea 
                        required
                        rows="5"
                        placeholder="Detail exactly what you will teach. Include curriculum points..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 outline-none font-bold text-slate-900 transition-all resize-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-2">Indexing Tags (Comma Separated)</label>
                    <div className="relative group">
                      <Tags className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input 
                        type="text"
                        placeholder="javascript, architecture, systems, pattern"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Visibility */}
              <div className="space-y-6 pt-10 border-t border-slate-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">03</div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Visibility Protocol</h3>
                </div>

                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.is_nexus ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-400'}`}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Nexus Bridge Enablement</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Toggle inter-campus visibility across the federation.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, is_nexus: !formData.is_nexus})}
                    className={`relative w-14 h-8 rounded-full transition-colors ${formData.is_nexus ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <motion.div 
                      animate={{ x: formData.is_nexus ? 28 : 4 }}
                      className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-sm" 
                    />
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              fullWidth 
              loading={loading}
              icon={Sparkles}
              className="py-10 text-xl shadow-2xl shadow-indigo-200"
            >
              Initialize Node listing
            </Button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <ShieldCheck className="text-indigo-400 mb-6" size={40} />
              <h4 className="text-xl font-black mb-4 font-outfit uppercase tracking-tighter">Mentor Honor Code</h4>
              <ul className="space-y-4">
                {[
                  'Ensure academic sessions are authentic.',
                  'Maintain institutional integrity standards.',
                  'Respond to swap requests within 24hr.',
                  'Respect the Karma economy fairness.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-xs font-medium text-slate-400 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Preview Card</h4>
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{formData.category}</div>
              <h3 className="text-lg font-black text-slate-900 mb-4 font-outfit leading-tight">{formData.title || 'Your Skill Title Here'}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-black">{formData.karma_cost} Karma Point</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.split(',').filter(Boolean).map((t, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white text-[8px] font-black text-slate-400 rounded-lg uppercase tracking-tight">#{t.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
