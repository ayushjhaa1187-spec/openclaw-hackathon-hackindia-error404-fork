import { useState, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Search, SlidersHorizontal, Globe, MapPin, Zap, Info, ChevronDown } from 'lucide-react'
import { CATEGORIES } from '../utils/constants'
import { useAuthStore } from '../stores/authStore'
import SkillCard from '../components/shared/SkillCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 9

export default function Explore() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [nexusMode, setNexusMode] = useState(false)
  const [sort, setSort] = useState('newest')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['skills', nexusMode, category, search, sort],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('skills')
        .select('*, profiles(full_name, avatar_url, campuses(name))', { count: 'exact' })
        .eq('status', 'active')
        .range(pageParam, pageParam + PAGE_SIZE - 1)

      if (!nexusMode && profile?.campus_id) {
        query = query.eq('campus_id', profile.campus_id)
      } else if (nexusMode) {
        query = query.eq('is_nexus', true)
      }

      if (category !== 'All') {
        query = query.eq('category', category)
      }

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      if (sort === 'newest') query = query.order('created_at', { ascending: false })
      else if (sort === 'rating') query = query.order('avg_rating', { ascending: false })
      else if (sort === 'karma_asc') query = query.order('karma_cost', { ascending: true })

      const { data: skills, count, error } = await query
      if (error) throw error
      return { skills, nextCursor: skills.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null, count }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!profile
  })

  const allSkills = useMemo(() => data?.pages.flatMap(page => page.skills) || [], [data])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* FILTER BAR - Sticky */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 shadow-sm shadow-slate-200/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search skills, topics, or mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-400 placeholder:font-bold"
              />
           </div>

           <div className="flex gap-2 w-full md:w-auto h-12 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setNexusMode(false)}
                className={`flex-1 md:flex-none px-6 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${!nexusMode ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <MapPin size={14} /> My Campus
              </button>
              <button 
                onClick={() => setNexusMode(true)}
                className={`flex-1 md:flex-none px-6 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${nexusMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Globe size={14} /> Nexus Mode
              </button>
           </div>
           
           <select 
             value={sort}
             onChange={(e) => setSort(e.target.value)}
             className="h-12 px-6 bg-white border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer appearance-none shadow-sm"
           >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="karma_asc">Lowest Karma</option>
           </select>
        </div>

        {/* Categories Scroller */}
        <div className="max-w-7xl mx-auto mt-4 overflow-x-auto no-scrollbar py-2">
           <div className="flex gap-2 min-w-max">
              {['All', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="w-full h-80 bg-slate-100 rounded-3xl animate-pulse p-8 flex flex-col justify-end gap-4 shadow-sm">
                  <div className="w-2/3 h-6 bg-slate-200 rounded-full" />
                  <div className="w-1/2 h-4 bg-slate-200 rounded-full" />
               </div>
             ))}
           </div>
        ) : allSkills.length > 0 ? (
           <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <AnimatePresence mode="popLayout">
                {allSkills.map((skill, idx) => (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx % 9 * 0.05 }}
                  >
                    <SkillCard 
                      skill={{
                        ...skill,
                        mentor: skill.profiles?.full_name,
                        campus: skill.profiles?.campuses?.name
                      }}
                      onClick={() => navigate(`/explore/skill/${skill.id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {hasNextPage && (
              <div className="text-center pb-24">
                <Button 
                  variant="outline" 
                  size="lg" 
                  loading={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className="rounded-full px-12"
                >
                  Load More Skills
                </Button>
              </div>
            )}
           </>
        ) : (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-32 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-8 border border-white">
                <Search size={48} className="rotate-12" />
             </div>
             <h2 className="text-3xl font-outfit font-black text-slate-900 mb-4 tracking-tight leading-none uppercase">No skills match your search.</h2>
             <p className="text-slate-500 font-medium max-w-sm mb-12">Try different keywords or clear filters to find what you're looking for.</p>
             <div className="flex gap-4">
                <Button onClick={() => { setSearch(''); setCategory('All'); setNexusMode(false); }}>Reset All Filters</Button>
                {/* Auto Switch to Nexus */}
                {!nexusMode && <Button variant="outline" onClick={() => setNexusMode(true)}>Try Nexus Mode</Button>}
             </div>
           </motion.div>
        )}
      </div>
    </div>
  )
}
