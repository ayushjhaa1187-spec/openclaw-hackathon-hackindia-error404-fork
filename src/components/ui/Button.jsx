import { motion } from 'framer-motion'
import Spinner from './Spinner'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  disabled = false,
  ...props 
}) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-200',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-200',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-200',
    white: 'bg-white text-indigo-600 hover:bg-slate-50 shadow-lg'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl font-semibold',
    lg: 'px-8 py-4 text-lg rounded-2xl font-bold'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden transition-colors flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
    </motion.button>
  )
}
