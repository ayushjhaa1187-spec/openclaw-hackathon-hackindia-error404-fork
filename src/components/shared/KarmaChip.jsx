import { Zap } from 'lucide-react'
import Badge from '../ui/Badge'

export default function KarmaChip({ amount, size = 'md' }) {
  return (
    <Badge variant="amber" size={size} className="gap-1 font-black">
      <Zap size={10} className="fill-current" />
      {amount}
    </Badge>
  )
}
