"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Globe, MessageSquare, BookOpen, Shield, User, Wallet, Building2, ChevronDown } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Nexus Node', icon: Zap, href: '/dashboard' },
  { id: 'explore', label: 'Explorer', icon: Globe, href: '/dashboard/explore' },
  { id: 'vault', label: 'Vault', icon: BookOpen, href: '/dashboard/vault' },
  { id: 'chat', label: 'Peer Sync', icon: MessageSquare, href: '/dashboard/chat' },
  { id: 'wallet', label: 'Karma', icon: Wallet, href: '/dashboard/wallet' },
  { id: 'admin', label: 'Admin Hub', icon: Shield, href: '/dashboard/admin' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav px-8 py-4 backdrop-blur-3xl shadow-2xl border-white/5 bg-slate-950/40">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="flex items-center gap-4 group">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">E</div>
             <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">EduSync</span>
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.4em] leading-none">Nexus Protocol</span>
             </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {TABS.map((tab) => {
              const isActive = (tab.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''} outline-none`}
                >
                  <tab.icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Campus Selector Mockup */}
           <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group">
              <Building2 size={14} className="text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">Institutional Node</span>
                <span className="text-[10px] font-black text-white flex items-center gap-1 uppercase italic tracking-tight mt-1">IIT Jammu <ChevronDown size={10} /></span>
              </div>
           </div>

           <Link href="/dashboard/profile/me" className="flex items-center gap-4 group outline-none">
             <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-white uppercase tracking-tighter">Arjun Singh</div>
                <div className="text-[8px] font-bold text-emerald-400 flex items-center justify-end gap-1 uppercase tracking-widest mt-1">
                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Active Link
                </div>
             </div>
             <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-indigo-500/50 transition-all shadow-xl">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="profile" />
             </div>
           </Link>
        </div>
      </div>
    </nav>
  );
}
