'use client';

import React, { useEffect, useState } from 'react';
import { 
  Compass, Search, Zap, Plus, FileText, Video, 
  Archive, ImageIcon, ShieldCheck, Star, Download, 
  ChevronRight, BookOpen, Lock, Clock, AlertCircle,
  RefreshCcw, CheckCircle, XCircle, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useVault } from '../../../hooks/useVault';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

export default function KnowledgeVaultPage() {
  const { data: session } = useSession();
  const { resources, loading, fetchResources, resubmitAsset } = useVault();
  
  const [activeTab, setActiveTab] = useState<'explorer' | 'my-submissions'>('explorer');
  const [search, setSearch] = useState('');
  const [useAiSearch, setUseAiSearch] = useState(false);
  
  // Resubmit Modal State
  const [resubmitTarget, setResubmitTarget] = useState<any>(null);
  const [resubmitData, setResubmitData] = useState({ title: '', description: '', tags: '' });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchResources(search, useAiSearch);
  };

  useEffect(() => {
    fetchResources('', false);
  }, [fetchResources]);

  const projects = activeTab === 'explorer' 
    ? resources.filter(r => r.verification?.status === 'verified' || r.ownerUid === session?.user?.email) // Email used for UID in some sessions
    : resources.filter(r => r.ownerUid === (session?.user as any)?.uid || r.ownerUid === session?.user?.email);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText size={20} />;
      case 'Video': return <Video size={20} />;
      case 'Archive': return <Archive size={20} />;
      default: return <ImageIcon size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase text-[8px] font-black italic">Certified</span>;
      case 'rejected': return <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded uppercase text-[8px] font-black italic">Rejected</span>;
      case 'changes_requested': return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded uppercase text-[8px] font-black italic">Changes Requested</span>;
      case 'under_review': return <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded uppercase text-[8px] font-black italic animate-pulse">Reviewing...</span>;
      default: return <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded uppercase text-[8px] font-black italic">Pending</span>;
    }
  };

  const startResubmit = (resource: any) => {
    setResubmitTarget(resource);
    setResubmitData({ 
      title: resource.title, 
      description: resource.description, 
      tags: (resource.tags || []).join(', ') 
    });
  };

  const handleResubmit = async () => {
    if (!resubmitTarget) return;
    try {
      await resubmitAsset(resubmitTarget._id, {
        ...resubmitData,
        tags: resubmitData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setResubmitTarget(null);
      fetchResources();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
             <Compass className="text-indigo-500" /> Knowledge Vault
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Institutional Intelligence Marketplace</p>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mt-6 w-fit">
            <button 
              onClick={() => setActiveTab('explorer')}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === 'explorer' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              Nexus Explorer
            </button>
            <button 
              onClick={() => setActiveTab('my-submissions')}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${activeTab === 'my-submissions' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              My Contributions
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto self-end">
           <form onSubmit={handleSearch} className="relative flex-1 md:w-96 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder={useAiSearch ? "Describe what you want to learn..." : "Search resources, tags..."}
                  className={`w-full bg-white/5 border ${useAiSearch ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-white/10'} rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button 
                type="button"
                onClick={() => setUseAiSearch(!useAiSearch)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 group ${useAiSearch ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/40' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                <Zap size={18} className={useAiSearch ? 'fill-current' : 'group-hover:text-indigo-400 text-slate-600'} />
              </button>
           </form>
           <Link 
              href="/dashboard/vault/upload"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center gap-2"
           >
             <Plus size={16} /> Contribute
           </Link>
        </div>
      </header>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {projects.map((resource: any, i: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={resource._id}
              className={`glass-card group border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all flex flex-col h-full overflow-hidden ${resource.verification?.status === 'changes_requested' ? 'ring-1 ring-amber-500/30' : ''}`}
            >
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-white/5 text-indigo-400 border border-white/10 group-hover:scale-110 transition-transform">
                    {getIcon(resource.fileType)}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     {activeTab === 'explorer' && resource.verification?.status === 'verified' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase text-emerald-500 italic shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          <ShieldCheck size={10} /> Guardian Certified
                        </div>
                     )}
                     {activeTab === 'my-submissions' && getStatusBadge(resource.verification?.status)}
                  </div>
                </div>

                <div>
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">{resource.title}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest italic flex items-center gap-1">
                        <Clock size={10} /> {formatDistanceToNow(new Date(resource.createdAt))} ago
                      </p>
                      <span className="text-slate-700">•</span>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest italic">
                        By {resource.ownerUid === session?.user?.email ? 'You' : `@${resource.ownerUid?.slice(0, 6)}`}
                      </p>
                   </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 italic font-medium">
                  {resource.description}
                </p>

                {activeTab === 'my-submissions' && resource.verification?.status === 'changes_requested' && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                     <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={12} /> Feedback:
                     </p>
                     <p className="text-[10px] text-slate-400 italic leading-relaxed">
                        {resource.verification?.changesRequested || "Adjust parameters as requested."}
                     </p>
                     <button 
                        onClick={() => startResubmit(resource)}
                        className="w-full py-2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                     >
                        <RefreshCcw size={12} /> Update & Re-submit
                     </button>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest italic tabular-nums">
                    <Star size={12} className="fill-current" /> {resource.karmaCost}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest tabular-nums">
                    <Download size={12} /> {resource.downloads}
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/vault/${resource._id}`}
                  className="px-4 py-2 bg-white/5 hover:bg-indigo-600 text-[10px] font-black uppercase tracking-tighter italic rounded-xl border border-white/10 hover:border-indigo-500 transition-all flex items-center gap-2"
                >
                  Details <ChevronRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {projects.length === 0 && !loading && (
        <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
          <BookOpen size={64} className="text-slate-700 mb-6" />
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] italic">The Vault is Silent</p>
        </div>
      )}

      {/* Resubmit Modal */}
      <AnimatePresence>
        {resubmitTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="glass-card w-full max-w-lg p-8 border-white/10 bg-slate-900/90 shadow-2xl relative"
            >
               <button onClick={() => setResubmitTarget(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                  <XCircle size={24} />
               </button>
               
               <header className="mb-8">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                     <RefreshCcw className="text-amber-500" /> Resubmit Protocol
                  </h2>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1 italic">Knowledge Optimization Session</p>
               </header>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">New Title</label>
                    <input 
                      type="text" 
                      value={resubmitData.title}
                      onChange={e => setResubmitData({...resubmitData, title: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:ring-1 focus:ring-amber-500 transition-all italic font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Optimized Description</label>
                    <textarea 
                      value={resubmitData.description}
                      onChange={e => setResubmitData({...resubmitData, description: e.target.value})}
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:ring-1 focus:ring-amber-500 transition-all italic font-medium resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Taxonomy Tags (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={resubmitData.tags}
                      onChange={e => setResubmitData({...resubmitData, tags: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:ring-1 focus:ring-amber-500 transition-all italic font-medium"
                    />
                  </div>

                  <button 
                    onClick={handleResubmit}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/10 mt-4"
                  >
                    Authorize Resubmission & Encrypt
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
