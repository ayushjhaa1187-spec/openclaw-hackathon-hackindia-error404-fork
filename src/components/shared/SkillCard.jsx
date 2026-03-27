import { Zap, Star } from 'lucide-react'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'
import StarRating from './StarRating'
import CampusBadge from './CampusBadge'
import KarmaChip from './KarmaChip'

export default function SkillCard({ skill, onClick, onAction }) {
  const { title, category, mentor, mentor_id, campus, campus_id, karma_cost, avg_rating, total_reviews, is_nexus, tags } = skill

  return (
    <Card className="flex flex-col h-full group">
       <div className="flex justify-between items-start mb-4">
          <Badge variant={is_nexus ? 'purple' : 'indigo'} className="uppercase font-black tracking-widest text-[10px]">
            {is_nexus && <Zap size={10} className="mr-1 fill-current" />}
            {category}
          </Badge>
          <KarmaChip amount={karma_cost} />
       </div>

       <div className="flex-1 cursor-pointer" onClick={onClick}>
          <h3 className="text-xl font-outfit font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
            {title}
          </h3>
          <div className="flex flex-wrap gap-1 mb-4">
             {tags?.map(tag => <Badge key={tag} variant="slate" size="sm" className="font-bold opacity-70">#{tag}</Badge>)}
          </div>
          <StarRating rating={avg_rating} count={total_reviews} />
       </div>

       <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Avatar size="sm" name={mentor} />
             <div className="leading-tight">
                <p className="text-xs font-black text-slate-900 truncate max-w-[100px]">{mentor}</p>
                <CampusBadge campus={campus} size="sm" />
             </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onAction && onAction(skill); }}
            className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
             <Zap size={18} />
          </button>
       </div>
    </Card>
  )
}
