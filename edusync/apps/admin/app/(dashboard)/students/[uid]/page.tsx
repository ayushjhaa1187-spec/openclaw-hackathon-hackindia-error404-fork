'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudentDetail } from '../../../../hooks/useStudentDetail';
import { 
  ArrowLeft, User, Shield, ShieldAlert, ShieldCheck, 
  History, BookOpen, CreditCard, Activity, AlertTriangle,
  Mail, Calendar, MapPin, Award, TrendingUp, TrendingDown,
  Clock, CheckCircle, XCircle, Info, MoreHorizontal,
  MessageSquare, Star, ArrowUpRight, ArrowDownRight,
  UserX, UserMinus, ShieldOff, Heart, RefreshCw, ChevronRight, Search
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from '../../../../lib/toast';

export default function StudentDetailPage() {
  const { uid } = useParams();
  const router = useRouter();
  const { 
    student, loading, error, fetchStudentDetail, 
    updateModerationStatus, clearRecord, fetchSwapHistory, fetchFlagHistory 
  } = useStudentDetail();

  const [activeTab, setActiveTab] = useState<'overview' | 'swaps' | 'resources' | 'flags' | 'karma'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModerationAction, setShowModerationAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState(7);

  // History states
  const [swapHistory, setSwapHistory] = useState<any[]>([]);
  const [flagHistory, setFlagHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (uid) fetchStudentDetail(uid as string);
  }, [uid, fetchStudentDetail]);

  const loadHistories = useCallback(async () => {
    if (!uid) return;
    setHistoryLoading(true);
    try {
      const [swaps, flags] = await Promise.all([
        fetchSwapHistory(uid as string),
        fetchFlagHistory(uid as string)
      ]);
      setSwapHistory(swaps);
      setFlagHistory(flags);
    } catch (err) {
      console.error('History Load Error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [uid, fetchSwapHistory, fetchFlagHistory]);

  useEffect(() => {
    if (activeTab === 'swaps' || activeTab === 'flags') {
      loadHistories();
    }
  }, [activeTab, loadHistories]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStudentDetail(uid as string);
    if (activeTab === 'swaps' || activeTab === 'flags') await loadHistories();
    setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const executeAction = async () => {
    if (!showModerationAction) return;
    if (showModerationAction === 'clear_record') {
       if (actionReason.length < 10) return toast.error('Reason required (avg 10 chars)');
       await clearRecord(uid as string, actionReason);
       setShowModerationAction(null);
       setActionReason('');
       return;
    }

    if (actionReason.length < 10) {
      toast.error('Please provide a reason (min 10 characters)');
      return;
    }

    try {
      await updateModerationStatus(uid as string, showModerationAction, {
        reason: actionReason,
        durationDays: showModerationAction === 'suspend' ? suspensionDuration : undefined
      });
      setShowModerationAction(null);
      setActionReason('');
    } catch (err) {
      // toast handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good_standing': 
        return <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">Good Standing</span>;
      case 'warning':
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">Warning Issued</span>;
      case 'suspended':
        return <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase">Suspended</span>;
      case 'banned':
        return <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-red-500 text-xs font-bold uppercase">Banned</span>;
      default:
        return null;
    }
  };

  if (loading && !student) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <UserX className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Student Not Found</h2>
        <p className="text-white/40 mb-8 max-w-sm">The student record could not be retrieved. They may be from another campus or the ID is invalid.</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">{student.profile.name}</h1>
              {getStatusBadge(student.moderation.currentStatus)}
            </div>
            <div className="flex items-center gap-4 mt-1 text-white/40 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {student.profile.campus}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {student.profile.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {student.moderation.currentStatus === 'good_standing' ? (
            <>
              <button 
                onClick={() => setShowModerationAction('warn')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium whitespace-nowrap"
              >
                <ShieldAlert className="w-4 h-4" /> Warn Student
              </button>
              <button 
                onClick={() => setShowModerationAction('suspend')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium whitespace-nowrap"
              >
                <Clock className="w-4 h-4" /> Suspend
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowModerationAction('reinstate')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" /> Reinstate Student
            </button>
          )}
          {student.moderation.currentStatus !== 'banned' && (
            <button 
              onClick={() => setShowModerationAction('ban')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-600/30 text-red-500 hover:bg-red-600/30 transition-all text-sm font-medium whitespace-nowrap"
            >
              <UserX className="w-4 h-4" /> Full Ban
            </button>
          )}
          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Quick Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <div className="flex items-center justify-between mb-2">
             <CreditCard className="w-4 h-4 text-indigo-400" />
             <div className="text-[10px] text-white/20 uppercase font-bold">Karma balance</div>
           </div>
           <div className="text-xl font-bold text-white">{student.karma.balance}</div>
           <div className="text-xs text-white/40 mt-1 capitalize">{student.karma.tier} Tier • #{student.karma.rank}</div>
        </div>
        <div className="p-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <div className="flex items-center justify-between mb-2">
             <Activity className="w-4 h-4 text-emerald-400" />
             <div className="text-[10px] text-white/20 uppercase font-bold">Completion Rate</div>
           </div>
           <div className="text-xl font-bold text-white">{student.swaps.completionRate}%</div>
           <div className="text-xs text-white/40 mt-1">{student.swaps.completed} of {student.swaps.total} swaps</div>
        </div>
        <div className="p-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <div className="flex items-center justify-between mb-2">
             <BookOpen className="w-4 h-4 text-amber-400" />
             <div className="text-[10px] text-white/20 uppercase font-bold">Resouce Trust</div>
           </div>
           <div className="text-xl font-bold text-white">{Math.round((student.resources.certified / (student.resources.total || 1)) * 100)}%</div>
           <div className="text-xs text-white/40 mt-1">{student.resources.certified} certified uploads</div>
        </div>
        <div className="p-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
           <div className="flex items-center justify-between mb-2">
             <AlertTriangle className={`w-4 h-4 ${student.moderation.totalFlags > 0 ? 'text-red-400' : 'text-white/20'}`} />
             <div className="text-[10px] text-white/20 uppercase font-bold">Risk Level</div>
           </div>
           <div className={`text-xl font-bold ${student.moderation.totalFlags > 5 ? 'text-red-500' : student.moderation.totalFlags > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
             {student.moderation.totalFlags > 5 ? 'High' : student.moderation.totalFlags > 0 ? 'Medium' : 'Low'}
           </div>
           <div className="text-xs text-white/40 mt-1">{student.moderation.totalFlags} lifetime flags</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'swaps', label: 'Swap History', icon: History },
            { id: 'resources', label: 'Resources', icon: BookOpen },
            { id: 'flags', label: 'Flag History', icon: ShieldAlert },
            { id: 'karma', label: 'Karma Ledger', icon: CreditCard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-all text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-xl shadow-indigo-500/20">
                    {student.profile.name[0]}
                  </div>
                  <h3 className="text-xl font-bold text-white">{student.profile.name}</h3>
                  <p className="text-white/40 text-sm">{student.profile.specialization || 'System User'}</p>
                </div>

                <div className="mt-8 space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-white/30 uppercase font-bold tracking-widest">Department</span>
                      <span className="text-sm text-white/80">{student.profile.department || 'N/A'}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-white/30 uppercase font-bold tracking-widest">Academic Year</span>
                      <span className="text-sm text-white/80">{student.profile.year}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-white/30 uppercase font-bold tracking-widest">Account Age</span>
                      <span className="text-sm text-white/80">{formatDistanceToNow(new Date(student.profile.createdAt))}</span>
                   </div>
                   <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-white/30 uppercase font-bold tracking-widest">Onboarding</span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase border border-indigo-500/20">
                         {student.profile.onboardingStatus}
                      </span>
                   </div>
                </div>
              </div>

              {/* Skills Card */}
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                 <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-tighter">Verified Skills</h4>
                 <div className="flex flex-wrap gap-2">
                    {student.profile.skills?.length > 0 ? (
                      student.profile.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs">
                           {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/20 italic text-xs">No skills listed yet.</span>
                    )}
                 </div>
              </div>
            </div>

            {/* Right Column: Timeline & Moderation Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Moderation History */}
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Shield className="w-5 h-5 text-indigo-400" />
                     Administrative Action History
                   </h3>
                   {student.moderation.totalFlags > 0 && (
                     <button 
                       onClick={() => setShowModerationAction('clear_record')}
                       className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-4"
                     >
                       Clear Risk Flags
                     </button>
                   )}
                </div>

                <div className="space-y-4">
                  {student.moderation.priorAdminActions?.length > 0 ? (
                    student.moderation.priorAdminActions.map((action: any) => (
                      <div key={action.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          action.action_type.includes('ban') || action.action_type.includes('suspend') 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-white uppercase tracking-tighter">
                                {action.action_type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-white/30">
                                {format(new Date(action.created_at), 'MMM dd, yyyy HH:mm')}
                              </span>
                           </div>
                           <p className="text-xs text-white/60 mt-1 italic">"{action.reason}"</p>
                           <div className="mt-2 text-[10px] text-white/20 font-medium">
                             ACTION BY ADMIN: {action.admin_uid}
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 text-white/20">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      No administrative actions recorded. Record is clean.
                    </div>
                  )}
                </div>
              </div>

              {/* Nexus Configuration */}
              <div className="p-6 rounded-3xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Nexus Connectivity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Cross-Campus Swaps</span>
                        {student.nexus.crossCampusEnabled ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-white">
                        {student.nexus.crossCampusEnabled ? 'ACCESS GRANTED' : 'ACCESS RESTRICTED'}
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Nexus Credits</span>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        {student.nexus.nexusCredits || 0} NX
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'swaps' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             {historyLoading && <div className="p-12 text-center text-white/20">Loading swaps...</div>}
             {!historyLoading && swapHistory.length === 0 && (
               <div className="p-20 text-center rounded-3xl border border-dashed border-white/10 text-white/20">No swap activity found.</div>
             )}
             {!historyLoading && swapHistory.map(swap => (
               <div key={swap._id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                       swap.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                       swap.status === 'canceled' ? 'bg-red-500/10 text-red-400' :
                       'bg-indigo-500/10 text-indigo-400'
                     }`}>
                       {swap.status}
                     </span>
                     <span className="text-[10px] text-white/20">{format(new Date(swap.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div>
                        <h4 className="text-white font-medium">{swap.skill}</h4>
                        <p className="text-xs text-white/40 mt-0.5">
                          {swap.requesterUid === uid ? 'Requested From: ' : 'Provided To: '}
                          {swap.requesterUid === uid ? swap.providerUid : swap.requesterUid}
                        </p>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-white">{swap.karmaStaked} Karma</div>
                        <div className="text-[10px] text-indigo-400 uppercase font-bold">{swap.isCrossCampus ? 'Cross-Campus' : 'Local'}</div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
             {student.resources.recent.length === 0 && (
               <div className="col-span-full p-20 text-center rounded-3xl border border-dashed border-white/10 text-white/20">No resources uploaded.</div>
             )}
             {student.resources.recent.map((res: any) => (
               <div key={res._id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <BookOpen className="w-5 h-5" />
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                       res.status === 'certified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                     }`}>
                       {res.status}
                     </span>
                  </div>
                  <h4 className="text-white font-bold mb-1 truncate">{res.title}</h4>
                  <p className="text-xs text-white/40 line-clamp-2 mb-4">"{res.description}"</p>
                  <div className="flex items-center justify-between text-[10px] text-white/20 font-bold uppercase tracking-widest">
                     <span>{res.category}</span>
                     <span>{format(new Date(res.createdAt), 'MMM yyyy')}</span>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'flags' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             {historyLoading && <div className="p-12 text-center text-white/20">Loading flags...</div>}
             {!historyLoading && flagHistory.length === 0 && (
               <div className="p-20 text-center rounded-3xl border border-dashed border-white/10 text-white/20">Clean history. No flags found.</div>
             )}
             {!historyLoading && flagHistory.map(flag => (
               <div key={flag._id} className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">{flag.flagType.replace('_', ' ')}</span>
                     </div>
                     <span className="text-[10px] text-white/20">{format(new Date(flag.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <p className="text-sm text-white/60 italic mt-1">"{flag.flaggedContent}"</p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 uppercase font-bold tracking-widest">
                     <span>Source: {flag.sourceEntityType}</span>
                     <span>Detection: {flag.detectionMethod}</span>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'karma' && (
          <div className="space-y-3 animate-in fade-in duration-500">
             {student.karma.history.map((tx: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                         {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                         <div className="text-sm font-medium text-white">{tx.reason}</div>
                         <div className="text-[10px] text-white/20">{format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}</div>
                      </div>
                   </div>
                   <div className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Moderation Modal Overlay */}
      {showModerationAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#0f0f13] border border-white/10 rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                 {showModerationAction === 'suspend' ? <Clock className="w-6 h-6 text-red-500" /> : 
                  showModerationAction === 'ban' ? <UserX className="w-6 h-6 text-red-600" /> :
                  showModerationAction === 'warn' ? <AlertTriangle className="w-6 h-6 text-amber-500" /> :
                  showModerationAction === 'reinstate' ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> :
                  <ShieldCheck className="w-6 h-6 text-indigo-500" />}
                 {showModerationAction === 'clear_record' ? 'Clear Student Record' : 
                  showModerationAction.charAt(0).toUpperCase() + showModerationAction.slice(1) + ' Student'}
              </h3>
              
              <p className="text-white/40 text-sm mb-6">
                 {showModerationAction === 'suspend' ? 'Student will be unable to access the platform for the specified period. All active swaps will be canceled and refunded.' :
                  showModerationAction === 'ban' ? 'Permanent revocation of platform access. This action triggers immediate cross-campus notification via Nexus protocol.' :
                  showModerationAction === 'warn' ? 'Issued when community standards are violated but no severe bridge of safety occurred.' :
                  showModerationAction === 'reinstate' ? 'Restores student to good standing and removes all access blocks.' :
                  'This resets the numerical flag count for social metrics but preserves the permanent audit trail.'}
              </p>

              {showModerationAction === 'suspend' && (
                <div className="mb-6">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-3">Suspension Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[7, 14, 30, 90].map(days => (
                      <button
                        key={days}
                        onClick={() => setSuspensionDuration(days)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          suspensionDuration === days 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Internal Reason / Justification</label>
                <textarea 
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide detailed reasoning for this institutional action..."
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span className="text-[10px] text-white/20 mt-1 block">Min 10 characters required. Logged to PostgreSQL audit ledger.</span>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowModerationAction(null)}
                   className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={executeAction}
                   className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
                     showModerationAction === 'ban' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' :
                     showModerationAction === 'reinstate' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                     'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                   }`}
                 >
                   Confirm {showModerationAction === 'clear_record' ? 'Reset' : showModerationAction.charAt(0).toUpperCase() + showModerationAction.slice(1)}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
