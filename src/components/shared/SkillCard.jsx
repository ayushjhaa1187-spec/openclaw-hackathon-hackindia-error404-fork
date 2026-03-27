import React from 'react'
import { motion } from 'framer-motion'
import { Star, Zap, Globe, AlertTriangle, ArrowRight } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

export default function SkillCard({ 
  skill, 
  onOpenDetail, 
  onRequestSwap, 
  onReport 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100 border border-slate-100 flex flex-col h-full group transition-all hover:border-indigo-500/30 overflow-hidden relative"
    >
      {skill.is_nexus && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl flex items-center gap-1.5 z-10 shadow-lg shadow-indigo-600/20">
          <Globe size={12} />
          Nexus Mode
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Avatar seed={skill.mentor} size="md" ring border />
          <div>
            <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{skill.mentor}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{skill.campus}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full ring-1 ring-amber-100/50">
          <Star size={12} fill="currentColor" />
          <span className="text-xs font-black">{skill.avg_rating}</span>
          <span className="text-[10px] opacity-60 font-bold">({skill.total_reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 cursor-pointer" onClick={() => onOpenDetail(skill)}>
        <div className="inline-flex px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tighter mb-3">
          {skill.category}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
          {skill.title}
        </h3>
        
        <div className="flex flex-wrap gap-1.5 mt-4">
          {skill.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cost</div>
            <div className="text-lg font-black text-amber-600 leading-none">{skill.karma_cost} Karma</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onReport?.(skill)}
            className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Report Content"
          >
            <AlertTriangle size={20} />
          </button>
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-xl px-5"
            onClick={() => onRequestSwap(skill)}
          >
            Request Swap
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
