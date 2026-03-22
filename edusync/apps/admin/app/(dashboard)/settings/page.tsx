'use client';

import React, { useState, useEffect } from 'react';
import { useCampusSettings } from '../../../hooks/useCampusSettings';
import { 
  Settings, Shield, Zap, CreditCard, Users, 
  Save, RefreshCw, AlertTriangle, Info, Plus, 
  Trash2, ExternalLink, ShieldCheck, ShieldAlert,
  Globe, Cpu, Database, Palette, CheckCircle, XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '../../../lib/toast';

export default function CampusSettingsPage() {
  const { 
    settings, adminUsers, loading, error, isDirty, setIsDirty,
    fetchSettings, updateNexusSettings, updateGuardianSettings, 
    updateKarmaSettings, fetchAdminUsers, addAdminUser, removeAdminUser,
    setSettings
  } = useCampusSettings();

  const [activeTab, setActiveTab] = useState<'nexus' | 'guardian' | 'karma' | 'admins' | 'display'>('nexus');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showBulkDisableConfirm, setShowBulkDisableConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAdminUsers();
  }, [fetchSettings, fetchAdminUsers]);

  const handleUpdateNexus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateNexusSettings(settings.nexus);
    } catch (err: any) {
      if (err.message === 'BULK_DISABLE_REQUIRED') {
        setShowBulkDisableConfirm(true);
      }
    }
  };

  const handleConfirmBulkDisable = async () => {
    try {
      await updateNexusSettings({ ...settings.nexus, enabled: false }, true);
      setShowBulkDisableConfirm(false);
    } catch (err) {
      // handled in hook
    }
  };

  const handleUpdateGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGuardianSettings(settings.guardian);
  };

  const handleUpdateKarma = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateKarmaSettings(settings.karma);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    // Note: API expects targetUid, but for UI we might need to resolve email first or assume it's a UID for now.
    // In a real app, you'd probably search for the user first.
    await addAdminUser(newAdminEmail);
    setNewAdminEmail('');
  };

  if (!settings && loading.settings) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Campus Configuration</h1>
          <p className="text-white/40 mt-1">Manage global node behavior and institutional protocols.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={() => fetchSettings()}
             className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading.settings ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'nexus', label: 'Nexus Protocol', icon: Globe, color: 'text-indigo-400' },
            { id: 'guardian', label: 'Guardian AI', icon: Shield, color: 'text-red-400' },
            { id: 'karma', label: 'Karma Economy', icon: CreditCard, color: 'text-emerald-400' },
            { id: 'admins', label: 'Administrators', icon: Users, color: 'text-amber-400' },
            { id: 'display', label: 'Display & Branding', icon: Palette, color: 'text-purple-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                activeTab === item.id 
                ? 'bg-white/10 border-white/10 text-white' 
                : 'bg-transparent border-transparent text-white/40 hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'nexus' && (
            <form onSubmit={handleUpdateNexus} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex items-start justify-between mb-8">
                     <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nexus Inter-Campus Protocol</h2>
                        <p className="text-sm text-white/40 mt-1">Configure how this node interacts with the global campus network.</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${settings.nexus.enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {settings.nexus.enabled ? 'Online' : 'Offline'}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-6 rounded-2xl bg-black/20 border border-white/5">
                        <div className="flex-1 pr-8">
                           <h4 className="text-white font-medium mb-1">Enable Global Discovery</h4>
                           <p className="text-xs text-white/30">Allow students from other campuses to discover skills and resources on this node.</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            setSettings({...settings, nexus: {...settings.nexus, enabled: !settings.nexus.enabled}});
                            setIsDirty(true);
                          }}
                          className={`w-12 h-6 rounded-full transition-all relative ${settings.nexus.enabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.nexus.enabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                           <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Exchange Controls</h4>
                           <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={settings.nexus.autoApproveIntraGroupSwaps}
                                  onChange={(e) => {
                                    setSettings({...settings, nexus: {...settings.nexus, autoApproveIntraGroupSwaps: e.target.checked}});
                                    setIsDirty(true);
                                  }}
                                  className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500/50"
                                />
                                <span className="text-sm text-white/80">Auto-approve intra-group swaps</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={settings.nexus.requireAdminApprovalForCrossCampus}
                                  onChange={(e) => {
                                    setSettings({...settings, nexus: {...settings.nexus, requireAdminApprovalForCrossCampus: e.target.checked}});
                                    setIsDirty(true);
                                  }}
                                  className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500/50"
                                />
                                <span className="text-sm text-white/80">Require admin check for cross-campus</span>
                             </div>
                           </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                           <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Quota Management</h4>
                           <label className="text-[10px] text-white/30 block mb-1">Max Cross-Swaps per Student</label>
                           <input 
                             type="number"
                             value={settings.nexus.maxCrossSwapsPerStudent}
                             onChange={(e) => {
                               setSettings({...settings, nexus: {...settings.nexus, maxCrossSwapsPerStudent: parseInt(e.target.value)}});
                               setIsDirty(true);
                             }}
                             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                     <button 
                       disabled={!isDirty || loading.nexus}
                       className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                     >
                       {loading.nexus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       Save Nexus Protocol
                     </button>
                  </div>
               </div>
            </form>
          )}

          {activeTab === 'guardian' && (
             <form onSubmit={handleUpdateGuardian} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                   <div className="flex items-start justify-between mb-8">
                      <div>
                         <h2 className="text-xl font-bold text-white tracking-tight">Guardian AI Moderation</h2>
                         <p className="text-sm text-white/40 mt-1">Configure automated safety intelligence and community standards.</p>
                      </div>
                      <Shield className="w-8 h-8 text-red-500 opacity-20" />
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-2xl bg-black/20 border border-white/5">
                         <div>
                            <h4 className="text-white font-medium">Real-time AI Screening</h4>
                            <p className="text-xs text-white/30">Automatically flag inappropriate content in swap rooms and resource descriptions.</p>
                         </div>
                         <button 
                           type="button"
                           onClick={() => {
                             setSettings({...settings, guardian: {...settings.guardian, aiModerationEnabled: !settings.guardian.aiModerationEnabled}});
                             setIsDirty(true);
                           }}
                           className={`w-12 h-6 rounded-full transition-all relative ${settings.guardian.aiModerationEnabled ? 'bg-red-600' : 'bg-white/10'}`}
                         >
                           <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.guardian.aiModerationEnabled ? 'left-7' : 'left-1'}`}></div>
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Safety Thresholds</h4>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                               <label className="text-[10px] text-white/30 block mb-2">Auto-Suspend after Flags</label>
                               <div className="flex items-center gap-4">
                                  <input 
                                    type="range" min="1" max="10" 
                                    value={settings.guardian.autoSuspendAfterFlags}
                                    onChange={(e) => {
                                      setSettings({...settings, guardian: {...settings.guardian, autoSuspendAfterFlags: parseInt(e.target.value)}});
                                      setIsDirty(true);
                                    }}
                                    className="flex-1" 
                                  />
                                  <span className="text-xl font-bold text-white">{settings.guardian.autoSuspendAfterFlags}</span>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Custom Keywords</h4>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 min-h-[120px]">
                               <div className="flex flex-wrap gap-2 mb-4">
                                  {settings.guardian.customKeywords?.map((kw: string) => (
                                    <span key={kw} className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                                      {kw}
                                      <Trash2 
                                        className="w-3 h-3 cursor-pointer hover:text-red-300" 
                                        onClick={() => {
                                          setSettings({...settings, guardian: {...settings.guardian, customKeywords: settings.guardian.customKeywords.filter((k: string) => k !== kw)}});
                                          setIsDirty(true);
                                        }}
                                      />
                                    </span>
                                  ))}
                               </div>
                               <input 
                                 type="text" 
                                 placeholder="Add keyword (hit enter)..."
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     const val = (e.target as HTMLInputElement).value;
                                     if (val && !settings.guardian.customKeywords.includes(val)) {
                                       setSettings({...settings, guardian: {...settings.guardian, customKeywords: [...settings.guardian.customKeywords, val]}});
                                       (e.target as HTMLInputElement).value = '';
                                       setIsDirty(true);
                                     }
                                   }
                                 }}
                                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-12 flex justify-end">
                      <button 
                        disabled={!isDirty || loading.guardian}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all font-premium"
                      >
                        {loading.guardian ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update Guardian Rules
                      </button>
                   </div>
                </div>
             </form>
          )}

          {activeTab === 'admins' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                   <div className="flex items-start justify-between mb-8">
                      <div>
                         <h2 className="text-xl font-bold text-white tracking-tight">Institutional Administrators</h2>
                         <p className="text-sm text-white/40 mt-1">Manage users with escalated privileges to oversee this node.</p>
                      </div>
                      <Users className="w-8 h-8 text-amber-500 opacity-20" />
                   </div>

                   <div className="space-y-4 mb-12">
                      {adminUsers.map(admin => (
                         <div key={admin.firebaseUid} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                                 {admin.name[0]}
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-white">{admin.name}</div>
                                  <div className="text-xs text-white/40">{admin.email}</div>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-right hidden md:block">
                                  <div className="text-[10px] text-white/20 uppercase font-bold">Last Active</div>
                                  <div className="text-xs text-white/60">{admin.lastActiveDate ? formatDistanceToNow(new Date(admin.lastActiveDate)) : 'Long ago'} ago</div>
                                </div>
                                <button 
                                  onClick={() => removeAdminUser(admin.firebaseUid)}
                                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                         </div>
                      ))}
                   </div>

                   <form onSubmit={handleAddAdmin} className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-500" />
                        Escalate New Administrator
                      </h4>
                      <div className="flex gap-4">
                         <input 
                           type="text" 
                           value={newAdminEmail}
                           onChange={(e) => setNewAdminEmail(e.target.value)}
                           placeholder="Enter Student Firebase UID..."
                           className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                         />
                         <button 
                           type="submit"
                           disabled={loading.addAdmin}
                           className="px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-lg shadow-amber-600/20"
                         >
                           {loading.addAdmin ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Grant Access'}
                         </button>
                      </div>
                      <p className="text-[10px] text-white/30 mt-3 italic flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        User must be an existing student registered on this campus node.
                      </p>
                   </form>
                </div>
             </div>
          )}

          {activeTab === 'karma' && (
             <div className="h-full flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
                <CreditCard className="w-12 h-12 text-white/10 mb-4" />
                <h3 className="text-lg font-medium text-white/60">Karma Economy Controls</h3>
                <p className="text-white/30 text-sm mt-2">Configure platform fees, bonus amounts for contributions, and minimum stakes for the skill swap protocol.</p>
             </div>
          )}

          {activeTab === 'display' && (
             <div className="h-full flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
                <Palette className="w-12 h-12 text-white/10 mb-4" />
                <h3 className="text-lg font-medium text-white/60">Node Branding</h3>
                <p className="text-white/30 text-sm mt-2">Adjust campus naming and color schemes for a personalized institutional experience.</p>
             </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showBulkDisableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#0f0f13] border border-red-500/30 rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                 <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter">Bulk Nexus Protocol Deactivation</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                 You are about to disable the Nexus Protocol campus-wide. This will immediately terminate all active cross-campus swaps and revoke Nexus access for all {settings.campus} students. This action is irreversible and will be logged to the global transparency ledger.
              </p>
              
              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowBulkDisableConfirm(false)}
                   className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                 >
                   Abort Action
                 </button>
                 <button 
                   onClick={handleConfirmBulkDisable}
                   className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all"
                 >
                   Confirm Deactivation
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
