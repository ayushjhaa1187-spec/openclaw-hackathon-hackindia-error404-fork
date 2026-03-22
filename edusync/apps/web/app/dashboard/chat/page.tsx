"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Globe, Shield, User, Zap, Info, Lock, Building2, Star, AlertCircle, ChevronLeft, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sneha", text: "Hey! I saw you're offering help with VLSI. I'm from IIT Delhi, can we sync?", time: "10:30 AM", type: "received" },
    { id: 2, sender: "System", text: "Guardian AI: Connection verified via Nexus Bridge. Conversation is monitored for MOU compliance.", time: "10:31 AM", type: "system" },
    { id: 3, sender: "You", text: "Sure Sneha! I have some notes on FPGA architecture too. When are you free?", time: "10:32 AM", type: "sent" },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: "You",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "sent"
    }]);
    setInputMessage('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8 max-w-[1600px] mx-auto min-h-screen"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]">
        {/* Sidebar / Active Rooms */}
        <aside className="lg:col-span-1 glass-card border-white/5 bg-slate-900/40 p-0 flex flex-col overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-white/5 space-y-6">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                 <MessageSquare size={20} className="text-indigo-400" /> Active Syncs
              </h2>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[
                { name: "Sneha Reddy", campus: "IIT Delhi", lastMsg: "When are you free?", time: "2m", active: true, status: 'online' },
                { name: "Aryan Gupta", campus: "IIT Bombay", lastMsg: "The notes were helpful!", time: "1h", status: 'away' },
                { name: "Admin (IITJ)", campus: "Institutional", lastMsg: "MOU Audit Successful", time: "1d", status: 'offline' },
              ].map((room, i) => (
                 <div key={i} className={`p-4 rounded-2xl border transition-all cursor-pointer group ${room.active ? 'bg-indigo-600/10 border-indigo-500/50 shadow-xl shadow-indigo-600/10' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}`}>
                    <div className="flex gap-4 items-center">
                       <div className="relative">
                          <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.name}`} alt="avatar" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${room.status === 'online' ? 'bg-emerald-500' : room.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center mb-0.5">
                             <span className="text-xs font-black text-white tracking-widest uppercase italic">{room.name}</span>
                             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{room.time}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 leading-none">{room.campus}</span>
                            <p className="text-[10px] text-slate-400 font-medium truncate italic leading-none">{room.lastMsg}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           <div className="p-8 bg-black/20 border-t border-white/5 shadow-inner">
              <div className="flex items-center gap-4 group cursor-pointer">
                 <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                    <User size={18} />
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-indigo-400 transition-colors leading-none italic">Global Registry</span>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1 shadow-sm">Find Mentors Near You</p>
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Chat Area */}
        <section className="lg:col-span-3 glass-card border-white/5 bg-slate-900/60 p-0 flex flex-col overflow-hidden relative shadow-2xl">
           {/* Header */}
           <div className="p-8 border-b border-white/10 flex items-center justify-between bg-slate-950/40 relative z-10 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-6">
                 <div className="lg:hidden p-2 hover:bg-white/5 rounded-lg mr-2">
                    <ChevronLeft size={20} />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl border-2 border-indigo-500/50 overflow-hidden shadow-2xl shadow-indigo-600/20">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha" alt="avatar" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Sneha Reddy</h3>
                          <span className="verified-badge px-3 py-1 font-black italic shadow-[0_0_15px_rgba(16,185,129,0.1)]">Verified Peer</span>
                       </div>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">IIT DELHI • NEXUS NODE 04</span>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex flex-col items-end mr-4 group cursor-help">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-indigo-400 transition-colors leading-none italic">Karma Stake</span>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-black text-white italic tracking-widest">240</span>
                       <Star size={12} className="text-amber-400 fill-current" />
                    </div>
                 </div>
                 <button className="btn-secondary !p-3 group hover:border-red-500/30">
                    <AlertCircle size={18} className="group-hover:text-red-500 transition-colors" />
                 </button>
                 <button className="btn-primary flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-8 shadow-xl shadow-indigo-600/20 leading-none outline-none">
                    <Zap size={16} /> Sync Done
                 </button>
              </div>
           </div>

           {/* Messages Container */}
           <div className="flex-1 overflow-y-auto p-12 space-y-10 relative">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/20 to-transparent pointer-events-none" />
              
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.type === 'sent' ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'system' ? (
                      <div className="w-full max-w-2xl mx-auto py-1.5 px-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-3 shadow-xl">
                         <Shield size={14} className="text-indigo-400" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic font-bold">{msg.text}</span>
                      </div>
                    ) : (
                      <div className={`flex gap-4 max-w-[80%] ${msg.type === 'sent' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-lg border border-white/10 shrink-0 overflow-hidden shadow-lg mt-1 ${msg.type === 'sent' ? 'order-1' : ''}`}>
                            <img src={msg.type === 'sent' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"} alt="avatar" />
                         </div>
                         <div className={`space-y-2 ${msg.type === 'sent' ? 'items-end flex flex-col' : ''}`}>
                            <div className={`p-6 rounded-2xl shadow-2xl relative ${msg.type === 'sent' ? 'bg-indigo-600 border border-white/10 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none'}`}>
                               <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mt-1 italic">{msg.time} • {msg.type === 'sent' ? 'Delivered Nexus 01' : 'Institutional Relay'}</span>
                         </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           {/* Input Area */}
           <div className="p-8 border-t border-white/10 bg-slate-950/40 backdrop-blur-3xl relative z-10 shadow-inner">
              <form onSubmit={handleSendMessage} className="flex gap-6 items-center">
                 <div className="flex-1 relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-focus-within:bg-indigo-500 group-focus-within:text-white transition-all">
                       <Shield size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Type a secure message..." 
                      className="w-full pl-20 pr-6 py-5 bg-slate-900 border border-white/5 rounded-2xl text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all font-medium italic text-sm shadow-inner outline-none"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                    />
                 </div>
                 <button 
                   type="submit"
                   className="p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 group active:scale-95 transition-all border border-white/10 outline-none"
                 >
                    <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </button>
              </form>
              <div className="mt-6 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Lock size={12} className="text-slate-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">End-to-End Encrypted Tunnel Active • Institutional Grade Protocol</span>
                 </div>
                 <div className="flex items-center gap-2 py-1 px-3 bg-white/5 border border-white/10 rounded-lg">
                    <Building2 size={10} className="text-indigo-400" />
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none italic">MOU Tunnel: IIT Jammu ↔ IIT Delhi</span>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </motion.div>
  );
}
