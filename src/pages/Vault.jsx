import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, SlidersHorizontal, Plus, 
  FileText, Play, Link as LinkIcon, 
  ShieldCheck, AlertTriangle, CloudUpload, 
  Filter, X, Star, History, Info
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vaultService } from '../services/vaultService'
import { useAuthStore } from '../stores/authStore'
import ResourceCard from '../components/shared/ResourceCard'
import UploadResourceModal from '../components/shared/UploadResourceModal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const TYPES = ['All', 'PDF', 'Video', 'Doc', 'Link']
const SUBJECTS = ['All', 'Data Structures', 'Algorithms', 'VLSI Design', 'Digital Logic', 'Marketing Strategy', 'UX Design', 'Thermodynamics', 'Machine Learning']

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [activeSubject, setActiveSubject] = useState('All')
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()

  // 1. Fetch Resources
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['vault', activeType, activeSubject],
    queryFn: () => vaultService.getResources({ type: activeType, subject: activeSubject }),
  })

  // 2. Unlock Mutation
  const unlockMutation = useMutation({
    mutationFn: ({ resourceId, cost }) => vaultService.unlockResource(resourceId, profile.id, cost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] }) // Refresh balance
      toast.success('Resource unlocked! Accessible in your downloads.')
    },
    onError: (err) => toast.error(err.message)
  })

  // 3. Filters
  const filteredResources = useMemo(() => {
    if (!resources) return []
    return resources.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [resources, searchQuery])

  if (isLoading) return <Spinner fullscreen />

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-24 lg:pb-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none">Marketplace</span>
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">• Admin Certified</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter mb-2">Knowledge Vault</h1>
          <p className="text-slate-500 font-medium italic">Verified academic resources from top-tier students.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, topics, or authors..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-xl shadow-slate-100/50"
            />
          </div>
          <Button 
            className="rounded-2xl h-[58px]" 
            icon={Plus} 
            onClick={() => setShowUploadModal(true)}
          >
            Contribute
          </Button>
        </div>
      </div>

      {/* Type & Subject Filters */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`
                px-5 py-2.5 rounded-xl text-xs font-black transition-all border whitespace-nowrap uppercase tracking-widest
                ${activeType === type 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}
              `}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-slate-500">
            <Filter size={14} />
          </div>
          {SUBJECTS.map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`
                px-5 py-2 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap uppercase tracking-tighter
                ${activeSubject === sub 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}
              `}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Banner */}
      <div className="mb-12 bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Info size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Karma-Verified Economy</h4>
            <p className="text-xs text-slate-500 font-medium">Earn +50 Karma for every resource that gets certified by campus admin.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={History} className="text-[10px]">Unlock History</Button>
          <Button variant="secondary" size="sm" icon={ShieldCheck} className="text-[10px]">Certification Guide</Button>
        </div>
      </div>

      {/* Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredResources.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              isUnlocked={false} // Would check against resource_unlocks table in real app
              onUnlock={(r) => unlockMutation.mutate({ resourceId: r.id, cost: r.karma_cost })}
              onDownload={(r) => toast.info(`Initializing secure download for ${r.title}...`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
            <FileText size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 font-outfit uppercase tracking-tighter">Vault Empty</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
            No resources match your filters. Be the first to contribute and earn Karma!
          </p>
          <Button variant="primary" size="lg" icon={CloudUpload} onClick={() => setShowUploadModal(true)}>Upload First Resource</Button>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadResourceModal 
            onClose={() => setShowUploadModal(false)} 
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['vault'] })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
