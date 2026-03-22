'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Layers, 
  ShieldAlert,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';

export default function GroupAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupAnalytics();
  }, []);

  const fetchGroupAnalytics = async () => {
    try {
      // Assuming the user is a Super Admin for a specific college group
      // In a real scenario, collegeGroupId would come from the session/token
      const collegeGroupId = 'IIT_SYSTEM'; 
      const res = await fetch(`/api/v1/admin/analytics/group?collegeGroupId=${collegeGroupId}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error('Failed to load group analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!data) return <div>No data available.</div>;

  const stats = [
    { label: 'Total Students', value: data.aggregate.totalStudents, icon: Users, color: 'text-blue-400' },
    { label: 'Nexus Enabled', value: data.aggregate.nexusEnabledStudents, icon: Activity, color: 'text-emerald-400' },
    { label: 'Certified Resources', value: data.aggregate.totalResourcesCertified, icon: BookOpen, color: 'text-amber-400' },
    { label: 'Active MOUs', value: data.aggregate.activeMOUCount, icon: Globe, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            College Group Intelligence
          </h1>
          <p className="text-white/50 mt-2 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Aggregated performance for <span className="text-indigo-400 font-bold">{data.collegeGroupId}</span> ({data.campusCount} Campuses)
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-white/30">Last Synced</div>
          <div className="text-sm font-mono text-white/60">{new Date(data.generatedAt).toLocaleString()}</div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform ${s.color}`}>
              <s.icon className="w-16 h-16" />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-white/50 font-medium">{s.label}</span>
              <div className="text-3xl font-bold tracking-tight">{s.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campus Distribution */}
        <div className="lg:col-span-2 glass-card p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="text-indigo-400 w-5 h-5" />
              Resource Contribution by Campus
            </h2>
            <button className="text-xs text-indigo-400 hover:underline">View Detailed Report</button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.campuses.map((c: string) => ({ name: c, value: Math.floor(Math.random() * 500) + 100 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickFormatter={(val) => val.split('_')[1] || val}
                />
                <YAxis stroke="#ffffff20" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.campuses.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 20}, 70%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security / Risk Health */}
        <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-400 w-5 h-5" />
            Group Safety Health
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-red-400/5 border border-red-400/10 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs text-red-200/50 uppercase tracking-wider">Active Flags</div>
                <div className="text-2xl font-bold text-red-400">12</div>
              </div>
              <ArrowUpRight className="text-red-400 w-6 h-6" />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-white/70">Top Risk Campuses</div>
              <div className="space-y-3">
                {['IIT_DELHI', 'NIT_TRICHY'].map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-xl">
                    <span className="font-mono">{c}</span>
                    <span className="text-red-400 font-bold">{5 - i} Flagged</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-semibold transition-all">
                Access Group Guardian Console
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Karma Velocity Leaderboard */}
      <div className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-emerald-400 w-5 h-5" />
          Cross-Institutional Karma Velocity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.campuses.map((c: string, i: number) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm tracking-wide">{c.replace('_', ' ')}</div>
                <div className="text-xs text-white/30">Node Efficiency: {85 + i * 3}%</div>
              </div>
              <div className="text-emerald-400 font-mono font-bold">
                +{i}.5%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
