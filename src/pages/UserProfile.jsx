import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Zap, Star, Shield, BookOpen, MessageSquare, ArrowLeft, MapPin, CheckCircle } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import SkillCard from '../components/shared/SkillCard'
import CampusBadge from '../components/shared/CampusBadge'

export default function UserProfile() {
  const { userId } = useParams()
  const { user: me } = useAuthStore()
  const navigate = useNavigate()

  if (userId === me?.id) navigate('/profile')

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campuses(*)')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!userId
  })

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['user-skills', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('mentor_id', userId)
        .eq('status', 'active')
      if (error) throw error
      return data
    },
    enabled: !!userId
  })

  const stats = [
    { label: 'Karma Wallet', value: profile?.karma_balance || 0, icon: Star, color: 'amber' },
    { label: 'Skills Verified', value: skills?.length || 0, icon: Shield, color: 'emerald' },
    { label: 'Sessions Run', value: 0, icon: Zap, color: 'indigo' },
    { label: 'Academic Audit', value: profile?.audit_grade || 'A+', icon: BookOpen, color: 'purple' }
  ]

  if (profileLoading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>

  return (
    <div className="font-sans min-h-screen bg-white">
      {/* HEADER GRADIENT */}
      <div className="h-64 bg-navy relative overflow-hidden flex items-end">
         <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-800 opacity-80" />
         <div className="max-w-7xl mx-auto w-full px-6 pb-0 relative z-10 flex flex-col md:flex-row items-end gap-6 translate-y-16">
            <Avatar size="xl" src={profile?.avatar_url} name={profile?.full_name} seed={profile?.full_name} className="w-32 h-32 md:w-48 md:h-48 border-[8px] border-white shadow-2xl" />
            <div className="flex-1 pb-6 text-center md:text-left">
               <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
                  <CampusBadge campus={profile?.campuses?.name} size="lg" />
                  <Badge variant="emerald" className="bg-emerald-900 border-emerald-700 text-emerald-300 font-black uppercase tracking-widest text-[10px]"><CheckCircle size={10} className="mr-1" /> Peer Verified</Badge>
               </div>
               <h1 className="text-4xl md:text-6xl font-outfit font-black text-slate-900 tracking-tighter uppercase leading-none">{profile?.full_name}</h1>
               <p className="mt-2 text-slate-500 font-medium">{profile?.department}, {profile?.year_of_study} YEAR</p>
            </div>
            <div className="flex gap-4 pb-6 w-full md:w-auto">
               <Button onClick={() => navigate('/chat')} className="flex-1 h-14 rounded-2xl px-8 shadow-xl shadow-indigo-100">
                  <MessageSquare size={18} className="mr-2" /> Message
               </Button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-12">
        <div className="space-y-8">
           <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 font-outfit">Mentor Bio</h3>
              <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-emerald-50 pl-6 py-2">
                {profile?.bio || 'This student hasn\'t added an official bio to the Nexus registry.'}
              </p>
           </section>
           <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group">
                   <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-4`}>
                      <s.icon size={18} />
                   </div>
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{s.label}</p>
                   <p className="text-xl font-black text-slate-900 font-outfit">{s.value}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-16">
           <section>
              <h3 className="text-2xl font-outfit font-black text-slate-900 tracking-tight leading-none uppercase mb-8">Active Teaching Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {skills?.map(skill => (
                   <SkillCard 
                     key={skill.id} 
                     skill={{ ...skill, mentor: profile.full_name, campus: profile.campuses?.name }}
                     onClick={() => navigate(`/explore/skill/${skill.id}`)}
                   />
                 ))}
                 {skills?.length === 0 && (
                   <div className="col-span-full py-16 text-center text-slate-400 font-bold uppercase text-xs">No active skill listings found for this mentor.</div>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}
