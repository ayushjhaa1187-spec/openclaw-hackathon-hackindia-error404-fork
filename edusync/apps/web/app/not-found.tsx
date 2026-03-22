'use client';

import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center animate-in fade-in zoom-in duration-700">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-600/20 border border-indigo-500/50 rounded-full shadow-lg shadow-indigo-600/20">
            <AlertCircle className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-700 mb-2 tracking-tighter">
            404
          </h1>
          <p className="text-indigo-400/60 text-xs font-bold uppercase tracking-widest">Page Discovery Failure</p>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Looks like you took a wrong turn
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            The page you're looking for doesn't exist or has been moved to a new institutional node. 
            Let's get you back to the Nexus.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition-all backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Support */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm">
            Still lost?{' '}
            <a
              href="mailto:support@edusync.io"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Contact Support Node
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
