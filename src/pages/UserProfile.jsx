import React from 'react'
import { User } from 'lucide-react'

export default function UserProfile() {
  return (
    <div className="p-10 text-center">
      <User size={64} className="mx-auto mb-6 text-slate-300" />
      <h1 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Student Profile</h1>
      <p className="text-slate-500">Retrieving nexus member identity...</p>
    </div>
  )
}
