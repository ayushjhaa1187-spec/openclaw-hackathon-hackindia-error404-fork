import React from 'react'
import { Bell } from 'lucide-react'

export default function Notifications() {
  return (
    <div className="p-10 text-center">
      <Bell size={64} className="mx-auto mb-6 text-slate-300" />
      <h1 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Nexus Feed</h1>
      <p className="text-slate-500">Real-time alerts for skill swaps and institutional announcements.</p>
    </div>
  )
}
