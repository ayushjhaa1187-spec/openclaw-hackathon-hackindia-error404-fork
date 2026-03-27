import React from 'react'
import { ShieldAlert } from 'lucide-react'

export default function Admin() {
  return (
    <div className="p-10 text-center">
      <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
        <ShieldAlert size={40} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter mb-4">Nexus Core Control</h1>
      <p className="text-slate-500 max-w-sm mx-auto mb-12">Institutional oversight panel. Only accessible by registered college moderators.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-30 grayscale pointer-events-none select-none">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
        ))}
      </div>
    </div>
  )
}
