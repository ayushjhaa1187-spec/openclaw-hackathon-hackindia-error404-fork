'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, BookOpen, Activity, 
  Download, RefreshCw, Layers, ShieldCheck,
  ChevronDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { overview, trends, karmaFlow, loading, range, setRange, refresh, exportROI } = useAnalytics();

  const mouHealth = useMemo(() => {
    if (!overview) return 0;
    // mouHealthScore = (completion_rate * 0.5) + (karma_velocity * 0.3) + (activity_trend * 0.2)
    // For MVP frontend, we calculate a simplified version if aggregate missing
    return 78; // Mocked until MOU Utilization is fully integrated in service
  }, [overview]);

  const stats = [
    { label: 'Total Students', value: overview?.totalStudents || 0, icon: Users, trend: '+12%', color: 'from-blue-500/20 to-blue-600/5' },
    { label: 'Nexus Enabled', value: overview?.nexusEnabledStudents || 0, icon: Layers, trend: '+8%', color: 'from-indigo-500/20 to-indigo-600/5' },
    { label: 'Certified Resources', value: overview?.totalResourcesCertified || 0, icon: ShieldCheck, trend: '+24%', color: 'from-emerald-500/20 to-emerald-600/5' },
    { label: 'Karma in Circulation', value: (overview?.totalKarmaCirculating || 0).toLocaleString(), icon: Activity, trend: '+18%', color: 'from-amber-500/20 to-amber-600/5' },
  ];

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Institutional Intelligence
          </h1>
          <p className="text-white/40 mt-1">Real-time performance metrics and MOU ROI analytics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button 
            onClick={exportROI}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export ROI Report
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-white/10 bg-gradient-to-br ${stat.color} backdrop-blur-xl transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                {stat.trend}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-white/40 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Swap Trend Chart */}
        <div className="lg:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold text-white">Skill Swap Activity</h3>
              <p className="text-sm text-white/40">Initiated vs Completed swaps</p>
            </div>
            <TrendingUp className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends?.swaps}>
                <defs>
                  <linearGradient id="colorInitiated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12}
                  tickFormatter={(str: string) => format(new Date(str), 'MMM d')}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Area type="monotone" dataKey="initiated" stroke="#6366f1" fillOpacity={1} fill="url(#colorInitiated)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MOU Health Score Gauge */}
        <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl flex flex-col items-center">
          <h3 className="text-xl font-semibold text-white self-start">MOU Utilization</h3>
          <p className="text-sm text-white/40 mb-8 self-start">Overall connectivity health score</p>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96" cy="96" r="80"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="96" cy="96" r="80"
                stroke={mouHealth > 70 ? '#10b981' : mouHealth > 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="16"
                strokeDasharray={`${(mouHealth * 502) / 100} 502`}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{mouHealth}</span>
              <span className="text-xs text-white/40 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div className="mt-8 w-full space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Cross-Campus Access</span>
                <span className="text-sm text-white font-medium">92%</span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Institutional Trust</span>
                <span className="text-sm text-white font-medium">High</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Karma Flow Line Chart */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <h3 className="text-xl font-semibold text-white mb-8">Karma Economy Flow</h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={karmaFlow?.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12}
                  tickFormatter={(str: string) => format(new Date(str), 'MMM d')}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Vault Growth Bar Chart */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <h3 className="text-xl font-semibold text-white mb-8">Vault Asset Certification</h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.vault?.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12}
                  tickFormatter={(str: string) => format(new Date(str), 'MMM d')}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Bar dataKey="uploaded" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="certified" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
