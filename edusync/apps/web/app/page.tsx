"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Globe, Shield, ArrowRight, Star, Building2, MousePointer2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-44 flex flex-col items-center text-center px-6">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-20 right-1/4 w-[30rem] h-[30rem] bg-purple-600/5 rounded-full blur-[100px] animate-pulse delay-1000" />
         </div>

         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full mb-10 shadow-xl backdrop-blur-xl"
         >
            <Zap size={14} className="text-amber-400 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Institutional Protocol v4.0 live</span>
         </motion.div>

         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase italic"
         >
            The Nexus of <br />
            <span className="text-indigo-500">Academic Intelligence.</span>
         </motion.h1>

         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium tracking-tight mb-12 leading-relaxed"
         >
            Securely trade skills, verify resources, and collaborate across India's premier engineering campuses through a federated institutional protocol.
         </motion.p>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="flex flex-col sm:flex-row gap-6 mb-24"
         >
            <Link href="/dashboard" className="btn-primary !px-10 !py-5 text-base font-bold uppercase tracking-widest">
               Access Nexus Hub <ArrowRight size={18} />
            </Link>
            <button className="btn-secondary !px-10 !py-5 text-base font-bold uppercase tracking-widest">
               View Federation MOUs
            </button>
         </motion.div>

         {/* Trust Banner Inline */}
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="w-full flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-20 hover:opacity-100 transition-opacity duration-700"
         >
            {['IIT JAMMU', 'IIT DELHI', 'IIT BOMBAY', 'IIT KANPUR', 'NIT TRICHY'].map((name, i) => (
               <span key={i} className="text-xl md:text-2xl font-black text-white tracking-widest uppercase italic">{name}</span>
            ))}
         </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-6 pb-44">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Globe, 
                title: "Federated Nodes", 
                desc: "Verified student identity exchange across institutional nodes using a zero-trust handshake protocol.",
                color: "text-indigo-400"
              },
              { 
                icon: Star, 
                title: "Karma Ledger", 
                desc: "Transparent, immutable value exchange for peer tutoring and resource verification.",
                color: "text-amber-400" 
              },
              { 
                icon: Shield, 
                title: "Guardian AI", 
                desc: "Real-time institutional moderation ensuring content remains aligned with campus MOUs.",
                color: "text-emerald-400"
              },
            ].map((f, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass-card p-10 bg-white/[0.02] border-white/[0.05] hover:border-indigo-500/30 transition-all cursor-pointer group"
               >
                  <div className={`p-4 bg-white/[0.03] ${f.color} rounded-xl w-fit mb-8 group-hover:scale-110 transition-transform`}>
                     <f.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter mb-4">{f.title}</h3>
                  <p className="text-slate-500 text-base font-medium leading-relaxed tracking-tight group-hover:text-slate-300 transition-colors">
                     {f.desc}
                  </p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 pb-44">
         <div className="glass-card p-16 text-center bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/10">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8">Ready to sync?</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
               Join the fastest growing academic collaboration network in India. 
               Experience the future of peer-to-peer knowledge exchange.
            </p>
            <Link href="/onboarding" className="btn-primary !inline-flex !w-auto !px-12">
               Initialize Onboarding <ArrowRight size={18} />
            </Link>
         </div>
      </section>
    </div>
  );
}
