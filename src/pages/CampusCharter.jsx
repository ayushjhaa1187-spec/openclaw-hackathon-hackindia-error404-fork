import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, BookOpen, Lock, MessageSquare, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Section = ({ icon: Icon, title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4 font-outfit">{title}</h3>
    <div className="text-slate-400 leading-relaxed space-y-4">
      {children}
    </div>
  </motion.div>
)

export default function CampusCharter() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-24 px-6 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
            <Shield size={16} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium uppercase tracking-widest">Platform Governance</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 font-outfit tracking-tight">
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Charter</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The foundational agreement that enables cross-campus collaboration while maintaining institutional boundaries and trust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Section icon={Users} title="Overview" delay={0.1}>
            <p>EduSync operates as a federated knowledge network. This Charter defines the relationship between the platform, partner institutions, and the student body.</p>
            <p>Our goal is to unlock the collective intelligence of Indian campuses by removing physical and administrative silos while preserving the unique identity of each institution.</p>
          </Section>

          <Section icon={Shield} title="Governance" delay={0.2}>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each campus maintains its own administrative node for local content moderation.</li>
              <li>Nexus Mode interactions are governed by the Multi-Campus MOU standard.</li>
              <li>Institutions reserve the right to restrict content based on their specific academic policies.</li>
            </ul>
          </Section>

          <Section icon={BookOpen} title="Academic Integrity" delay={0.3}>
            <p>EduSync is a peer-to-peer mentoring and resource-sharing platform, NOT a substitute for institutional instruction.</p>
            <p>Students must adhere to their respective college's conduct codes. Any exchange involving exam leaks, plagiarism, or unauthorized aid is strictly prohibited and subject to immediate institutional reporting.</p>
          </Section>

          <Section icon={Lock} title="Data Privacy" delay={0.4}>
            <p>Student institutional identities are verified via OIDC/Auth tokens. We do not share personal student data with external third parties.</p>
            <p>Activity logs within the Nexus are accessible to respective campus administrators for audit purposes and to ensure safe peer-to-peer interaction.</p>
          </Section>

          <Section icon={MessageSquare} title="Dispute Resolution" delay={0.5}>
            <p>Conflicts arising from skill swaps or resource quality follow a 3-tier resolution process:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Peer-level negotiation via chat.</li>
              <li>EduSync automated karma arbitration.</li>
              <li>Campus Admin intervention for serious violations.</li>
            </ol>
          </Section>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-4">Partner With Us</h3>
              <p className="text-white/80 mb-8 leading-relaxed">Bring the EduSync Nexus to your campus and empower your students today.</p>
            </div>
            <Link to="/contact" className="relative z-10 w-fit inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:gap-4 transition-all">
              Apply for Partnership <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center pt-10 border-t border-white/10"
        >
          <p className="text-slate-500 text-sm">Last Updated: March 2026 · EduSync Nexus Protocol v2.4</p>
        </motion.div>
      </div>
    </div>
  )
}
