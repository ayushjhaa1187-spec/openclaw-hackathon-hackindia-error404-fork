export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  seed = ''
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  }

  const avatarUrl = src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || name || 'default'}`

  return (
    <div className={`
      relative rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex-shrink-0
      ${sizes[size]} ${className}
    `}>
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'E'}`
        }}
      />
    </div>
  )
}
