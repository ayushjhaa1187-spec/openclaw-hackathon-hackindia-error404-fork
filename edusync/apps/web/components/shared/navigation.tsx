'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Globe, ShieldCheck, Database, ShoppingBag, MessageSquare } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Nexus Explorer', href: '/dashboard/nexus', icon: Globe },
  { name: 'Vault', href: '/dashboard/vault', icon: Database },
  { name: 'Redeem', href: '/dashboard/wallet', icon: ShoppingBag },
  { name: 'Admin Console', href: '/dashboard/admin/mou', icon: ShieldCheck },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="glass-nav px-6 py-4 flex items-center justify-between shadow-2xl backdrop-blur-3xl border-b border-white/[0.08]">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl uppercase tracking-tighter">E</span>
          </div>
          <span className="text-xl font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            EduSync <span className="text-indigo-500 italic">Nexus</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <MessageSquare size={20} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer"></div>
      </div>
    </nav>
  );
};
