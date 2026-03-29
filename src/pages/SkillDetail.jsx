import React, { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Star, Clock, Globe, ShieldCheck, 
  CheckCircle2, MessageSquare, ArrowLeft, 
  Share2, AlertTriangle, PlayCircle, BookOpen,
  Calendar, Layers, Users, Rocket
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import SwapRequestModal from '../components/shared/SwapRequestModal'
import { toast } from 'sonner'

export default function SkillDetail() {
  const { skillId } = useParams()
  const navigate = useNavigate()
  const [showSwapModal, setShowSwapModal] = useState(false)
  
  const { data: skill, isLoading, error } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select(`
          *,
          profile:mentor_id (
            full_name, 
            avatar_url, 
            campus_id, 
            role,
            campuses:campus_id (name, short_code)
          )
        `)
        .eq('id', skillId)
        .single()
      
      if (error) throw error
      
      return {
        ...data,
        mentor: data.profile?.full_name || 'EduSync Peer',
        campus: data.profile?.campuses?.name || 'Partner Campus',
        mentor_avatar: data.profile?.avatar_url
      }
    },
    enabled: !!skillId
  })

  const activeSinceDate = useMemo(() => new Date(2025, 0, 15).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), [])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Syncing with Nexus Data Node...</p>
      </div>
    </div>
  )

  if (error || !skill) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <AlertTriangle size={48} className="mx-auto text-rose-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-900 mb-2 font-outfit uppercase tracking-tighter">Skill Not Found</h2>
        <p className="text-slate-500 mb-8 font-medium">The skill protocol you are trying to access is no longer active.</p>
        <Button onClick={() => navigate('/explore')}>Return to Explore</Button>
      </div>
    </div>
  )

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Navbar Context */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Explore
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="Share Skill">
              <Share2 size={20} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl transition-all" title="Report">
              <AlertTriangle size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Hero Section */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
                <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                  <PlayCircle size={48} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none">{skill.category}</span>
                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">• Nexus Verified</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 font-outfit tracking-tighter leading-tight">
                    {skill.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="text-amber-500 fill-amber-500" size={18} />
                      <span className="text-lg font-black text-slate-900">{skill.avg_rating}</span>
                      <span className="text-sm font-bold text-slate-400">({skill.total_reviews} Reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users size={18} />
                      <span className="text-sm font-bold">14 Students Enrolled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Profile */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Your Peer Mentor</h2>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Active Provider
                </div>
              </div>
              <div className="flex items-center gap-8 mb-10">
                <Avatar seed={skill.mentor} size="xl" ring border />
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{skill.mentor}</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">{skill.campus}</p>
                  <p className="flex items-center gap-1.5 text-xs text-indigo-600 font-black">
                    <Clock size={14} /> Active since {activeSinceDate}
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed italic max-w-2xl mb-10">
                "I've worked on multiple inter-campus projects involving deep-tech research. {skill.title} is my primary area of expertise and I love simplifying complex concepts for fellow enthusiasts."
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                {[
                  { label: 'Swaps', value: '12', color: 'indigo' },
                  { label: 'Response', value: '2hr', color: 'emerald' },
                  { label: 'Accuracy', value: '98%', color: 'amber' },
                  { label: 'Rating', value: '4.9', color: 'rose' },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-xl font-black text-${stat.color}-600 leading-none mb-1`}>{stat.value}</div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter ml-2">What you'll master</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Foundational Theory', icon: BookOpen, desc: 'Core academic principles and simplified conceptual workflows.' },
                  { title: 'Real-world Projects', icon: Layers, desc: 'Implementation details from successful campus projects.' },
                  { title: 'Nexus Practice', icon: Rocket, desc: 'Applying these skills within the EduSync ecosystem.' },
                  { title: 'Cheat Sheets', icon: CheckCircle2, desc: 'Exclusive PDFs and notes from my personal Knowledge Vault.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex gap-6 group hover:border-indigo-500/30 transition-all">
                    <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black font-outfit tracking-tighter uppercase">Peer Reviews</h2>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Total: {skill.total_reviews}</div>
              </div>
              <div className="space-y-12">
                {[1, 2].map(i => (
                  <div key={i} className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <Avatar seed={`Reviewer-ID-${i}`} size="md" ring />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-black text-lg">Indravali Member</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">2 weeks ago</div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => <Star key={j} className="fill-indigo-500 text-indigo-500" size={12} />)}
                        </div>
                      </div>
                      <p className="text-slate-300 text-lg font-medium italic leading-relaxed">
                        "The way {skill.mentor} explained the CMOS layout logic was mindblowing. Far better than any professor I've had. Worth every Karma point spent."
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 space-y-6">
              
              {/* Swap Agreement Draft Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-200/50 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] -mr-16 -mt-16 opacity-10" />
                
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-[0.2em] mb-8">Draft Swap Agreement</h3>
                
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-500">Service Fee</span>
                    <span className="text-lg font-black text-slate-900">{skill.karma_cost} Karma</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-500">Duration</span>
                    <span className="text-lg font-black text-slate-900">120 Minutes</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-500">Format</span>
                    <span className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Live Meet</span>
                  </div>
                </div>

                <Button 
                  fullWidth 
                  size="lg" 
                  icon={Zap} 
                  className="mb-4 shadow-indigo-600/30"
                  onClick={() => setShowSwapModal(true)}
                >
                  Confirm Request
                </Button>
                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  100% Refundable if mentor cancels.
                </div>
              </div>

              {/* Security Hint */}
              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-[11px] font-bold text-amber-900 leading-relaxed uppercase tracking-tight">
                  This skill is verified by Northvale Admin. All communication is monitored to maintain institutional integrity.
                </p>
              </div>

              {/* Chat Hint */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg text-center">
                <MessageSquare className="mx-auto mb-4 text-indigo-600" size={32} />
                <h4 className="font-black text-slate-900 mb-2 font-outfit">Need to ask a question?</h4>
                <p className="text-xs text-slate-500 mb-6 font-medium">Send a quick message to {skill.mentor} before you commit.</p>
                <button 
                  onClick={() => toast.info(`Chat with ${skill.mentor} is opening...`)}
                  className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                >
                  Open Nexus Bridge →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showSwapModal && (
          <SwapRequestModal skill={skill} onClose={() => setShowSwapModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
