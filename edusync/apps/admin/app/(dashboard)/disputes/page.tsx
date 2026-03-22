'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCcw, Landmark, Gavel, AlertCircle, Info } from 'lucide-react';
import { useNexus } from '../../../../../web/hooks/useNexus';

export default function AdminDisputesPage() {
  const { swaps, fetchSwaps, adminOverride } = useNexus();
  const [selectedSwap, setSelectedSwap] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Fetch swaps that are stale or have cancellation requests
    fetchSwaps(); // In a real app, use ?filter=disputed
  }, [fetchSwaps]);

  const flaggedSwaps = swaps.filter((s: any) => s.isStale || s.cancelRequestedBy || s.status === 'disputed');

  const handleOverride = async (action: 'force_refund' | 'force_payout') => {
    if (!selectedSwap || !notes) return;
    await adminOverride(selectedSwap._id, action, notes);
    setSelectedSwap(null);
    setNotes('');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Gavel className="text-indigo-500" /> Nexus Dispute Console
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Administrative Escrow Recovery & Conflict Resolution</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dispute List */}
        <div className="lg:col-span-2 space-y-4">
          {flaggedSwaps.length === 0 ? (
            <div className="glass-card p-12 text-center opacity-50 border-white/5 bg-slate-900/40">
              <ShieldAlert size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Nexus Integrity Maintained. No pending disputes.</p>
            </div>
          ) : (
            flaggedSwaps.map((swap: any) => (
              <motion.div 
                key={swap._id}
                onClick={() => setSelectedSwap(swap)}
                className={`glass-card p-5 border-white/5 bg-slate-900/40 cursor-pointer transition-all hover:bg-slate-900/60 ${selectedSwap?._id === swap._id ? 'ring-2 ring-indigo-500 bg-slate-900/80' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${swap.isStale ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                       <h3 className="text-white font-black uppercase italic text-sm">{swap.skill} Swap</h3>
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium uppercase italic tracking-widest">
                       {swap.requesterUid} ↔ {swap.providerUid}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-indigo-400 text-xs font-black italic">{swap.karmaStaked} KARMA</span>
                    <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mt-1">Status: {swap.status}</p>
                  </div>
                </div>
                {swap.cancelRequestedBy && (
                   <div className="mt-3 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] text-amber-500 font-bold uppercase italic inline-block">
                     Cancellation requested by @{swap.cancelRequestedBy}
                   </div>
                )}
                {swap.isStale && (
                   <div className="mt-3 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] text-red-500 font-bold uppercase italic inline-block ml-2">
                     Stale (Inactive for 7+ days)
                   </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/10 bg-indigo-500/5 min-h-[400px]">
            {selectedSwap ? (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter border-b border-white/10 pb-4">Resolve Conflict</h2>
                
                <div className="space-y-4">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest italic mb-2">Audit Detail</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Target Swap:</span> <span className="text-white font-bold">{selectedSwap._id.slice(-8)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Cross-Campus:</span> <span className="text-white font-bold">{selectedSwap.isCrossCampus ? 'YES' : 'NO'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Last Active:</span> <span className="text-white font-bold">{new Date(selectedSwap.updatedAt).toLocaleDateString()}</span></div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest italic flex items-center gap-2">
                        <Info size={12} className="text-indigo-400" /> Reason for Override
                      </label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Requester ghosted after confirmed session..."
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-3 pt-4">
                      <button 
                        onClick={() => handleOverride('force_refund')}
                        disabled={!notes}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all group disabled:opacity-20"
                      >
                         <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-center">Force Refund to Requester</span>
                      </button>
                      <button 
                        onClick={() => handleOverride('force_payout')}
                        disabled={!notes}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group disabled:opacity-20"
                      >
                         <Landmark size={20} className="group-hover:scale-110 transition-transform" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-center">Force Payout to Provider</span>
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 gap-4">
                 <AlertCircle size={32} />
                 <p className="text-[10px] font-black uppercase tracking-widest italic">Select a conflicted swap from the list to begin resolution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
