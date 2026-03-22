'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Filter, 
  AlertCircle, 
  ArrowLeft,
  Calendar,
  Zap,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, Notification } from '../../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markRead, 
    markAllRead, 
    fetchNotifications 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'swap' | 'resource' | 'karma'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'swap') return n.type.startsWith('swap_');
    if (filter === 'resource') return n.type.startsWith('resource_');
    if (filter === 'karma') return n.type.startsWith('karma_');
    return true;
  });

  const getIcon = (type: string) => {
    if (type.startsWith('swap_')) return <Zap className="text-indigo-400" size={18} />;
    if (type.startsWith('resource_')) return <BookOpen className="text-emerald-400" size={18} />;
    if (type.startsWith('karma_')) return <DollarSign className="text-amber-400" size={18} />;
    if (type === 'guardian_warning') return <AlertCircle className="text-rose-400" size={18} />;
    return <Bell className="text-slate-400" size={18} />;
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markRead(n._id);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Nexus Alerts</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] italic ml-12">
            Institutional Pulse & Event Stream
            {unreadCount > 0 && (
               <span className="ml-3 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full animate-pulse">
                 {unreadCount} Unread
               </span>
            )}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Mark All Read
          </button>
        )}
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {(['all', 'unread', 'swap', 'resource', 'karma'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === t 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                key={n._id}
              >
                <Link 
                  href={n.actionUrl}
                  onClick={() => handleNotificationClick(n)}
                  className={`block glass-card p-6 border transition-all hover:translate-x-1 ${
                    n.isRead 
                      ? 'bg-slate-900/40 border-white/5 opacity-70' 
                      : 'bg-slate-900/60 border-indigo-500/30 ring-1 ring-indigo-500/10'
                  }`}
                >
                  <div className="flex gap-6 items-start">
                    <div className={`p-4 rounded-2xl border transition-all ${
                      n.isRead ? 'bg-white/5 border-white/10' : 'bg-indigo-500/10 border-indigo-500/20'
                    }`}>
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-black text-sm uppercase tracking-tight italic">
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} /> {formatDistanceToNow(new Date(n.createdAt))} ago
                        </span>
                      </div>
                      <p className={`text-xs italic leading-relaxed ${n.isRead ? 'text-slate-500' : 'text-slate-300'}`}>
                        {n.body}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-30">
              <Clock size={48} className="text-slate-700 mb-6" />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] italic">The Stream is Quiet</p>
              <p className="text-slate-600 text-[10px] mt-2 italic uppercase font-bold tracking-widest">
                {filter === 'unread' ? "You're all caught up" : "No Nexus events recorded yet"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {loading && notifications.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
           <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic animate-pulse">Syncing Alerts...</p>
        </div>
      )}
    </div>
  );
}
