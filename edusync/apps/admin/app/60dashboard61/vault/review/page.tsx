'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, XCircle, CheckCircle, FileText, 
  ExternalLink, Filter, AlertTriangle, Clock, 
  BrainCircuit, History, Info, Lock, ChevronRight
} from 'lucide-react';
import { useVerification } from '../../../../hooks/useVerification';
import { formatDistanceToNow } from 'date-fns';

export default function VaultReviewPage() {
  const { 
    queue, loading, auditLogs, 
    fetchQueue, fetchAuditLogs, 
    openReview, approveResource, 
    rejectResource, requestChanges 
  } = useVerification();

  const [selected, setSelected] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [conflict, setConflict] = useState<any>(null);
  const [view, setView] = useState<'queue' | 'audit'>('queue');

  useEffect(() => {
    fetchQueue();
    fetchAuditLogs();
  }, [fetchQueue, fetchAuditLogs]);

  const handleSelect = async (resource: any) => {
    setConflict(null);
    try {
      const result = await openReview(resource._id);
      if (result.success) {
        setSelected(result.resource);
      } else if (result.conflict) {
        setConflict(result);
      }
    } catch (e) {
      console.error('Open Review Error:', e);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'request') => {
    if (!selected) return;
    try {
      if (action === 'approve') {
        await approveResource(selected._id, reviewNote);
      } else if (action === 'reject') {
        await rejectResource(selected._id, reviewNote, 'Policy Violation');
      } else if (action === 'request') {
        await requestChanges(selected._id, reviewNote);
      }
      setSelected(null);
      setReviewNote('');
    } catch (e) {
      console.error('Moderation Action Failed:', e);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Institutional Node 72A</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Resource Certification</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em] mt-1 italic">Knowledge Vault Verification Queue & Audit Trail</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setView('queue')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${view === 'queue' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Pending ({queue.length})
          </button>
          <button 
            onClick={() => setView('audit')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${view === 'audit' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            History
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Queue/Audit List */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">
            {view === 'queue' ? (
              <motion.div 
                key="queue"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {queue.length === 0 ? (
                  <div className="glass-card p-20 text-center opacity-40 border-dashed border-white/10 bg-transparent">
                    <CheckCircle size={48} className="mx-auto text-emerald-500/50 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">All resources certified. Nexus compliant.</p>
                  </div>
                ) : (
                  queue.map((resource) => (
                    <div 
                      key={resource._id}
                      onClick={() => handleSelect(resource)}
                      className={`glass-card p-5 border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer group flex items-center justify-between ${selected?._id === resource._id ? 'ring-2 ring-emerald-500 bg-slate-900/80 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl border transition-all ${resource.verification?.aiSafetyVerdict === 'flagged' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                          {resource.verification?.aiSafetyVerdict === 'flagged' ? <AlertTriangle size={24} /> : <FileText size={24} />}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                            {resource.title}
                            {resource.verification?.status === 'changes_requested' && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] rounded uppercase font-bold italic border border-amber-500/20">Re-submitted</span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest italic text-slate-500">
                            <span>@{resource.ownerUid}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span>{resource.campusId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {formatDistanceToNow(new Date(resource.createdAt))} ago
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 text-right">
                        <div className="flex items-center gap-2">
                           {resource.verification?.aiSafetyVerdict === 'flagged' && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-black italic rounded uppercase border border-red-500/30">AI FLAG</span>
                           )}
                           <div className="flex flex-col">
                              <span className={`text-sm font-black italic ${resource.verification?.aiSafetyScore > 80 ? 'text-emerald-500' : resource.verification?.aiSafetyScore < 50 ? 'text-red-500' : 'text-amber-500'}`}>
                                {resource.verification?.aiSafetyScore || '--'}%
                              </span>
                              <span className="text-[8px] font-bold text-slate-600 uppercase">AI Score</span>
                           </div>
                        </div>
                        <ChevronRight className={`transition-transform ${selected?._id === resource._id ? 'rotate-90 text-emerald-500' : 'text-slate-700 group-hover:translate-x-1'}`} size={20} />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="audit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                 {auditLogs.map((log) => (
                   <div key={log.id} className="glass-card p-4 border-white/5 bg-slate-900/20 text-[10px] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg ${log.action_type === 'resource_approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                           {log.action_type === 'resource_approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                         </div>
                         <div>
                           <p className="text-white font-black uppercase italic tracking-wider">{log.action_type.replace(/_/g, ' ')}</p>
                           <p className="text-slate-500 font-bold uppercase tracking-widest mt-0.5">ID: {log.target_entity_id.slice(-8)} • By Admin {log.admin_uid.slice(-4)}</p>
                         </div>
                      </div>
                      <div className="text-right italic">
                        <p className="text-slate-400">{formatDistanceToNow(new Date(log.created_at))} ago</p>
                      </div>
                   </div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Review Interface */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="glass-card overflow-hidden border-white/10 bg-slate-900/60 shadow-2xl min-h-[500px] flex flex-col">
            {selected ? (
              <div className="flex flex-col h-full">
                <div className="p-8 space-y-6">
                  <header>
                    <span className="text-emerald-500 text-[8px] font-black uppercase tracking-[0.4em] italic mb-1 block">Active Investigation</span>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{selected.title}</h2>
                    <p className="text-slate-400 text-xs mt-3 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">{selected.description}</p>
                  </header>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                           <BrainCircuit size={16} className="text-indigo-400" />
                           <span className="text-[10px] font-black uppercase italic text-indigo-400 tracking-widest">Guardian AI Analysis</span>
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest italic animate-pulse">
                              <span className="text-slate-500">Verdict:</span>
                              <span className={selected.verification?.aiSafetyVerdict === 'flagged' ? 'text-red-500' : 'text-emerald-500'}>
                                {selected.verification?.aiSafetyVerdict || 'UNSCREENED'}
                              </span>
                           </div>
                           <div className="flex flex-wrap gap-1 pt-2">
                              {(selected.verification?.aiSafetyFlags || []).map((f: string) => (
                                <span key={f} className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] rounded uppercase font-black italic border border-red-500/20">{f}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                           <History size={16} className="text-slate-500" />
                           <span className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Metadata</span>
                        </div>
                        <div className="space-y-1 text-[10px] uppercase font-bold italic font-mono text-slate-300">
                           <div className="flex justify-between"><span>Type:</span> <span>{selected.fileType}</span></div>
                           <div className="flex justify-between"><span>Cost:</span> <span>{selected.karmaCost} KARMA</span></div>
                           <div className="flex justify-between"><span>Attempts:</span> <span>{selected.verification?.reviewAttempts || 1}</span></div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] uppercase font-black tracking-widest italic flex items-center gap-2">
                      <Info size={14} className="text-indigo-400" /> Institutional Feedback / Decision Notes
                    </label>
                    <textarea 
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Specify required changes or internal certification notes..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none italic"
                    />
                  </div>
                </div>

                <div className="mt-auto p-4 bg-black/40 border-t border-white/5 grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleAction('reject')}
                    className="flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all group"
                  >
                    <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase mt-1 tracking-widest">REJECT</span>
                  </button>
                  <button 
                    onClick={() => handleAction('request')}
                    className="flex flex-col items-center justify-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all group"
                  >
                    <AlertTriangle size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[8px] font-black uppercase mt-1 tracking-widest text-center leading-[1.2]">REQUEST CHANGES</span>
                  </button>
                  <button 
                    onClick={() => handleAction('approve')}
                    className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                  >
                    <CheckCircle size={20} className="group-hover:scale-125 transition-transform" />
                    <span className="text-[8px] font-black uppercase mt-1 tracking-widest">CERTIFY</span>
                  </button>
                </div>
                
                <a 
                  href={selected.fileUrl} 
                  target="_blank"
                  className="p-3 bg-white/5 hover:bg-white/10 text-center text-[10px] font-black text-slate-500 uppercase italic tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={12} /> Inspect File Artifact
                </a>
              </div>
            ) : conflict ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
                <div className="relative">
                  <Lock size={64} className="text-amber-500/50" />
                  <div className="absolute inset-0 animate-ping border-2 border-amber-500/20 rounded-full" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Concurrent Review Conflict</h3>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em] mt-2 italic leading-relaxed">
                    This resource is currently under institutional review by administrator <span className="text-amber-500">ID: {conflict.reviewerUid?.slice(-4)}</span>. 
                    Lock active since {formatDistanceToNow(new Date(conflict.openedAt))} ago.
                  </p>
                </div>
                <button 
                  onClick={() => setConflict(null)}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-slate-300 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all"
                >
                  Return to Queue
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-20 text-center opacity-20 grayscale scale-95">
                <ShieldCheck size={80} className="text-slate-600 mb-6" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] italic leading-relaxed">
                  Institutional Protocol: Select a pending resource from the queue to initiate Guardian review session.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 p-6 bg-indigo-500/5 border border-white/5 rounded-3xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Verification Logic v2.5</h4>
             </div>
             <p className="text-[9px] text-slate-500 leading-relaxed italic font-medium">
               Resource certification awards the uploader <span className="text-indigo-400 font-bold">+20 KARMA</span> and marks the asset as **Guardian Certified**. This status bypasses standard visibility throttles across the entire Educational Nexus. High AI flag counts require mandatory human inspection.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
