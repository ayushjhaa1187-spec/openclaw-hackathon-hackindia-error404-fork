'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Video, 
  Archive, 
  ImageIcon, 
  ArrowLeft,
  ChevronRight,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { useVault } from '../../../hooks/useVault';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadResourcePage() {
  const router = useRouter();
  const { uploadAsset } = useVault();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    courseCode: '',
    fileType: 'PDF',
    karmaCost: '10',
    visibility: 'public'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      const res = await uploadAsset(payload);
      if (res.success) {
        router.push('/dashboard/vault?uploaded=true');
      }
    } catch (err) {
      console.error(err);
      alert('Vault Submission Failed: Check institutional connectivity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <Link 
        href="/dashboard/vault"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Nexus
      </Link>

      <header>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
          <Upload className="text-indigo-500" /> Contribute Knowledge
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Seed the Institutional Memory</p>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card p-8 border-white/5 bg-slate-900/40 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Title</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50"
              placeholder="e.g. Adv. Algorithms Final Prep"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Course Code</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50"
              placeholder="e.g. CS401"
              value={formData.courseCode}
              onChange={e => setFormData({...formData, courseCode: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Abstract / Description</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
            placeholder="What concepts does this resource cover?"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
            <select 
              className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
              value={formData.fileType}
              onChange={e => setFormData({...formData, fileType: e.target.value})}
            >
              <option>PDF</option>
              <option>Video</option>
              <option>Archive</option>
              <option>Image</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Karma Price</label>
            <input 
              type="number"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50"
              value={formData.karmaCost}
              onChange={e => setFormData({...formData, karmaCost: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Visibility</label>
            <select 
              className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
              value={formData.visibility}
              onChange={e => setFormData({...formData, visibility: e.target.value as any})}
            >
              <option value="public">Public (Nexus)</option>
              <option value="campus_only">Campus Only</option>
              <option value="college_group">College Group</option>
            </select>
          </div>
        </div>

        {/* File Drop Area */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset (PDF/MP4/ZIP)</label>
          <div className="relative group">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <div className={`border-2 border-dashed ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'} rounded-2xl p-12 text-center transition-all group-hover:border-indigo-500/50`}>
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="text-emerald-500" size={32} />
                  <p className="text-white font-black uppercase italic text-sm">{file.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={32} />
                  <p className="text-slate-500 font-black uppercase italic text-xs tracking-widest">Click or Drag to Upload</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
           <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <Zap className="text-indigo-400" size={18} />
              <p className="text-[10px] text-indigo-200/70 font-bold uppercase tracking-widest leading-relaxed">
                <span className="text-white font-black italic">+10 Karma Bounty</span> will be awarded to your ledger upon successful Nexus indexing.
              </p>
           </div>
           
           <button 
             disabled={loading || !file}
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black text-sm uppercase tracking-[0.2em] italic rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
           >
             {loading ? 'Transmitting...' : 'Commit to Vault'} <ChevronRight size={18} />
           </button>
        </div>
      </motion.form>
    </div>
  );
}
