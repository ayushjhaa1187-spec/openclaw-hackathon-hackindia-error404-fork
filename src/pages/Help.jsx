import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Minus, Mail, PlayCircle, HelpCircle, MessageSquare } from 'lucide-react'

const FAQ = ({ question, answer, isOpen, onToggle }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl mb-4 overflow-hidden shadow-lg transition-all hover:bg-white/10">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
    >
      <span className="text-xl font-bold text-white pr-8 font-outfit">{question}</span>
      <div className={`p-2 rounded-xl bg-indigo-500/10 text-indigo-400 transform transition-transform ${isOpen ? 'rotate-180 bg-indigo-500/20' : ''}`}>
        {isOpen ? <Minus size={20} /> : <Plus size={20} />}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="px-6 md:px-8 pb-8 text-slate-400 text-lg leading-relaxed border-t border-white/10 pt-6">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openIdx, setOpenIdx] = useState(0)

  const faqs = [
    {
      question: "How do I sign up for EduSync?",
      answer: "Signing up is simple. Click the 'Get Started' button on the landing page and use your official campus email ending in .edu.in. This ensures you're matched with your specific institution's knowledge network."
    },
    {
      question: "What is Karma and how do I earn it?",
      answer: "Karma is our internal knowledge currency. You earn Karma by helping others—teaching a skill swap session (+50 to +200 Karma), uploading verified resources to the Vault (+10 to +50 Karma per unlock), or receiving 5-star reviews from peers (+25 bonus)."
    },
    {
      question: "How does a Skill Swap work?",
      answer: "Once you find a skill you want to learn, submit a swap request to the mentor. You can offer Karma or a skill of your own in return. Once they accept, a private chat channel opens (within the Nexus Bridge for cross-campus sessions) and you can schedule your meeting."
    },
    {
      question: "What is 'Nexus Mode' exactly?",
      answer: "By default, you see people and resoruces within your own campus. Nexus Mode expands this discovery pool to every partner institution in the EduSync network, allowing you to learn from peers at other universities."
    },
    {
      question: "Can I use EduSync for group study?",
      answer: "Currently, EduSync is optimized for 1-on-1 peer mentoring to ensure high quality and accountability. However, you can use the Chat feature to coordinate larger groups for exam prep or collective project work."
    },
    {
      question: "How do I report an issue or moderation concern?",
      answer: "If you encounter content that violates our Honor Code or have a technical problem, use the 'Report' button available on every listing or message. Our Guardian AI and campus admins monitor and act on flags 24/7."
    }
  ]

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-24 px-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
            <HelpCircle size={16} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium uppercase tracking-widest">Help Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 font-outfit tracking-tighter shadow-2xl">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">help you?</span>
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Search for questions, karma tips, or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xl"
            />
          </div>
        </motion.div>

        <section className="mb-20">
          <h2 className="text-3xl font-black text-white mb-8 font-outfit uppercase tracking-wider flex items-center gap-4">
            <PlayCircle className="text-indigo-400" /> Frequently Asked Questions
          </h2>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((f, i) => (
              <FAQ 
                key={i} 
                question={f.question} 
                answer={f.answer} 
                isOpen={openIdx === i} 
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} 
              />
            ))
          ) : (
            <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-2xl text-slate-500 font-medium">No results found for "{searchTerm}"</p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Mail size={100} className="text-white" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 relative z-10">Email Support</h3>
            <p className="text-indigo-100 text-lg mb-8 max-w-[80%] relative z-10">Still have a question? Our support team is here to help you 24/7.</p>
            <a href="mailto:support@edusync.nexus" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:gap-4 transition-all relative z-10">
              Compose Email <Mail size={20} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <MessageSquare size={100} className="text-white" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 relative z-10">Community Discord</h3>
            <p className="text-slate-400 text-lg mb-8 max-w-[80%] relative z-10">Join 1,000+ peers in our official Discord community.</p>
            <a href="#" className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:gap-4 transition-all relative z-10">
              Join Discord <MessageSquare size={20} />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center pt-10 border-t border-white/10"
        >
          <p className="text-slate-500 text-sm italic">"The only way to do great work is to love what you do." — Knowledge is power.</p>
        </motion.div>
      </div>
    </div>
  )
}
