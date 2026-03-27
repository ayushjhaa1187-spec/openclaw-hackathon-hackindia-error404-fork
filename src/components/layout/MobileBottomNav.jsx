import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, BookOpen, MessageSquare, User } from 'lucide-react'

export default function MobileBottomNav() {
  const location = useLocation()
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: BookOpen, label: 'Vault', path: '/vault' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-10 h-1 bg-indigo-600 rounded-b-full"></div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
