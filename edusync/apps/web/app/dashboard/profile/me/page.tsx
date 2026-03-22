import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, Zap, Mail, Building2, Star, Award, Clock, ExternalLink, Settings, Edit3, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const profile = {
    name: "Arjun Singh",
    email: "arjun.s@iitjammu.ac.id",
    campus: "IIT Jammu",
    specialization: "VLSI & Embedded Systems",
    skills: ["FPGA", "Verilog", "Rust", "RTOS"],
    karma: 1240,
    rank: 42,
    trust: 98,
    activeSince: "Oct 2023"
  };

  const activity = [
    { label: "Completed Skill Swap with Sneha R.", type: "swap", time: "2h ago" },
    { label: "Uploaded 'EE301: Control Systems' to Vault", type: "vault", time: "1d ago" },
    { label: "Earned 'Nexus Partner' Badge", type: "badge", time: "3d ago" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8 space-y-12 max-w-[1600px] mx-auto min-h-screen"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
        <div className="flex items-center gap-10">
           <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white/10 overflow-hidden relative z-10 shadow-2xl group-hover:scale-105 transition-transform">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-white rounded-2xl border-4 border-slate-950 z-20 shadow-xl">
                 <Shield size={18} className="fill-current" />
              </div>
           </div>
           <div className="space-y-4">
              <div className="flex flex-col">
                 <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none m-0">Institutional Intel</h1>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] mt-3 italic leading-none">Security Clearance: LEVEL 4</span>
              </div>
              <div className="flex flex-wrap gap-4">
                 <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-none">Verified OIDC Identity</span>
                 <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 uppercase italic tracking-widest leading-none">IIT Jammu Node</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <button className="btn-secondary !px-8 text-[11px] uppercase tracking-widest font-black italic group leading-none outline-none">
              <Settings size={18} className="group-hover:rotate-90 transition-transform" /> Preferences
           </button>
           <button className="btn-primary !px-8 text-[11px] uppercase tracking-widest font-black italic leading-none outline-none">
              <Edit3 size={18} /> Edit Core Profile
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-1 space-y-10">
           <div className="glass-card p-10 bg-slate-900/60 border-white/5 relative overflow-hidden group shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 italic leading-none">Identity Core</h3>
              <div className="space-y-8">
                 <div className="flex items-center gap-6 group/item">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 group-hover/item:text-indigo-400 transition-colors">
                       <User size={20} />
                    </div>
                    <div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 leading-none">Full Name</span>
                       <h4 className="text-xl font-black text-white italic tracking-tight leading-none mt-1">{profile.name}</h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 group/item">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 group-hover/item:text-indigo-400 transition-colors">
                       <Mail size={20} />
                    </div>
                    <div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 leading-none">Secure Email</span>
                       <h4 className="text-xl font-black text-white italic tracking-tight leading-none mt-1">{profile.email}</h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 group/item">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 group-hover/item:text-indigo-400 transition-colors">
                       <Building2 size={20} />
                    </div>
                    <div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 leading-none">Home Campus</span>
                       <h4 className="text-xl font-black text-white italic tracking-tight leading-none mt-1 uppercase">{profile.campus}</h4>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-10 border-t border-white/5 space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic leading-none">Knowledge Specialization</span>
                 <p className="text-lg font-black text-white leading-relaxed tracking-tight italic">{profile.specialization}</p>
                 <div className="flex flex-wrap gap-2 pt-2">
                    {profile.skills.map((skill, i) => (
                       <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase italic tracking-widest hover:text-indigo-400 hover:border-indigo-500/30 transition-all leading-none">#{skill}</span>
                    ))}
                 </div>
              </div>
           </div>

           <div className="glass-card p-10 bg-slate-950/20 border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic leading-none">Nexus Metrics</h3>
                 <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse leading-none">Live Sync</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 leading-none">Global Rank</span>
                    <h4 className="text-3xl font-black text-indigo-400 italic tracking-widest leading-none mt-2 shadow-sm">#{profile.rank}</h4>
                 </div>
                 <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 leading-none">Trust Quotient</span>
                    <h4 className="text-3xl font-black text-emerald-400 italic tracking-widest leading-none mt-2 shadow-sm">{profile.trust}%</h4>
                 </div>
              </div>
           </div>
        </section>

        <section className="lg:col-span-2 space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-10 border-white/5 bg-slate-900/40 relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform -translate-y-1/2 translate-x-1/2">
                    <Star size={180} className="text-amber-500" />
                 </div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 italic leading-none">Credibility Wallet</h3>
                 <div className="flex items-end gap-3 mb-10">
                    <span className="text-6xl font-black text-white tracking-widest italic leading-none shadow-md">{profile.karma}</span>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2 leading-none">Karma Units</span>
                 </div>
                 <Link href="/dashboard/wallet" className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2 hover:gap-4 transition-all italic leading-none outline-none">
                    View Transaction Ledger <ExternalLink size={12} />
                 </Link>
              </div>

              <div className="glass-card p-10 border-white/5 bg-white/5 relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform -translate-y-1/2 translate-x-1/2">
                    <Award size={180} className="text-indigo-400" />
                 </div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 italic leading-none">Badges & Awards</h3>
                 <div className="flex gap-4">
                    <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform cursor-pointer">
                       <Zap size={24} className="fill-current" />
                    </div>
                    <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform cursor-pointer">
                       <Shield size={24} className="fill-current" />
                    </div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform cursor-pointer">
                       <Clock size={24} />
                    </div>
                 </div>
                 <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-8 leading-none italic">
                    Nexus Partner status active until Oct 2026.
                 </p>
              </div>
           </div>

           <div className="glass-card p-0 bg-slate-900/60 border-white/5 overflow-hidden flex flex-col shadow-2xl">
              <div className="p-10 border-b border-white/10 flex justify-between items-center bg-slate-950/40 backdrop-blur-3xl shadow-lg">
                 <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                    <Activity size={20} className="text-indigo-400" /> Activity Ledger
                 </h3>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Recent Interaction Logs</span>
              </div>
              <div className="p-10 space-y-8">
                 {activity.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-xl border-2 shrink-0 group-hover:scale-110 transition-transform shadow-inner ${item.type === 'swap' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : item.type === 'vault' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                             {item.type === 'swap' ? <Zap size={20} /> : item.type === 'vault' ? <BookOpen size={20} /> : <Award size={20} />}
                          </div>
                          <div>
                             <h5 className="text-lg font-black text-white tracking-tight uppercase italic group-hover:text-indigo-400 transition-colors leading-none">{item.label}</h5>
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2 leading-none italic">Protocol Action • Verified</span>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors leading-none">{item.time}</span>
                    </div>
                 ))}
              </div>
              <div className="p-10 bg-black/20 border-t border-white/5 text-center shadow-inner">
                 <button className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-white transition-colors italic leading-none outline-none">View Full Activity History</button>
              </div>
           </div>
        </section>
      </div>
    </motion.div>
  );
}
