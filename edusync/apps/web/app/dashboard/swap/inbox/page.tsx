'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Clock, Star, ArrowRight } from 'lucide-react';
import { useNexus } from '../../../../hooks/useNexus';

export default function SwapInboxPage() {
  const { swaps, fetchSwaps, acceptSwap, rejectSwap, completeSwap, requestCancel } = useNexus();

  useEffect(() => {
    fetchSwaps('pending'); // Initialize with pending
  }, [fetchSwaps]);

  const receivedSwaps = swaps; // Assuming API filters or I can filter locally

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-8 space-y-8 max-w-5xl mx-auto"
    >
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Skill Inbox</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Incoming Nexus Collaboration Requests</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => fetchSwaps('pending')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 transition-all tracking-widest italic">Pending</button>
           <button onClick={() => fetchSwaps('accepted')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 transition-all tracking-widest italic">In Progress</button>
        </div>
      </header>

      <div className="space-y-6">
        {receivedSwaps.length === 0 ? (
          <div className="glass-card p-20 border-white/5 bg-slate-900/20 flex flex-col items-center justify-center text-center opacity-50">
             <Clock size={48} className="text-slate-700 mb-4" />
             <p className="text-slate-500 font-black uppercase tracking-widest italic text-sm">Quiet in the Nexus...</p>
             <p className="text-slate-600 text-xs mt-2 italic">You have no active incoming requests at this moment.</p>
          </div>
        ) : (
          receivedSwaps.map((swap: any) => (
            <motion.div 
              key={swap._id}
              layout
              className="glass-card p-6 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group border-l-4 border-l-indigo-600 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                     <Zap size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Request: {swap.skill}</h3>
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase italic rounded-md">
                        {swap.isCrossCampus ? 'Cross-Campus' : 'Local'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">From: <span className="text-indigo-300 font-bold">@{swap.requesterUid}</span></p>
                    <div className="flex items-center gap-4 mt-4">
                       <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                         <Star size={12} className="fill-current" /> {swap.karmaStaked} Locked in Escrow
                       </span>
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                       <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Status: {swap.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {swap.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => rejectSwap(swap._id)}
                        className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                        title="Reject Request"
                      >
                        <X size={20} />
                      </button>
                      <button 
                        onClick={() => acceptSwap(swap._id)}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10 active:scale-90"
                        title="Accept Request"
                      >
                        <Check size={20} />
                      </button>
                    </>
                  )}
                  {swap.status === 'accepted' && (
                    <div className="flex flex-col items-end gap-2">
                       <button 
                         onClick={() => completeSwap(swap._id)}
                         className="px-6 py-3 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
                       >
                         Complete Session <ArrowRight size={14} />
                       </button>

                       {swap.cancelRequestedBy ? (
                         <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[8px] font-black uppercase text-amber-500 italic animate-pulse">
                           <Clock size={10} /> Waiting for Peer Consent
                         </div>
                       ) : (
                         <button 
                           onClick={() => requestCancel(swap._id)}
                           className="text-[8px] font-black uppercase text-slate-500 hover:text-red-400 transition-colors italic tracking-widest underline decoration-dotted underline-offset-4"
                         >
                           Request Cancellation
                         </button>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
