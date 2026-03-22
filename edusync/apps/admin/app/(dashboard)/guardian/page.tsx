'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGuardian } from '../../../hooks/useGuardian';
import { 
  ShieldAlert, ShieldCheck, UserX, UserMinus, 
  MessageSquare, BookOpen, AlertCircle, RefreshCw,
  Clock, CheckCircle, Info, ChevronRight, Filter,
  TrendingDown, TrendingUp, Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '../../../lib/toast';

export default function GuardianMonitor() {
  const { flags, stats, loading, fetchFlags, fetchStats, resolveFlag, undoResolution, getFlagDetails } = useGuardian();
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [flagDetails, setFlagDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchFlags();
    fetchStats();
  }, [fetchFlags, fetchStats]);

  const handleSelectFlag = async (id: string) => {
    setSelectedFlagId(id);
    setDetailsLoading(true);
    try {
      const details = await getFlagDetails(id);
      setFlagDetails(details);
      setResolutionNotes('');
    } catch (err) {
      toast.error('Failed to load flag details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleResolve = async (action: string) => {
    if (!selectedFlagId) return;
    if (!resolutionNotes && action !== 'no_action') {
      toast.error('Please provide resolution notes.');
      return;
    }

    try {
      await resolveFlag(selectedFlagId, action, resolutionNotes);
      setSelectedFlagId(null);
      setFlagDetails(null);
    } catch (err) {
      // toast handled in hook
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Guardian AI Monitor
          </h1>
          <p className="text-white/40 mt-1">Real-time institutional safety and moderation intelligence.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium text-white/60">Live Feed Active</span>
          </div>
        </div>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Flags', value: stats?.pendingFlags || 0, icon: AlertCircle, color: 'text-red-400' },
          { label: 'Flags Today', value: stats?.flagsToday || 0, icon: Clock, color: 'text-amber-400' },
          { label: 'Flagged Users', value: stats?.flaggedUsers || 0, icon: UserMinus, color: 'text-orange-400' },
          { label: 'Total Scanned', value: stats?.totalFlags || 0, icon: ShieldCheck, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className="text-xs text-white/20 font-medium uppercase tracking-tighter">Institutional</div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Flag Queue */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-semibold text-white">Priority Queue</h3>
            <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filter
            </button>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {flags.length === 0 && !loading && (
              <div className="p-8 text-center rounded-3xl border border-dashed border-white/10 text-white/20">
                Institutional queue clean. No pending flags.
              </div>
            )}
            
            {flags.map((flag) => (
              <button
                key={flag._id}
                onClick={() => handleSelectFlag(flag._id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedFlagId === flag._id 
                  ? 'bg-indigo-600/20 border-indigo-500/50 scale-[1.02]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border border-dashed font-bold uppercase ${getSeverityColor(flag.severity)}`}>
                    {flag.severity}
                  </span>
                  <span className="text-[10px] text-white/30 uppercase font-medium">
                    {flag.detectionMethod.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white truncate mb-1">
                  {flag.flagType.replace('_', ' ')}: {flag.sourceEntityType}
                </h4>
                <p className="text-xs text-white/40 line-clamp-2 italic">"{flag.flaggedContent}"</p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-white/20">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(flag.createdAt))} ago
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Flag Detail / Resolution */}
        <div className="lg:col-span-2">
          {!selectedFlagId ? (
            <div className="h-full flex flex-col items-center justify-center p-12 rounded-3xl border border-white/10 bg-white/5 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Select a Flag to Review</h3>
              <p className="text-white/40 mt-2 max-w-xs">
                Examine flagged content, AI confidence scores, and involved student histories before taking institutional action.
              </p>
            </div>
          ) : detailsLoading ? (
             <div className="h-full flex items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {/* Flag Info Header */}
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                 <div className="flex items-start justify-between mb-6">
                    <div>
                       <span className={`text-xs px-2 py-1 rounded-lg border font-bold uppercase ${getSeverityColor(flagDetails?.flag?.severity)}`}>
                         {flagDetails?.flag?.severity} Priority
                       </span>
                       <h2 className="text-2xl font-bold text-white mt-4">
                         {flagDetails?.flag?.flagType.replace('_', ' ').toUpperCase()} Resolution
                       </h2>
                       <p className="text-white/40 text-sm mt-1">Detected via {flagDetails?.flag?.detectionMethod.replace('_', ' ')}</p>
                    </div>
                    {flagDetails?.flag?.status === 'actioned' && (
                       <button 
                        onClick={() => undoResolution(selectedFlagId)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                       >
                         Undo Resolution (5m window)
                       </button>
                    )}
                 </div>

                 <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-6">
                    <div className="text-xs text-white/20 uppercase font-bold tracking-widest mb-3">Flagged Content</div>
                    <p className="text-white italic text-lg leading-relaxed">
                      "{flagDetails?.flag?.flaggedContent}"
                    </p>
                    {flagDetails?.flag?.aiAnalysisReason && (
                       <div className="mt-4 pt-4 border-t border-white/5">
                          <div className="text-xs text-indigo-400 uppercase font-bold mb-2">Gemini Analysis Reasoning</div>
                          <p className="text-sm text-white/60">{flagDetails?.flag?.aiAnalysisReason}</p>
                       </div>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <span className="text-xs text-white/30 block mb-1">Source Entity</span>
                       <span className="text-white font-medium flex items-center gap-2">
                         {flagDetails?.flag?.sourceEntityType === 'swap_room' ? <MessageSquare className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                         {flagDetails?.flag?.sourceEntityId}
                       </span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <span className="text-xs text-white/30 block mb-1">Campus Node</span>
                       <span className="text-white font-medium">{flagDetails?.flag?.campus}</span>
                    </div>
                 </div>
              </div>

              {/* Student Context */}
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                 <h3 className="text-lg font-semibold text-white mb-4">Involved Students</h3>
                 <div className="space-y-3">
                    {flagDetails?.involvement?.students?.map((student: any) => (
                       <div key={student.firebaseUid} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {student.name[0]}
                             </div>
                             <div>
                                <div className="text-sm font-medium text-white">{student.name}</div>
                                <div className="text-xs text-white/40">{student.email}</div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className={`text-[10px] font-bold uppercase ${
                               student.moderation?.status === 'good_standing' ? 'text-emerald-400' : 'text-red-400'
                             }`}>
                                {student.moderation?.status.replace('_', ' ')}
                             </div>
                             <div className="text-[10px] text-white/30">{student.moderation?.flags || 0} lifetime flags</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Resolution Controls */}
              <div className="p-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl">
                 <h3 className="text-lg font-semibold text-white mb-4">Institutional Resolution</h3>
                 <textarea
                   value={resolutionNotes}
                   onChange={(e) => setResolutionNotes(e.target.value)}
                   placeholder="Enter administrative justification for this action..."
                   className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-6"
                 />

                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleResolve('no_action')}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 text-sm font-medium border border-white/10 transition-all"
                    >
                       <ShieldCheck className="w-4 h-4 text-emerald-400" />
                       Dismiss Flag
                    </button>
                    <button 
                      onClick={() => handleResolve('warning_issued')}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-amber-500/20 text-white rounded-xl py-3 text-sm font-medium border border-white/10 hover:border-amber-500/50 transition-all"
                    >
                       <Info className="w-4 h-4 text-amber-400" />
                       Issue Warning
                    </button>
                    <button 
                      onClick={() => handleResolve('content_removed')}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-orange-500/20 text-white rounded-xl py-3 text-sm font-medium border border-white/10 hover:border-orange-500/50 transition-all"
                    >
                       <UserMinus className="w-4 h-4 text-orange-400" />
                       Remove Content
                    </button>
                    <button 
                      onClick={() => handleResolve('swap_terminated')}
                      className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-3 text-sm font-medium border border-red-500/20 transition-all"
                    >
                       <ShieldAlert className="w-4 h-4" />
                       Terminate Swap
                    </button>
                    <button 
                      onClick={() => handleResolve('student_suspended')}
                      className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-200 rounded-xl py-3 text-sm font-medium border border-red-600/30 transition-all"
                    >
                       <Clock className="w-4 h-4" />
                       Suspend (7d)
                    </button>
                    <button 
                       onClick={() => handleResolve('student_banned')}
                       className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 text-sm font-medium shadow-lg shadow-red-600/20 transition-all"
                    >
                       <UserX className="w-4 h-4" />
                       Ban Student
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
