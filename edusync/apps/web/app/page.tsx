"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Globe, Shield, ArrowRight, Star, Building2, MousePointer2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-64 flex flex-col items-center text-center px-8">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-20 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-40 right-1/4 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
         </div>

         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full mb-12 shadow-2xl backdrop-blur-xl"
         >
            <Zap size={14} className="text-amber-400 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">EduSync Protocol v4.0 Alpha live</span>
         </motion.div>

         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-8xl md:text-[10rem] font-black text-white tracking-tighter leading-none mb-12 uppercase italic relative"
         >
            Decentralize <br />
            <span className="text-indigo-600">Learning.</span>
         </motion.h1>

         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="text-slate-400 text-xl md:text-2xl max-w-3xl font-medium tracking-tight mb-16 leading-relaxed"
         >
            The federated collaborative ecosystem for India's premier engineering institutions. 
            Connect. Trade Skills. Build the Nexus.
         </motion.p>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="flex flex-col sm:flex-row gap-8"
         >
            <Link href="/dashboard" className="btn-primary !px-12 !py-6 text-lg font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/40">
               Enter The Nexus <ArrowRight size={20} />
            </Link>
            <button className="btn-secondary !px-12 !py-6 text-lg font-black uppercase tracking-[0.3em] bg-white/5 border-white/10">
               Institutional Access
            </button>
         </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-8 pb-64">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Globe, title: "Multi-Campus", desc: "Access verified peers across 20+ premier institutions via federated handshake." },
              { icon: Star, title: "Karma Protocol", desc: "Proof-of-knowledge currency system that incentivizes institutional mastery." },
              { icon: Shield, title: "Guardian Moderation", desc: "Autonomous AI oversight ensuring strict adherence to academic MOUs." },
            ].map((f, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass-card p-12 bg-slate-900/40 border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
               >
                  <div className="p-5 bg-indigo-600/10 text-indigo-500 rounded-2xl w-fit mb-10 group-hover:scale-110 transition-transform">
                     <f.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">{f.title}</h3>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed tracking-tight group-hover:text-slate-300 transition-colors">
                     {f.desc}
                  </p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 border-y border-white/5 bg-slate-950/40 text-center">
         <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 mb-12 block italic">Trusted by the Nexus Federation</span>
         <div className="container mx-auto px-8 flex flex-wrap justify-center items-center gap-16 md:gap-32 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {['IIT JAMMU', 'IIT DELHI', 'IIT BOMBAY', 'IIT KANPUR', 'NIT TRICHY'].map((name, i) => (
               <span key={i} className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase italic">{name}</span>
            ))}
         </div>
      </section>
      
      <footer className="py-12 bg-slate-950 text-center">
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">
            HackIndia 2026 Submission • Project EduSync • Secure Multi-Campus Node
         </p>
      </footer>
    </div>
  );
}
