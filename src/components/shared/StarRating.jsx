import { Star } from 'lucide-react'

export default function StarRating({ rating, count }) {
  const fullStars = Math.floor(rating || 0)
  const hasHalf = (rating % 1) >= 0.5

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            fill={i < fullStars ? "#fbbf24" : "none"} 
            stroke={i < fullStars ? "#fbbf24" : "#cbd5e1"} 
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs font-bold text-slate-400">({count} reviews)</span>
      )}
    </div>
  )
}
