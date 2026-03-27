import { motion } from 'framer-motion'

export default function Spinner({ fullscreen = false, size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  }

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className={`${sizes[size]} border-indigo-200 border-t-indigo-600 rounded-full`}
    />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          {spinner}
          <p className="mt-4 font-medium text-slate-600 animate-pulse">Loading EduSync...</p>
        </div>
      </div>
    )
  }

  return spinner
}
