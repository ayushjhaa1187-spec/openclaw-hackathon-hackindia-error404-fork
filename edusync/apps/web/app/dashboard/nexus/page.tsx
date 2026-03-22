'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Search, Zap, Building2, ArrowUpRight, Network } from 'lucide-react';

const PARTNER_NODES = [
  { id: 'IIT_DELHI', name: 'IIT Delhi', status: 'ACTIVE', focus: 'VLSI & Microelectronics', users: 1240, color: 'indigo' },
  { id: 'IIT_BOMBAY', name: 'IIT Bombay', status: 'ACTIVE', focus: 'Aerospace & Robotics', users: 3105, color: 'blue' },
  { id: 'NIT_TRICHY', name: 'NIT Trichy', status: 'ACTIVE', focus: 'Materials Science', users: 890, color: 'emerald' },
];

export default function NexusExplorer() {
  const [search, setSearch] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-12 max-w-7xl mx-auto"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white m-0 tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Nexus Explorer
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold tracking-wide uppercase">
            Traversing the Federated Institutional Network
          </p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search cross-campus nodes..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 focus:ring-1 ring-indigo-500/50 outline-none transition-all text-sm italic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Active Partner Nodes */}
      <section>
        <div className="flex items-center gap-2 mb-8">
           <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
           <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">Active Partner Nodes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PARTNER_NODES.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 bg-white/[0.01] border-white/[0.05] hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 bg-${node.color}-500/10 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Building2 className={`w-6 h-6 text-${node.color}-400`} />
                </div>
                <span className="text-[9px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 tracking-widest uppercase">
                  {node.status}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mb-1 uppercase italic tracking-tighter">{node.name}</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium italic opacity-80">{node.focus}</p>
              
              <div className="pt-6 border-t border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Network size={14} className="text-slate-600" />
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{node.users} Peers</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Connectivity Ledger */}
      <section className="glass-card p-10 bg-gradient-to-br from-white/[0.02] to-transparent border-white/[0.05] shadow-2xl">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
             <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase italic tracking-tighter">Institutional Transparency Ledger</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { tag: 'IITJ 🤝 IITD', msg: 'New Cross-Campus Skill Swap Initiated (VLSI Design)', time: '2m ago', type: 'SWAP' },
            { tag: 'MOU UPDATE', msg: 'New Academic MOU Signed with IIIT Alliance Nodes', time: '1h ago', type: 'SYS' },
            { tag: 'VAULT SYNC', msg: 'Verification of 45 Academic Resources from IIT Bombay', time: '4h ago', type: 'DATA' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/[0.03] group transition-all cursor-pointer">
              <div className="flex items-center space-x-6">
                <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded border border-indigo-500/20 tracking-[0.2em] uppercase">
                  {log.tag}
                </span>
                <span className="text-sm text-slate-300 font-medium italic group-hover:text-white transition-colors">{log.msg}</span>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">{log.time}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
