import React from 'react'

export default function Spinner({ size = 'medium', color = 'indigo', fullscreen = false }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }

  const spinner = (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className={`absolute inset-0 rounded-full border-4 border-${color}-100`} />
      <div className={`absolute inset-0 rounded-full border-t-4 border-${color}-600 animate-spin`} />
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-indigo-100 rounded-3xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-indigo-600 font-black text-4xl">E</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {spinner}
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Initializing Nexus Node...</p>
        </div>
      </div>
    )
  }

  return spinner
}
