import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Shield, AlertTriangle, Scale, Target } from 'lucide-react'

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-14">
    <div className="flex items-center gap-5 mb-8">
      <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl">
        <Icon size={28} />
      </div>
      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{title}</h3>
    </div>
    <div className="pl-20 text-slate-400 leading-relaxed text-xl space-y-5">
      {children}
    </div>
  </div>
)

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-32 px-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-32"
        >
          <div className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-500/30 rounded-full px-5 py-2 mb-10">
            <Shield size={20} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-black uppercase tracking-widest">Platform Guidelines</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter leading-none">Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Use</span></h1>
          <p className="text-3xl font-caveat text-indigo-200 opacity-60">"Respect the Network. Respect the Knowledge. Respect the Code."</p>
        </motion.div>

        <section className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-12 md:p-24 rounded-[4rem] shadow-2xl relative">
          <Section icon={Scale} title="Acceptance of Terms">
            <p>By creating an account on EduSync, you agree to become a part of the Nexus peer network and abide by these Terms of Use and the associated Honor Code.</p>
          </Section>

          <Section icon={Target} title="Karma System">
            <p>The Karma economy is a non-monetary, reputation-based system. Karma points have no cash value and cannot be redeemed for real currency. Any attempt to sell or buy Karma outside the platform is a violation of these terms.</p>
          </Section>

          <Section icon={AlertTriangle} title="Prohibited Conduct">
            <ul className="list-disc pl-3 mt-4 space-y-3">
              <li>Using the platform for any form of academic dishonesty.</li>
              <li>Unauthorized distribution of institutional intellectual property.</li>
              <li>Harrassment, bullying, or discrimination against peers.</li>
              <li>Automation or scraping of platform data.</li>
            </ul>
          </Section>

          <Section icon={Shield} title="Termination">
            <p>Institutions and EduSync reserve the right to suspend or terminate accounts that violate the academic integrity of the platform or the respective partner campuses.</p>
          </Section>

          <div className="mt-24 pt-16 border-t border-white/10 text-center">
            <div className="text-6xl text-white font-black mb-6">EduSync Nexus</div>
            <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs mb-4">Agreement v2.1 · HackIndia Edition</p>
            <p className="text-slate-600 max-w-lg mx-auto leading-relaxed text-sm">
              All institutional logos and campus names used are fictional for demonstration purposes of the HackIndia 2026 project 'EduSync'. 
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
