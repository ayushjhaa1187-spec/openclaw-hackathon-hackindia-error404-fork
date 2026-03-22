'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Lock, 
  Download, 
  Trash2, 
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNexus } from '../../../hooks/useNexus';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../lib/toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    updateNexusSettings, 
    updateNotificationPreferences, 
    updatePrivacySettings 
  } = useNexus();

  const [nexusEnabled, setNexusEnabled] = useState(user?.nexus?.crossCampusEnabled || false);
  const [notifs, setNotifs] = useState({
    swaps: user?.notificationPreferences?.swaps ?? true,
    vault: user?.notificationPreferences?.vault ?? true,
    karma: user?.notificationPreferences?.karma ?? true,
    admin: user?.notificationPreferences?.admin ?? true,
  });
  const [privacy, setPrivacy] = useState({
    showOnLeaderboard: user?.privacySettings?.showOnLeaderboard ?? true,
    showKarmaBalance: user?.privacySettings?.showKarmaBalance ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleNexusToggle = async () => {
    const newValue = !nexusEnabled;
    if (!newValue) {
       // Warn on disable
       if (!confirm("Disabling Nexus will hide you from cross-campus searches and cancel any pending cross-campus swap requests. Continue?")) {
         return;
       }
    }
    setNexusEnabled(newValue);
    await updateNexusSettings(newValue);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(notifs);
      await updatePrivacySettings(privacy);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-slate-800 rounded-2xl border border-white/5 shadow-xl">
              <Settings className="text-indigo-400" size={24} />
           </div>
           <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Institutional Settings</h1>
        </div>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] italic ml-14">
          Node Configuration & Privacy Governance
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Section 1: Nexus Connectivity */}
        <section className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-indigo-600 rounded-lg">
                    <Globe className="text-white" size={20} />
                 </div>
                 <div>
                    <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Nexus Cross-Campus Bridge</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Global Institutional Discovery</p>
                 </div>
              </div>
              <button 
                onClick={handleNexusToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${nexusEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${nexusEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
           </div>

           <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4">
              <AlertTriangle className="text-amber-400 shrink-0" size={18} />
              <div className="space-y-1">
                 <p className="text-[11px] text-slate-300 font-medium">
                    When enabled, your profile is visible to students at partner institutions with active MOUs.
                 </p>
                 <p className="text-[9px] text-slate-500 italic">
                    Current active partners: {user?.nexus?.partnerCampusAccess?.join(', ') || 'None (Managed by Admin)'}
                 </p>
              </div>
           </div>
        </section>

        {/* Section 2: Notification Flow */}
        <section className="glass-card p-8 space-y-8">
           <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Bell className="text-indigo-400" size={20} />
              <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Notification Channels</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'swaps', label: 'Skill Swap Lifecycle', desc: 'Requests, acceptances, and completions' },
                { key: 'vault', label: 'Knowledge Vault', desc: 'Resource certifications and purchase alerts' },
                { key: 'karma', label: 'Karma Economy', desc: 'Ledger updates and distribution bonuses' },
                { key: 'admin', label: 'Guardian Alerts', desc: 'Official institutional communications' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group">
                   <div className="space-y-1">
                      <p className="text-[11px] font-black text-white uppercase tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-slate-500 font-medium">{item.desc}</p>
                   </div>
                   <input 
                    type="checkbox"
                    checked={(notifs as any)[item.key]}
                    onChange={(e) => setNotifs({...notifs, [item.key]: e.target.checked})}
                    className="w-5 h-5 rounded border-white/10 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                   />
                </div>
              ))}
           </div>
        </section>

        {/* Section 3: Privacy & Rank */}
        <section className="glass-card p-8 space-y-8">
           <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Lock className="text-indigo-400" size={20} />
              <h3 className="text-white font-black uppercase text-sm italic tracking-tight">Privacy Governance</h3>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight">Public Leaderboard Visibility</p>
                    <p className="text-[9px] text-slate-500 font-medium italic">If disabled, you will not appear in campus or global rankings.</p>
                 </div>
                 <button 
                    onClick={() => setPrivacy({...privacy, showOnLeaderboard: !privacy.showOnLeaderboard})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.showOnLeaderboard ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.showOnLeaderboard ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight">Show Karma Balance on Profile</p>
                    <p className="text-[9px] text-slate-500 font-medium italic">Hides your current karma total from other students.</p>
                 </div>
                 <button 
                  onClick={() => setPrivacy({...privacy, showKarmaBalance: !privacy.showKarmaBalance})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.showKarmaBalance ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.showKarmaBalance ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
           </div>
        </section>

        {/* Section 4: Data & Danger Zone */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card p-6 space-y-4 border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Download size={14} /> Data Portability
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                 Request a comprehensive export of all your institutional interactions, ledger history, and skill profile in JSON format.
              </p>
              <button 
                onClick={() => toast.success('Data export request logged. You will receive an email shortly.')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all italic"
              >
                 Request Data Archive
              </button>
           </div>

           <div className="glass-card p-6 space-y-4 border-rose-500/20 bg-rose-500/5">
              <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                 <Trash2 size={14} /> Account Deletion
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                 Institutional deletion requests are subject to audit logs. Active karma balances will be frozen and MOUs notified.
              </p>
              <button 
                 onClick={() => toast.error('Account deletion requires institutional admin verification.')}
                 className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 transition-all italic"
              >
                 Initiate Deletion Request
              </button>
           </div>
        </section>
      </div>

      {/* Sticky Save Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 z-40 flex justify-center"
      >
         <button 
           onClick={savePreferences}
           disabled={saving}
           className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl flex items-center gap-3 shadow-2xl shadow-indigo-600/20 group transition-all"
         >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} className="group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-black uppercase tracking-widest italic">Save Governance Configuration</span>
         </button>
      </motion.div>
    </div>
  );
}
