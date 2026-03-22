'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Users, Award, ShieldCheck, Download, BarChart3, Globe } from 'lucide-react';

const MOU_DATA = [
  { partner: 'NIT Trichy Node', activeSwaps: 42, completed: 156, satisfaction: '4.8/5', color: 'indigo' },
  { partner: 'IIT Delhi Nexus', activeSwaps: 12, completed: 89, satisfaction: '4.5/5', color: 'blue' },
  { partner: 'BITS Network Node', activeSwaps: 28, completed: 210, satisfaction: '4.9/5', color: 'emerald' },
];

export default function MOUConsole() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-12 max-w-7xl mx-auto"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white m-0 tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            MOU Analytics
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold tracking-wide uppercase">
            Measuring Institutional ROI & Inter-Campus Synergy
          </p>
        </div>
        <button className="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-widest shadow-indigo-600/20">
          <Download size={16} /> Export Handshake Log
        </button>
      </header>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: TrendingUp, label: 'Cross-Campus Activity', value: '+24%', sub: 'vs last term', color: 'emerald' },
          { icon: Users, label: 'Federated Connections', value: '1,240', sub: 'Verified Peers', color: 'indigo' },
          { icon: Award, label: 'Karma Exchange', value: '15.4K', sub: 'Value Transferred', color: 'amber' },
          { icon: ShieldCheck, label: 'Handshake Score', value: '98/100', sub: 'Node Health', color: 'blue' },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 bg-white/[0.01] border-white/[0.05] flex flex-col justify-between hover:border-indigo-500/20 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${kpi.color}-500/10 text-${kpi.color}-400 rounded-lg group-hover:scale-110 transition-transform`}>
                <kpi.icon size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{kpi.label}</span>
            </div>
            <div>
               <div className="text-3xl font-black text-white tracking-tighter mb-1">{kpi.value}</div>
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{kpi.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MOU Ledger */}
      <section className="glass-card bg-white/[0.01] border-white/[0.05] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
               <Globe size={18} />
             </div>
             <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Active Institutional Nodes</h3>
          </div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">REF: NEXUS-MOU-2026</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-4">Node Partner</th>
                <th className="px-8 py-4">Active Swaps</th>
                <th className="px-8 py-4">Completed</th>
                <th className="px-8 py-4">SLA Satisfaction</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {MOU_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="px-8 py-6 font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{row.partner}</td>
                  <td className="px-8 py-6 text-slate-400 text-sm">{row.activeSwaps}</td>
                  <td className="px-8 py-6 text-slate-400 text-sm">{row.completed}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05] text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                      ⭐ {row.satisfaction}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="inline-flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                       <span className="text-emerald-400 font-black text-[10px] tracking-widest uppercase italic">LIVE Handshake</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compliance & Ledger */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-10 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/10 shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Transparency Ledger Preview</h3>
          </div>
          <p className="text-slate-500 mb-8 text-sm font-medium italic leading-relaxed opacity-80">
            Institutional-grade activity logs facilitating cross-campus academic research credit verification.
          </p>
          <div className="space-y-4">
            <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 text-[10px] font-mono text-slate-600 italic">
               &gt; [TIMESTAMP: 2026-03-22T12:05:14Z] ::: HANDSHAKE_INITIATED ::: NODE_A: IITJ :: NODE_B: NIT_TRICHY ::: PKI_VERIFIED
            </div>
            <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 text-[10px] font-mono text-slate-600 italic">
               &gt; [TIMESTAMP: 2026-03-22T11:42:09Z] ::: KARMA_LEDGER_SYNC ::: OFFSET: +245.00 ::: AUTH_NODE: IIT_BOMBAY
            </div>
          </div>
        </div>
        
        <div className="glass-card p-10 bg-white/[0.01] border-white/[0.05] flex flex-col items-center justify-center text-center shadow-2xl">
          <div className="p-6 bg-slate-900/50 rounded-full mb-6 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
             <ShieldCheck className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tighter">Audit Protocol</h3>
          <p className="text-slate-500 text-xs font-medium italic opacity-70 leading-relaxed">
            All data processed in compliance with the federated institutional privacy handshake (FIPH v2.0).
          </p>
        </div>
      </section>
    </motion.div>
  );
}
