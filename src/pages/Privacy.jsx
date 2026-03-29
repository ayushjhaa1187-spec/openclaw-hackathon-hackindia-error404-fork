import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, Lock, FileText, Globe } from 'lucide-react'

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-12">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
        <Icon size={24} />
      </div>
      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h3>
    </div>
    <div className="pl-16 text-slate-400 leading-relaxed text-lg space-y-4">
      {children}
    </div>
  </div>
)

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-32 px-6 overflow-hidden relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 rounded-full px-5 py-2 mb-8">
            <Lock size={18} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-black uppercase tracking-widest">Data Protection</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter">Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Policy</span></h1>
          <p className="text-2xl text-slate-400 max-w-2xl mx-auto italic font-medium">Draft v1.0 · Last Updated March 2026</p>
        </motion.div>

        <section className="bg-white/5 border border-white/10 p-12 md:p-20 rounded-[3rem] shadow-2xl">
          <Section icon={Eye} title="Information We Collect">
            <p>We collect your Institutional Email (.edu.in) to verify your campus identity through the OIDC protocol. This is the only physical identifier we store.</p>
            <p>Other data includes your public profile (name, avatar, department, skills) and your Karma exchange history within the platform.</p>
          </Section>

          <Section icon={Lock} title="How We Use Data">
            <p>Your data is used solely to facilitate skill swaps and resource sharing between peers. We do not sell or monetize your individual student data.</p>
            <p>Aggregation of skill trends across campuses may be shared with institutional administrators to improve academic MOU outcomes.</p>
          </Section>

          <Section icon={Globe} title="Cookie Policy">
            <p>EduSync uses essential session cookies to keep you signed in. We do not use third-party tracking pixels or behavioral advertising cookies.</p>
          </Section>

          <Section icon={FileText} title="Retention">
            <p>Your profile and transaction history are retained as long as your account is active. You can request account deletion at any time through the Settings page.</p>
          </Section>

          <div className="mt-20 pt-12 border-t border-white/10 text-center">
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed italic">
              "Privacy is not an option, it's a fundamental right. EduSync respects your digital boundaries across the Nexus."
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
