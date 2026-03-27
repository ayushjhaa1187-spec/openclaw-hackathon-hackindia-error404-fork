import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Users, Zap, BookOpen, Star, Building2, Globe, MessageSquare, ShieldCheck, Search, ArrowRight 
} from 'lucide-react'
import { MOCK_TESTIMONIALS } from '../data/mockData'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <div className="overflow-x-hidden">
      {/* SECTION 1 — HERO */}
      <section className="relative min-h-screen bg-navy text-white flex flex-col pt-6 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-25 pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-purple-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        {/* Top Bar */}
        <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20">E</div>
            <span className="text-2xl font-black tracking-tight font-outfit">EduSync</span>
          </div>
          <Link to="/login">
            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-white/10">Sign In</Button>
          </Link>
        </nav>

        {/* Hero Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="indigo" className="bg-indigo-900/50 text-indigo-300 border-indigo-500/30 mb-8 py-2 px-4 shadow-xl">
              🎓 Built for Indian University Students
            </Badge>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-outfit text-5xl md:text-7xl font-black tracking-tight leading-tight max-w-4xl">
            Your Campus Has <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">10,000 Brilliant Minds.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-indigo-300 text-xl md:text-2xl mt-6 font-medium tracking-tight">
            You just haven't met the right one yet.
          </motion.p>

          <motion.p variants={fadeInUp} className="text-slate-400 text-base md:text-lg max-w-lg mt-8 leading-relaxed font-sans">
            EduSync connects students across campuses to swap skills, share knowledge, and grow together — powered by Karma, not cash.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto h-16 px-10">Get Started Free</Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-16 px-10" onClick={() => document.getElementById('story').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-slate-500 text-sm mt-10 font-bold uppercase tracking-widest">
            Trusted by students from Northvale, Deccan, Vistara & more
          </motion.p>

          {/* Floating Stat Chips */}
          <div className="flex flex-wrap gap-4 mt-16 justify-center">
            {[
              { icon: Users, value: "2,400+", label: "Students", delay: 0 },
              { icon: Zap, value: "840", label: "Skill Swaps", delay: 0.5 },
              { icon: BookOpen, value: "1,200+", label: "Resources", delay: 1 }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5 + idx * 0.5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex items-center gap-3 shadow-2xl"
              >
                <stat.icon size={18} className="text-indigo-400" />
                <div className="text-left leading-none">
                  <div className="text-lg font-black tracking-tight leading-none">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — THE STORY */}
      <section id="story" className="relative py-24 bg-cream overflow-hidden">
        {/* Rule Lines */}
        <div className="absolute inset-0 notebook-lines opacity-100 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-caveat text-6xl md:text-8xl text-slate-800 leading-tight"
          >
            A story every engineering student <br />
            has lived through...
          </motion.h2>

          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-48 h-1.5 bg-indigo-500 rounded-full mx-auto mt-6" 
          />

          {/* Story Block 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-col md:flex-row gap-0 overflow-hidden bg-white rounded-3xl shadow-xl border-l-[6px] border-rose-400 text-left"
          >
            <div className="w-full md:w-[40%] bg-navy p-8 flex items-center justify-center min-h-[300px]">
              <div className="relative w-48 h-48">
                {/* Simple Laptop + Figure SVG */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-20 bg-slate-800 rounded-t-lg border-2 border-slate-700 shadow-[0_0_30px_rgba(251,191,36,0.3)] shadow-inner">
                  <div className="absolute inset-2 bg-amber-400/20 animate-pulse rounded" />
                </div>
                <div className="absolute bottom-0 left-12 w-24 h-4 bg-slate-900 rounded-b-lg" />
                <div className="absolute top-10 left-12 w-24 h-24 text-white text-9xl opacity-10 font-bold tracking-tighter pointer-events-none select-none">
                  ?
                </div>
              </div>
            </div>
            <div className="w-full md:w-[60%] p-10 md:p-14">
              <span className="text-rose-500 font-bold uppercase tracking-widest text-sm block mb-4">Chapter 1 — The Wall</span>
              <p className="font-caveat text-2xl md:text-3xl text-slate-700 leading-relaxed">
                Arjun was a 3rd-year Electronics student at <span className="text-indigo-600 font-bold">Northvale Institute of Technology</span>.<br /><br />
                It was 2 AM on a Tuesday. His Embedded Systems exam was in 4 days. He had hit a wall — 
                VLSI Circuit Design. The kind of topic that made you question every life choice.<br /><br />
                He'd watched 6 YouTube videos. Read 3 chapters. Posted in 4 WhatsApp groups. Silence.<br /><br />
                His professor replied the next morning: 'Refer to the standard textbook, Chapter 9.'<br /><br />
                Chapter 9 was where his confusion had started.
              </p>
              <div className="mt-8">
                <Badge variant="rose" className="text-sm py-1.5 px-4">😤 Frustrated. Stuck. Alone.</Badge>
              </div>
            </div>
          </motion.div>

          {/* Story Block 2 */}
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-col md:flex-row-reverse gap-0 overflow-hidden bg-white rounded-3xl shadow-xl border-r-[6px] border-amber-400 text-left"
          >
            <div className="w-full md:w-[40%] bg-amber-50 p-8 flex items-center justify-center min-h-[300px]">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-amber-200/50 rounded-full blur-3xl" />
                <div className="relative z-10 w-full h-full border-4 border-amber-500/30 rounded-2xl flex items-center justify-center p-4">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {[1,2,3,4].map(i => <div key={i} className="h-8 bg-amber-500/20 rounded-md" />)}
                    <div className="col-span-2 h-16 bg-emerald-500/20 rounded-md border-2 border-emerald-500/30 flex items-center justify-center text-emerald-700 font-black">A+</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-[60%] p-10 md:p-14">
              <span className="text-amber-600 font-bold uppercase tracking-widest text-sm block mb-4">Chapter 2 — The Skill Nobody Knew About</span>
              <p className="font-caveat text-2xl md:text-3xl text-slate-700 leading-relaxed">
                700 kilometres south, at <span className="text-indigo-600 font-bold">Deccan Engineering University</span>, Priya had just finished her VLSI lab with a perfect score.<br /><br />
                Her professor had called her work 'exceptional.' She had a clear, simple method for CMOS layout that no textbook had ever explained properly.<br /><br />
                She also had 4 free hours every week.<br /><br />
                And she desperately wanted to learn React.js to build her final-year project. But the only tutors she found charged ₹800/hour. It wasn't a rate. It was a barrier.
              </p>
              <div className="mt-8">
                <Badge variant="amber" className="text-sm py-1.5 px-4">😔 Capable. Underutilized. Disconnected.</Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Story Block 3 — The Gap */}
        <div className="mt-24 pt-24 bg-slate-900/95 text-white pb-32">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="relative flex min-h-[300px] mb-12">
              <div className="flex-1 bg-slate-800/50 rounded-l-3xl p-12 flex flex-col items-center justify-center border border-slate-700">
                <div className="w-12 h-12 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-4" />
                <p className="text-indigo-300 font-caveat text-xl">Arjun's Desk</p>
              </div>
              <div className="w-1 bg-slate-700 relative">
                <motion.div 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500/30 blur-sm"
                />
              </div>
              <div className="flex-1 bg-slate-800/50 rounded-r-3xl p-12 flex flex-col items-center justify-center border border-slate-700">
                <div className="w-12 h-12 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-4" />
                <p className="text-amber-300 font-caveat text-xl">Priya's Desk</p>
              </div>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="font-caveat text-3xl md:text-5xl max-w-2xl mx-auto leading-relaxed"
            >
              700 km. Different colleges. Same problem. <br />
              Neither knew the other existed. <br />
              <span className="text-indigo-400 font-bold">Both had exactly what the other needed.</span>
            </motion.p>
            
            <p className="mt-12 text-slate-500 italic max-w-lg mx-auto leading-relaxed">
              This gap exists in every college network in India. Between every campus. Between every semester. 
              Students helping strangers online while the perfect mentor sat 3 hostels away.
            </p>
          </div>
        </div>

        {/* Story Block 4 — EduSync Arrives */}
        <div className="relative z-10 py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="relative flex items-center justify-center gap-24 mb-16">
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="relative z-10 w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center font-black text-white text-5xl shadow-2xl shadow-indigo-600/30">
                E
                <div className="absolute inset-[-15px] border-2 border-indigo-600/30 rounded-full animate-ping pointer-events-none" />
              </motion.div>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="font-caveat text-3xl md:text-4xl text-slate-800 leading-relaxed"
            >
              "Arjun opened EduSync. Searched 'VLSI Design.'<br /><br />
              Found Priya — 3rd year, Deccan Engineering University, perfect score in lab, 4 free hours.<br /><br />
              He sent a swap request: <span className="text-indigo-600 font-bold text-4xl italic">'I'll teach you React for 4 hours. Can you help me understand VLSI layouts?'</span><br /><br />
              She accepted in 11 minutes."
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 mt-16 font-caveat">
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg text-xl">📅 First session: 2 days later</motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg text-xl">📈 Arjun's exam: 79% (was 31%)</motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-600 text-white px-6 py-3 rounded-full shadow-lg text-xl">⭐ Priya built her React project. GOT 9.1 CGPA.</motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="bg-slate-50 py-24 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-outfit font-black text-slate-900 tracking-tight">Getting started takes 3 minutes.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-indigo-200" />
             
             <div className="relative z-10 text-center group">
               <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform">
                 <Building2 size={32} />
                 <div className="absolute top-[-10px] right-[-10px] w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-xl">1</div>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Join your campus</h3>
               <p className="text-slate-500 font-medium leading-relaxed">Sign up with your institutional email. We verify your campus automatically.</p>
             </div>

             <div className="relative z-10 text-center group">
               <div className="w-20 h-20 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform">
                 <Zap size={32} />
                 <div className="absolute top-[-10px] right-[-10px] w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-emerald-600 font-black text-xl">2</div>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">List what you know</h3>
               <p className="text-slate-500 font-medium leading-relaxed">Tell us what you can teach and what you want to learn. Takes 2 minutes.</p>
             </div>

             <div className="relative z-10 text-center group">
               <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform">
                 <Star size={32} />
                 <div className="absolute top-[-10px] right-[-10px] w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-amber-600 font-black text-xl">3</div>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Swap & grow</h3>
               <p className="text-slate-500 font-medium leading-relaxed">Match with peers. Swap knowledge. Earn Karma you can spend across the Nexus.</p>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES GRID */}
      <section className="bg-white py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-outfit font-black text-slate-900 tracking-tight">Everything a student ecosystem needs.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Globe, color: 'indigo', title: 'Nexus Mode', text: 'Discover skills beyond your own campus. Access the full inter-campus network with one switch.' },
              { icon: Zap, color: 'amber', title: 'Karma Economy', text: 'No money changes hands. Teach to earn Karma. Spend Karma to learn. Fair, transparent, and student-powered.' },
              { icon: BookOpen, color: 'emerald', title: 'Knowledge Vault', text: 'Verified notes, PDFs, and study guides uploaded by students. Peer-reviewed material you can trust.' },
              { icon: ShieldCheck, color: 'slate', title: 'Admin Oversight', text: 'Every interaction moderated by campus admins. Maintaining academic integrity across the whole Nexus.' },
              { icon: MessageSquare, color: 'purple', title: 'Real-Time Chat', text: 'Direct messaging with Nexus Bridge for cross-campus swaps. Monitored for safety and academic focus.' },
              { icon: Search, color: 'rose', title: 'Smart Matching', text: 'AI-driven recommendations based on your unique skills, goals, and academic year.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-indigo-500/30 transition-all hover:bg-slate-50/50"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 flex items-center justify-center text-${feature.color}-600 mb-8`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-widest">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — TESTIMONIALS */}
      <section className="bg-navy py-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-outfit font-black tracking-tight mb-4">What students are saying.</h2>
            <p className="text-indigo-300 text-lg">Real stories from the EduSync network.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-2xl"
              >
                <div className="absolute top-[-20px] left-[-10px] text-white/5 text-9xl font-black italic pointer-events-none select-none">“</div>
                <div className="relative z-10 flex items-center gap-4 mb-8">
                  <Avatar name={t.name} seed={t.avatar_seed} size="lg" />
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <p className="text-indigo-400 text-sm font-medium">{t.campus}</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5">{t.dept}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#fbbf24" stroke="none" />
                  ))}
                </div>
                <p className="font-caveat text-2xl md:text-3xl text-slate-300 italic leading-relaxed group-hover:text-white transition-colors">
                  "{t.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — CAMPUS NETWORK */}
      <section className="bg-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-outfit font-black text-slate-900 mb-6 tracking-tight">Our growing campus network.</h2>
          <p className="text-slate-500 text-lg mb-16">5 partner institutions. 2,400+ students. 1 unified knowledge economy.</p>
          
          <div className="relative w-full max-w-lg mx-auto h-[400px] flex items-center justify-center">
            {/* Network Visualization */}
            <div className="absolute w-[300px] h-[300px] border border-slate-100 rounded-full border-dashed animate-spin-slow pointer-events-none" />
            
            <motion.div className="relative z-20 w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-600/30">
              E
            </motion.div>
            
            {[
              { label: 'NIT-N', pos: 'top-0 left-1/2 -translate-x-1/2', color: 'indigo' },
              { label: 'DEU', pos: 'top-1/4 right-0', color: 'emerald' },
              { label: 'VCST', pos: 'bottom-1/4 right-0', color: 'amber' },
              { label: 'ITU', pos: 'bottom-0 left-1/2 -translate-x-1/2', color: 'purple' },
              { label: 'SIAS', pos: 'bottom-1/4 left-0', color: 'rose' }
            ].map((campus, i) => (
              <div key={i} className={`absolute ${campus.pos} z-10`}>
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-14 h-14 bg-white border-4 border-${campus.color}-500 rounded-full flex items-center justify-center text-${campus.color}-600 font-bold text-xs shadow-xl relative`}
                >
                  {campus.label}
                  <div className={`absolute inset-[-8px] border-2 border-${campus.color}-500/20 rounded-full pulse-ring`} style={{ animationDelay: `${i * 0.5}s` }} />
                </motion.div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-slate-600 font-medium">
            Your college isn't on our network yet? <br />
            <Link to="/404" className="text-indigo-600 underline font-bold hover:text-indigo-800">Apply for partnership →</Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter mb-8 leading-tight">Ready to find your Nexus?</h2>
          <p className="text-indigo-100 text-lg md:text-xl font-medium mb-12 opacity-80 leading-relaxed">Join free. Verify your campus email. Start swapping in minutes.</p>
          <Link to="/login">
            <Button variant="white" size="lg" className="h-20 px-12 text-xl rounded-full group">
              Create Your Account
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-10 text-white/60 font-medium">
            Already a member? <Link to="/login" className="text-white underline font-bold ml-1">Sign in →</Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-20 px-6 text-center text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 group cursor-pointer">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black overflow-hidden group-hover:bg-indigo-400 transition-colors">E</div>
            <span className="text-xl font-bold text-white tracking-tight">EduSync</span>
          </div>
          <p className="font-medium text-slate-400">Bridging knowledge across campuses.</p>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm font-bold uppercase tracking-widest">
            <Link to="/404" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/404" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/404" className="hover:text-white transition-colors">Contact</Link>
            <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 w-full text-[10px] uppercase font-black tracking-[0.2em] opacity-40 leading-relaxed">
            HackIndia 2026 Submission · Team Error404 · Built with ❤️ for Indian students
          </div>
        </div>
      </footer>
    </div>
  )
}
