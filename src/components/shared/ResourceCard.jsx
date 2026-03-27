import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Play, Link as LinkIcon, Download, Star, ShieldCheck, Lock, Globe, Building2 } from 'lucide-react'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'

const typeConfig = {
  PDF: { icon: FileText, color: 'rose' },
  Video: { icon: Play, color: 'indigo' },
  Doc: { icon: FileText, color: 'blue' },
  Link: { icon: LinkIcon, color: 'emerald' },
}

export default function ResourceCard({ 
  resource, 
  isUnlocked, 
  onUnlock, 
  onDownload 
}) {
  const config = typeConfig[resource.type || 'PDF']
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100 border border-slate-100 flex flex-col h-full group transition-all hover:border-indigo-500/30 overflow-hidden relative"
    >
      {/* Verification Badge */}
      {resource.is_verified && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl flex items-center gap-1.5 z-10 shadow-lg shadow-emerald-600/20">
          <ShieldCheck size={12} />
          Certified
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 bg-${config.color}-50 text-${config.color}-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Downloads</div>
          <div className="text-lg font-black text-slate-900 leading-none">{resource.download_count || 0}</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 bg-${config.color}-50 text-${config.color}-600 rounded-lg text-[9px] font-black uppercase tracking-widest`}>{resource.type}</span>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">• {resource.subject}</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 font-outfit tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
          {resource.title}
        </h3>
        
        {/* Mentor/Campus Info */}
        <div className="mt-4 flex items-center gap-3">
          <Avatar seed={resource.uploader?.full_name} size="xs" ring />
          <div>
            <div className="text-[10px] font-black text-slate-600 leading-none mb-0.5">{resource.uploader?.full_name || 'Alumnus'}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
              <Building2 size={10} /> {resource.campus?.short_code || 'NIT-N'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Unlock Button */}
      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cost</div>
            <div className="text-lg font-black text-amber-600 leading-none">{resource.karma_cost} Karma</div>
          </div>
        </div>
        
        {isUnlocked ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl px-4 border-2" 
            icon={Download}
            onClick={() => onDownload(resource)}
          >
            Download
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-xl px-4" 
            icon={Lock}
            onClick={() => onUnlock(resource)}
          >
            Unlock File
          </Button>
        )}
      </div>
    </motion.div>
  )
}
