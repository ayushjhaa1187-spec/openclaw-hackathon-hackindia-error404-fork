'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Settings, 
  Users, 
  ShieldCheck, 
  Building2, 
  FileText, 
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Globe,
  AlertTriangle
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/analytics', icon: LayoutDashboard },
  { label: 'Super Admin', href: '/dashboard/super-admin', icon: ShieldCheck },
  { label: 'College Groups', href: '/dashboard/super-admin/groups', icon: Users },
  { label: 'Group Intel', href: '/dashboard/analytics/group', icon: Globe },
  { label: 'Institutional MOUs', href: '/dashboard/mou', icon: ShieldCheck },
  { label: 'Students', href: '/dashboard/students', icon: Users },
  { label: 'Guardian Monitor', href: '/dashboard/guardian', icon: ShieldCheck },
  { label: 'Error Monitor', href: '/dashboard/errors', icon: AlertTriangle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const CAMPUSES = [
  { id: 'IIT_JAMMU', name: 'IIT Jammu' },
  { id: 'IIT_DELHI', name: 'IIT Delhi' },
  { id: 'IIT_BOMBAY', name: 'IIT Bombay' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeCampus, setActiveCampus] = useState('IIT_JAMMU');
  const [isSuperAdmin, setIsSuperAdmin] = useState(true); // Mocked for Session 19

  return (
    <div className="flex h-screen bg-[#05060f] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0b14] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold tracking-tight">EduSync</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Admin Console</div>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-white/40 hover:text-red-400 transition-all rounded-xl hover:bg-red-400/5 group">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#0a0b14]/50 backdrop-blur-xl px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Active Node:</span>
                  <span className="text-sm font-semibold">{CAMPUSES.find(c => c.id === activeCampus)?.name}</span>
                  <ChevronDown className="w-4 h-4 text-white/30" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 space-y-1 z-[100]">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#4f46e5] font-bold">Switch Campus Context</div>
                  {CAMPUSES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCampus(c.id)}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                        activeCampus === c.id 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'hover:bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-bold">Dr. Aryan Sharma</div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Super Admin</div>
            </div>
            <div className="w-10 h-10 rounded-xl border-2 border-indigo-500/20 bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
              AS
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#05060f]">
          {children}
        </div>
      </main>
    </div>
  );
}
