"use client";

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="mt-20 py-12 px-6 border-t border-white/5 bg-slate-950/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">E</div>
            <span className="text-lg font-bold font-outfit">EduSync</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            The federated academic collaboration protocol. Powering cross-campus skill swaps and knowledge resource verification.
          </p>
        </div>

        <div>
           <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-6">Nexus Protocol</h4>
           <ul className="space-y-3 text-sm text-slate-500">
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">MOU Architecture</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Federated Auth</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Karma Ledger</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Node Telemetry</Link></li>
           </ul>
        </div>

        <div>
           <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-6">Institutional</h4>
           <ul className="space-y-3 text-sm text-slate-500">
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Admin Console</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Partner Directory</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Legal Framework</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Guardian AI Ethics</Link></li>
           </ul>
        </div>

        <div>
           <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-6">Connect</h4>
           <ul className="space-y-3 text-sm text-slate-500">
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Global Chat</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Support Portal</Link></li>
             <li><Link href="#" className="hover:text-indigo-400 transition-colors">Nexus API Documentation</Link></li>
           </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} EduSync Protocol. Institutional deployment v1.4.2-Genesis.
        </p>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-xs text-slate-600 hover:text-slate-400">Privacy Policy</Link>
          <Link href="#" className="text-xs text-slate-600 hover:text-slate-400">Terms of Service</Link>
          <Link href="#" className="text-xs text-slate-600 hover:text-slate-400">Institutional SLA</Link>
        </div>
      </div>
    </footer>
  );
};
