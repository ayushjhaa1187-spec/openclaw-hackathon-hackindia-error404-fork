import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Edit, Zap, Star, Shield, BookOpen, Clock, Settings, LogOut, ChevronRight, MessageSquare, AlertTriangle } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SkillCard from '../components/shared/SkillCard'
import CampusBadge from '../components/shared/CampusBadge'
import KarmaChip from '../components/shared/KarmaChip'

export default function Profile() {
  const { profile, user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const { data: mySkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['my-skills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('mentor_id', user.id)
      if (error) throw error
      return data
    },
    enabled: !!user
  })

  // Karma Ledger History
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['karma-ledger', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('karma_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const stats = [
    { label: 'Karma Earned', value: profile?.karma_balance || 0, icon: Star, color: 'amber' },
    { label: 'Skills Listed', value: mySkills?.length || 0, icon: Zap, color: 'indigo' },
    { label: 'Swaps Completed', value: 0, icon: Shield, color: 'emerald' },
    { label: 'Audit Grade', value: profile?.audit_grade || 'New', icon: BookOpen, color: 'purple' }
  ]

  return (
    <div className="font-sans min-h-screen bg-white">
      {/* HEADER GRADIENT */}
      <div className="h-64 bg-navy relative overflow-hidden flex items-end">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 opacity-80" />
         <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full blur-[100px] opacity-30" />
         <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-rose-400 rounded-full blur-[100px] opacity-20" />
         
         <div className="max-w-7xl mx-auto w-full px-6 pb-0 relative z-10 flex flex-col md:flex-row items-end gap-6 translate-y-16">
            <div className="relative group">
               <Avatar size="xl" src={profile?.avatar_url} name={profile?.full_name} seed={profile?.full_name} className="w-32 h-32 md:w-48 md:h-48 border-[8px] border-white shadow-2xl" />
               <button className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><Edit size={20} /></button>
            </div>
            
            <div className="flex-1 pb-6 text-center md:text-left">
               <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
                  <CampusBadge campus={profile?.campuses?.name} size="lg" />
                  <Badge variant="indigo" className="bg-indigo-900 border-indigo-700 text-indigo-300 font-black uppercase tracking-widest text-[10px]">{profile?.role}</Badge>
               </div>
               <h1 className="text-4xl md:text-6xl font-outfit font-black text-slate-900 tracking-tighter uppercase leading-none">{profile?.full_name}</h1>
               <p className="mt-2 text-slate-500 font-medium">
                 {profile?.department}, {profile?.year_of_study} YEAR · <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{profile?.campuses?.domain_suffix || 'edu.sync'}</span>
               </p>
            </div>

            <div className="flex gap-4 pb-6 w-full md:w-auto">
               <Button onClick={() => navigate('/settings')} variant="outline" className="flex-1 border-slate-200 text-slate-700 h-14 rounded-2xl">Edit Profile</Button>
               <Button onClick={() => signOut()} variant="danger" className="p-4 rounded-2xl"><LogOut size={20} /></Button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-12">
        {/* SIDEBAR */}
        <div className="space-y-8">
           <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">About Me</h3>
              <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-50 pl-6 py-2">
                {profile?.bio || 'You haven\'t added a bio yet. Mentors with bios get 4x more swap requests!'}
              </p>
           </section>

           <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group">
                   <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                      <s.icon size={18} />
                   </div>
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{s.label}</p>
                   <p className="text-xl font-black text-slate-900 font-outfit">{s.value}</p>
                </div>
              ))}
           </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-16">
           {/* MY SKILLS */}
           <section>
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-outfit font-black text-slate-900 tracking-tight leading-none uppercase">Published Skills</h3>
                 <Button className="h-12 px-6 rounded-xl font-bold">List New Skill</Button>
              </div>

              {skillsLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />)}
                 </div>
              ) : mySkills?.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mySkills.map(skill => (
                      <SkillCard 
                        key={skill.id} 
                        skill={{
                           ...skill,
                           mentor: profile.full_name,
                           campus: profile.campuses?.name
                        }}
                        onClick={() => navigate(`/explore/skill/${skill.id}`)}
                      />
                    ))}
                 </div>
              ) : (
                 <div className="bg-slate-50 border-2 border-dashed border-slate-200 py-16 rounded-[40px] text-center">
                    <Zap size={32} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest px-12">Break the ice and share what you know with the Nexus network.</p>
                 </div>
              )}
           </section>

           {/* ACTIVITY HISTORY */}
           <section>
              <h3 className="text-2xl font-outfit font-black text-slate-900 tracking-tight leading-none mb-8 uppercase">Activity Timeline</h3>
              <div className="space-y-4">
                 {ledgerLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)
                 ) : ledger?.length > 0 ? (
                    ledger.map((item, i) => (
                      <div key={i} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                         <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center ${item.type === 'earned' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {item.type === 'earned' ? <Star size={20} /> : <Zap size={20} />}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-slate-900 leading-none mb-1">{item.note || 'Nexus Transaction'}</h4>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest text-[10px]">{item.source || 'General'}</p>
                         </div>
                         <div className={`text-xl font-black font-outfit ${item.type === 'earned' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.type === 'earned' ? '+' : '-'}{item.amount}
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="bg-slate-50 border border-slate-100/50 p-6 rounded-3xl text-center">
                       <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No transaction history in the ledger yet.</p>
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}
