import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, GraduationCap, Laptop, BookOpen, 
  Settings, Award, MessageSquare, History, 
  Star, Zap, MoreVertical, Edit2, ShieldCheck, 
  CreditCard, ExternalLink, Calendar
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { MOCK_SKILLS } from '../data/mockData'
import { useQuery } from '@tanstack/react-query'
import { karmaService } from '../services/karmaService'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'

const TABS = ['My Skills', 'Reviews', 'History', 'Karma Ledger']

export default function Profile() {
  const [activeTab, setActiveTab] = useState('My Skills')
  const { profile } = useAuthStore()
  const { data: ledgerItems = [], isLoading: isLoadingLedger } = useQuery({
    queryKey: ['karma-ledger', profile?.id],
    queryFn: () => karmaService.getTransactionHistory(profile.id),
    enabled: !!profile?.id && activeTab === 'Karma Ledger'
  })
  
  // Format dates and display labels
  const formattedLedger = ledgerItems.map(item => ({
    ...item,
    label: item.note || item.source || 'Karma Transaction',
    amount: item.amount,
    type: item.type === 'earned' ? 'earned' : 'spent',
    date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 lg:pb-10">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100 border border-slate-100 mb-12 relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-12 relative z-10">
          <div className="relative group">
            <Avatar size="2xl" seed={profile?.full_name} ring border className="shadow-2xl shadow-indigo-200" />
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform cursor-pointer">
              <Edit2 size={18} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter mb-2">{profile?.full_name || 'Campus Student'}</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  <span className="flex items-center gap-2"><GraduationCap size={16} className="text-indigo-400" /> {profile?.department || 'CS'} • {profile?.year_of_study || 1}st Year</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full hidden md:block" />
                  <span className="flex items-center gap-2"><Building2 size={16} className="text-indigo-400" /> {profile?.campuses?.name || 'Partner Campus'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 self-center md:self-start">
                <Button variant="outline" size="sm" icon={Settings} className="rounded-xl px-5">Settings</Button>
                <Button variant="primary" size="sm" icon={Edit2} className="rounded-xl px-5">Edit Profile</Button>
              </div>
            </div>

            <p className="text-slate-500 max-w-2xl text-lg leading-relaxed mb-8 italic">
              "{profile?.bio || 'Building the future of inter-campus skill exchange, one swap at a time.'}"
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {[
                { label: 'Verified Campus', icon: ShieldCheck, color: 'indigo' },
                { label: 'Skill Expert', icon: Award, color: 'emerald' },
                { label: 'Mentor', icon: Star, color: 'amber' },
              ].map((badge, idx) => (
                <div key={idx} className={`px-4 py-2.5 bg-${badge.color}-50 text-${badge.color}-600 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest ring-1 ring-${badge.color}-100/50`}>
                  <badge.icon size={16} fill="currentColor" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Tab Navigation */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-[2rem] p-4 text-white p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-8 ml-4">Account Overview</h3>
            <div className="space-y-3">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all
                    ${activeTab === tab ? 'bg-white text-slate-900 font-black shadow-xl' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}
                  `}
                >
                  <span className="text-sm">{tab}</span>
                  <ArrowRight size={16} className={activeTab === tab ? 'text-indigo-600' : 'opacity-20'} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 text-indigo-900">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Total Balance</div>
                <div className="text-2xl font-black">{profile?.karma_balance || 100} Karma</div>
              </div>
            </div>
            <div className="h-2 w-full bg-indigo-200 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-indigo-600 w-3/4" />
            </div>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all">
              Top Up Points
            </button>
          </div>
        </div>

        {/* Right: Tab Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100 border border-slate-100 min-h-[500px]"
            >
              <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter border-b border-slate-50 pb-8 mb-8">
                {activeTab}
              </h2>

              {activeTab === 'My Skills' && (
                <div className="space-y-6">
                  {MOCK_SKILLS.slice(0, 2).map((skill, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{skill.category}</div>
                        <h4 className="text-xl font-extrabold text-slate-900 mb-2 font-outfit">{skill.title}</h4>
                        <div className="flex gap-2">
                          {skill.tags.slice(0, 2).map(t => <span key={t} className="text-xs font-bold text-slate-400">#{t}</span>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8">
                        <div className="text-center">
                          <div className="text-2xl font-black text-slate-900 leading-none mb-1">08</div>
                          <div className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Swaps</div>
                        </div>
                        <button className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Link to="/list-skill" className="w-full">
                    <button className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[2rem] text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                      </div>
                      <span className="font-black uppercase tracking-widest text-xs">Add New Listing</span>
                    </button>
                  </Link>
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div className="space-y-8">
                  {[1, 2].map(i => (
                    <div key={i} className="relative pl-12">
                      <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold italic">
                        "
                      </div>
                      <p className="text-slate-600 font-medium italic mb-4 leading-relaxed">
                        Excellent session on React hooks. Explained very complex concepts using simple real-world analogies. Highly recommended!
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar seed={`Reviewer-${i}`} size="xs" ring />
                        <span className="text-xs font-black text-slate-900">Final Year Student</span>
                        <span className="text-[10px] font-bold text-slate-400">NIT-N</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'History' && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-100/80 cursor-pointer transition-all border border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Exchange with Sneha R.</h4>
                          <p className="text-xs text-slate-500 font-medium tracking-tight">Vistara College • 2 Sessions Completed</p>
                        </div>
                      </div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Oct 12</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Karma Ledger' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 mb-2">
                    <div className="col-span-6">Transaction</div>
                    <div className="col-span-3 text-center">Amount</div>
                    <div className="col-span-3 text-right">Date</div>
                  </div>
                  
                  {isLoadingLedger ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Ledger History...</p>
                    </div>
                  ) : formattedLedger.length > 0 ? (
                    formattedLedger.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all items-center">
                        <div className="col-span-6">
                          <h4 className="text-sm font-black text-slate-900">{item.label}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.source}</p>
                        </div>
                        <div className={`col-span-3 text-center text-sm font-black tracking-tighter ${item.type === 'earned' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {item.type === 'earned' ? '+' : ''}{item.amount}
                        </div>
                        <div className="col-span-3 text-right text-xs font-black text-slate-400 uppercase tracking-tighter">{item.date}</div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <History size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-400 font-medium italic">No transactions recorded in your protocol yet.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Plus(props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
