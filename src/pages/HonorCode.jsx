import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Scale, Target, Flag } from 'lucide-react'

const Principle = ({ title, icon: Icon, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-indigo-600/30 transition-all shadow-xl group"
  >
    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{title}</h3>
    <p className="text-slate-400 text-lg leading-relaxed">{description}</p>
  </motion.div>
)

export default function HonorCode() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-32 px-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 rounded-full px-5 py-2 mb-8">
            <Scale size={18} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-black uppercase tracking-widest">Academic Commitment</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
            The Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Honor Code</span>
          </h1>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto italic font-medium">
            "We believe knowledge should be shared, but integrity must be protected."
          </p>
        </motion.div>

        <section className="mb-32">
          <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-12 md:p-20 rounded-[3rem] text-center shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
              <CheckCircle2 color="white" size={48} />
            </div>
            <h2 className="text-4xl font-black text-white mb-10">The Pledge</h2>
            <p className="text-2xl md:text-3xl font-caveat text-indigo-200 leading-relaxed max-w-4xl mx-auto">
              "As a member of the EduSync community, I pledge to uphold the values of honesty, trust, and mutual respect. I will use this platform to enhance my learning and help others grow, without compromising my academic integrity or that of my institution."
            </p>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="text-4xl font-black text-white mb-16 text-center uppercase tracking-widest">Core Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Principle title="Honesty" icon={CheckCircle2} delay={0.1} description="Be truthful about your skills and goals. Never represent another's work as your own or facilitate cheating in any form." />
            <Principle title="Trust" icon={Target} delay={0.2} description="The Nexus operates on mutual benefit. Deliver promised help and share verified content to build community reliance." />
            <Principle title="Fairness" icon={Scale} delay={0.3} description="Karma is earned through merit. Do not exploit the economy or attempt to circumvent intended resource values." />
            <Principle title="Respect" icon={CheckCircle2} delay={0.4} description="Treat every peer as a valued colleague, regardless of their campus, level, or location. Keep communication professional." />
            <Principle title="Responsibility" icon={Flag} delay={0.5} description="Take ownership of your learning path. Report violations that harm the integrity of the platform or your campus." />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-red-400/5 border border-red-500/20 p-12 rounded-[2.5rem] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertTriangle size={120} className="text-red-500" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-4">
              <AlertTriangle className="text-red-500" /> Violations
            </h3>
            <ul className="space-y-4 text-slate-400 text-lg">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2.5 shrink-0" />
                <span>Sharing exam questions or live test answers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2.5 shrink-0" />
                <span>Impersonation of campus faculty or staff.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2.5 shrink-0" />
                <span>Plagiarism of proprietary institutional materials.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-indigo-400/5 border border-indigo-500/20 p-12 rounded-[2.5rem] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Flag size={120} className="text-indigo-500" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-4">
              <Flag className="text-indigo-500" /> Consequences
            </h3>
            <ul className="space-y-4 text-slate-400 text-lg">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5 shrink-0" />
                <span>Suspension of Nexus Mode and Karma exchange.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5 shrink-0" />
                <span>Zero tolerance for fraud: Permanent Account Ban.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5 shrink-0" />
                <span>Reported to your campus administration Dean/Moderator.</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center p-10 bg-white/5 rounded-3xl border border-white/10"
        >
          <div className="text-3xl font-black text-white mb-4">Ethical Disclosure</div>
          <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
            EduSync is built to empower, not to exploit. All interactions are monitored by Guardian AI and can be audited by your campus admin node. By using this platform, you agree to these ethical standards.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
