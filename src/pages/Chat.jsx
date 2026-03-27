import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Globe, ShieldCheck, Zap, 
  Search, SlidersHorizontal, ArrowLeft, 
  MoreVertical, Calendar, MessageSquare, Plus,
  Info, Rocket, AlertCircle, Phone, Video
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatService } from '../services/chatService'
import { useAuthStore } from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function Chat() {
  const { conversationId } = useParams()
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  // 1. Fetch Conversations (Sidebar)
  const { data: conversations, isLoading: loadingChats } = useQuery({
    queryKey: ['conversations', profile.id],
    queryFn: () => chatService.getConversations(profile.id),
    enabled: !!profile.id
  })

  // 2. Fetch Messages (Current Thread)
  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId
  })

  // 3. Real-time Subscription
  useEffect(() => {
    if (!conversationId) return
    
    const subscription = chatService.subscribeToMessages(conversationId, (newMsg) => {
      // Optimistically update or invalidate
      queryClient.setQueryData(['messages', conversationId], (oldData) => {
        if (!oldData) return [newMsg]
        // Avoid duplicate if it's the one we just sent
        if (oldData.some(m => m.id === newMsg.id)) return oldData
        return [...oldData, newMsg]
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, queryClient])

  // 4. Send Mutation
  const sendMutation = useMutation({
    mutationFn: (content) => chatService.sendMessage(conversationId, profile.id, content),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })

  const currentChat = useMemo(() => 
    conversations?.find(c => c.id === conversationId), 
    [conversations, conversationId]
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMutation.mutate(message)
  }

  if (loadingChats) return <Spinner fullscreen />

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex bg-white rounded-[3rem] shadow-2xl shadow-indigo-200 border border-slate-100 overflow-hidden my-6">
      {/* LEFT: Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter shrink-0">Nexus Bridge</h2>
            <button className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:scale-110 transition-transform">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              placeholder="Search conversations..."
              className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {conversations?.map(chat => (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className={`flex items-center gap-4 p-4 rounded-3xl transition-all h-[90px] ${conversationId === chat.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'hover:bg-slate-50 text-slate-900 border border-transparent hover:border-slate-100'}`}
            >
              <Avatar seed={chat.id} size="md" ring />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black truncate text-sm">Nexus Member</h4>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${conversationId === chat.id ? 'text-indigo-100' : 'text-slate-400'}`}>12:45</span>
                </div>
                <p className={`text-xs truncate font-medium ${conversationId === chat.id ? 'text-indigo-100 opacity-80' : 'text-slate-500'}`}>
                  {chat.last_message || 'Active Skill Exchange...'}
                </p>
              </div>
              {chat.is_nexus_bridge && (
                <div className={`w-2 h-2 rounded-full ${conversationId === chat.id ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
              )}
            </Link>
          ))}

          {!conversations?.length && (
            <div className="py-20 text-center opacity-30 px-6">
              <MessageSquare className="mx-auto mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">No encrypted bridge channels active.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Thread Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {conversationId ? (
          <>
            {/* Thread Header */}
            <div className="p-6 bg-white border-b border-slate-50 flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-4">
                <Link to="/chat" className="md:hidden p-2 text-slate-400"><ArrowLeft size={20} /></Link>
                <div className="relative">
                  <Avatar seed={conversationId} size="md" ring />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 font-outfit uppercase tracking-tighter">Nexus Member</h3>
                    <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest leading-none">Verified Mentor</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none mt-1">
                    <ShieldCheck size={10} className="text-emerald-500" /> AES-256 Encrypted Session
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"><Video size={20} /></button>
                <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"><Phone size={20} /></button>
                <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
              <div className="py-10 text-center px-10">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/50 shadow-lg shadow-indigo-100">
                  <Globe className="animate-spin-slow" size={16} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Nexus Bridge Active across institutional nodes.</span>
                </div>
              </div>

              {messages?.map((msg, i) => {
                const isMe = msg.sender_id === profile.id
                return (
                  <motion.div 
                    key={msg.id || i}
                    initial={{ opacity: 0, scale: 0.9, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-4`}
                  >
                    {!isMe && <div className="mr-4 mt-auto"><Avatar seed={msg.id} size="xs" ring /></div>}
                    <div className={`relative max-w-sm lg:max-w-md ${isMe ? 'order-1' : 'order-2'}`}>
                      <div className={`
                        px-6 py-4 rounded-[2rem] text-sm font-medium leading-relaxed
                        ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm shadow-xl shadow-indigo-200' : 'bg-white text-slate-900 border border-slate-100 rounded-tl-sm shadow-sm'}
                      `}>
                        {msg.content}
                      </div>
                      <div className={`text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-2 ${isMe ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                        12:48 PM
                        {isMe && <ShieldCheck size={10} className="text-indigo-400" />}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white border-t border-slate-50 relative z-10 shadow-lg">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><Zap size={20} /></button>
                  <div className="w-px h-6 bg-slate-100" />
                </div>
                <input 
                  value={message}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message or share a vault resource..."
                  className="w-full pl-20 pr-32 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[2rem] text-sm font-bold focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Button 
                    type="submit" 
                    variant="primary" 
                    className="rounded-2xl px-6 py-3 shadow-lg shadow-indigo-600/30 group-hover:scale-105"
                    disabled={!message.trim()}
                    icon={Rocket}
                   >
                     Send
                   </Button>
                </div>
              </form>
              <div className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                Maintain Institutional Professionalism. Guardian AI Moderation Active.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-white">
            <div className="absolute inset-0 bg-indigo-50/30 opacity-20 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-indigo-100 rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10 stagger-item">
              <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-200">
                <Globe size={64} className="animate-spin-slow" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 font-outfit uppercase tracking-tighter">Your Nexus Bridge</h2>
              <p className="text-slate-500 max-w-sm mx-auto mb-10 text-lg italic leading-relaxed">
                Connect your campus nodes. Secure, immutable communication for peer-to-peer knowledge exchange.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {[
                  { icon: ShieldCheck, label: 'Audit Grade Protected' },
                  { icon: Zap, label: 'Instant Skill Request' },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center gap-3">
                    <item.icon className="text-indigo-600" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
