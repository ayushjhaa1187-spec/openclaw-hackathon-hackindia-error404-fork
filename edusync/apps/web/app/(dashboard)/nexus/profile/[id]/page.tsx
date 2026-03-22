'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  History, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Briefcase,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNexus } from '../../../../hooks/useNexus';
import { TierBadge } from '../../../../components/ui/TierBadge';
import { MOUDisclosureModal } from '../../../../components/features/MOUDisclosureModal';
import { format } from 'date-fns';

export default function NexusProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { fetchCrossCampusProfile, profileData, nexusMeta, globalRank, loading } = useNexus();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCrossCampusProfile(params.id as string);
    }
  }, [params.id, fetchCrossCampusProfile]);

  if (loading) return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
       <div className="h-48 bg-white/5 rounded-3xl" />
       <div className="grid grid-cols-3 gap-6">
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
       </div>
    </div>
  );

  if (!profileData) return (
    <div className="p-24 text-center space-y-4">
       <AlertCircle className="mx-auto text-rose-500" size={48} />
       <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Node Desynchronized</h2>
       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">The requested Nexus profile is either private or institutional bridge is down.</p>
       <button onClick={() => router.back()} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/10 italic">Return to Nexus</button>
    </div>
  );

  const isExpiringSoon = nexusMeta?.mouValidUntil && 
    (new Date(nexusMeta.mouValidUntil).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      {/* Nexus Header Banner */}
      <div className="relative glass-card overflow-hidden border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-950 p-8">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Globe size={160} className="text-indigo-400" />
         </div>
         
         <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative"
            >
               <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-indigo-500/50 shadow-2xl shadow-indigo-600/20">
                  <img src={profileData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.name}`} alt="" />
               </div>
               <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-xl shadow-xl border border-white/10">
                  <Globe className="text-white" size={16} />
               </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left space-y-4">
               <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                     <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{profileData.name}</h1>
                     <div className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
                        <span className="text-[10px] font-black text-indigo-400 uppercase italic tracking-widest">Nexus Partner</span>
                     </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                     <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-400" /> {profileData.campus}</span>
                     <span className="flex items-center gap-1.5"><GraduationCap size={12} className="text-indigo-400" /> {profileData.department}</span>
                     <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-indigo-400" /> Year {profileData.year}</span>
                  </div>
               </div>

               <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                     <TierBadge tier={globalRank.tier} size="md" />
                     <div className="h-6 w-px bg-white/10"></div>
                     <span className="text-[10px] font-black text-white uppercase italic tracking-widest">Rank #{globalRank.rank}</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                     <Zap size={14} className="text-amber-400" />
                     <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{profileData.karma} Karma</span>
                  </div>
               </div>
            </div>
         </div>

         {/* MOU Bridge Status */}
         <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShieldCheck size={18} className="text-emerald-400" />
               </div>
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest italic">MOU Verification Active</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight italic">
                    Bridge: {nexusMeta.mouId.substring(0, 13)}...
                    {nexusMeta.mouValidUntil && ` • Valid until ${format(new Date(nexusMeta.mouValidUntil), 'MMM yyyy')}`}
                  </p>
               </div>
            </div>
            {isExpiringSoon && (
               <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-400" />
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Partnership Renews Soon</span>
               </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Skills & Want To Learn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="glass-card p-6 space-y-6 flex flex-col">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                     <Zap className="text-indigo-400" size={18} />
                     <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Verified Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-grow">
                     {profileData.skills.map((s: string) => (
                        <span key={s} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest italic rounded-lg">
                           {s}
                        </span>
                     ))}
                  </div>
               </section>

               <section className="glass-card p-6 space-y-6 flex flex-col">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                     <MessageSquare className="text-emerald-400" size={18} />
                     <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Eager to Learn</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-grow">
                     {profileData.wantToLearn.map((s: string) => (
                        <span key={s} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest italic rounded-lg">
                           {s}
                        </span>
                     ))}
                  </div>
               </section>
            </div>

            {/* Interaction History */}
            <section className="glass-card p-6 space-y-6">
               <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <History className="text-slate-400" size={18} />
                  <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Nexus Collaboration History</h3>
               </div>
               
               {nexusMeta.hasCollaboratedBefore ? (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Shared Swaps</p>
                           <p className="text-2xl font-black text-white italic">{nexusMeta.crossCampusSwapsCompleted}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Transparency Grade</p>
                           <p className="text-2xl font-black text-emerald-400 italic font-serif">A+</p>
                        </div>
                     </div>
                     <div className="space-y-2">
                        {nexusMeta.interactions.map((log: any, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                              <span className="text-[10px] font-bold text-white uppercase italic">{log.action.replace('_', ' ')}</span>
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{format(new Date(log.timestamp), 'MMM d, yyyy')}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="py-12 text-center space-y-3">
                     <Globe className="mx-auto text-slate-700" size={32} />
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">No Prior Trans-Institutional Connectivity Found</p>
                  </div>
               )}
            </section>
         </div>

         {/* Sidebar: Swap compatibility */}
         <div className="space-y-8">
            <section className="glass-card p-6 border-indigo-500/30 bg-indigo-500/5 space-y-6">
               <div className="space-y-2">
                  <h3 className="text-white font-black uppercase text-xs italic tracking-widest">Connect via Nexus</h3>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                     Propose a cross-campus swap to build your reputation across institutions.
                  </p>
               </div>

               <button 
                  onClick={() => setModalOpen(true)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] italic shadow-2xl shadow-indigo-600/30 group flex items-center justify-center gap-3 transition-all"
               >
                  Propose Swap <ChevronRight className="group-hover:translate-x-1 transition-transform" size={14} />
               </button>

               <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Institutional Notice</p>
                     <p className="text-[8px] text-slate-400 leading-relaxed font-bold italic">
                        This action will be shared with administrators at {profileData.campus} and your local node.
                     </p>
                  </div>
               </div>
            </section>
         </div>
      </div>

      <MOUDisclosureModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partnerCampus={profileData.campus}
        mouId={nexusMeta.mouId}
        termsSummary={nexusMeta.mouAgreementTerms}
        onConfirm={() => {
           // Redirect to swap proposal page S08 with Nexus flags
           router.push(`/dashboard/swaps/propose?providerUid=${profileData.uid}&isCrossCampus=true&mouId=${nexusMeta.mouId}`);
        }}
      />
    </div>
  );
}
