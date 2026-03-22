'use client';

import { useEffect, useState } from 'react';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

export default function RateLimited() {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          window.location.reload();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-600/10 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-cyan-600/20 border border-cyan-500/50 rounded-full shadow-lg shadow-cyan-600/20">
            <Clock className="w-12 h-12 text-cyan-400" />
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-cyan-700 mb-2 tracking-tighter">
            429
          </h1>
          <p className="text-cyan-400/60 text-xs font-bold uppercase tracking-widest">Rate Limit Exceeded</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Slow down there!
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Institutional load balancing has throttled your requests. 
            Please wait for the Nexus to cool down.
          </p>

          {/* Countdown Timer */}
          <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl mb-6 shadow-xl shadow-cyan-900/10">
            <p className="text-[10px] text-white/30 font-black uppercase mb-2 tracking-widest">Retrying Synchronisation in</p>
            <p className="text-4xl font-bold text-cyan-400 font-mono tracking-widest">{seconds}s</p>
          </div>

          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
            This page will refresh automatically once the cooldown period ends.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/20"
        >
          Force Refresh
        </button>
      </div>
    </div>
  );
}
