import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Zap, BookOpen, Star, Building2, Bell, ArrowRight, CheckCircle, Info } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MOCK_SKILLS } from '../data/mockData'
import SkillCard from '../components/shared/SkillCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const { profile, user } = useAuthStore()
  const navigate = useNavigate()

  // REAL SUPABASE QUERIES
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      // 1. Swaps count
      const { count: swapsCount } = await supabase
        .from('skill_requests')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},skills.mentor_id.eq.${user.id}`)
        .eq('status', 'accepted')

      // 2. Resources count
      const { count: resourcesCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('uploader_id', user.id)

      // 3. Rank
      const { count: higherKarmaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('karma_balance', profile?.karma_balance || 0)

      return {
        swaps: swapsCount || 0,
        resources: resourcesCount || 0,
        rank: (higherKarmaCount || 0) + 1
      }
    },
    enabled: !!user?.id && !!profile
  })

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommended-skills', profile?.campus_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('skills')
        .select('*, profiles(full_name, avatar_url, campuses(name))')
        .eq('campus_id', profile.campus_id)
        .eq('status', 'active')
        .neq('mentor_id', user.id)
        .limit(3)

      if (!data || data.length === 0) {
        // Fallback to Nexus
        const { data: nexusData } = await supabase
          .from('skills')
          .select('*, profiles(full_name, avatar_url, campuses(name))')
          .eq('is_nexus', true)
          .eq('status', 'active')
          .neq('mentor_id', user.id)
          .limit(3)
        return nexusData || []
      }
      return data
    },
    enabled: !!profile?.campus_id
  })

  const statsList = [
    { label: 'Active Swaps', value: stats?.swaps || 0, icon: Zap, color: 'indigo', path: '/explore' },
    { label: 'Karma Balance', value: profile?.karma_balance || 0, icon: Star, color: 'amber', path: '/profile' },
    { label: 'Vault Uploads', value: stats?.resources || 0, icon: BookOpen, color: 'emerald', path: '/vault' },
    { label: 'Campus Rank', value: stats?.rank ? `#${stats.rank}` : 'New', icon: Building2, color: 'purple', path: '/profile' }
  ]

  const isNewUser = (stats?.swaps === 0 && stats?.resources === 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 md:pb-10">
      <header className="mb-12">
        <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight leading-none mb-4">
          Welcome to EduSync, <span className="text-indigo-600">{profile?.full_name?.split(' ')[0] || 'Explorer'}! 👋</span>
        </h1>
        <p className="text-slate-500 font-medium">Your hub for peer-to-peer knowledge exchange across campuses.</p>
      </header>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {statsList.map((st, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="cursor-pointer"
            onClick={() => navigate(st.path)}
          >
            <Card className="p-4 md:p-6 group flex flex-col items-center md:items-start text-center md:text-left h-full">
              <div className={`w-12 h-12 rounded-2xl bg-${st.color}-50 flex items-center justify-center text-${st.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                <st.icon size={22} />
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{st.label}</p>
              <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter leading-none">
                {st.value}
              </h3>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-10">
        <div>
          {/* GETTING STARTED CHECKLIST */}
          {isNewUser && (
            <Card className="p-10 mb-12 bg-indigo-50/50 border-2 border-indigo-100 overflow-hidden relative">
               <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-100 rounded-full blur-[80px] opacity-40" />
               <div className="relative z-10">
                  <h2 className="text-2xl font-outfit font-black text-slate-900 mb-2">Getting Started Checklist</h2>
                  <p className="text-indigo-700/60 font-medium mb-8">Kickstart your EduSync journey with these tasks.</p>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Complete your profile', done: !!profile?.onboarding_completed, path: '/settings' },
                      { label: 'List your first skill', done: false, action: 'LIST_SKILL' },
                      { label: 'Explore the Knowledge Vault', done: false, path: '/vault' },
                      { label: 'Send your first message', done: false, path: '/explore' }
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 transition-all hover:translate-x-1 cursor-pointer" onClick={() => task.path && navigate(task.path)}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-slate-200 text-slate-200'}`}>
                          <CheckCircle size={14} />
                        </div>
                        <span className={`font-bold flex-1 ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.label}</span>
                        {!task.done && <ArrowRight size={16} className="text-indigo-400" />}
                      </div>
                    ))}
                  </div>
               </div>
            </Card>
          )}

          {/* RECOMMENDATIONS */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-outfit font-black text-slate-900 tracking-tight">Handpicked for you.</h2>
              <Link to="/explore" className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                See full directory <ArrowRight size={16} />
              </Link>
            </div>

            {recommendationsLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <div key={i} className="w-full aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />)}
               </div>
            ) : recommendations?.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recommendations.map(skill => (
                   <SkillCard 
                     key={skill.id} 
                     skill={{
                       ...skill,
                       mentor: skill.profiles?.full_name,
                       campus: skill.profiles?.campuses?.name
                     }}
                     onClick={() => navigate(`/explore/skill/${skill.id}`)}
                   />
                 ))}
               </div>
            ) : (
               <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-3xl text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                   <Info size={40} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Be the first to list a skill here!</h3>
                 <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">No skills listed from {profile?.campuses?.name || 'your campus'} yet. Break the ice and start earning Karma.</p>
                 <Button>List a Skill</Button>
               </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
           <Card className="p-8 bg-navy text-white text-center overflow-hidden border-none shadow-2xl shadow-indigo-600/20 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] opacity-40 translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                 <h3 className="text-xl font-black mb-1 font-outfit tracking-tight">Need a Boost?</h3>
                 <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-10">Invite friends & earn</p>
                 <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center text-white mb-6">
                    <Zap size={40} className="fill-current text-indigo-400" />
                 </div>
                 <Badge variant="indigo" className="bg-indigo-500 text-white border-none py-1.5 px-4 mb-6">+50 Karma</Badge>
                 <Button variant="white" className="w-full h-14 rounded-2xl">Copy Invite Link</Button>
              </div>
           </Card>

           <section>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest text-[11px]">Activity Feed</h3>
                <Link to="/notifications" className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <Bell size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                 {[
                   { type: 'karma', title: 'Bonus Karma Earned!', body: 'You received +100 bonus starting Karma.', time: '2h ago', color: 'indigo' },
                   { type: 'system', title: 'Campus Verified', body: `Welcome to the ${profile?.campuses?.short_code || 'NIT-N'} network.`, time: '2h ago', color: 'emerald' }
                 ].map((act, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all">
                       <div className={`w-10 h-10 rounded-xl bg-${act.color}-50 flex items-center justify-center text-${act.color}-500 flex-shrink-0 group-hover:scale-110 transition-all shadow-sm`}>
                          {act.type === 'karma' ? <Star size={18} /> : <Info size={18} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 leading-none mb-1">{act.title}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{act.body}</p>
                          <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase mt-1 block">{act.time}</span>
                       </div>
                    </div>
                 ))}
                 <Button variant="ghost" className="w-full mt-4 text-xs font-black uppercase tracking-widest" onClick={() => navigate('/notifications')}>
                    View All Activity
                 </Button>
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}
