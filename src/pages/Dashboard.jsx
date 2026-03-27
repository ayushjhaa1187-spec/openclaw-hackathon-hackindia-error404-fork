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
import { MOCK_SKILLS } from '../data/mockData'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'

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

export default function Dashboard() {
  const { profile } = useAuthStore()
  
  // Phase 2 Rule: For new users, activity stats are 0.
  // We determine "new user" if they have 0 swaps or no specific activity data.
  const stats = {
    activeSwaps: 0,
    karmaBalance: profile?.karma_balance || 0,
    resources: 0,
    networkRank: 0
  }

  const checklist = [
    { label: 'Complete Onboarding', completed: profile?.onboarding_completed, path: '/onboarding' },
    { label: 'List your first skill', completed: !!profile?.teaching_skills?.length, path: '/profile' },
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
            <Button variant="primary" icon={Rocket} className="rounded-2xl px-6 py-4 shadow-xl shadow-indigo-600/20">New Skill Hub</Button>
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
            
            <div className="space-y-8">
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

          {/* Community Rank Card Placeholder */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 font-outfit border-b border-slate-100 pb-4">Security Protocol</h3>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase mb-1">Nexus Verified</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">All interactions are authenticated via institutional email for academic integrity.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase mb-1">Audit Quality</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Maintain a high rating for better visibility across the {profile?.campus_id || 'campus'}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

