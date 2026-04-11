import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Users, TrendingUp, Award, BookOpen, Zap,
  Calendar, Globe, Shield, BarChart3, Download, Settings,
  AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Activity, Target, Brain, GraduationCap
} from 'lucide-react'
import Button from '../components/ui/Button'

const CAMPUS_METRICS = {
  name: 'Doon Educational University',
  code: 'DEU',
  students: 2408,
  activeSwaps: 156,
  completedSwaps: 842,
  resources: 1205,
  avgKarma: 87,
  topSkills: ['Web Development', 'Data Science', 'VLSI Design'],
  engagement: 94,
  growth: +23
}

const ENGAGEMENT_DATA = [
  { month: 'Oct', swaps: 45, students: 180 },
  { month: 'Nov', swaps: 67, students: 245 },
  { month: 'Dec', swaps: 89, students: 312 },
  { month: 'Jan', swaps: 124, students: 458 },
  { month: 'Feb', swaps: 156, students: 621 },
  { month: 'Mar', swaps: 178, students: 842 }
]

const TOP_CONTRIBUTORS = [
  { name: 'Arjun P.', karma: 2890, swaps: 47, skills: 'Electronics' },
  { name: 'Priya S.', karma: 2654, swaps: 42, skills: 'Web Dev' },
  { name: 'Rahul M.', karma: 2341, swaps: 38, skills: 'ML/AI' }
]

export default function InstituteDashboard() {
  const [timeRange, setTimeRange] = useState('6m')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white font-outfit tracking-tight">{CAMPUS_METRICS.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/30">{CAMPUS_METRICS.code}</span>
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <ArrowUpRight size={14} />
                    {CAMPUS_METRICS.growth}% Growth
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Institutional Analytics & Campus Governance Portal</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" icon={Download}>Export Report</Button>
            <Button variant="primary" icon={Settings}>Campus Settings</Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Students', value: CAMPUS_METRICS.students.toLocaleString(), icon: Users, change: '+12%', color: 'indigo' },
            { label: 'Active Swaps', value: CAMPUS_METRICS.activeSwaps, icon: Zap, change: '+8%', color: 'amber' },
            { label: 'Completed Swaps', value: CAMPUS_METRICS.completedSwaps, icon: CheckCircle, change: '+23%', color: 'emerald' },
            { label: 'Knowledge Resources', value: CAMPUS_METRICS.resources.toLocaleString(), icon: BookOpen, change: '+15%', color: 'rose' }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${metric.color}-500/10 flex items-center justify-center mb-4`}>
                <metric.icon className={`text-${metric.color}-400`} size={24} />
              </div>
              <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{metric.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-black text-white font-outfit">{metric.value}</div>
                <span className="text-emerald-400 text-xs font-bold">{metric.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Engagement Chart & Top Contributors */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          
          {/* Engagement Trend */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">Student Engagement</h3>
              <div className="flex gap-2">
                {['1m', '3m', '6m', '1y'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      timeRange === range 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative h-48 flex items-end justify-between gap-2">
              {ENGAGEMENT_DATA.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg relative group cursor-pointer"
                       style={{ height: `${(data.swaps / 178) * 100}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.swaps}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">Top Contributors</h3>
              <Award className="text-amber-400" size={24} />
            </div>
            
            <div className="space-y-4">
              {TOP_CONTRIBUTORS.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.skills} · {user.swaps} swaps</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400">{user.karma.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Karma</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campus Insights & Controls */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Top Skills */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="text-purple-400" size={24} />
              <h3 className="text-lg font-black text-white">Trending Skills</h3>
            </div>
            <div className="space-y-3">
              {CAMPUS_METRICS.topSkills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${100 - (i * 20)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-bold w-8">{100 - (i * 20)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Health */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-emerald-400" size={24} />
              <h3 className="text-lg font-black text-white">Campus Health</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Engagement Rate</span>
                  <span className="text-sm text-white font-bold">{CAMPUS_METRICS.engagement}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${CAMPUS_METRICS.engagement}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Avg Karma Score</span>
                  <span className="text-sm text-white font-bold">{CAMPUS_METRICS.avgKarma}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: `${CAMPUS_METRICS.avgKarma}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-rose-400" size={24} />
              <h3 className="text-lg font-black text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-sm font-bold transition-all text-left flex items-center gap-2">
                <GraduationCap size={18} />
                View All Students
              </button>
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-bold transition-all text-left flex items-center gap-2">
                <BarChart3 size={18} />
                Generate Report
              </button>
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-bold transition-all text-left flex items-center gap-2">
                <Globe size={18} />
                Federation Status
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
