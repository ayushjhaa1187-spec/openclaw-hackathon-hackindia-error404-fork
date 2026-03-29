import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      if (!session.user.email.endsWith('.edu.in')) {
        await supabase.auth.signOut()
        set({ user: null, profile: null, loading: false })
        toast.error('Access Denied: Please use your institutional email ending in .edu.in.')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      set({ user: session.user, profile, loading: false })
    } else {
      set({ user: null, profile: null, loading: false })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (!session.user.email.endsWith('.edu.in')) {
          await supabase.auth.signOut()
          set({ user: null, profile: null })
          toast.error('Switching Node: Use your .edu.in campus email to continue.')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        set({ user: session.user, profile })
      } else {
        set({ user: null, profile: null })
      }
    })

    return () => subscription.unsubscribe()
  },

  updateProfile: (updates) =>
    set(state => ({ profile: { ...state.profile, ...updates } })),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))

