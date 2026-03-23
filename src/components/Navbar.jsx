import React from 'react'
import { LayoutDashboard, Search, BookOpen, MessageSquare, Shield, Globe, Building2, Bell } from 'lucide-react'

const Navbar = ({ activeTab, setActiveTab, currentCampus }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'explore', icon: Search, label: 'Nexus Explorer' },
    { id: 'vault', icon: BookOpen, label: 'Knowledge Vault' },
    { id: 'chat', icon: MessageSquare, label: 'Collab Room' },
    { id: 'admin', icon: Shield, label: 'Admin Oversight' },
  ]

  return (
    <nav className="glass-nav px-8 py-4 flex items-center justify-between border-white/5">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">E</div>
          <span className="text-2xl font-black tracking-tighter text-white">EduSync</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 rounded-full border border-white/10">
          <Building2 size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-slate-100 uppercase tracking-[0.2em]">{currentCampus}</span>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-3xl">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-500 group ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
            <span className="font-semibold text-sm tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Globe size={20} />
          </button>
        </div>
        
        <button 
          onClick={() => setActiveTab('profile')} 
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1 hover:border-indigo-500 transition-all group overflow-hidden"
        >
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="avatar" 
            className="w-full h-full rounded-lg group-hover:scale-110 transition-transform"
          />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
