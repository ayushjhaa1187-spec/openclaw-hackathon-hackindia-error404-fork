'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Lock, 
  ShieldCheck, 
  Star, 
  User, 
  Globe,
  FileText,
  Video,
  Archive,
  ImageIcon,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useVault } from '../../../hooks/useVault';
import Link from 'next/link';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getResourceById, purchaseAsset } = useVault();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const data = await getResourceById(id as string);
      setResource(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const data = await purchaseAsset(id as string);
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText size={48} />;
      case 'Video': return <Video size={48} />;
      case 'Archive': return <Archive size={48} />;
      default: return <ImageIcon size={48} />;
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse font-black uppercase italic">Retrieving Asset...</div>;
  if (!resource) return <div className="p-20 text-center text-red-500 font-black uppercase italic">Asset Not Found</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <Link 
        href="/dashboard/vault"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Vault
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Preview Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden border-white/5 bg-slate-900/40">
            <div className="aspect-video bg-indigo-500/10 flex items-center justify-center border-b border-white/5 relative">
               <div className="text-indigo-400 opacity-40 group-hover:scale-110 transition-transform">
                  {getIcon(resource.fileType)}
               </div>
               {resource.verification?.status === 'verified' && (
                 <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase text-emerald-500 italic">
                    <ShieldCheck size={10} /> Guardian Certified
                 </div>
               )}
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">{resource.title}</h1>
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                  <Star size={16} className="fill-current" />
                  <span className="font-black italic">{resource.karmaCost}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                <span className="flex items-center gap-1.5"><User size={12} /> @{resource.ownerUid}</span>
                <span className="flex items-center gap-1.5"><Globe size={12} /> {resource.campusId.replace('_', ' ')}</span>
                <span className="flex items-center gap-1.5 text-indigo-400"># {resource.courseCode}</span>
                <span className="flex items-center gap-1.5 text-indigo-400"># {resource.subject}</span>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-slate-400 text-sm leading-relaxed italic">
                  {resource.description}
                </p>
              </div>

              <div className="flex gap-2">
                {resource.tags?.map((tag: string) => (
                  <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5 italic">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ratings Placeholder */}
          <div className="glass-card p-6 border-white/5 bg-slate-900/40 flex items-center justify-between">
             <div className="flex items-center gap-4 text-slate-500 italic uppercase font-black text-[10px] tracking-widest">
                <Star size={18} /> Peer Assessment
             </div>
             <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-slate-600 uppercase italic">
                Implementation Deferred: Session 10
             </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 bg-slate-900/60 sticky top-8">
            <h3 className="text-white font-black uppercase italic text-xs tracking-widest mb-6">Nexus Transaction</h3>
            
            <div className="space-y-4">
               <div className="flex justify-between text-xs text-slate-400 italic">
                  <span>Resource Value</span>
                  <span className="text-white font-bold">{resource.karmaCost} Ҝ</span>
               </div>
               <div className="flex justify-between text-xs text-slate-400 italic">
                  <span>Nexus Node Surcharge</span>
                  <span className="text-emerald-500 font-bold">0 Ҝ</span>
               </div>
               <div className="h-px bg-white/5 my-4" />
               <div className="flex justify-between text-sm font-black text-white italic uppercase tracking-tighter">
                  <span>Total Due</span>
                  <span>{resource.karmaCost} Ҝ</span>
               </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-[0.2em] italic rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {purchasing ? 'Processing...' : (
                <>Unlock Asset <Lock size={16} /></>
              )}
            </button>

            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[8px] text-amber-500/60 font-medium leading-relaxed uppercase tracking-wider text-center">
                  Unlock grants lifetime access to this institutional node asset. Karma is non-refundable upon transmission.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
