import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Send, ChevronLeft, Info, Zap, Calendar, MoreVertical, Search, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react'
import { formatTimeAgo } from '../utils/formatters'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function Chat() {
  const { conversationId } = useParams()
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [activeChat, setActiveChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) return
    fetchConversations()
    
    // Subscribe to NEW messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        if (payload.new.conversation_id === conversationId) {
          setMessages(prev => [...prev, payload.new])
        }
        fetchConversations() // update previews
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, conversationId])

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      fetchActiveChat(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, profiles:participant_ids(*)')
      .contains('participant_ids', [user.id])
      .order('last_message_at', { ascending: false })

    if (!error) {
      // Map profiles to get the partner
      const formatted = data.map(conv => {
        const partner = conv.profiles.find(p => p.id !== user.id)
        return { ...conv, partner }
      })
      setConversations(formatted)
      setLoading(false)
    }
  }

  const fetchActiveChat = async (id) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, profiles:participant_ids(*)')
      .eq('id', id)
      .single()
    
    if (!error) {
       const partner = data.profiles.find(p => p.id !== user.id)
       setActiveChat({ ...data, partner })
    }
  }

  const fetchMessages = async (id) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (!error) {
      setMessages(data)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    const msg = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim()
    }

    // Update locally for speed (Optimistic UI)
    // setMessages(prev => [...prev, { ...msg, created_at: new Date().toISOString(), id: 'temp-'+Date.now() }])
    setNewMessage('')

    const { error } = await supabase
      .from('messages')
      .insert([msg])
    
    if (error) {
      console.error(error)
    } else {
       // update last message in conversation
       await supabase.from('conversations')
          .update({ 
            last_message: msg.content, 
            last_message_at: new Date().toISOString() 
          })
          .eq('id', conversationId)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Spinner /></div>

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden font-sans bg-slate-50 relative">
       {/* PANEL 1: SIDEBAR */}
       <div className={`${conversationId ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col bg-white border-r border-slate-200 z-20`}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
             <h2 className="text-2xl font-outfit font-black text-slate-900 uppercase tracking-tighter">Messages</h2>
             <button className="p-2 bg-slate-50 text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"><MessageSquare size={20} /></button>
          </div>
          <div className="p-4">
             <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search chats..."
                  className="w-full h-12 pl-12 pr-4 bg-slate-100/50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold transition-all"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
             {conversations.length > 0 ? (
                conversations.map(conv => (
                   <Link 
                     key={conv.id} 
                     to={`/chat/${conv.id}`}
                     className={`flex items-center gap-4 p-5 transition-all relative group ${conv.id === conversationId ? 'bg-indigo-50/50 border-r-[4px] border-indigo-600' : 'hover:bg-slate-50'}`}
                   >
                     <Avatar src={conv.partner?.avatar_url} name={conv.partner?.full_name} size="md" />
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1">
                           <h4 className={`text-sm font-black truncate uppercase tracking-tight ${conv.id === conversationId ? 'text-indigo-900' : 'text-slate-800'}`}>
                              {conv.partner?.full_name}
                           </h4>
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{formatTimeAgo(conv.last_message_at)}</span>
                        </div>
                        <p className={`text-xs font-medium truncate ${conv.id === conversationId ? 'text-indigo-600' : 'text-slate-500'}`}>
                           {conv.last_message || 'Start a conversation'}
                        </p>
                     </div>
                   </Link>
                ))
             ) : (
                <div className="p-10 text-center">
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No conversations yet.</p>
                </div>
             )}
          </div>
       </div>

       {/* PANEL 2: CHAT AREA */}
       <div className={`${conversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50 relative`}>
          {activeChat ? (
             <>
               {/* Chat Header */}
               <div className="px-6 h-[80px] flex items-center justify-between bg-white border-b border-slate-200 z-10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-4">
                     <button onClick={() => navigate('/chat')} className="md:hidden p-2 text-slate-400 hover:text-indigo-600">
                        <ChevronLeft size={24} />
                     </button>
                     <Avatar src={activeChat.partner?.avatar_url} name={activeChat.partner?.full_name} size="md" />
                     <div className="leading-tight">
                        <h3 className="text-lg font-outfit font-black text-slate-900 leading-none mb-1 uppercase tracking-tighter group cursor-pointer hover:text-indigo-600 transition-colors">
                          <Link to={`/profile/${activeChat.partner?.id}`}>{activeChat.partner?.full_name}</Link>
                        </h3>
                        {activeChat.is_nexus_bridge && <Badge variant="purple" size="sm" className="bg-purple-50 text-purple-600 border-none px-0"><ShieldCheck size={10} className="mr-1" /> Nexus Bridge Verified</Badge>}
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" className="hidden sm:flex text-slate-400 h-10 w-10 !p-0"><Zap size={20} /></Button>
                     <Button variant="ghost" className="text-slate-400 h-10 w-10 !p-0"><MoreVertical size={20} /></Button>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth bg-white/40">
                  {activeChat.is_nexus_bridge && (
                    <div className="flex justify-center mb-8">
                       <div className="bg-amber-50 border border-amber-100 px-6 py-2.5 rounded-2xl flex items-center gap-2 text-amber-700 text-[10px] font-black uppercase tracking-widest animate-pulse shadow-xl shadow-amber-50">
                          <Info size={14} className="animate-spin-slow" /> Official Nexus Bridge · Monitored
                       </div>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                     const isMine = msg.sender_id === user.id
                     return (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                           <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm border ${isMine ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                              {msg.content}
                              <div className={`text-[9px] font-black uppercase tracking-widest mt-1.5 opacity-40 ${isMine ? 'text-right' : 'text-left'}`}>
                                 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                        </motion.div>
                     )
                  })}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input Area */}
               <div className="p-6 bg-white border-t border-slate-200">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                     <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 h-14 pl-6 pr-16 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-indigo-600 font-bold text-slate-800 transition-all placeholder:text-slate-400 font-sans shadow-inner"
                     />
                     <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="absolute right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-indigo-100"
                     >
                        <Send size={18} />
                     </button>
                  </form>
               </div>
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 border border-indigo-50 flex items-center justify-center text-indigo-400 mb-8 animate-float">
                   <MessageSquare size={48} className="rotate-12" />
                </div>
                <h3 className="text-3xl font-outfit font-black text-slate-900 tracking-tighter mb-4 uppercase">Your Nexus Conversations.</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-12">Select a conversation from the sidebar to start swapping knowledge or explore the Nexus to meet new mentors.</p>
                <Button onClick={() => navigate('/explore')}>Discover Skills</Button>
             </div>
          )}
       </div>

       {/* PANEL 3: DETAIL PANEL (Desktop) */}
       {conversationId && activeChat && (
          <div className="hidden lg:flex w-[280px] bg-white border-l border-slate-200 flex-col items-center py-12 px-6 overflow-y-auto no-scrollbar">
             <Avatar src={activeChat.partner?.avatar_url} name={activeChat.partner?.full_name} size="xl" className="border-8 border-slate-50 shadow-2xl shadow-slate-200 mb-6" />
             <h4 className="text-2xl font-outfit font-black text-slate-900 uppercase tracking-tighter text-center leading-none mb-1">{activeChat.partner?.full_name}</h4>
             <p className="text-sm font-bold text-indigo-600 mb-8">{activeChat.partner?.department}</p>
             
             <div className="w-full space-y-4 pt-10 border-t border-slate-50">
                <div className="p-5 bg-slate-50 rounded-3xl text-center group cursor-pointer hover:bg-indigo-50 transition-all">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 mb-1">Karma Pool</p>
                   <span className="text-2xl font-black text-slate-900 group-hover:text-indigo-900">{activeChat.partner?.karma_balance}</span>
                </div>
                <Link to={`/profile/${activeChat.partner?.id}`} className="block">
                   <Button variant="outline" className="w-full h-14 rounded-2xl group">
                      View Profile <ChevronLeft size={16} className="rotate-180 ml-2 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </Link>
             </div>

             <div className="mt-auto pt-10 w-full space-y-2">
                <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors">Report Conversation</button>
             </div>
          </div>
       )}
    </div>
  )
}
