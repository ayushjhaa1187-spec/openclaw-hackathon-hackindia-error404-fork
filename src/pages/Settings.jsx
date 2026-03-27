import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Lock, Trash2, Camera, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

export default function Settings() {
  const { profile, user, updateProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: profile?.full_name || '',
      bio: profile?.bio || '',
      department: profile?.department || '',
      yearOfStudy: profile?.year_of_study || ''
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          bio: data.bio,
          department: data.department,
          year_of_study: parseInt(data.yearOfStudy)
        })
        .eq('id', user.id)

      if (error) throw error
      updateProfile({
        full_name: data.fullName,
        bio: data.bio,
        department: data.department,
        year_of_study: parseInt(data.yearOfStudy)
      })
      toast.success('Official profile record updated in Nexus.')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 md:pb-12 font-sans">
      <div className="mb-12">
        <h1 className="text-4xl font-outfit font-black text-slate-900 tracking-tight leading-none mb-4 uppercase">Registry Settings.</h1>
        <p className="text-slate-500 font-medium">Manage your identity and preferences across the inter-campus network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-12">
         {/* Navigation */}
         <div className="space-y-2">
            {[
               { label: 'Profile Registry', icon: User, active: true },
               { label: 'Nexus Notifications', icon: Bell },
               { label: 'Security & Auth', icon: Lock },
               { label: 'Academic Privacy', icon: Shield }
            ].map((item, i) => (
               <button key={i} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${item.active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}>
                  <item.icon size={18} /> {item.label}
               </button>
            ))}
         </div>

         {/* Form */}
         <Card className="p-8 sm:p-10 border-none shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
               <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-50">
                  <div className="relative group">
                     <Avatar size="xl" src={profile?.avatar_url} name={profile?.full_name} className="border-4 border-white shadow-lg" />
                     <button type="button" className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-xl shadow-xl group-hover:scale-110 transition-transform"><Camera size={16} /></button>
                  </div>
                  <div>
                     <h3 className="text-xl font-outfit font-black text-slate-900 uppercase">Nexus Identity</h3>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verified with {profile?.campuses?.short_code} email</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Full Legal Name</label>
                    <input {...register('fullName')} className="w-full h-14 bg-slate-50 border-2 border-slate-100/50 rounded-2xl px-6 font-bold text-slate-800 focus:border-indigo-600 outline-none transition-all placeholder:font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Academic Department</label>
                    <input {...register('department')} className="w-full h-14 bg-slate-50 border-2 border-slate-100/50 rounded-2xl px-6 font-bold text-slate-800 focus:border-indigo-600 outline-none transition-all placeholder:font-medium" />
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Profile Declaration (Bio)</label>
                  <textarea {...register('bio')} rows={4} className="w-full p-6 bg-slate-50 border-2 border-slate-100/50 rounded-[32px] font-medium text-slate-800 focus:border-indigo-600 outline-none transition-all resize-none shadow-inner" />
               </div>

               <div className="pt-8 flex justify-between items-center">
                  <button type="button" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors">
                     <Trash2 size={16} /> Delete Identity Record
                  </button>
                  <Button type="submit" loading={loading} className="h-14 px-10 rounded-2xl shadow-xl shadow-indigo-100">
                     <Save size={18} className="mr-2" /> Save Official Changes
                  </Button>
               </div>
            </form>
         </Card>
      </div>
    </div>
  )
}
