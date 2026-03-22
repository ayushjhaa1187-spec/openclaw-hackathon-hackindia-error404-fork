"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Globe, Shield, ArrowRight, Check, Building2, User, Sparkles } from 'lucide-react';
import apiClient from '../lib/api-client';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    specialization: '',
    skills: [],
    campus: 'IIT_JAMMU',
  });

  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput && !formData.skills.includes(skillInput as never)) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput as never] });
      setSkillInput('');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await apiClient.post('/profile/sync', {
        ...formData,
        onboardingStatus: 'complete'
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding Sync Failure:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
         <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl bg-slate-900/60 border-white/5 p-12 relative shadow-2xl"
      >
        <div className="mb-12 text-center">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-600/30">E</div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Nexus Onboarding</h1>
           <p className="text-slate-500 mt-4 font-black uppercase tracking-[0.3em] text-[10px] italic">Institutional Node Synchronization Protocol</p>
        </div>

        <div className="flex justify-between items-center mb-16 px-4">
           {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                    {step > s ? <Check size={18} /> : s}
                 </div>
                 {s < 3 && <div className={`w-20 md:w-32 h-1 mx-2 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-white/5'}`} />}
              </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Institutional Verify</h2>
                    <p className="text-slate-400 font-medium italic">Confirmed identity via Federated Handshake. Please select your primary specialization node.</p>
                    
                    <div className="space-y-4 pt-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Specialization</label>
                       <select 
                         className="w-full bg-slate-950/50 border border-white/10 p-5 rounded-2xl text-white font-medium focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                         value={formData.specialization}
                         onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                       >
                          <option value="">Select Domain...</option>
                          <option value="VLSI & Embedded">VLSI & Embedded Systems</option>
                          <option value="AI & Machine Learning">AI & Machine Learning</option>
                          <option value="Distributed Systems">Distributed Systems</option>
                          <option value="Cyberpsychology">Cyberpsychology</option>
                       </select>
                    </div>
                 </div>
                 <button onClick={() => setStep(2)} className="w-full btn-primary font-black uppercase tracking-widest py-5 shadow-2xl shadow-indigo-600/20 leading-none">Continue Protocol <ArrowRight size={18} /></button>
              </motion.div>
           )}

           {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Skill Matrix</h2>
                    <p className="text-slate-400 font-medium italic">Enter the skills you're offering to the Nexus. This defines your Node weight.</p>
                    
                    <div className="space-y-4 pt-4">
                       <div className="flex gap-4">
                          <input 
                            type="text" 
                            placeholder="Add skill (e.g. Rust, FPGA)..." 
                            className="flex-1 bg-slate-950/50 border border-white/10 p-5 rounded-2xl text-white font-medium outline-none shadow-inner"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          />
                          <button onClick={addSkill} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                             <Sparkles size={24} />
                          </button>
                       </div>
                       <div className="flex flex-wrap gap-3 pt-4">
                          {formData.skills.map((skill, i) => (
                             <span key={i} className="px-5 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 font-black uppercase text-[10px] tracking-widest italic animate-fade-in shadow-xl">
                                #{skill}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setStep(3)} className="w-full btn-primary font-black uppercase tracking-widest py-5 leading-none">Lock Matrix <ArrowRight size={18} /></button>
              </motion.div>
           )}

           {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                 <div className="py-12 space-y-8">
                    <div className="w-24 h-24 bg-emerald-500/10 border-4 border-emerald-500/20 rounded-full mx-auto flex items-center justify-center text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-success">
                       <Check size={48} />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Handshake Ready</h2>
                       <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] italic">Node Sync: 100% complete • MOU Status: Active</p>
                    </div>
                 </div>
                 <button 
                   onClick={handleComplete} 
                   disabled={loading}
                   className="w-full btn-primary font-black uppercase tracking-[0.4em] py-6 shadow-2xl shadow-indigo-600/30 leading-none group"
                 >
                    {loading ? 'Synchronizing Node...' : 'Initialize EduSync Nexus'}
                    <Zap size={20} className="group-hover:text-amber-400 transition-colors" />
                 </button>
              </motion.div>
           )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
