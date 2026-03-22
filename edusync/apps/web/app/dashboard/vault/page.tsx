"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Upload, Download, Star, Filter, Folder, ArrowRight, ShieldCheck, Zap, Info } from 'lucide-react';
import { useVault } from '../../hooks/useVault';

export default function VaultPage() {
  const { resources, loading, fetchResources, purchaseAsset } = useVault();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchResources(searchQuery);
  }, [searchQuery]);

  const handlePurchase = async (id: string) => {
    try {
      const res = await purchaseAsset(id);
      alert(`Success! File ready at: ${res.fileUrl}`);
    } catch (err) {
      alert(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="p-8 space-y-12 max-w-[1600px] mx-auto min-h-screen"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Knowledge Vault</h1>
           </div>
           <p className="text-slate-400 text-xl font-medium max-w-3xl leading-relaxed tracking-tight">
             Access a decentralized repository of <span className="text-indigo-400 font-bold uppercase italic font-bold">Curated Institutional Intel</span> across the Nexus network.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end pr-6 border-r border-white/10 group cursor-pointer hover:border-indigo-500/30 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Karma Incentive</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic group-hover:text-white transition-colors leading-none mt-1">Earn on Uploads</span>
           </div>
           <button className="btn-primary font-black text-[10px] uppercase tracking-[0.3em] px-10 relative group overflow-hidden shadow-2xl shadow-indigo-600/20 leading-none outline-none">
              <div className="absolute inset-x-[-100%] inset-y-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
              <Upload size={20} /> Upload Resource
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        <aside className="lg:col-span-1 space-y-8 glass-card p-8 bg-slate-900/40 border-white/5 sticky top-32 shadow-2xl">
           <div className="space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Search</label>
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Course Code, Topic..." 
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-700 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'PDFs', count: 124 },
                   { label: 'Videos', count: 42 },
                   { label: 'Past Papers', count: 89 },
                   { label: 'Projects', count: 12 },
                 ].map((cat, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer group hover:bg-white/10 shadow-lg">
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors leading-none">{cat.label}</span>
                       <span className="text-xl font-black text-white tracking-widest leading-none mt-1">{cat.count}</span>
                    </div>
                 ))}
              </div>
           </div>
        </aside>

        <section className="lg:col-span-3 space-y-8">
           <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Global Nexus Directory • {loading ? 'Uplink active...' : `${resources.length} active assets`}</span>
              <div className="flex gap-4 items-center">
                 <div className="flex items-center gap-2 group cursor-pointer">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors tracking-[0.2em] italic">Featured Only</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resources.map((resource: any, i: number) => (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card group overflow-hidden border-white/5 bg-slate-900/40 relative hover:border-indigo-500/30 transition-all h-[340px] flex flex-col justify-between shadow-2xl"
                >
                  <div className="p-8 pb-4 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-indigo-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                          <BookOpen size={28} className="group-hover:rotate-6 transition-transform" />
                       </div>
                       <div className="flex flex-col items-end">
                          <div className={resource.verified ? "verified-badge uppercase italic px-4 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)] border border-emerald-500/20" : "px-4 py-1.5 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded text-[10px] font-black uppercase italic tracking-widest"}>
                            {resource.verified ? "Certified Asset" : "Community Shared"}
                          </div>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{resource.fileType} Protocol</span>
                       </div>
                    </div>

                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-tight mb-2 group-hover:text-indigo-400 transition-colors">
                      {resource.title}
                    </h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                       {resource.campus} • <span className="text-slate-200">Owner ID: {resource.ownerUid.split('-')[0]}</span>
                    </p>
                  </div>

                  <div className="p-8 pt-4 bg-white/5 border-t border-white/5 flex items-center justify-between mt-auto relative z-10 shadow-inner">
                    <div className="flex items-center gap-3">
                       <div className="karma-chip shadow-[0_0_20px_rgba(245,158,11,0.1)] bg-amber-500/20 border-amber-500/30 px-5 py-2">
                          <Star size={14} className="fill-current" /> {resource.karmaCost} <span className="opacity-50 text-[8px] uppercase tracking-widest ml-1 leading-none italic">Tokens</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => handlePurchase(resource._id)}
                      className="btn-primary group !bg-white/5 !text-slate-400 hover:!bg-indigo-600 hover:!text-white border border-white/10 hover:border-indigo-500 transition-all px-8 text-[11px] font-black uppercase italic tracking-widest leading-none outline-none ring-0"
                    >
                       Purchase <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>

                  {resource.campus !== 'IIT_JAMMU' && (
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none -rotate-12 translate-x-1/3 -translate-y-1/3">
                       <Zap size={300} className="text-indigo-400" />
                    </div>
                  )}
                </motion.div>
              ))}
           </div>
        </section>
      </div>
    </motion.div>
  );
}
