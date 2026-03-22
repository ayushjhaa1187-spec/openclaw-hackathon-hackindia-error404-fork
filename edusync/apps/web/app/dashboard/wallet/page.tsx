"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Star, TrendingUp, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, Globe, Package, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KarmaWalletPage() {
  const transactions = [
    { id: 1, type: 'earn', amount: 50, label: 'Skill Swap Completion', from: 'Sneha (IIT Delhi)', time: '2h ago' },
    { id: 2, type: 'spend', amount: 30, label: 'Vault Asset Purchase', from: 'Control Systems Notes', time: '1d ago' },
    { id: 3, type: 'earn', amount: 100, label: 'Admin Resource Certification', from: 'Institutional Bonus', time: '3d ago' },
    { id: 4, type: 'earn', amount: 20, label: 'Early Adopter Bonus', from: 'Nexus Node Init', time: '1w ago' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="p-8 space-y-12 max-w-[1600px] mx-auto min-h-screen"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Institutional Karma</h1>
           </div>
           <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed tracking-tight italic">
             Your <span className="text-amber-400 font-bold uppercase italic font-bold">Credibility Currency</span>. Earned through verified knowledge transfers across the Nexus.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end pr-6 border-r border-white/10 group cursor-pointer hover:border-amber-500/30 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Node Balance</span>
              <span className="text-[8px] font-black text-amber-400 uppercase tracking-[0.4em] leading-none mt-1 group-hover:text-white transition-colors italic">Verified On-Chain</span>
           </div>
           <div className="flex items-center gap-4 px-10 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10">
              <Star size={24} className="text-amber-400 fill-current animate-pulse" />
              <span className="text-4xl font-black text-white tracking-widest italic">1,240</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
           <div className="glass-card p-10 bg-slate-900/60 border-white/5 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform -rotate-12 translate-x-1/2 -translate-y-1/2">
                 <Package size={200} className="text-amber-400" />
              </div>
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 border-b border-white/5 pb-4 italic leading-none">Karma Tier Protocol</h3>
              <div className="space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none">Current Standing</span>
                       <h4 className="text-3xl font-black text-white tracking-tighter uppercase italic mt-1 leading-none shadow-sm">Diamond Node</h4>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-amber-400 text-xl font-black italic shadow-lg shadow-black/20">D</div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none">Progress to Apex Tier</span>
                       <span className="text-[10px] font-black text-white uppercase italic tracking-widest leading-none">78%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '78%' }}
                         transition={{ duration: 1, ease: 'easeOut' }}
                         className="h-full bg-gradient-to-r from-amber-500 to-amber-200 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                       />
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed italic">
                       Earn <span className="text-white">260 more units</span> to unlock **Institutional Ambassador** status and 0.5% Nexus Rewards.
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Total Earned', value: '4,500', icon: TrendingUp, color: 'emerald' },
                { label: 'Avg Rating', value: '4.95', icon: Star, color: 'amber' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 border-white/5 bg-slate-900/40 relative group cursor-pointer hover:border-white/10 transition-all overflow-hidden flex flex-col justify-between shadow-xl">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className={`p-2.5 bg-${stat.color}-500/10 text-${stat.color}-400 rounded-xl w-fit group-hover:scale-110 transition-transform shadow-inner`}>
                      <stat.icon size={18} />
                   </div>
                   <div className="mt-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">{stat.label}</span>
                      <h4 className="text-2xl font-black text-white tracking-widest uppercase italic mt-1 leading-none shadow-md">{stat.value}</h4>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <section className="lg:col-span-2 space-y-8 glass-card p-0 bg-slate-900/40 border-white/5 overflow-hidden flex flex-col shadow-2xl">
           <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-950/40 backdrop-blur-3xl shadow-lg">
              <div>
                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Transaction Ledger</h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic flex items-center gap-2 leading-none">
                    <ShieldCheck size={12} className="text-indigo-400 uppercase" /> Distributed Node Verification Protocol
                 </p>
              </div>
              <button className="btn-secondary font-black text-[10px] uppercase tracking-widest px-8 group hover:border-indigo-500/30 outline-none">
                 Export Logs <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {transactions.map((tx, i) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer shadow-xl"
                >
                  <div className="flex items-center gap-6">
                     <div className={`p-4 rounded-xl border-2 shrink-0 group-hover:scale-110 transition-transform shadow-inner ${tx.type === 'earn' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-500/10 border-slate-500/20 text-slate-400 shadow-sm'}`}>
                        {tx.type === 'earn' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h5 className="text-lg font-black text-white tracking-tight uppercase italic leading-none">{tx.label}</h5>
                           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5 italic">{tx.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2 leading-none italic">
                           {tx.type === 'earn' ? `Node Origin: ${tx.from}` : `Asset: ${tx.from}`}
                        </p>
                     </div>
                  </div>
                  <div className={`text-2xl font-black tracking-widest uppercase italic shadow-md group-hover:scale-110 transition-transform ${tx.type === 'earn' ? 'text-emerald-400' : 'text-slate-400'}`}>
                     {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`}
                  </div>
                </motion.div>
              ))}
           </div>
           
           <div className="p-10 bg-black/20 border-t border-white/5 text-center flex items-center justify-center gap-6 shadow-inner">
              <Gift size={18} className="text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic leading-tight">
                Karma can be redeemed for Premium Vault Access & Institutional Badges.
              </span>
           </div>
        </section>
      </div>

      {/* Phase 3: Karma Redemption Protocol */}
      <section className="mt-12">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-4">
          <Zap className="text-amber-400 group-hover:animate-bounce" /> Nexus Redemption Lab
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Premium Vault Pass', cost: 500, desc: '30 Days Unlimited Downloads', icon: Globe },
            { label: 'Featured Node Status', cost: 200, desc: 'Top Visibility in Discovery', icon: ArrowUpRight },
            { label: 'Certification NFT', cost: 1000, desc: 'On-Chain Skill Validation', icon: ShieldCheck },
            { label: 'Campus Merchandise', cost: 2500, desc: 'Exclusive EduSync Gear', icon: Package },
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 bg-slate-900/60 border-white/5 hover:border-amber-500/30 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <item.icon size={80} />
              </div>
              <h4 className="text-xl font-black text-white uppercase italic leading-tight">{item.label}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{item.desc}</p>
              <div className="mt-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-current" />
                  <span className="text-xl font-black text-white italic">{item.cost}</span>
                </div>
                <Button className="bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black hover:font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-lg transition-all">
                  Redeem
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
