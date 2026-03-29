import { Bell, Search, MessageSquare, LogOut, User, LayoutDashboard, Compass, BookOpen, Shield, Settings, HelpCircle, ChevronDown } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useState } from 'react'

export default function Navbar() {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

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

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 group p-1 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                  {profile?.full_name?.split(' ')[0] || 'Student'}
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  {profile?.campus_id || 'NODE-1'}
                </p>
              </div>
              <Avatar size="sm" src={profile?.avatar_url} name={profile?.full_name} seed={profile?.full_name} />
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-3xl shadow-2xl py-3 z-20 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                  <div className="px-5 py-3 border-b border-slate-50">
                    <p className="text-sm font-black text-slate-900 truncate uppercase mt-1 tracking-tighter">{profile?.full_name}</p>
                    <p className="text-xs text-slate-400 font-bold truncate">{profile?.email || 'Student Portal'}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link to="/dashboard" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/explore" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <Compass size={18} /> Explore Skills
                    </Link>
                    <Link to="/vault" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <BookOpen size={18} /> Knowledge Vault
                    </Link>
                    <Link to="/chat" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <MessageSquare size={18} /> Messages
                    </Link>
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <User size={18} /> My Profile
                    </Link>
                  </div>

                  <div className="h-px bg-slate-50 mx-4 my-1" />

                  <div className="py-2">
                    <Link to="/campus-charter" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <Shield size={16} /> Campus Charter
                    </Link>
                    <Link to="/honor-code" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <BookOpen size={16} /> Honor Code
                    </Link>
                    <Link to="/help" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-xs text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <HelpCircle size={16} /> Help Center
                    </Link>
                  </div>

                  <div className="h-px bg-slate-50 mx-4 my-1" />

                  <div className="py-2">
                    <Link to="/settings" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                      <Settings size={18} /> Node Settings
                    </Link>
                    <button 
                      onClick={() => { signOut(); navigate('/login'); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rose-500 font-black uppercase tracking-widest hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
