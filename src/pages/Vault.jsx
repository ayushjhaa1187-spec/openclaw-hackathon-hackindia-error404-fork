import React from 'react'
import { BookOpen } from 'lucide-react'

export default function Vault() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
          <BookOpen />
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-outfit">Knowledge Vault</h1>
      </div>
      <p className="text-slate-500 max-w-lg mb-12">
        Access verified academic assets from across the Nexus.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50 grayscale select-none pointer-events-none">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
      <div className="mt-12 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold tracking-widest uppercase">Nexus Integration in Progress</p>
      </div>
    </div>
  )
}
