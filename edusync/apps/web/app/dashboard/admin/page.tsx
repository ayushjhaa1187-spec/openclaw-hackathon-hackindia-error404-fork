"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, CheckCircle, Building2, Zap, Server, Database, Lock } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminHubPage() {
  const { stats, queue, loading, fetchStats, fetchQueue, resolveItem } = useAdmin();

  useEffect(() => {
    fetchStats();
    fetchQueue();
  }, []);

  const uiStats = stats ? [
    { label: 'Active Nodes', value: stats.activeNodes, icon: Building2, color: 'indigo' },
    { label: 'Network Health', value: stats.networkHealth, icon: Activity, color: 'emerald' },
    { label: 'Total Syncs', value: stats.totalSyncs, icon: Zap, color: 'amber' },
    { label: 'Global Students', value: stats.activeStudents, icon: Zap, color: 'indigo' },
  ] : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8 space-y-12 max-w-[1600px] mx-auto min-h-screen"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-600/30">
                 <Shield size={32} />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Nexus Admin Hub</h1>
           </div>
           <p className="text-slate-400 text-xl font-medium max-w-3xl leading-relaxed tracking-tight italic">
             Centralized Oversight & <span className="text-indigo-400 font-bold uppercase italic font-bold">Node Compliance Telemetry</span> for the Federated MOU Network.
           </p>
        </div>

        <div className="flex gap-4">
           <button className="btn-secondary !px-8 text-[11px] uppercase tracking-widest font-black italic hover:border-indigo-500/30">
              Nexus Protocol Logs
           </button>
           <button className="btn-primary !px-8 text-[11px] uppercase tracking-widest font-black italic shadow-2xl shadow-indigo-600/20">
              System Wide Alert
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {uiStats.map((stat: any, i: number) => (
          <div key={i} className="glass-card p-8 border-white/5 bg-slate-900/40 relative group overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className={`absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform text-${stat.color}-400 -rotate-12 translate-x-1/2 -translate-y-1/2`}>
                <stat.icon size={160} />
            </div>
            <div className="flex justify-between items-start mb-10">
              <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-400 rounded-2xl border border-white/5`}>
                <stat.icon size={28} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${stat.color}-400 leading-none`}>{stat.label}</span>
            </div>
            <div className="text-4xl font-black text-white tracking-widest leading-none shadow-md">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8 glass-card p-0 bg-slate-900/40 border-white/5 overflow-hidden flex flex-col shadow-2xl">
           <div className="p-10 border-b border-white/10 flex justify-between items-center bg-slate-950/40 backdrop-blur-3xl shadow-lg">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                 <AlertTriangle size={24} className="text-amber-500 animate-pulse" /> Moderation Queue
              </h2>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{queue.length} Pending Actions</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {queue.map((item: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white/5 border border-white/10 rounded-3xl gap-8 group hover:border-indigo-500/30 transition-all shadow-xl">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.ownerUid}`} alt="avatar" />
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">{item.title}</h4>
                            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded italic uppercase tracking-widest">RA-CERT Pending</span>
                         </div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2 italic leading-none">
                            {item.campus} • {item.fileType} Protocol • Owner: {item.ownerUid.split('-')[0]}
                         </p>
                      </div>
                   </div>
                   <div className="flex gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => resolveItem(item._id, 'approve')}
                        className="flex-1 btn-secondary !px-4 !py-3 !text-[9px] uppercase tracking-widest font-black italic hover:border-emerald-500/30 leading-none outline-none"
                      >Approve</button>
                      <button 
                        onClick={() => resolveItem(item._id, 'reject')}
                        className="flex-1 btn-primary !bg-red-600/10 !text-red-500 border border-red-500/20 hover:!bg-red-600 hover:!text-white !px-4 !py-3 !text-[9px] uppercase tracking-widest font-black italic leading-none outline-none"
                      >Reject</button>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section className="lg:col-span-1 space-y-10">
           <div className="glass-card p-10 bg-slate-900/60 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-x-[-20%] top-[-20%] p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                 <Server size={300} className="text-indigo-400" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-10 italic leading-none">Node Infrastructure</h3>
              <div className="space-y-10">
                 {[
                   { label: 'Latency', value: '14ms', icon: Activity, color: 'emerald' },
                   { label: 'Blockchain Sync', value: '100%', icon: Database, color: 'indigo' },
                   { label: 'AES-256 Auth', value: 'Active', icon: Lock, color: 'emerald' },
                 ].map((infra, i) => (
                    <div key={i} className="flex justify-between items-center group/item cursor-pointer">
                       <div className="flex items-center gap-4">
                          <infra.icon size={20} className={`text-${infra.color}-400 group-hover/item:scale-125 transition-transform`} />
                          <span className="text-xs font-black text-white tracking-widest uppercase italic shadow-sm">{infra.label}</span>
                       </div>
                       <span className={`text-[10px] font-black px-4 py-1.5 bg-${infra.color}-500/10 text-${infra.color}-400 rounded-lg border border-${infra.color}-500/20 uppercase tracking-widest italic`}>{infra.value}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      </div>
    </motion.div>
  );
}
