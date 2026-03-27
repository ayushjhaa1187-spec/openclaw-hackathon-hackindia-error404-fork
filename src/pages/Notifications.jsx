import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Bell, Zap, Star, MessageSquare, AlertCircle, Trash2, Check, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function Notifications() {
  const { user } = useAuthStore()

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
    if (!error) refetch()
  }

  const deleteNotification = async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (!error) refetch()
  }

  const getTypeStyles = (type) => {
    switch (type) {
      case 'swap_request': return { icon: Zap, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' }
      case 'karma': return { icon: Star, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' }
      case 'message': return { icon: MessageSquare, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' }
      default: return { icon: Bell, color: 'slate', bg: 'bg-slate-50', text: 'text-slate-600' }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 md:pb-12 font-sans min-h-screen">
      <div className="flex justify-between items-end mb-12">
        <div>
           <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight leading-none mb-4 uppercase">The Feed.</h1>
           <p className="text-slate-500 font-medium">Your nexus activity, karma alerts, and swap updates.</p>
        </div>
        <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 h-10 px-4 bg-indigo-50 border border-indigo-100 rounded-xl transition-all">Mark all as read</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : notifications?.length > 0 ? (
        <div className="space-y-3">
           <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => {
                 const { icon: Icon, bg, text } = getTypeStyles(notif.type)
                 return (
                    <motion.div
                       key={notif.id}
                       layout
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className={`relative p-6 rounded-[32px] border transition-all flex items-center gap-6 group hover:translate-x-1 ${notif.is_read ? 'bg-white border-slate-100' : 'bg-white border-indigo-200 shadow-lg shadow-indigo-100 group shadow-lg shadow-indigo-50/50'}`}
                    >
                       {!notif.is_read && <div className="absolute top-6 right-8 w-2 h-2 bg-indigo-600 rounded-full animate-ping" />}
                       
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${text} shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon size={24} />
                       </div>

                       <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 leading-none mb-1 uppercase tracking-tight text-base">{notif.title}</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed truncate group-hover:block transition-all">{notif.body}</p>
                          <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                             <Clock size={12} /> {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                       </div>

                       <div className="flex gap-2">
                          <Link to={notif.link || '/dashboard'}>
                             <Button variant="ghost" className="h-10 w-10 !p-0 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50"><ChevronRight size={20} /></Button>
                          </Link>
                          <button onClick={() => deleteNotification(notif.id)} className="h-10 w-10 flex items-center justify-center text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                       </div>
                    </motion.div>
                 )
              })}
           </AnimatePresence>
        </div>
      ) : (
        <div className="py-24 text-center">
           <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Bell size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">Your Nexus is Quiet.</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium leading-relaxed italic">"Silence is just the discovery between actions." — You haven't received any alerts yet.</p>
           <Link to="/explore">
              <Button>Start Discovering Skills</Button>
           </Link>
        </div>
      )}
    </div>
  )
}
