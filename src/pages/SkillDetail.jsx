import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Star, Zap, Globe, MapPin, Calendar, Clock, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import CampusBadge from '../components/shared/CampusBadge'
import KarmaChip from '../components/shared/KarmaChip'
import StarRating from '../components/shared/StarRating'
import SwapRequestModal from '../components/shared/SwapRequestModal'

export default function SkillDetail() {
  const { skillId } = useParams()
  const navigate = useNavigate()
  const { profile, user } = useAuthStore()
  const [showSwapModal, setShowSwapModal] = useState(false)

  const { data: skill, isLoading, error } = useQuery({
    queryKey: ['skill-detail', skillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select(`
          *,
          mentor:profiles!mentor_id(id, full_name, avatar_url, bio, department, year_of_study, karma_balance, campuses(name)),
          campus:campuses(*)
        `)
        .eq('id', skillId)
        .single()
      
      if (error) throw error
      return data
    }
  })

  const { data: reviews } = useQuery({
    queryKey: ['skill-reviews', skillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_reviews')
        .select('*, reviewer:profiles!reviewer_id(full_name, avatar_url)')
        .eq('skill_id', skillId)
      if (error) throw error
      return data
    },
    enabled: !!skillId
  })

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center min-h-[60vh]">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
    </div>
  )

  if (error || !skill) return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
       <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
         <AlertTriangle size={40} />
       </div>
       <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2 uppercase">Skill Missing in Archive</h2>
       <p className="text-slate-500 mb-8 font-medium">This skill listing might have been removed or moved to the private archive.</p>
       <Button onClick={() => navigate('/explore')}>Back to Explore</Button>
    </div>
  )

  const canAfford = (profile?.karma_balance || 0) >= skill.karma_cost
  const isOwnSkill = skill.mentor_id === user?.id

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32 md:pb-12 font-sans bg-slate-50 min-h-screen">
      <div className="mb-8">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest transition-all">
           <ArrowLeft size={16} /> Back to Search
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-12 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-12">
          <section>
             <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="indigo" className="px-4 py-2 text-xs font-black uppercase tracking-[.2em]">{skill.category}</Badge>
                {skill.is_nexus && <Badge variant="purple" className="px-4 py-2 text-xs font-black uppercase tracking-[.2em] shadow-xl shadow-purple-50"><Globe size={12} className="mr-2" /> Nexus Cross-Campus</Badge>}
             </div>
             <h1 className="text-5xl md:text-6xl font-outfit font-black text-slate-900 mb-6 tracking-tighter uppercase leading-[0.9]">{skill.title}</h1>
             <div className="flex flex-wrap gap-4 items-center">
                <StarRating rating={skill.avg_rating} count={skill.total_reviews} />
                <div className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block" />
                <Badge variant="slate" className="font-bold text-slate-400 border-none px-0"><MapPin size={12} className="mr-1" /> {skill.campus?.name}</Badge>
             </div>
          </section>

          <section className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-100">
             <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 inline-block pb-2 border-b-2 border-indigo-100">Description</h3>
             <p className="text-xl text-slate-600 leading-relaxed font-outfit font-medium">
               {skill.description || 'No detailed description provided by the mentor. Send a swap request to ask specific questions about the curriculum.'}
             </p>
             <div className="flex flex-wrap gap-2 mt-10">
               {skill.tags?.map((tag, i) => (
                 <span key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:border-indigo-200 transition-colors">#{tag}</span>
               ))}
             </div>
          </section>

          <section>
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-outfit font-black text-slate-900 tracking-tight uppercase">Peer Reviews</h3>
                {skill.total_reviews > 0 && <span className="text-sm font-bold text-slate-400">Showing {reviews?.length || 0} reviews</span>}
             </div>
             
             {reviews?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {reviews.map((rev, i) => (
                      <Card key={i} className="p-6 bg-white flex flex-col items-start text-left shadow-lg scale-95 hover:scale-100 transition-transform">
                         <div className="flex items-center gap-3 mb-4">
                            <Avatar size="sm" src={rev.reviewer?.avatar_url} name={rev.reviewer?.full_name} seed={rev.reviewer?.full_name} />
                            <div>
                               <p className="text-xs font-black text-slate-900 leading-none mb-1">{rev.reviewer?.full_name}</p>
                               <StarRating rating={rev.rating} />
                            </div>
                         </div>
                         <p className="text-slate-500 text-sm font-medium italic leading-relaxed">"{rev.comment}"</p>
                         <span className="mt-4 text-[10px] font-black uppercase text-slate-300 tracking-widest">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </Card>
                   ))}
                </div>
             ) : (
                <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 py-16 rounded-[40px] text-center">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Star size={30} />
                   </div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews listed in the archive yet.</p>
                </div>
             )}
          </section>
        </div>

        {/* RIGHT COLUMN — Sticky Card */}
        <div className="sticky top-24 space-y-8">
           <Card className="p-10 border-none shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-100 transition-colors" />
              <div className="relative z-10 text-center">
                 <div className="mb-6 flex justify-center flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 leading-none">Swap Cost</p>
                    <div className="flex items-center gap-3">
                       <Zap size={30} className="text-amber-500 fill-current animate-pulse shadow-sm shadow-amber-100" />
                       <span className="text-6xl font-outfit font-black text-slate-900 tracking-tighter">{skill.karma_cost}</span>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Balance</span>
                       <span className={`text-xs font-black ${canAfford ? 'text-emerald-500' : 'text-rose-500'}`}>{profile?.karma_balance} Karma</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (profile?.karma_balance / skill.karma_cost) * 100)}%` }} className={`h-full ${canAfford ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                 </div>

                 {isOwnSkill ? (
                    <div className="space-y-3">
                       <Button variant="outline" className="w-full h-14 rounded-2xl">Edit Listing</Button>
                       <Button variant="danger" className="w-full h-14 rounded-2xl bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white border-0">Deactivate</Button>
                    </div>
                 ) : (
                    <Button 
                      onClick={() => setShowSwapModal(true)}
                      disabled={!canAfford}
                      size="lg" 
                      className="w-full h-16 rounded-2xl text-xl font-black uppercase tracking-tight shadow-lg shadow-indigo-600/30"
                    >
                      {canAfford ? 'Request Swap' : 'Insufficient Karma'}
                    </Button>
                 )}
                 
                 <p className="mt-8 text-xs text-slate-400 font-medium">Karma is credited only after the session is marked as complete by both parties.</p>
              </div>
           </Card>

           {/* MENTOR CARD */}
           <Card className="p-8 border-none shadow-xl bg-slate-900 text-white relative">
              <Link to={`/profile/${skill.mentor_id}`} className="flex items-center gap-5 group">
                <Avatar size="lg" src={skill.mentor?.avatar_url} name={skill.mentor?.full_name} className="border-indigo-500/30" />
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 leading-none">The Mentor</p>
                   <h4 className="text-xl font-outfit font-black group-hover:text-indigo-400 transition-colors truncate tracking-tight uppercase leading-none">{skill.mentor?.full_name}</h4>
                   <p className="text-xs text-slate-500 font-medium truncate mt-1">
                      {skill.mentor?.department}, Year {skill.mentor?.year_of_study}
                   </p>
                </div>
              </Link>
              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                 <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span>Verified Academic Account</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <Calendar size={18} className="text-indigo-500" />
                    <span>Active since {new Date(skill.mentor?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                 </div>
              </div>
              <Button onClick={() => navigate(`/chat`)} variant="ghost" className="w-full mt-8 bg-white/5 text-white hover:bg-white/10 uppercase font-black text-xs tracking-widest h-14">
                 Message {skill.mentor?.full_name?.split(' ')[0]}
              </Button>
           </Card>

           <button className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors py-4">
              <AlertTriangle size={14} /> Report Listing 
           </button>
        </div>
      </div>

      <SwapRequestModal 
        isOpen={showSwapModal} 
        onClose={() => setShowSwapModal(false)} 
        skill={skill} 
      />
    </div>
  )
}
