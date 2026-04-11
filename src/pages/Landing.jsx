import React, { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Users, Zap, BookOpen, Building2, Star, 
  Globe, ShieldCheck, MessageSquare, Search,
  ArrowRight, Menu, X, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { MOCK_SKILLS, MOCK_TESTIMONIALS } from '../data/mockData'
import Footer from '../components/layout/Footer'

// Helper component for floating chips
const FloatingChip = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-8, 0, -8] }}
    transition={{ duration: 2.5 + Math.random(), repeat: Infinity, ease: "easeInOut", delay }}
    className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 shadow-xl"
  >
    <Icon className="w-4 h-4 text-indigo-400" />
    <span className="text-white font-bold">{value}</span>
    <span className="text-white/60 text-sm">{label}</span>
  </motion.div>
)

const StatChip = FloatingChip; // Alias to resolve potential ReferenceError

export default function Landing() {
  const { scrollYProgress } = useScroll()
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-24">
        {/* Background Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-25 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600 rounded-full blur-[120px] opacity-20 translate-x-1/4 translate-y-1/4" />

        {/* Top Navbar */}
        <nav className="absolute top-0 left-0 w-full p-6 md:p-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-xl leading-none">C</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tighter">EduSync</span>
          </div>
          <Link to="/login" className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold">
            Sign In
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-cyan-900/50 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="text-cyan-300 text-sm font-medium tracking-wide">🛡️ Swap Skills. Earn Karma. Grow Together.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-6 font-outfit"
          >
            Find Your Skill.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Share What You Know.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-indigo-200 mb-6 font-medium"
          >
            Find your mentor. Share your knowledge. Earn Karma.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            EduSync connects students across campuses to swap skills, share resources, and build a knowledge economy — entirely free — powered by AI-driven triage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link to="/login" className="group w-full sm:w-auto px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-cyan-600/20 active:scale-95 flex items-center justify-center gap-2">
              Join EduSync Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/20 hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all"
            >
              See How It Works
            </button>
          </motion.div>

          {/* New Live Feed Simulation for density */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="hidden md:flex items-center justify-center gap-4 mb-16"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                </div>
              ))}
            </div>
            <div className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse" />
              12 Active skill swaps right now
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-slate-500 text-sm mb-12"
          >
            Trusted by students across Northvale Institute, Deccan Engineering, Vistara College & 2 more partner campuses
          </motion.p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <FloatingChip icon={Users} value="2,400+" label="Active Students" delay={0} />
            <FloatingChip icon={Zap} value="840" label="Skills Shared" delay={0.1} />
            <FloatingChip icon={BookOpen} value="1,200+" label="Skill Swaps" delay={0.2} />
            <FloatingChip icon={Globe} value="5" label="Partner Campuses" delay={0.3} />
            <FloatingChip icon={ShieldCheck} value="98%" label="Avg Karma Rating" delay={0.4} />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE STORY */}
      <section className="bg-[#fdf6ec] py-24 px-6 overflow-hidden relative">
        {/* Notebook Lines Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 1px, transparent 1px)', backgroundSize: '100% 28px' }} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-caveat text-5xl md:text-7xl text-slate-800 leading-tight">
              A story every engineering student<br />has lived through...
            </h2>
            <div className="flex justify-center mt-6">
              <motion.svg width="200" height="20" viewBox="0 0 200 20" fill="none">
                <motion.path 
                  d="M5 15C30 5 170 5 195 15" 
                  stroke="#4f46e5" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.svg>
            </div>
          </div>

          <div className="space-y-16">
            {/* Story Block 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border-l-[12px] border-red-400"
            >
              <div className="md:w-2/5 bg-[#0f172a] p-10 flex flex-col items-center justify-center text-center relative">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 bg-amber-500/20 blur-3xl" />
                  <div className="relative z-10 border-4 border-slate-700 rounded-xl p-4 bg-slate-900/50 backdrop-blur aspect-video w-full">
                    <div className="w-full h-full bg-amber-500/10 rounded flex flex-col gap-2 p-3">
                      <div className="h-2 w-3/4 bg-slate-700 rounded" />
                      <div className="h-2 w-1/2 bg-slate-700 rounded" />
                      <div className="mt-auto h-2 w-full bg-amber-500/40 rounded shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-white">
                  <div className="text-4xl font-black mb-2">2:00 AM</div>
                  <div className="text-slate-400 text-sm italic">The Night Before Exam</div>
                </div>
              </div>
              <div className="md:w-3/5 p-10 md:p-14 font-caveat text-2xl text-slate-700 leading-relaxed">
                <div className="text-sm uppercase tracking-widest text-red-500 font-bold font-sans mb-4">Chapter 1 — The Wall</div>
                <p className="mb-6">
                  Arjun was a 3rd-year Electronics student at <strong>Northvale Institute of Technology</strong>.
                </p>
                <p className="mb-6">
                  It was 2 AM on a Tuesday. His Embedded Systems exam was in 4 days. He had hit a wall — <strong>VLSI Circuit Design</strong>. The kind of topic that made you question every life choice.
                </p>
                <p className="mb-8">
                  He'd watched 6 YouTube videos. Read 3 textbook chapters. Posted in 4 WhatsApp groups. Silence.
                </p>
                <div className="inline-flex items-center bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-lg font-sans font-medium">
                  😤 Frustrated. Stuck. Alone.
                </div>
              </div>
            </motion.div>

            {/* Story Block 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row-reverse bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border-r-[12px] border-amber-400"
            >
              <div className="md:w-2/5 bg-amber-50 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10 w-full aspect-video bg-white rounded-xl shadow-lg border border-amber-100 p-4">
                  <div className="space-y-3">
                    <div className="h-2 w-3/4 bg-slate-100 rounded" />
                    <div className="h-32 w-full bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Zap className="w-12 h-12 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-slate-800">
                  <div className="text-4xl font-black mb-2">3:00 PM</div>
                  <div className="text-slate-400 text-sm italic">The Golden Skill</div>
                </div>
              </div>
              <div className="md:w-3/5 p-10 md:p-14 font-caveat text-2xl text-slate-700 leading-relaxed">
                <div className="text-sm uppercase tracking-widest text-amber-500 font-bold font-sans mb-4">Chapter 2 — The Skill Nobody Knew About</div>
                <p className="mb-6">
                  700 kilometres south, at <strong>Deccan Engineering University</strong>, Priya had just finished her VLSI lab with a perfect score.
                </p>
                <p className="mb-6">
                  Her professor had called her work 'exceptional.' She had a clear, simple method for CMOS layout that no textbook had ever explained properly.
                </p>
                <p className="mb-8">
                  She also had 4 free hours every week. She desperately wanted to learn React.js to build her final-year project. But tutors were expensive.
                </p>
                <div className="inline-flex items-center bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-lg font-sans font-medium">
                  😔 Capable. Underutilized. Disconnected.
                </div>
              </div>
            </motion.div>

            {/* Gap Visualizer */}
            <div className="relative py-20 bg-slate-900 rounded-3xl overflow-hidden text-center p-10">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-indigo-900/10" />
                <div className="w-1/2 bg-amber-900/10" />
              </div>
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-700">
                <motion.div 
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full w-full bg-indigo-500/50 blur-[2px]"
                />
              </div>

              <div className="relative z-10">
                <p className="font-caveat text-3xl md:text-4xl text-white max-w-2xl mx-auto leading-relaxed mb-12">
                  "700 km. Different colleges. Same problem.<br />
                  Neither knew the other existed.<br />
                  Both had exactly what the other needed."
                </p>
                
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-4 h-4 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                  <svg width="200" height="2" className="overflow-visible">
                    <motion.line 
                      x1="0" y1="1" x2="200" y2="1" 
                      stroke="#4b5563" strokeWidth="2" strokeDasharray="6 4"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 0.85 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5 }}
                    />
                  </svg>
                  <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                </div>
                
                <p className="text-slate-400 italic text-sm">
                  This gap exists in every college network in India. Between every campus.<br />Between every semester. Students helping strangers online while the perfect mentor sat 3 hostels away.
                </p>
              </div>
            </div>

            {/* Resolution Block */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-10 md:p-16 text-center border border-indigo-100 shadow-xl"
            >
              <div className="relative w-24 h-24 mx-auto mb-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute inset-0 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 z-10"
                >
                  <span className="text-white font-black text-4xl">E</span>
                </motion.div>
                <div className="absolute inset-0 bg-indigo-400/20 rounded-3xl -rotate-6" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-3xl rotate-6" />
              </div>

              <div className="max-w-2xl mx-auto font-caveat text-3xl text-slate-800 leading-relaxed mb-12">
                <p className="mb-8">"Arjun opened EduSync. Searched 'VLSI Design.'"</p>
                <p className="mb-8">
                  Found Priya — 3rd year, Deccan Engineering University, perfect score in Embedded Systems lab, 4 free hours per week.
                </p>
                <p>
                  He sent a swap request:<br />
                  <span className="text-indigo-600 font-bold">'I'll teach you React for 4 hours. Can you help me understand VLSI layouts?'</span><br />
                  She accepted in 11 minutes.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-full font-caveat text-xl shadow-lg"
                >
                  📅 First session: 2 days later
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-full font-caveat text-xl shadow-lg"
                >
                  📈 Arjun's score: 79% (was 31%)
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-full font-caveat text-xl shadow-lg"
                >
                  ⭐ Priya project: 9.1 CGPA
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-24 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 font-outfit tracking-tight">Getting started takes 3 minutes.</h2>
            <p className="text-slate-500 text-lg">Knowledge exchange refined to its simplest form.</p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-12 md:gap-8 relative">
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">1</div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Join your campus</h3>
              <p className="text-slate-500">Sign up with your institutional email. We verify your campus automatically.</p>
            </div>

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl shadow-emerald-600/20 group-hover:scale-110 transition-transform">2</div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Share your skills</h3>
              <p className="text-slate-500">Tell us what you can teach and what you want to learn. Takes 2 minutes.</p>
            </div>

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">3</div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Swap & earn Karma</h3>
              <p className="text-slate-500">Match with peers. Swap knowledge. Earn Karma you can spend across the Nexus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES GRID */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 font-outfit tracking-tight">Everything a student ecosystem needs.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Globe, color: 'indigo', title: 'Nexus Mode', desc: 'Discover skills and resources beyond your own campus. Toggle Nexus Mode to access the full inter-campus network.' },
              { icon: Zap, color: 'amber', title: 'Karma Economy', desc: 'No money changes hands. Teach to earn Karma. Spend Karma to learn. Fair. Transparent. Trackable.' },
              { icon: BookOpen, color: 'emerald', title: 'Knowledge Vault', desc: 'Verified notes, PDFs, and study guides uploaded by students. Admin-certified resources you can actually trust.' },
              { icon: ShieldCheck, color: 'slate', title: 'Admin Oversight', desc: 'Every interaction is moderated. Campus admins maintain academic integrity across the entire Nexus network.' },
              { icon: MessageSquare, color: 'purple', title: 'Real-Time Chat', desc: 'Direct messaging with Nexus Bridge for cross-campus swaps. All conversations are monitored for safety.' },
              { icon: Search, color: 'rose', title: 'Smart Matching', desc: 'We recommend who you should meet based on your skills, learning goals, and campus network proximity.' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-100 hover:border-indigo-500/30 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 text-${feature.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 font-outfit">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIALS */}
      <section className="bg-slate-900 py-24 px-6 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-outfit tracking-tight">What students are saying.</h2>
            <p className="text-slate-400 text-lg">Real stories from the EduSync network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden ring-2 ring-indigo-500/20">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatar_seed}`} alt={t.name} />
                  </div>
                  <div>
                    <div className="text-white font-bold">{t.name}</div>
                    <div className="text-indigo-400 text-sm font-medium">{t.campus}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{t.dept}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-indigo-600 opacity-20 font-serif">"</span>
                  <p className="font-caveat text-2xl text-slate-300 leading-relaxed italic relative z-10">
                    {t.quote}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CAMPUS NETWORK */}
      <section className="bg-white py-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4 font-outfit tracking-tight">Our growing campus network.</h2>
          <p className="text-slate-500 text-lg mb-16">5 partner institutions. 2,400+ students. 1 unified knowledge economy.</p>

          <div className="relative max-w-lg mx-auto aspect-square mb-16">
            {/* Center Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                <span className="text-white font-black text-3xl">E</span>
              </div>
            </div>

            {/* Orbit Paths */}
            <div className="absolute inset-0 border border-slate-100 rounded-full" />
            
            {/* Campus Nodes */}
            {[
              { code: 'NIT-N', color: 'indigo', pos: 'top-0 left-1/2 -translate-x-1/2' },
              { code: 'DEU', color: 'emerald', pos: 'top-1/4 right-0 translate-x-1/2' },
              { code: 'VCST', color: 'amber', pos: 'bottom-1/4 right-0 translate-x-1/2' },
              { code: 'ITU', color: 'purple', pos: 'bottom-0 left-1/2 -translate-x-1/2' },
              { code: 'SIAS', color: 'rose', pos: 'top-1/2 left-0 -translate-x-1/2' },
            ].map((node, i) => (
              <div key={i} className={`absolute ${node.pos} flex items-center justify-center`}>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-white border-2 border-${node.color}-100 flex items-center justify-center text-xs font-black text-slate-800 shadow-lg`}>
                    {node.code}
                  </div>
                  <div className={`absolute inset-0 rounded-2xl ring-4 ring-${node.color}-500/20 animate-ping`} style={{ animationDelay: `${i * 0.4}s` }} />
                </div>
                {/* Connector SVG */}
                <svg className="absolute top-1/2 left-1/2 -z-10 translate-x-0 translate-y-0 overflow-visible" width="1" height="1">
                  <line x1="0" y1="0" x2={-100} y2={-100} stroke="#e2e8f0" strokeWidth="1.5" />
                </svg>
              </div>
            ))}
          </div>

          <div className="text-slate-600">
            Your college isn't on our network yet?<br />
            <a href="#" className="text-indigo-600 font-bold underline hover:text-indigo-800 transition-colors">Apply for partnership →</a>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="relative py-32 bg-indigo-600 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 px-6">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 font-outfit tracking-tighter">Ready to find your Nexus?</h2>
          <p className="text-indigo-100 text-lg md:text-xl max-w-xl mx-auto mb-12">
            Join free. Verify your campus email. Start swapping in minutes.
          </p>
          <Link to="/login" className="px-12 py-6 bg-white text-indigo-700 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-2xl shadow-black/20 active:scale-95">
            Create Your Account
          </Link>
          <div className="mt-8">
            <Link to="/login" className="text-white/60 hover:text-white transition-colors text-sm underline">
              Already a member? Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* SHORTCUT LINKS SECTION */}
      <section className="bg-slate-900 border-t border-slate-800 relative z-10 overflow-hidden py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8 opacity-60">Quick Navigation</div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 md:gap-x-20">
              <Link to="/explore" className="group flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Find Mentors</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-indigo-500 transition-all duration-300" />
              </Link>
              <Link to="/vault" className="group flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Study Vault</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-indigo-500 transition-all duration-300" />
              </Link>
              <Link to="/campus-charter" className="group flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Nexus Protocol</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-indigo-500 transition-all duration-300" />
              </Link>
              <Link to="/honor-code" className="group flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Honor Code</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-indigo-500 transition-all duration-300" />
              </Link>
              <Link to="/help" className="group flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Help Center</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-indigo-500 transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer dark />
    
    
        {/* Institute Portal CTA */}
        <section className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
              <Building2 size={14} className="text-indigo-400" />
              <span className="text-indigo-400 text-[11px] font-black uppercase tracking-widest">For Institution Administrators</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white font-outfit tracking-tight mb-6">
              Bring Your Campus<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Into the Federation</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
              Give your institution the authority to govern, monitor, and empower student knowledge exchange at scale. Join 5+ partner campuses already running on EduSync.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/institute/onboarding"
                className="group px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/30"
              >
                <Building2 size={20} />
                Register Your Campus
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/institute/dashboard"
                className="px-10 py-5 border border-white/10 hover:border-indigo-500/50 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all flex items-center gap-3 hover:bg-white/5"
              >
                <Globe size={18} />
                View Dashboard Demo
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { value: '5+', label: 'Partner Campuses' },
                { value: '2.4K+', label: 'Active Students' },
                { value: '842', label: 'Knowledge Swaps' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-white font-outfit">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      )
}
