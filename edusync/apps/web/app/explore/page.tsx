"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Filter, 
  Zap, 
  ArrowRight, 
  User, 
  Star, 
  Info, 
  Building2, 
  MapPin,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNexus } from '../../hooks/useNexus';
import { format } from 'date-fns';

export default function ExplorePage() {
  const router = useRouter();
  const { 
    skills, 
    loading, 
    searchSkills, 
    fetchNexusExplore, 
    fetchMOUPartners, 
    partners 
  } = useNexus();
  
  const [isNexusMode, setIsNexusMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isNexusMode) {
      fetchMOUPartners();
      fetchNexusExplore(searchQuery);
    } else {
      searchSkills(searchQuery, 'IIT_JAMMU');
    }
  }, [searchQuery, isNexusMode, fetchMOUPartners, fetchNexusExplore, searchSkills]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <div className="space-y-4">
           <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Nexus Explorer</h1>
           <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed tracking-tight">
             Discover and collaborate with peers across the <span className="text-indigo-400 font-bold uppercase">Federated Knowledge Network</span>.
           </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl">
           <div className="flex flex-col items-end pr-4 border-r border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Nexus Protocol</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Cross-Campus Access</span>
           </div>
           <button 
             onClick={() => setIsNexusMode(!isNexusMode)}
             className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] relative overflow-hidden group ${isNexusMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/50' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-indigo-500/30'}`}
           >
             {isNexusMode && <motion.div layoutId="nexus-glow" className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse" />}
             <Globe size={18} className={isNexusMode ? 'animate-spin-slow' : ''} />
             {isNexusMode ? 'Nexus Mode Active' : 'Enable Nexus Mode'}
           </button>
        </div>
      </header>

      {/* Partner Connectivity Cards (Only in Nexus Mode) */}
      <AnimatePresence>
        {isNexusMode && partners.length > 0 && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden"
          >
             {partners.map((partner: any) => (
               <div key={partner.mouId} className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 space-y-4 relative group">
                  <div className="flex justify-between items-start">
                     <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <ShieldCheck size={18} className="text-emerald-400" />
                     </div>
                     <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest italic group-hover:text-emerald-400 transition-colors">Active MOU Bridge</span>
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-white font-black text-sm uppercase italic tracking-tight">{partner.partnerCampus}</h4>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Node ID: {partner.mouId.substring(0, 13)}...</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Verified till {format(new Date(partner.validUntil), 'MMM yyyy')}</span>
                     <ExternalLink size={12} className="text-slate-600 group-hover:text-white transition-colors cursor-pointer" />
                  </div>
               </div>
             ))}
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1 space-y-8">
           <div className="glass-card p-8 border-white/5 bg-slate-900/60 sticky top-32">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 flex items-center gap-2">
                 <Filter size={16} /> Filters
              </h3>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search Mentors</label>
                    <div className="relative group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                       <input 
                         type="text" 
                         placeholder="Skill, ID, or Topic..." 
                         className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-slate-600 outline-none"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                    <div className="flex gap-3 items-start">
                       <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-indigo-400/80 leading-relaxed font-bold italic tracking-tight">
                         {isNexusMode 
                           ? "Nexus mode searches across all MOU-partnered campus nodes using verified OIDC handshake." 
                           : "Local node search restricted to your primary campus node."}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

        <section className="lg:col-span-3 space-y-6">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {loading ? 'Nexus Uplink Active...' : `Showing ${skills.length} results`}
              </span>
              <div className="flex gap-2">
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">Sort: Karma Score</div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {skills.map((listing: any, i: number) => (
                  <motion.div
                    key={listing.uid || listing._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card p-6 border-white/5 bg-slate-900/40 relative group overflow-hidden border-l-4 transition-all shadow-xl ${listing.campus !== 'IIT_JAMMU' ? 'hover:border-l-indigo-500' : 'hover:border-l-slate-500'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
                             <img src={listing.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.name}`} alt="avatar" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-white tracking-tight uppercase italic">{listing.name}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={listing.campus !== 'IIT_JAMMU' ? "px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[8px] font-black uppercase italic" : "px-2 py-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded-md text-[8px] font-black uppercase italic"}>
                                   {listing.campus !== 'IIT_JAMMU' ? "Nexus Partner" : "Local Node"}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase">
                                   <MapPin size={10} className="text-indigo-400" /> {listing.campus}
                                </span>
                             </div>
                          </div>
                       </div>
                       <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-black text-amber-500 flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.1)] italic">
                          <Star size={12} className="fill-current" /> {listing.karma}
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                       {listing.skills?.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all uppercase italic">
                             #{skill}
                          </span>
                       ))}
                    </div>

                    <button 
                      onClick={() => {
                        if (listing.campus !== 'IIT_JAMMU') {
                           router.push(`/dashboard/nexus/profile/${listing.uid || listing.firebaseUid}`);
                        } else {
                           router.push(`/dashboard/profile/${listing.uid || listing.firebaseUid}`);
                        }
                      }}
                      className="w-full py-4 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] group overflow-hidden relative transition-all shadow-xl italic flex items-center justify-center gap-2"
                    >
                       View Profile <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {listing.campus !== 'IIT_JAMMU' && (
                       <div className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:scale-150 transition-transform -rotate-12 pointer-events-none">
                          <Globe size={120} className="text-indigo-400" />
                       </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </section>
      </div>
    </motion.div>
  );
}
