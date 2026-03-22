'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to backend
    console.error('🔴 Application Error:', error.message);
    
    fetch('/api/v1/errors/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorMessage: error.message,
        errorStack: error.stack,
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    }).catch(err => console.error('Failed to report error:', err));

    // Show toast notification
    toast.error('System Failure: Institutional node experienced a critical error.');
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background with subtle glow */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-600/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center animate-in fade-in zoom-in duration-700">
        {/* Icon with pulsing background */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600/20 border border-red-500/50 rounded-full shadow-lg shadow-red-500/20">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-800 mb-2 tracking-tighter">
            500
          </h1>
          <p className="text-red-500/60 text-xs font-bold uppercase tracking-widest">Internal Sync Failure</p>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            We've logged this error and our team is looking into the nexus synchronization issues. 
            Try refreshing the page or contact the operator.
          </p>
        </div>

        {/* Error ID */}
        {error.digest && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl backdrop-blur-3xl">
            <p className="text-[10px] text-red-400/50 uppercase font-black mb-1">Audit Trace Digest</p>
            <p className="text-xs text-white/40 font-mono break-all font-bold">
              {error.digest}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition-all backdrop-blur-xl"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Support */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm italic">
            Still broken?{' '}
            <a
              href="mailto:support@edusync.io"
              className="text-red-400 hover:text-red-300 transition-colors font-black not-italic"
            >
              Emergency Node Contact
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
