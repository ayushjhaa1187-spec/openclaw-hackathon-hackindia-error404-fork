"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, ShieldCheck, Building2, ExternalLink, Globe, Plus, Shield } from 'lucide-react';
import Link from 'next/link';
import { useKarma } from '../../hooks/useKarma';

export default function DashboardPage() {
  const { balance, loading } = useKarma();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8 space-y-8 max-w-7xl mx-auto"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white m-0 tracking-tight leading-none uppercase italic">Ecosystem Dashboard</h1>
          <p className="text-slate-400 mt-4 text-lg font-medium tracking-tight">Node: <span className="text-indigo-400 font-bold uppercase">IIT Jammu</span> Connected & Federated.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary group font-black text-[10px] uppercase tracking-widest px-8">
            <Globe size={18} className="group-hover:rotate-12 transition-transform" /> Switch Campus
          </button>
          <Link href="/dashboard/explore" className="btn-primary font-black text-[10px] uppercase tracking-widest px-8 shadow-indigo-600/30 outline-none">
            <Plus size={20} /> New Skill Swap
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, label: 'Active Swaps', value: '12', sub: '3 Inter-Campus', color: 'indigo' },
          { icon: Star, label: 'Karma Balance', value: loading ? '...' : balance.toLocaleString(), sub: 'Rank: #42 Global', color: 'amber' },
          { icon: ShieldCheck, label: 'Verified Proof', value: '25', sub: 'Admin Certified', color: 'emerald' },
          { icon: Building2, label: 'Active MOUs', value: '05', sub: 'Nexus Bridge', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5 bg-slate-900/40 relative group overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl">
            <div className={`absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'amber' ? 'amber' : stat.color === 'emerald' ? 'emerald' : 'purple'}-400`}>
                <stat.icon size={80} />
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 bg-${stat.color === 'indigo' ? 'indigo' : stat.color === 'amber' ? 'amber' : stat.color === 'emerald' ? 'emerald' : 'purple'}-500/10 text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'amber' ? 'amber' : stat.color === 'emerald' ? 'emerald' : 'purple'}-400 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'amber' ? 'amber' : stat.color === 'emerald' ? 'emerald' : 'purple'}-400 leading-none`}>{stat.label}</span>
            </div>
            <div className="text-4xl font-black text-white tracking-widest shadow-sm">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 font-bold uppercase tracking-widest italic leading-none truncate">
              <ExternalLink size={12} /> {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-white/5 relative overflow-hidden group bg-slate-950/20 shadow-2xl">
          <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
             <Globe size={240} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic uppercase tracking-tight">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            Nexus Activity feed
          </h2>
          <div className="space-y-4">
            {[
              { user: "Sneha (IIT Delhi)", action: "Requested Skill Swap", time: "2m ago", badge: "Cross-Campus" },
              { user: "Admin (IIT Jammu)", action: "Verified CS101 Notes", time: "1h ago", badge: "Auth" },
              { user: "Aryan (IIT Bombay)", action: "Joined Engineering Nexus", time: "3h ago", badge: "Network" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all px-4 -mx-4 rounded-xl cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Zap size={18} />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-white text-sm tracking-tight">{item.user}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded italic">{item.badge}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium italic leading-none">{item.action}</p>
                   </div>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-400 transition-colors italic">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 border-white/5 flex flex-col justify-between bg-slate-900/40 relative shadow-2xl">
          <div>
            <h2 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tight shadow-sm">Guardian AI Monitoring</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium italic tracking-tight opacity-70">
              The Nexus protocol implements distributed sentiment analysis and compliance auditing. Your interactions are audited for the safety of our multi-campus partners.
            </p>
          </div>
          
          <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/10 mb-6 group hover:bg-amber-500/10 transition-all cursor-pointer shadow-inner">
             <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div>
                   <h4 className="font-black text-amber-500 leading-tight text-lg uppercase tracking-tight italic">Policy Protocol Active</h4>
                   <p className="text-sm text-amber-400/70 mt-2 leading-relaxed italic font-black uppercase tracking-widest text-[9px] leading-tight">
                     "Autonomous NLP Guardian AI is monitoring local and cross-campus knowledge transfers for institutional compliance."
                   </p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/admin" className="btn-secondary text-[10px] uppercase font-black tracking-[0.2em] py-4 hover:border-indigo-500/30 outline-none">View Compliance</Link>
            <button className="btn-secondary text-[10px] uppercase font-black tracking-[0.2em] py-4 bg-white/[0.02]">Security Keys</button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
