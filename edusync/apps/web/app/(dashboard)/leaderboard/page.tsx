'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Globe, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '../../../hooks/useLeaderboard';
import { TierBadge } from '../../../components/ui/TierBadge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { 
    students, 
    myRankData, 
    loading, 
    mode, 
    setMode, 
    lastComputed 
  } = useLeaderboard();

  // Split podium and list
  const top3 = students.slice(0, 3);
  const list = students.slice(3);

  // Podium Order layout: 2nd | 1st | 3rd
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                <Trophy className="text-white" size={24} />
             </div>
             <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Nexus Rankings</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] italic ml-14">
            Elite Reputation & Karma Distribution
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl">
            <button
              onClick={() => setMode('campus')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                mode === 'campus' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'
              }`}
            >
              <MapPin size={14} /> Campus
            </button>
            <button
              onClick={() => setMode('global')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                mode === 'global' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Globe size={14} /> Nexus Global
              {!myRankData?.campus && <Info size={12} className="opacity-50" />}
            </button>
          </div>
          {lastComputed && (
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 italic">
               <Clock size={12} /> Sync: {formatDistanceToNow(lastComputed)} ago
             </span>
          )}
        </div>
      </header>

      {/* "My Rank" Highlight Widget */}
      {myRankData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-indigo-500/30 bg-slate-900/40 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Trophy size={120} />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
             <div className="flex items-center gap-6 text-center md:text-left">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Your Position</span>
                  <div className="text-5xl font-black text-white italic tracking-tighter">
                    #{myRankData.rank || '??'}
                  </div>
                </div>
                <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                <div className="space-y-2">
                   <TierBadge tier={myRankData.tier} size="lg" />
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">Current Rank Tier</p>
                </div>
             </div>

             <div className="flex-1 max-w-md w-full space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{myRankData.karma} Karma</span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Next Tier: {myRankData.karmaToNextTier} more</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (myRankData.karma / (myRankData.karma + myRankData.karmaToNextTier)) * 100)}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                   />
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Podium Section */}
      {!loading && top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12">
          {podiumOrder.map((s, idx) => {
            const isFirst = s.karmaRank === 1;
            const isSecond = s.karmaRank === 2;
            const containerHeight = isFirst ? 'h-[360px]' : isSecond ? 'h-[320px]' : 'h-[280px]';
            const medalColor = isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : 'text-orange-400';
            
            return (
              <motion.div
                key={s.uid}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                className={`relative flex flex-col items-center group cursor-pointer`}
              >
                {/* Ranking Hover Badge */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                   <div className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl">
                      <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{s.name}</span>
                   </div>
                </div>

                <Link href={`/dashboard/profile/${hideFirebasePrefix(s.uid)}`} className="relative mb-6">
                   <div className={`w-24 h-24 rounded-3xl overflow-hidden border-4 ${isFirst ? 'border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'border-white/10'} transition-all group-hover:scale-105`}>
                      <img src={s.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} />
                   </div>
                   <div className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-slate-900 border-2 flex items-center justify-center shadow-xl ${isFirst ? 'border-amber-400' : 'border-white/10'}`}>
                      <Trophy className={medalColor} size={18} />
                   </div>
                </Link>

                <div className={`w-full ${containerHeight} glass-card border-white/5 bg-gradient-to-b from-white/10 to-transparent flex flex-col items-center pt-8 space-y-4 shadow-2xl`}>
                   <div className="text-4xl font-black text-white italic tracking-tighter">#{s.karmaRank}</div>
                   <div className="text-center px-4">
                      <h3 className="text-white font-black uppercase text-sm italic tracking-tight mb-1 truncate max-w-[120px]">{s.name}</h3>
                      <p className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.2em]">{s.campus}</p>
                   </div>
                   <div className="flex flex-col items-center gap-3">
                      <TierBadge tier={s.rankTier} size="sm" />
                      <div className="text-xl font-black text-indigo-400 italic tabular-nums">{s.karma}</div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Karma Score</span>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Main Table List */}
      <div className="space-y-4">
         <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Globe className="text-indigo-400" size={18} /> The Leaderboard Stream
         </h2>

         <div className="glass-card border-white/5 bg-slate-900/20 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic bg-white/5">
               <div className="col-span-1">Rank</div>
               <div className="col-span-1">Movement</div>
               <div className="col-span-4 lg:col-span-5">Pioneer Student</div>
               <div className="col-span-2 hidden lg:block text-center">Campus</div>
               <div className="col-span-2 text-center">Tier</div>
               <div className="col-span-2 lg:col-span-1 text-right">Karma</div>
            </div>

            <div className="divide-y divide-white/5">
               {loading ? (
                 Array(10).fill(0).map((_, i) => (
                   <div key={i} className="px-8 py-6 flex items-center gap-6 animate-pulse">
                      <div className="w-8 h-8 bg-white/10 rounded-lg" />
                      <div className="flex-1 h-4 bg-white/5 rounded-full" />
                   </div>
                 ))
               ) : (
                 list.map((s, i) => (
                    <motion.div 
                      key={s.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/5 transition-colors ${s.uid === myRankData?.uid ? 'bg-indigo-500/10 border-indigo-500/20 ring-1 ring-inset ring-indigo-500/20' : ''}`}
                    >
                       <div className="col-span-1 font-black text-white italic tabular-nums">#{s.karmaRank}</div>
                       <div className="col-span-1">
                          {getMovementIcon(s.karmaRank, s.previousRank)}
                       </div>
                       <div className="col-span-4 lg:col-span-5 flex items-center gap-4">
                          <Link href={`/dashboard/profile/${hideFirebasePrefix(s.uid)}`} className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                             <img src={s.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt="" />
                          </Link>
                          <span className="text-xs font-black text-white uppercase italic tracking-tight truncate">{s.name}</span>
                       </div>
                       <div className="col-span-2 hidden lg:block text-center text-[10px] font-bold text-slate-500 uppercase italic truncate">{s.campus}</div>
                       <div className="col-span-2 flex justify-center">
                          <TierBadge tier={s.rankTier} size="sm" showLabel={false} />
                       </div>
                       <div className="col-span-2 lg:col-span-1 text-right text-sm font-black text-indigo-400 tabular-nums italic">{s.karma}</div>
                    </motion.div>
                 ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

const hideFirebasePrefix = (uid: string) => uid.replace('user:', '');

const getMovementIcon = (current: number, previous: number | null) => {
  if (previous === null) return <Minus size={14} className="text-slate-600" />;
  if (current < previous) return <TrendingUp size={14} className="text-emerald-400" />;
  if (current > previous) return <TrendingDown size={14} className="text-rose-400" />;
  return <Minus size={14} className="text-slate-600" />;
};
