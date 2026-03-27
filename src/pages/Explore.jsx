import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Globe, X, Zap, ArrowRight, Star } from 'lucide-react'
import { toast } from 'sonner'
import { MOCK_SKILLS, MOCK_CAMPUSES } from '../data/mockData'
import SkillCard from '../components/shared/SkillCard'
import SwapRequestModal from '../components/shared/SwapRequestModal'
import Button from '../components/ui/Button'

const CATEGORIES = ['All', 'Coding', 'Electronics', 'Design', 'Mechanical', 'Math', 'Languages', 'Robotics']

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [isNexusMode, setIsNexusMode] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSkillForSwap, setSelectedSkillForSwap] = useState(null)
  
  const filteredSkills = useMemo(() => {
    return MOCK_SKILLS.filter(skill => {
      const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = activeCategory === 'All' || skill.category === activeCategory
      
      return matchesSearch && matchesCategory && (isNexusMode ? true : !skill.is_nexus)
    })
  }, [searchQuery, activeCategory, isNexusMode])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 lg:pb-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter mb-2">Explore the Nexus</h1>
          <p className="text-slate-500 font-medium">Find students ready to share their knowledge.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, tags, or mentors..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-xl shadow-slate-100/50"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-2xl border flex items-center gap-2 font-bold transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 shadow-xl shadow-slate-100/50'}`}
          >
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>
      </div>

      {/* Categories & Nexus Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-black transition-all border whitespace-nowrap
                ${activeCategory === cat 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-indigo-50 p-2 rounded-2xl border border-indigo-100 self-start md:self-auto min-w-[200px] justify-between">
          <div className="flex items-center gap-3 pl-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isNexusMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-100 text-indigo-400'}`}>
              <Globe size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-0.5">Federation</div>
              <div className="text-sm font-black text-indigo-900 leading-none">Nexus Mode</div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsNexusMode(!isNexusMode)
              if (!isNexusMode) toast.info('Expanding search to all partner campuses! 🌎')
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${isNexusMode ? 'bg-indigo-600' : 'bg-indigo-200'}`}
          >
            <motion.div 
              animate={{ x: isNexusMode ? 26 : 4 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" 
            />
          </button>
        </div>
      </div>

      {/* Advanced Filters (Animated Panel) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-4">Partner Campus</label>
                <div className="space-y-2">
                  {MOCK_CAMPUSES.map(campus => (
                    <label key={campus.id} className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{campus.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-4">Karma Cost Range</label>
                <div className="px-2">
                  <input type="range" min="0" max="500" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400">
                    <span>0 KARMA</span>
                    <span>500 KARMA</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <Button variant="secondary" onClick={() => setShowFilters(false)} fullWidth>Apply Filters</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredSkills.map((skill) => (
          <SkillCard 
            key={skill.id} 
            skill={skill} 
            onOpenDetail={() => {}} 
            onRequestSwap={(s) => setSelectedSkillForSwap(s)}
            onReport={() => toast.warning('Report submitted for admin review.')}
          />
        ))}
        
        {filteredSkills.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit">No skills found</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Try adjusting your filters or search keywords to find what you're looking for.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('All'); setIsNexusMode(true); }}>Reset All Filters</Button>
          </div>
        )}
      </div>

      {/* Infinite Scroll Indicator */}
      {filteredSkills.length > 0 && (
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-full text-slate-400 text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Showing {filteredSkills.length} Verified Nexus Listings
          </div>
        </div>
      )}

      {/* Swap Request Modal */}
      <AnimatePresence>
        {selectedSkillForSwap && (
          <SwapRequestModal 
            skill={selectedSkillForSwap} 
            onClose={() => setSelectedSkillForSwap(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
