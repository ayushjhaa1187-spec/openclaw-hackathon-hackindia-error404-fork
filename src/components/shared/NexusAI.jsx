import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Sparkles, X, MessageSquare, 
  Terminal, Bot, Info, ShieldCheck, 
  Zap, ArrowRight, User
} from 'lucide-react'
import { model } from '../../lib/gemini'
import { useAuthStore } from '../../stores/authStore'
import { MOCK_SKILLS, MOCK_RESOURCES } from '../../data/mockData'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'

export default function NexusAI() {
  const { profile } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [chat, setChat] = useState([
    { 
      role: 'ai', 
      content: profile 
        ? `Identity Verified: ${profile.full_name} (${profile.campus_id}). I am Nexus AI — your institutional guide. How can I facilitate your knowledge exchange today?`
        : "Neural link detected. I am Nexus AI — your institutional guide. Please identify yourself to access the full knowledge federation."
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    setChat(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      // Create context block for Gemini performance
      const context = `
        USER PROFILE: ${profile?.full_name} (${profile?.department}), Goals: ${profile?.learning_goals?.join(', ')}.
        OFFERINGS: Skills(${MOCK_SKILLS.length}), Resources(${MOCK_RESOURCES.length}).
      `;

      const result = await model.generateContent(`${context}\nUser Question: ${userMsg}`);
      const response = await result.response;
      setChat(prev => [...prev, { role: 'ai', content: response.text() }])
    } catch (error) {
      setChat(prev => [...prev, { role: 'ai', content: "Neural link timeout. Ensure VITE_GEMINI_API_KEY is active in the Nexus Control Panel." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-[60] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[90vw] md:w-[420px] h-[600px] max-h-[70vh] bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* AI Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 relative">
                  <Bot size={24} />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest font-outfit">Nexus Intelligence</h3>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">
                    <Terminal size={10} /> Gemini 1.5 Protocol Active
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide no-scrollbar">
              {chat.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-xl' 
                      : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-sm'}
                  `}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* AI Footer */}
            <div className="p-6 bg-black/40 border-t border-white/10">
              <form onSubmit={handleSend} className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Nexus anything..."
                  className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600 text-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
                <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={10} className="text-emerald-500" /> Secure Encryption
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <Sparkles size={10} className="text-indigo-400" /> LLM Augmented
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all relative z-[70]
          ${isOpen ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white shadow-indigo-600/40'}
        `}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative">
            <Sparkles size={28} />
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-white/40 rounded-full"
            />
          </div>
        )}
      </motion.button>
    </div>
  )
}
