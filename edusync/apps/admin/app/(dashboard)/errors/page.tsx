'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, CheckCircle, Search, Filter, ShieldAlert } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface ErrorReport {
  _id: string;
  errorMessage: string;
  errorStack?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
  userId?: string;
  url: string;
  type: string;
}

export default function ErrorsDashboard() {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    unresolvedCount: 0,
    recentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');

  const fetchErrors = async () => {
    try {
      const res = await apiClient.get('/admin/errors?limit=100');
      const errorList = res.data.data;
      setErrors(errorList);

      // Calculate stats
      const critical = errorList.filter((e: any) => e.severity === 'critical').length;
      const unresolved = errorList.filter((e: any) => !e.resolved).length;
      const recent = errorList.filter((e: any) => {
        const age = Date.now() - new Date(e.timestamp).getTime();
        return age < 60 * 60 * 1000; // Last hour
      }).length;

      setStats({
        total: errorList.length,
        critical,
        unresolvedCount: unresolved,
        recentCount: recent,
      });
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
    const interval = setInterval(fetchErrors, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const filteredErrors = errors.filter(e => {
    if (filter === 'all') return true;
    return e.severity === filter;
  });

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             <ShieldAlert className="text-red-500 w-10 h-10" />
             Nexus Integrity Monitor
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time observability of institutional node failures.</p>
        </div>
        <button 
          onClick={() => fetchErrors()}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm"
        >
           Sync Monitor
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Sync Events', value: stats.total, icon: TrendingUp, color: 'indigo' },
          { label: 'Critical Anomalies', value: stats.critical, icon: ShieldAlert, color: 'red', alert: stats.critical > 0 },
          { label: 'Unresolved Logs', value: stats.unresolvedCount, icon: AlertTriangle, color: 'amber' },
          { label: 'Last 60m Activity', value: stats.recentCount, icon: Clock, color: 'blue' }
        ].map((s, i) => (
          <div key={i} className={`p-6 bg-slate-900/40 border ${s.alert ? 'border-red-500/50' : 'border-white/5'} rounded-[32px] backdrop-blur-3xl shadow-2xl`}>
             <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-${s.color}-500/10 rounded-xl`}>
                   <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                </div>
                {s.alert && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
             </div>
             <p className="text-4xl font-black font-mono tracking-tighter mb-1">{s.value}</p>
             <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex gap-4">
         <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
         >
            All Logs
         </button>
         <button 
            onClick={() => setFilter('critical')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'critical' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
         >
            Critical Only
         </button>
      </div>

      {/* Main Error Log */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Trace ID</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Nexus Signature</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Priority</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Timestamp</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredErrors.length === 0 ? (
               <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-20">
                        <CheckCircle className="w-16 h-16 text-emerald-500" />
                        <p className="text-xl font-bold">Nexus Integrity Verified: No active failures.</p>
                     </div>
                  </td>
               </tr>
            ) : filteredErrors.map((error) => (
              <tr key={error._id} className="border-b border-white/5 hover:bg-white/10 transition-colors group">
                <td className="px-8 py-5 font-mono text-[10px] text-white/20 group-hover:text-indigo-400 transition-colors">#{error._id.substring(18)}</td>
                <td className="px-8 py-5">
                   <div className="flex flex-col gap-1 max-w-sm">
                      <span className="font-bold text-sm text-white/90 truncate">{error.errorMessage}</span>
                      <span className="text-[10px] font-mono text-white/30 truncate">{error.url}</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      error.severity === 'critical'
                        ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                        : error.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                        : 'bg-slate-500/20 text-slate-400 border border-white/5'
                    }`}
                  >
                    {error.severity}
                  </span>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-white/40 font-mono text-[10px]">
                      <Clock className="w-3 h-3" />
                      {new Date(error.timestamp).toLocaleString()}
                   </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    {!error.resolved ? (
                      <button
                        onClick={async () => {
                          await apiClient.patch(`/admin/errors/${error._id}/resolve`, {
                            notes: 'Node inconsistency resolved via manual intervention.',
                          });
                          fetchErrors();
                        }}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl transition-all"
                      >
                         <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                       <span className="text-emerald-500 font-bold text-xs">RESOLVED</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
