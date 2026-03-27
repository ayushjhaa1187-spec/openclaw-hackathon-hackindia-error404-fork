import React from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'

export default function Avatar({ src, name, seed, size = 'md', border = false, ring = false, className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-32 h-32'
  }

  const avatarUrl = src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || name || 'default'}`

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      <div className={`
        w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center
        ${border ? 'border border-slate-200 shadow-sm' : ''}
        ${ring ? 'ring-2 ring-indigo-500/20' : ''}
      `}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name || 'User Avatar'} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'fallback'}` }}
          />
        ) : (
          <User className="text-slate-400" size={size === 'xs' ? 12 : 20} />
        )}
      </div>
    </div>
  )
}
