import Badge from '../ui/Badge'

export default function CampusBadge({ campus, size = 'sm' }) {
  if (!campus) return null
  
  const campusColors = {
    'Northvale Institute of Technology': 'indigo',
    'Deccan Engineering University': 'emerald',
    'Vistara College of Science & Tech': 'amber',
    'Indravali Technical University': 'purple',
    'Sahyadri Institute of Advanced Studies': 'rose',
    'NIT-N': 'indigo',
    'DEU': 'emerald',
    'VCST': 'amber',
    'ITU': 'purple',
    'SIAS': 'rose'
  }

  const color = campusColors[campus] || 'slate'
  
  return (
    <Badge variant={color} size={size} className="font-black uppercase tracking-widest text-[9px]">
      {campus}
    </Badge>
  )
}
