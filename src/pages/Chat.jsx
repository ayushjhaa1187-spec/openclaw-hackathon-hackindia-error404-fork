import React from 'react'
import { MessageSquare } from 'lucide-react'

export default function Chat() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
        <MessageSquare size={32} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit">Nexus Bridge Chat</h1>
      <p className="text-slate-500 max-w-sm mb-8">
        Real-time inter-campus messaging is initializing.
      </p>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden opacity-40 grayscale pointer-events-none">
        <div className="bg-indigo-600 p-4" />
        <div className="p-8 space-y-4">
          <div className="w-1/2 h-4 bg-slate-100 rounded" />
          <div className="w-3/4 h-4 bg-slate-100 rounded ml-auto" />
          <div className="w-1/2 h-4 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  )
}
