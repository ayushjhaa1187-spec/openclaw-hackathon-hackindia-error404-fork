import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Search, Filter, BookIcon, Upload, CheckCircle, Unlock, Download, FileText, Play, File, Zap, Info } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import CampusBadge from '../components/shared/CampusBadge'
import KarmaChip from '../components/shared/KarmaChip'

export default function Vault() {
  const { profile, user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ['vault-resources', search, filter],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select('*, profiles:uploader_id(full_name, avatar_url), campuses(name)')
        .eq('status', 'approved')
      
      if (search) query = query.ilike('title', `%${search}%`)
      if (filter !== 'All') query = query.eq('type', filter)
      
      const { data, error } = await query
      if (error) throw error

      // Get user unlocks
      const { data: unlocks } = await supabase
        .from('resource_unlocks')
        .select('resource_id')
        .eq('user_id', user.id)

      const unlockedIds = new Set(unlocks?.map(u => u.resource_id) || [])
      
      return data.map(r => ({
        ...r,
        isUnlocked: unlockedIds.has(r.id) || r.uploader_id === user.id
      }))
    },
    enabled: !!user
  })

  const handleUnlock = async (resource) => {
    if (profile.karma_balance < resource.karma_cost) {
      toast.error('Insufficient Karma balance.')
      return
    }

    try {
      // 1. Insert unlock
      const { error: unlockError } = await supabase.from('resource_unlocks').insert([
        { resource_id: resource.id, user_id: user.id, karma_spent: resource.karma_cost }
      ])
      if (unlockError) throw unlockError

      // 2. Debit Karma
      const { error: karmaError } = await supabase.from('profiles')
        .update({ karma_balance: profile.karma_balance - resource.karma_cost })
        .eq('id', user.id)
      if (karmaError) throw karmaError
      
      // 3. Increment download count (for popularity)
      await supabase.rpc('increment_download_count', { row_id: resource.id })

      toast.success(`Successfully unlocked "${resource.title}"!`)
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return <BookIcon size={24} className="text-rose-500" />
      case 'Doc': return <FileText size={24} className="text-indigo-500" />
      case 'Video': return <Play size={24} className="text-purple-500" />
      default: return <File size={24} className="text-slate-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 md:pb-10 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight leading-none mb-4 uppercase">The Knowledge Vault.</h1>
           <p className="text-slate-500 font-medium">Earn Karma by sharing notes. Spend it to unlock verified resources from mentors across the Nexus.</p>
        </div>
        <Button className="h-14 rounded-2xl px-10 shadow-indigo-600/20 shadow-xl group">
           <Upload size={20} className="mr-2 group-hover:-translate-y-1 transition-transform" />
           Share Resource
        </Button>
      </header>

      {/* FILTER SEARCH */}
      <Card className="p-2 bg-white/50 border border-slate-200 shadow-xl mb-12 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-2">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Find study guides, lab manuals, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl focus:border-indigo-600 outline-none font-bold text-slate-700 placeholder:text-slate-400"
              />
           </div>
           
           <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl">
              {['All', 'PDF', 'Doc', 'Video', 'Link'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3,4,5,6].map(i => <div key={i} className="w-full h-64 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : resources?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
           {resources.map((res, idx) => (
             <motion.div
               key={res.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
             >
                <Card className="flex flex-col h-full group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                         {getTypeIcon(res.type)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {res.is_verified && <Badge variant="emerald" className="animate-pulse shadow-xl shadow-emerald-50"><CheckCircle size={10} className="mr-1" /> Admin Verified</Badge>}
                        <KarmaChip amount={res.karma_cost} />
                      </div>
                   </div>

                   <div className="flex-1">
                      <h3 className="text-xl font-outfit font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{res.title}</h3>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 inline-flex items-center gap-1">
                        <span className="text-slate-300">Subject:</span> {res.subject}
                      </p>
                      <div className="mb-6">
                         <CampusBadge campus={res.campuses?.name} size="sm" />
                      </div>
                   </div>

                   <div className="mt-4 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Avatar size="sm" name={res.profiles?.full_name} seed={res.profiles?.full_name} src={res.profiles?.avatar_url} />
                         <div className="leading-tight">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1">Uploaded by</p>
                            <p className="text-xs font-black text-slate-900 leading-none">{res.profiles?.full_name?.split(' ')[0]}</p>
                         </div>
                      </div>
                      
                      {res.isUnlocked ? (
                         <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white group">
                            <Download size={14} className="mr-2 group-hover:translate-y-0.5 transition-transform" />
                            Download
                         </Button>
                      ) : (
                         <Button size="sm" onClick={() => handleUnlock(res)} className="group">
                            <Unlock size={14} className="mr-2 group-hover:scale-110 transition-transform" />
                            Unlock ({res.karma_cost})
                         </Button>
                      )}
                   </div>
                </Card>
             </motion.div>
           ))}
        </div>
      ) : (
        <div className="py-24 text-center">
           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
             <Info size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase">Your search came up empty.</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Try different keywords or be the first to contribute to this category.</p>
           <Button variant="ghost" className="font-bold text-indigo-600 underline" onClick={() => { setSearch(''); setFilter('All'); }}>Reset All Filters</Button>
        </div>
      )}
    </div>
  )
}
