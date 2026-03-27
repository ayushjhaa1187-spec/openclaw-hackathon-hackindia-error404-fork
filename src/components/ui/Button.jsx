import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseClasses = 'flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none'
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-50 active:scale-95',
    outline: 'bg-transparent border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-95',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95',
  }

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${widthClass} 
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} 
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <>
          {Icon && <Icon size={size === 'xs' ? 14 : 20} />}
          {children}
        </>
      )}
    </motion.button>
  )
}
