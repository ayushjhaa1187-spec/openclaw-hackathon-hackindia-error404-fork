'use client';

import Link from 'next/link';
import { Lock, ShieldAlert, Home } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-amber-600/10 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-600/20 border border-amber-500/50 rounded-full shadow-lg shadow-amber-600/20">
            <Lock className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-700 mb-2 tracking-tighter">
            403
          </h1>
          <p className="text-amber-400/60 text-xs font-bold uppercase tracking-widest">Unauthorized Nexus Access</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Access Denied
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your institutional node does not have the necessary permissions to access this resource. 
            Contact your campus super-admin for credentials escalation.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-600/20"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
