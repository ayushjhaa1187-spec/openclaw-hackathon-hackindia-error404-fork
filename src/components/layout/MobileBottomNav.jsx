import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, BookOpen, User, Bell, MessageSquare } from 'lucide-react'

export default function MobileBottomNav() {
  const location = useLocation()
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: BookOpen, label: 'Vault', path: '/vault' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-4 flex items-center justify-between z-50">
      {navItems.map((item, idx) => {
        const isActive = location.pathname.startsWith(item.path)
        return (
          <Link 
            key={idx} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-600 scale-110 font-bold' : 'text-slate-400'}`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium tracking-tighter uppercase">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
