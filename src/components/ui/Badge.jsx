export default function Badge({ 
  children, 
  variant = 'indigo', 
  className = '',
  size = 'md'
}) {
  const variants = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  return (
    <span className={`
      inline-flex items-center font-bold tracking-tight rounded-full border
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  )
}
