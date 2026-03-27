import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <div className="p-10 text-center">
      <SettingsIcon size={64} className="mx-auto mb-6 text-slate-300" />
      <h1 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Node Settings</h1>
      <p className="text-slate-500">Manage your campus node presence and authentication parameters.</p>
    </div>
  )
}
