'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Share2,
  Activity 
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Partner Selection', icon: Building2 },
  { id: 2, title: 'Terms & Conditions', icon: FileText },
  { id: 3, title: 'Nexus Policy', icon: ShieldCheck },
  { id: 4, title: 'Review & Propose', icon: CheckCircle2 },
];

const CAMPUSES = [
  { id: 'IIT_DELHI', name: 'IIT Delhi' },
  { id: 'IIT_BOMBAY', name: 'IIT Bombay' },
  { id: 'IIT_KANPUR', name: 'IIT Kanpur' },
  { id: 'NIT_TRICHY', name: 'NIT Trichy' },
  { id: 'IIT_JAMMU', name: 'IIT Jammu' }
];

export default function MOUWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    initiatingCampus: 'IIT_JAMMU', // Default for this node
    acceptingCampus: '',
    agreementTerms: 'Standard EduSync Nexus MOU v2.0 - Institutional Resource & Skill Exchange Protocol.',
    validUntil: '',
    durationMonths: '12',
    creditExchangeRate: 1.0,
    maxCrossConnections: 100,
    dataShareLevel: 'profiles_only',
    autoApproveThreshold: 0.9,
    karmaVelocityLimit: 50
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/v1/admin/mou/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success('MOU Proposal Sent Successfully');
        router.push('/dashboard/mou');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send proposal');
      }
    } catch (err) {
      toast.error('Network error during submission');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">Institutional Partnership Wizard</h1>
        <p className="text-white/50 text-lg italic">Drafting automated MOU for Nexus interoperability</p>
      </header>

      {/* Progress Tracker */}
      <div className="flex justify-between items-center px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />
        {STEPS.map((s) => (
          <div 
            key={s.id} 
            className={`flex flex-col items-center gap-3 transition-all duration-500 ${step >= s.id ? 'text-indigo-400' : 'text-white/20'}`}
          >
            <div className={`p-3 rounded-2xl border-2 transition-all duration-500 ${step >= s.id ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-900 border-white/5'}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest">{s.title}</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Building2 className="text-indigo-400" />
                Select Partner Campus
              </h2>
              <p className="text-white/50">Choose whose institutional node you wish to sync with.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CAMPUSES.map(c => (
                <button
                  key={c.id}
                  disabled={c.id === form.initiatingCampus}
                  onClick={() => setForm({ ...form, acceptingCampus: c.id })}
                  className={`p-6 text-left rounded-2xl border transition-all ${
                    form.acceptingCampus === c.id 
                    ? 'bg-indigo-500/10 border-indigo-500' 
                    : c.id === form.initiatingCampus
                      ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-lg">{c.name}</div>
                  <div className="text-xs text-white/30 uppercase tracking-widest mt-1">
                    {c.id === form.initiatingCampus ? 'Your Campus (Self)' : 'Institutional Node'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="text-indigo-400" />
                Agreement Terms
              </h2>
              <p className="text-white/50">Define the legal and operational framework for this partnership.</p>
            </div>
            <textarea
              className="w-full h-40 bg-slate-900/50 border border-white/10 rounded-2xl p-4 focus:border-indigo-500 outline-none resize-none font-sans leading-relaxed"
              value={form.agreementTerms}
              onChange={(e) => setForm({ ...form, agreementTerms: e.target.value })}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/40">Agreement Expiry (Optional)</span>
              <input 
                type="date" 
                className="bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none"
                onChange={(e) => setForm({ ...form, validUntil: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="text-indigo-400" />
                Nexus Policy Configuration
              </h2>
              <p className="text-white/50">Configure technical constraints for cross-campus resource exchange.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Coins className="text-amber-400 w-5 h-5" />
                  <span className="font-bold text-sm">Credit Exchange Rate</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" 
                  value={form.creditExchangeRate}
                  onChange={(e) => setForm({ ...form, creditExchangeRate: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>0.5x (Favor Partner)</span>
                  <span className="text-indigo-400 font-bold">{form.creditExchangeRate}x</span>
                  <span>2.0x (Favor You)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Share2 className="text-blue-400 w-5 h-5" />
                  <span className="font-bold text-sm">Data Share Level</span>
                </div>
                <select 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none text-sm"
                  value={form.dataShareLevel}
                  onChange={(e) => setForm({ ...form, dataShareLevel: e.target.value })}
                >
                  <option value="profiles_only">Profiles & Metadata Only</option>
                  <option value="aggregate">Aggregated Performance Only</option>
                  <option value="full_transparency">Full Transaction Logs</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-400 w-5 h-5" />
                  <span className="font-bold text-sm">Auto-Approve Threshold</span>
                </div>
                <input 
                  type="number" step="0.05"
                  value={form.autoApproveThreshold}
                  onChange={(e) => setForm({ ...form, autoApproveThreshold: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none text-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="text-red-400 w-5 h-5" />
                  <span className="font-bold text-sm">Karma Velocity Limit</span>
                </div>
                <input 
                  type="number"
                  value={form.karmaVelocityLimit}
                  onChange={(e) => setForm({ ...form, karmaVelocityLimit: parseInt(e.target.value) })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 text-center">
            <div className="p-4 bg-indigo-500/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Proposal Ready</h2>
              <p className="text-white/50">You are about to send an institutional handshake request to:</p>
              <div className="text-2xl font-bold text-indigo-400 py-2">
                {CAMPUSES.find(c => c.id === form.acceptingCampus)?.name || 'None Selected'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 divide-x divide-white/10 bg-white/5 rounded-2xl p-4 text-sm mt-8">
              <div>
                <div className="text-white/30 uppercase text-[10px] tracking-tighter">Exchange Rate</div>
                <div className="font-mono font-bold text-lg">{form.creditExchangeRate}x</div>
              </div>
              <div>
                <div className="text-white/30 uppercase text-[10px] tracking-tighter">Max Swaps</div>
                <div className="font-mono font-bold text-lg">{form.maxCrossConnections}</div>
              </div>
              <div>
                <div className="text-white/30 uppercase text-[10px] tracking-tighter">Share Level</div>
                <div className="font-mono font-bold text-[10px] mt-2">{form.dataShareLevel.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2 text-white/50 hover:text-white transition-all disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !form.acceptingCampus}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/20"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20"
            >
              Sign & Send Proposal
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
