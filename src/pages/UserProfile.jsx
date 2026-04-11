import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, MapPin, BookOpen, Star, 
  MessageSquare, Shield, Zap, Award,
  ArrowLeft, Mail, ExternalLink, GraduationCap
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { chatService } from '../services/chatService'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import KarmaChip from '../components/shared/KarmaChip'
import CampusBadge from '../components/shared/CampusBadge'
import { toast } from 'sonner'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { profile: currentUser } = useAuthStore()
  const [userProfile, setUserProfile] = useState(null)
  const [userSkills, setUserSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [isStartingChat, setIsStartingChat] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setUserProfile(profile)

      // 2. Fetch User's Skills
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('mentor_id', userId)
        .eq('status', 'active')

      if (skillsError) throw skillsError
      setUserSkills(skills)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      toast.error('Failed to load portal identity.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (!currentUser) {
      toast.error('Identity authentication required.')
      return
    }
    
    setIsStartingChat(true)
    try {
      const convoId = await chatService.startConversation([currentUser.id, userId])
      navigate(`/chat/${convoId}`)
    } catch (err) {
      toast.error('Nexus bridge failed to initialize.')
    } finally {
      setIsStartingChat(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Nexus Data...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="p-20 text-center">
        <Shield size={64} className="mx-auto mb-6 text-slate-200" />
        <h1 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Identity Not Found</h1>
        <p className="text-slate-500 mb-8">This portal ID does not exist in the EduSync Nexus.</p>
        <Button onClick={() => navigate(-1)} variant="secondary" icon={ArrowLeft}>Return to Hub</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Profile Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-8 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Internal Return
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <Avatar 
                src={userProfile.avatar_url} 
                className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] ring-8 ring-slate-50"
              />
              <div className="absolute -bottom-2 -right-2">
                <KarmaChip karma={userProfile.karma_balance} className="px-4 py-2 text-lg" />
              </div>
            </motion.div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-outfit tracking-tighter">
                  {userProfile.full_name}
                </h1>
                <CampusBadge campusId={userProfile.campus_id} />
              </div>

              <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                {userProfile.bio || 'This student has not yet synchronized their bio with the Nexus. Likely focused on deep-work.'}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 font-bold text-xs">
                  <GraduationCap size={16} className="text-indigo-500" /> {userProfile.department}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 font-bold text-xs">
                  <MapPin size={16} className="text-emerald-500" /> {userProfile.campus_id} Node
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto pt-4 md:pt-0">
              {currentUser?.id === userId ? (
                <Button 
                  onClick={() => navigate('/settings')} 
                  variant="secondary" 
                  fullWidth
                >
                  Modify Identity
                </Button>
              ) : (
                <Button 
                  onClick={handleStartChat} 
                  variant="primary" 
                  icon={MessageSquare}
                  loading={isStartingChat}
                  fullWidth
                  className="shadow-xl shadow-indigo-200"
                >
                  Nexus Bridge
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Stats & Info */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Expertise Distribution
            </h3>
            <div className="space-y-4">
              {userProfile.skills_to_teach?.length > 0 ? (
                userProfile.skills_to_teach.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-700">{skill}</span>
                    <Award size={16} className="text-indigo-500" />
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No expertise declared.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BookOpen size={14} className="text-indigo-500" /> Learning Path
            </h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills_to_learn?.length > 0 ? (
                userProfile.skills_to_learn.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No active learning goals.</p>
              )}
            </div>
          </section>

          <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white">
            <Shield className="text-indigo-400 mb-4" size={32} />
            <h4 className="text-lg font-black font-outfit uppercase tracking-tighter mb-2">Institutional Verification</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              This identity has been verified through the {userProfile.campus_id} institutional portal. 
              Trust Level: **SECURE**.
            </p>
          </div>
        </div>

        {/* Right Side: Listed Skills */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Knowledge Nodes</h2>
            <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black">{userSkills.length} ACTIVE</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userSkills.length > 0 ? (
              userSkills.map((skill) => (
                <motion.div 
                  key={skill.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tight">
                      {skill.category}
                    </div>
                    <KarmaChip karma={skill.karma_cost} small />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-4 font-outfit leading-tight group-hover:text-indigo-600 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                  <Button 
                    onClick={() => navigate(`/explore/skill/${skill.id}`)}
                    variant="secondary" 
                    size="sm" 
                    fullWidth
                    icon={ArrowRight}
                  >
                    View Protocol
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-20 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No public expertise nodes found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
