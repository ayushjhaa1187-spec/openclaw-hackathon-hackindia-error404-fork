import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Shield, CheckCircle, XCircle, AlertTriangle, Users, BookOpen, Clock, Activity, Search, Filter, MessageSquare, Zap, Star } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

export default function Admin() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('resources')
  const [search, setSearch] = useState('')

  const { data: pendingResources, isLoading: resLoading, refetch: refetchRes } = useQuery({
    queryKey: ['admin-pending-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*, uploader:profiles!uploader_id(full_name, avatar_url), campus:campuses(name)')
        .eq('status', 'pending')
      if (error) throw error
      return data
    }
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*, campus:campuses(name)')
      if (search) query = query.ilike('full_name', `%${search}%`)
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  const approveResource = async (id) => {
    const { error } = await supabase.from('resources').update({ status: 'approved', is_verified: true }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Resource verified and live in Nexus Vault.')
      refetchRes()
    }
  }

  const rejectResource = async (id) => {
     const { error } = await supabase.from('resources').update({ status: 'rejected' }).eq('id', id)
     if (error) toast.error(error.message)
     else {
        toast.success('Resource entry flagged and rejected.')
        refetchRes()
     }
  }

  if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return (
       <div className="h-screen flex items-center justify-center p-6 bg-slate-950 text-white font-sans text-center">
          <div className="max-w-md space-y-6">
             <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl shadow-rose-600/30">
                <Shield size={40} />
             </div>
             <h1 className="text-4xl font-outfit font-black uppercase tracking-tighter">Access Denied.</h1>
             <p className="text-slate-400 font-medium leading-relaxed italic">"The Nexus Council only admits those with official administrative clearance. Return to safe space."</p>
             <Link to="/dashboard" className="block"><Button className="w-full h-16 rounded-2xl">Return to Sanctuary</Button></Link>
          </div>
       </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32 md:pb-12 font-sans bg-slate-50 min-h-screen">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
                <Badge variant="rose" size="lg" className="bg-rose-500 text-white border-none shadow-lg shadow-rose-500/20 font-black uppercase tracking-widest text-[9px]">Admin Nexus Protocol</Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest"><Activity size={12} className="text-emerald-500 animate-pulse" /> Signal Stable</div>
             </div>
             <h1 className="text-5xl font-outfit font-black text-slate-900 tracking-tighter uppercase leading-none">Command Center.</h1>
             <p className="mt-4 text-slate-500 font-medium max-w-xl">Supervising cross-campus knowledge flow, verifying academic assets, and managing student identities.</p>
          </div>
          
          <div className="flex gap-4 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl w-full md:w-auto overflow-x-auto no-scrollbar">
             {[
                { id: 'resources', label: 'Vault Moderation', icon: BookOpen },
                { id: 'users', label: 'Student Directory', icon: Users },
                { id: 'reports', label: 'Incident Reports', icon: AlertTriangle }
             ].map(t => (
                <button
                   key={t.id}
                   onClick={() => setTab(t.id)}
                   className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all min-w-max ${tab === t.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
                >
                   <t.icon size={16} /> {t.label}
                </button>
             ))}
          </div>
       </header>

       <AnimatePresence mode="wait">
          {tab === 'resources' && (
             <motion.div 
                key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
             >
                <div className="flex justify-between items-center mb-10 px-4">
                   <h2 className="text-2xl font-outfit font-black text-slate-900 uppercase">Pending Approvals <span className="text-indigo-600 opacity-30 ml-2">({pendingResources?.length || 0})</span></h2>
                   <Button variant="ghost" className="text-slate-400 group h-12 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl px-6">Refresh Stream <Clock size={16} className="ml-2 group-hover:rotate-180 transition-transform duration-500" /></Button>
                </div>

                {resLoading ? (
                   <div className="flex justify-center py-20"><Spinner /></div>
                ) : pendingResources?.length > 0 ? (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {pendingResources.map(res => (
                         <Card key={res.id} className="p-8 group bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                            <div className="flex gap-6 relative z-10">
                               <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                     <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="indigo" size="sm" className="bg-indigo-50 border-none text-indigo-600 px-3">{res.type}</Badge>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Subject: {res.subject}</span>
                                     </div>
                                     <h3 className="text-2xl font-outfit font-black text-slate-900 uppercase tracking-tighter leading-[1.1] mb-6 group-hover:text-indigo-600 transition-colors">{res.title}</h3>
                                     <div className="flex items-center gap-3 mb-8">
                                        <Avatar size="sm" src={res.uploader?.avatar_url} name={res.uploader?.full_name} seed={res.uploader?.full_name} />
                                        <div className="leading-tight">
                                           <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Uploaded by</p>
                                           <p className="text-xs font-black text-slate-800 leading-none uppercase">{res.uploader?.full_name} · {res.campus?.name}</p>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="flex gap-3">
                                     <Button onClick={() => approveResource(res.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl shadow-xl shadow-emerald-600/20 uppercase font-black text-xs tracking-widest"><CheckCircle size={18} className="mr-2" /> Verify Asset</Button>
                                     <Button onClick={() => rejectResource(res.id)} variant="outline" className="flex-1 h-14 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white border-none uppercase font-black text-xs tracking-widest"><XCircle size={18} className="mr-2" /> Flag & Reject</Button>
                                  </div>
                               </div>
                               <div className="w-1/3 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                                  <BookOpen size={40} className="text-slate-200 mb-2" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preview Hub</span>
                               </div>
                            </div>
                         </Card>
                      ))}
                   </div>
                ) : (
                   <div className="bg-white border-2 border-dashed border-slate-200 py-32 rounded-[40px] text-center max-w-2xl mx-auto shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                         <Shield size={32} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tighter mb-2">Vault Queue Clear.</h4>
                      <p className="text-slate-500 font-medium">All student contributions have been processed and verified.</p>
                   </div>
                )}
             </motion.div>
          )}

          {tab === 'users' && (
             <motion.div 
               key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
               className="space-y-10"
             >
                <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
                   <div className="relative flex-1 w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                         type="text" 
                         placeholder="Registry search by name, campus, or department..."
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         className="w-full h-14 pl-16 pr-6 bg-white border border-slate-200 rounded-3xl outline-none focus:border-indigo-600 font-bold uppercase text-xs tracking-widest text-slate-600 shadow-sm"
                      />
                   </div>
                   <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white flex items-center gap-2 uppercase font-black text-xs tracking-widest"><Filter size={16} /> Audit Filters</Button>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nexus Student</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Campus Identity</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Karma Assets</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol Role</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {usersLoading ? (
                            [1,2,3].map(i => <tr key={i}><td colSpan="5" className="p-10"><Spinner /></td></tr>)
                         ) : users?.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                               <td className="px-10 py-6">
                                  <div className="flex items-center gap-4">
                                     <Avatar size="md" src={u.avatar_url} name={u.full_name} seed={u.full_name} />
                                     <div>
                                        <p className="font-outfit font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{u.full_name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 leading-none">{u.department} · Year {u.year_of_study}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <Badge variant="slate" className="bg-slate-100 border-none font-black text-[9px] uppercase tracking-widest text-slate-500">{u.campus?.name}</Badge>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex items-center gap-2">
                                     <Star size={12} className="text-amber-500 fill-current" />
                                     <span className="font-outfit font-black text-slate-900">{u.karma_balance}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <Badge variant={u.role === 'admin' ? 'rose' : 'indigo'} size="sm" className="font-black uppercase tracking-widest text-[8px]">{u.role}</Badge>
                               </td>
                               <td className="px-6 py-6 text-right">
                                  <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><Shield size={18} /></button>
                                  <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><MessageSquare size={18} /></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  )
}
