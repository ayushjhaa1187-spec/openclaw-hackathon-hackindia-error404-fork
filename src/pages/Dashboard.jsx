import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Zap, Star, BookOpen, Building2, 
  CheckCircle2, ArrowRight, MessageSquare, 
  Bell, LayoutDashboard, Compass, ShieldCheck,
  TrendingUp, Users, Search, Rocket
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { MOCK_SKILLS, MOCK_RESOURCES } from '../data/mockData'
import { getRecommendations } from '../lib/gemini'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

// Animated Count Component
const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: duration,
      onUpdate: (latest) => setCount(Math.floor(latest))
    })
    return () => controls.stop()
  }, [value, duration])

  return <span>{count}</span>
}

// Mini component for Stat Cards
const StatCard = ({ icon: Icon, label, value, color, delay, suffix = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-indigo-500/30 transition-all flex flex-col justify-between"
  >
    <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-4xl font-black text-slate-900 mb-1 font-outfit tracking-tighter">
        {suffix}<Counter value={value} />
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
    </div>
  </motion.div>
)

const AIRecommendations = ({ profile }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchRecs() {
      if (!profile) return
      setLoading(true)
      try {
        const result = await getRecommendations(profile, MOCK_SKILLS, MOCK_RESOURCES)
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [profile])

  if (loading) return (
    <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[200px] border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
      <Spinner />
      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-4">Syncing with Nexus Neural Link...</p>
    </div>
  )

  if (!data || data.error) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-200 border border-white/10 relative overflow-hidden group"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full group-hover:bg-indigo-600/20 transition-all" />
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">AI Pulse</h2>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mt-1">
             Gemini 1.5 Analysis • Instant Matches
          </div>
        </div>
      </div>

      <p className="text-slate-300 italic font-medium text-lg leading-relaxed mb-10 relative z-10">
        "{data.brief_insight}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {data.recommendations.map((rec, idx) => {
          const item = rec.type === 'skill' 
            ? MOCK_SKILLS.find(s => s.id === rec.id) || MOCK_SKILLS[0]
            : MOCK_RESOURCES.find(r => r.id === rec.id) || MOCK_RESOURCES[0]
          
          return (
            <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all flex flex-col justify-between group/item">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${rec.type === 'skill' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {rec.type}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white leading-tight mb-2 font-outfit truncate">{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{rec.reason}</p>
              </div>
              <Link to={rec.type === 'skill' ? `/explore` : '/vault'} className="mt-6 flex items-center justify-between text-[10px] font-black text-white uppercase tracking-widest group-hover/item:text-indigo-400 transition-colors">
                {rec.type === 'skill' ? 'Connect with Mentor' : 'Unlock Now'}
                <ArrowRight size={14} className="group-hover/item:translate-x-1 transition-transform" />
              </Link>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { profile } = useAuthStore()
  
  // Real stats fetching
  const { data: swapCount = 0 } = useQuery({
    queryKey: ['active-swaps', profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('skill_requests')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${profile.id},status.eq.pending`)
      return count || 0
    },
    enabled: !!profile?.id
  })

  const { data: resourceCount = 0 } = useQuery({
    queryKey: ['user-resources', profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('uploader_id', profile.id)
      return count || 0
    },
    enabled: !!profile?.id
  })

  const stats = {
    activeSwaps: swapCount,
    karmaBalance: profile?.karma_balance || 0,
    resources: resourceCount,
    networkRank: Math.max(1, 400 - Math.floor((profile?.karma_balance || 0) / 10)) 
  }

  const checklist = [
    { label: 'Complete Onboarding', completed: profile?.onboarding_completed, path: '/onboarding' },
    { label: 'List your first skill', completed: !!profile?.teaching_skills?.length, path: '/list-skill' },
    { label: 'Explore the Vault', completed: false, path: '/vault' },
    { label: 'Send a wave (Message)', completed: false, path: '/explore' },
  ]
  const completedCount = checklist.filter(i => i.completed).length
  const progressPercent = Math.round((completedCount / checklist.length) * 100)

  // Recommendation logic based on onboarding learning goals
  const recommendations = MOCK_SKILLS.filter(skill => 
    profile?.learning_goals?.some(goal => skill.tags.includes(goal) || skill.title.includes(goal))
  ).slice(0, 2)

  const finalRecommendations = recommendations.length > 0 ? recommendations : MOCK_SKILLS.slice(0, 2)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 lg:pb-20 font-sans">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Student Phase II</div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-bold text-indigo-600">+12</div>
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 font-outfit tracking-tighter mb-2">
              Welcome to EduSync, {profile?.full_name?.split(' ')[0] || 'Member'}! 👋
            </h1>
            <p className="text-slate-500 font-medium">
              Your personalized Nexus dashboard for <span className="text-indigo-600 font-bold">fictional academic growth.</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" icon={Search} className="rounded-2xl px-6 py-4">Global Search</Button>
            <Link to="/list-skill">
              <Button variant="primary" icon={Rocket} className="rounded-2xl px-6 py-4 shadow-xl shadow-indigo-600/20 w-full">New Skill Hub</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Zap} label="Active Swaps" value={stats.activeSwaps} color="indigo" delay={0.1} />
        <StatCard icon={Star} label="Karma Balance" value={stats.karmaBalance} color="amber" delay={0.2} />
        <StatCard icon={BookOpen} label="Unlocked Vault" value={stats.resources} color="emerald" delay={0.3} />
        <StatCard icon={Building2} label="Network Rank" value={stats.networkRank} suffix="#" color="purple" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Real-time Notification Stream Placeholder */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Bell size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Nexus Pulse</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time status</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            
            <AIRecommendations profile={profile} />

            <div className="space-y-8 mt-10">
              {stats.activeSwaps === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 font-outfit">Silence in the Nexus</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto">
                    You haven't initiated any swaps yet. Start by listing a skill or exploring the repository.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Notifications would go here */}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Based on Learning Goals */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter">Top Matches For You</h2>
              <Link to="/explore" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                All Skills <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {finalRecommendations.map((skill, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <Avatar seed={skill.mentor} size="md" ring />
                      <div>
                        <div className="text-sm font-black text-slate-900">{skill.mentor}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{skill.campus.split(' ')[0]}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {skill.avg_rating}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 font-outfit leading-tight group-hover:text-indigo-600 transition-colors">{skill.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-auto pt-8 border-t border-slate-50">
                    {skill.tags.map(t => <span key={t} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{t}</span>)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Space (1/3) */}
        <div className="space-y-10">
          {/* New User Checklist */}
          {progressPercent < 100 && (
            <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
              <h3 className="text-3xl font-black mb-4 font-outfit tracking-tighter">Getting Started</h3>
              <p className="text-slate-400 text-sm mb-12 font-medium">Activate your campus protocol to earn more Karma.</p>
              
              <div className="space-y-8">
                {checklist.map((item, idx) => (
                  <Link to={item.path} key={idx} className="flex items-center gap-5 group">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${item.completed ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/20 ring-2 ring-white/5 group-hover:bg-white/10'}`}>
                      {item.completed ? <CheckCircle2 size={24} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                    </div>
                    <span className={`text-base font-bold ${item.completed ? 'line-through opacity-30' : 'group-hover:translate-x-2 transition-transform'}`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
              
              <div className="mt-16 p-8 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                <div className="text-5xl font-black mb-2 font-outfit tracking-tighter">{progressPercent}%</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Sync Progress</div>
              </div>
            </div>
          )}

          {/* Governance & Integrity */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border-2 border-slate-50 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 blur-3xl rounded-full group-hover:bg-indigo-100 transition-colors" />
            <h3 className="text-xl font-black text-slate-900 mb-6 font-outfit uppercase tracking-tighter relative z-10">Nexus Protocol</h3>
            <div className="space-y-4 relative z-10">
              <Link to="/campus-charter" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all group/item">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-indigo-500 group-hover/item:text-white" />
                  <span className="text-sm font-bold">Campus Charter</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
              </Link>
              <Link to="/honor-code" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all group/item">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-indigo-500 group-hover/item:text-white" />
                  <span className="text-sm font-bold">Honor Code</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
              </Link>
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center">Academic Integrity First</p>
          </div>
        </div>
      </div>
    </div>
  )
}

