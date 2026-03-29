import React, { useState } from 'react'
import { 
  User, Lock, Bell, Shield, Trash2, 
  Camera, Check, Save, AlertCircle, ChevronRight 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import Button from '../components/ui/Button'

const SettingSection = ({ id, icon: Icon, title, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={22} className={active ? 'text-white' : 'text-slate-400'} />
    <span className="font-bold flex-1 text-left">{title}</span>
    <ChevronRight size={18} className={active ? 'text-white' : 'text-slate-300'} />
  </button>
)

const InputGroup = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-2 mb-6">
    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
      placeholder={placeholder}
    />
  </div>
)

export default function Settings() {
  const { profile, user, updateProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  
  // Local form state
  const [name, setName] = useState(profile?.full_name || '')
  const [department, setDepartment] = useState(profile?.department || '')
  const [newPassword, setNewPassword] = useState('')

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // Logic for updating profile in Supabase would go here via updateProfile store action
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulation
      toast.success('Settings synchronized with the Nexus.')
    } catch (error) {
      toast.error('Failed to update node settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure? This will purge your Karma and identity from the Nexus. This action is irreversible.')) {
      toast.error('Account deletion requested. This requires campus moderator approval.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 font-outfit uppercase tracking-tighter mb-2">Node Settings</h1>
        <p className="text-slate-500 font-medium">Configure your platform experience and security parameters.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT COLLUMN: Tabs */}
        <aside className="lg:w-80 space-y-2">
          <SettingSection id="profile" icon={User} title="Public Profile" active={activeTab === 'profile'} onClick={setActiveTab} />
          <SettingSection id="account" icon={Lock} title="Security & Auth" active={activeTab === 'account'} onClick={setActiveTab} />
          <SettingSection id="notifications" icon={Bell} title="System Alerts" active={activeTab === 'notifications'} onClick={setActiveTab} />
          <SettingSection id="privacy" icon={Shield} title="Data Privacy" active={activeTab === 'privacy'} onClick={setActiveTab} />
          <div className="h-px bg-slate-100 my-6" />
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-4 p-5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold group"
          >
            <Trash2 size={22} className="group-hover:rotate-12 transition-transform" />
            <span>Purge Account</span>
          </button>
        </aside>

        {/* RIGHT COLUMN: Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm"
              >
                <div className="flex flex-col md:flex-row items-center gap-10 mb-12 border-b border-slate-50 pb-12">
                  <div className="relative group">
                    <div className="w-40 h-40 bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl group-hover:opacity-80 transition-opacity">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'avatar'}`} 
                        alt="" 
                      />
                    </div>
                    <button className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all">
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{profile?.full_name || 'Anonymous Student'}</h2>
                    <p className="text-slate-500 font-medium mb-6">{profile?.campus_id || 'Campus Node Pending'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100">
                        {profile?.role || 'Student'}
                      </div>
                      <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100">
                        {profile?.karma_balance || 0} Karma Points
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <InputGroup label="Display Name" value={name} onChange={setName} placeholder="How others see you" />
                  <InputGroup label="Department / Stream" value={department} onChange={setDepartment} placeholder="e.g. Computer Science" />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button variant="outline" size="lg" className="rounded-2xl">Cancel</Button>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    isLoading={isSaving}
                    onClick={handleSaveProfile}
                    className="rounded-2xl px-10"
                  >
                    Sync Profile <Save size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-sm"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Authentication Node</h3>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Email</div>
                        <div className="font-bold text-slate-700">{user?.email}</div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider">Verified</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Update Password</h3>
                    <InputGroup label="Current Password" type="password" placeholder="••••••••" value="" onChange={() => {}} />
                    <InputGroup label="New Password" type="password" placeholder="Min 8 characters" value={newPassword} onChange={setNewPassword} />
                    <Button variant="secondary" className="rounded-2xl">Update Password</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeTab === 'notifications' || activeTab === 'privacy') && (
              <motion.div
                key="other"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-indigo-500">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Expansion Pending</h3>
                <p className="text-slate-500">Tier 2 node configuration will be available in the next Nexus update.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
