import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Zap, Star, BookOpen, Building2, 
  CheckCircle2, ArrowRight, MessageSquare, 
  Bell, LayoutDashboard, Compass, ShieldCheck,
  TrendingUp, Users, Search
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { MOCK_SKILLS } from '../data/mockData'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'

// Mini component for Stat Cards
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 group hover:border-indigo-500/30 transition-all"
  >
    <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 inline-block mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1 font-outfit">{value}</div>
    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</div>
  </motion.div>
)

export default function Dashboard() {
  const { profile } = useAuthStore()
  
  // Dummy logic for checklist completion for now
  const checklist = [
    { label: 'Complete your profile', completed: !!profile?.bio, path: '/settings' },
    { label: 'List your first skill', completed: false, onClick: () => {} },
    { label: 'Explore the Knowledge Vault', completed: false, path: '/vault' },
    { label: 'Send your first message', completed: false, path: '/explore' },
  ]
  const isChecklistCompleted = checklist.every(i => i.completed)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter mb-2">
            Welcome to the Nexus, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Connected to <span className="text-indigo-600 font-bold">{profile?.campuses?.name || 'Local Campus'}</span> & 12 Partner Campuses.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Search} className="rounded-2xl" onClick={() => {}}>Search Nexus</Button>
          <Button variant="primary" icon={Zap} className="rounded-2xl">New Listing</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Zap} label="Active Swaps" value="03" color="indigo" delay={0.1} />
        <StatCard icon={Star} label="Karma Balance" value={profile?.karma_balance || 100} color="amber" delay={0.2} />
        <StatCard icon={BookOpen} label="Verified Work" value="12" color="emerald" delay={0.3} />
        <StatCard icon={Building2} label="Network Rank" value="#42" color="purple" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Activity Feed */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 font-outfit flex items-center gap-3">
                <Bell className="text-indigo-600" />
                Nexus Activity
              </h2>
              <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
              {[
                { type: 'swap', title: 'New Swap Request', body: 'Arjun from Vistara wants to learn VLSI Circuit Design from you.', time: '2m ago' },
                { type: 'karma', title: 'Karma Earned', body: 'You earned 50 Karma for completing a session with Sneha.', time: '1h ago' },
                { type: 'vault', title: 'Resource Verified', body: 'Your "DSA Cheat Sheet" is now Admin-Certified.', time: '3h ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-6 group cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      {activity.type === 'swap' ? <Zap size={20} /> : activity.type === 'karma' ? <Star size={20} /> : <ShieldCheck size={20} />}
                    </div>
                    {idx !== 2 && <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-100" />}
                  </div>
                  <div className="flex-1 pb-6 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-slate-900">{activity.title}</h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</span>
                    </div>
                    <p className="text-sm text-slate-500">{activity.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 font-outfit">Recommended For You</h2>
              <Link to="/explore" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Explore More →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_SKILLS.slice(0, 2).map((skill, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 hover:border-indigo-500/30 transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <Avatar seed={skill.mentor} size="sm" ring />
                      <div>
                        <div className="text-sm font-black text-slate-900">{skill.mentor}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{skill.campus}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> {skill.avg_rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 font-outfit">{skill.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-slate-50">
                    {skill.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-10">
          {/* Checklist */}
          {!isChecklistCompleted && (
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
              <h3 className="text-2xl font-black mb-2 font-outfit">Getting Started</h3>
              <p className="text-indigo-100 text-sm mb-10">Finish these to unlock full Nexus access.</p>
              
              <div className="space-y-6">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${item.completed ? 'bg-white text-indigo-600' : 'bg-white/10 text-white/40 ring-2 ring-white/10'}`}>
                      {item.completed ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 rounded-full bg-white/40" />}
                    </div>
                    <span className={`text-sm font-bold ${item.completed ? 'line-through opacity-60' : 'group-hover:translate-x-1 transition-transform'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10 text-center">
                <div className="text-3xl font-black mb-1 font-outfit tracking-tighter">0%</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Completion Progress</div>
              </div>
            </div>
          )}

          {/* Quick Stats/Audit */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-100 border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 font-outfit border-b border-slate-50 pb-4">Security & Transparency</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Admin Oversight Active</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">Your interactions are being monitored by campus moderators to ensure academic integrity.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Audit Grade: {profile?.audit_grade || 'New'}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">Maintaining a high audit grade improves your visibility in the Nexus search.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
