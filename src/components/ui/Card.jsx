import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '', 
  hover = true, 
  padding = true,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' } : {}}
      className={`
        bg-white border border-slate-100 rounded-3xl overflow-hidden
        ${padding ? 'p-6' : ''}
        ${hover ? 'transition-all duration-300' : 'shadow-sm'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
