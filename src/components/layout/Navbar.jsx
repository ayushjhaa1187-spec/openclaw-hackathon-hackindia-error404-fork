import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Bell, Search, MessageSquare, LogOut, User, LayoutDashboard, Compass, BookOpen, Shield } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

export default function Navbar() {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black overflow-hidden shadow-indigo-200 shadow-lg">
            E
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
            EduSync
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={`text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors`}>Dashboard</Link>
          <Link to="/explore" className={`text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors`}>Explore</Link>
          <Link to="/vault" className={`text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors`}>Vault</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className={`text-rose-500 hover:text-rose-600 font-black text-xs uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5`}>
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/notifications" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all relative">
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
          </Link>
          <Link to="/chat" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all">
            <MessageSquare size={22} />
          </Link>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

          <Link to="/profile" className="flex items-center gap-2 group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {profile?.full_name?.split(' ')[0] || 'Student'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {profile?.campuses?.short_code || 'NIT-N'}
              </p>
            </div>
            <Avatar size="sm" src={profile?.avatar_url} name={profile?.full_name} seed={profile?.full_name} />
          </Link>
          
          <button 
            onClick={() => { signOut(); navigate('/login'); }}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-full transition-all ml-1"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}
