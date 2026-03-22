'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private resetTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 1,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console
    console.error('🔴 ErrorBoundary caught:', error);
    
    // Send to backend
    fetch('/api/v1/errors/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        type: 'boundary',
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('Failed to report error:', err));

    // Show toast
    toast.error('Component Failure: A part of the interface experienced an error.');
  }

  handleReset = () => {
    this.setState(
      (prev) => ({ hasError: false, error: null, errorCount: prev.errorCount + 1 }),
      () => {
        // Full page reload if it keeps happening
        if (this.state.errorCount > 3) {
          window.location.reload();
        }
      }
    );

    // Auto-clear error count after persistent success
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.setState({ errorCount: 0 });
    }, 10000);
  };

  componentWillUnmount() {
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 bg-red-950/20 border border-red-500/20 rounded-[40px] shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-4 bg-red-500/10 rounded-3xl border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-red-500 uppercase tracking-widest text-sm">Interface Disconnected</h3>
                <p className="text-slate-300 text-xs font-mono leading-relaxed">
                  {this.state.error?.message || 'An unexpected component failure occurred in the Nexus.'}
                </p>
                <div className="text-[10px] text-red-500/40 uppercase font-black pt-2">Error Instance ID: {Math.random().toString(36).substring(7)}</div>
              </div>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Restore Component
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
