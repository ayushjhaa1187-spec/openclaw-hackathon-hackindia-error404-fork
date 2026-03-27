import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Camera, ChevronRight, ChevronLeft, Star, Zap, Rocket, Plus, X } from 'lucide-react'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'

const STEPS = 5

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const { user, profile, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: profile?.full_name || '',
      department: '',
      yearOfStudy: '',
      bio: '',
      skillsTeach: [],
      skillsLearn: []
    }
  })

  useEffect(() => {
    if (profile?.full_name) {
      setValue('fullName', profile.full_name)
    }
  }, [profile, setValue])

  const skillsTeach = watch('skillsTeach')
  const skillsLearn = watch('skillsLearn')
  const [customSkill, setCustomSkill] = useState('')

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setAvatarPreview(URL.createObjectURL(file))
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Avatar upload failed')
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setValue('avatarUrl', publicUrl)
  }

  const addSkill = (type, skill) => {
    const current = watch(type)
    if (current.length >= 8) return
    if (current.includes(skill)) return
    setValue(type, [...current, skill])
  }

  const removeSkill = (type, skill) => {
    const current = watch(type)
    setValue(type, current.filter(s => s !== skill))
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          department: data.department,
          year_of_study: parseInt(data.yearOfStudy),
          bio: data.bio,
          avatar_url: data.avatarUrl,
          onboarding_completed: true
        })
        .eq('id', user.id)

      if (error) throw error

      // Also insert initials skills to teach
      if (data.skillsTeach.length > 0) {
        const skillEntries = data.skillsTeach.map(title => ({
          title,
          category: 'Other',
          mentor_id: user.id,
          campus_id: profile.campus_id,
          status: 'active'
        }))
        await supabase.from('skills').insert(skillEntries)
      }

      updateProfile({ onboarding_completed: true })
      toast.success(`Welcome to EduSync, ${data.fullName.split(' ')[0]}! 🚀`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const next = () => setStep(s => Math.min(STEPS, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const PREDEFINED_SKILLS = [
    'Python', 'DSA', 'Machine Learning', 'React', 'Node.js', 'UI/UX Design', 
    'VLSI', 'Embedded Systems', 'Robotics', 'ROS2', 'Calculus', 'Physics',
    'Organic Chemistry', 'Economics', 'Data Science', 'Git & DevOps'
  ]

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 40 : -40, opacity: 0 })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 font-sans">
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        {/* Progress */}
        <div className="mt-8 mb-16">
          <div className="flex justify-between items-end mb-4">
             <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Step {step} of {STEPS}</span>
             <span className="text-sm font-bold text-indigo-600 font-outfit">{Math.round((step / STEPS) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(step / STEPS) * 100}%` }}
               className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
               <motion.div 
                 key="step1" custom={step} variants={variants} initial="enter" animate="center" exit="exit"
                 className="text-center"
               >
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-24 h-24 mx-auto mb-8"
                 >
                   <Avatar size="xl" name={watch('fullName')} seed={watch('fullName')} />
                 </motion.div>
                 <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight mb-4">
                   Hey {watch('fullName')?.split(' ')[0] || 'there'}! Welcome to EduSync 🎉
                 </h1>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto mb-12">
                   Let's set up your profile in 4 quick steps so we can find the right mentors and peers for you.
                 </p>
                 <Button size="lg" className="w-full h-16 text-lg rounded-2xl" onClick={next}>
                   Let's Go <ChevronRight size={20} />
                 </Button>
               </motion.div>
            )}

            {step === 2 && (
               <motion.div key="step2" custom={step} variants={variants} initial="enter" animate="center" exit="exit">
                 <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2">Create your presence.</h2>
                 <p className="text-slate-500 font-medium mb-10">How do you want the Nexus to see you?</p>
                 
                 <div className="space-y-8">
                   <div className="flex items-center gap-6">
                     <div className="relative group">
                       <Avatar size="xl" src={avatarPreview} name={watch('fullName')} className="border-4 border-indigo-50 shadow-xl" />
                       <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                         <Camera size={18} />
                         <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                       </label>
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
                        <input 
                           {...register('fullName')}
                           className="w-full h-12 px-0 border-b-2 border-slate-200 focus:border-indigo-600 outline-none text-xl font-bold bg-transparent transition-colors"
                        />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Department</label>
                       <select {...register('department', { required: true })} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:border-indigo-600 outline-none appearance-none">
                         <option value="">Select...</option>
                         <option value="CS">Computer Science</option>
                         <option value="Electronics">Electronics</option>
                         <option value="Mechanical">Mechanical</option>
                         <option value="Civil">Civil</option>
                         <option value="Physics">Physics</option>
                         <option value="Academic">Other Academic</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Year of Study</label>
                       <select {...register('yearOfStudy', { required: true })} className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:border-indigo-600 outline-none appearance-none">
                         <option value="">Select...</option>
                         <option value="1">1st Year</option>
                         <option value="2">2nd Year</option>
                         <option value="3">3rd Year</option>
                         <option value="4">4th Year</option>
                         <option value="5">Final/Masters</option>
                       </select>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between items-end mb-2">
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Short Bio</label>
                       <span className="text-[10px] font-bold text-slate-400">{watch('bio')?.length || 0}/100</span>
                     </div>
                     <textarea 
                       {...register('bio', { maxLength: 100 })}
                       placeholder="Tell us about yourself..."
                       className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none font-medium text-slate-800 resize-none"
                     />
                   </div>

                   <div className="flex gap-4">
                     <Button variant="ghost" className="flex-1 h-14" onClick={back}>Back</Button>
                     <Button className="flex-[2] h-14" onClick={next}>Continue</Button>
                   </div>
                 </div>
               </motion.div>
            )}

            {step === 3 && (
               <motion.div key="step3" custom={step} variants={variants} initial="enter" animate="center" exit="exit">
                 <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2">What can you teach?</h2>
                 <p className="text-slate-500 font-medium mb-10">Select at least 1 skill you're comfortable sharing. You'll earn Karma for teaching these!</p>

                 <div className="flex flex-wrap gap-2 mb-8">
                   {PREDEFINED_SKILLS.map(skill => (
                     <button
                        key={skill}
                        onClick={() => skillsTeach.includes(skill) ? removeSkill('skillsTeach', skill) : addSkill('skillsTeach', skill)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${skillsTeach.includes(skill) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'}`}
                     >
                       {skill}
                     </button>
                   ))}
                 </div>

                 <div className="flex gap-3 mb-10">
                   <input 
                     type="text" 
                     value={customSkill}
                     onChange={(e) => setCustomSkill(e.target.value)}
                     placeholder="Add custom skill..."
                     className="flex-1 h-12 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 font-bold"
                   />
                   <Button variant="outline" className="h-12 w-12 !p-0" onClick={() => { if(customSkill) { addSkill('skillsTeach', customSkill); setCustomSkill(''); } }}>
                     <Plus size={20} />
                   </Button>
                 </div>

                 <div className="flex gap-4">
                   <Button variant="ghost" className="flex-1 h-14" onClick={back}>Back</Button>
                   <Button className="flex-[2] h-14" disabled={skillsTeach.length === 0} onClick={next}>Continue</Button>
                 </div>
               </motion.div>
            )}

            {step === 4 && (
               <motion.div key="step4" custom={step} variants={variants} initial="enter" animate="center" exit="exit">
                 <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2">What do you want to learn?</h2>
                 <p className="text-slate-500 font-medium mb-10">We'll use these to recommend the best mentors across the Nexus network.</p>

                 <div className="flex flex-wrap gap-2 mb-8">
                   {PREDEFINED_SKILLS.map(skill => (
                     <button
                        key={skill}
                        onClick={() => skillsLearn.includes(skill) ? removeSkill('skillsLearn', skill) : addSkill('skillsLearn', skill)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${skillsLearn.includes(skill) ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' : 'border-slate-100 bg-white text-slate-500 hover:border-purple-200'}`}
                     >
                       {skill}
                     </button>
                   ))}
                 </div>

                 <div className="flex gap-4 mt-12">
                   <Button variant="ghost" className="flex-1 h-14" onClick={back}>Back</Button>
                   <Button className="flex-[2] h-14" onClick={next}>Continue</Button>
                 </div>
               </motion.div>
            )}

            {step === 5 && (
               <motion.div key="step5" custom={step} variants={variants} initial="enter" animate="center" exit="exit" className="text-center">
                 <h2 className="text-3xl font-outfit font-black text-slate-900 mb-10">Here's how Karma works 💫</h2>
                 
                 <div className="space-y-4 mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-3xl text-left flex items-center gap-6">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm">100</div>
                       <div className="flex-1">
                          <h4 className="font-bold text-indigo-900">You start with 100 Karma</h4>
                          <p className="text-sm text-indigo-700/70 font-medium">Enough to unlock your first resource right away.</p>
                       </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl text-left flex items-center gap-6">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                         <Zap size={32} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-emerald-900">Teach to Earn</h4>
                          <p className="text-sm text-emerald-700/70 font-medium">Earn 50-200 Karma per session. The more you help, the richer the Nexus gets.</p>
                       </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl text-left flex items-center gap-6">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                         <Star size={32} className="animate-spin-slow" />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-amber-900">Spend to Grow</h4>
                          <p className="text-sm text-amber-700/70 font-medium">No cash. No subscriptions. Just knowledge exchange. Teaching is the currency.</p>
                       </div>
                    </motion.div>
                 </div>

                 <Button 
                   size="lg" 
                   className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-indigo-200"
                   onClick={handleSubmit(onSubmit)}
                   loading={loading}
                 >
                   Enter EduSync <Rocket size={24} />
                 </Button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
