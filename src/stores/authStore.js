import { create } from 'zustand'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: () => {
    // Initial check (Firebase holds internal persistence)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create profile in Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', firebaseUser.uid)
          .single()
        
        set({ user: firebaseUser, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })

    return unsubscribe
  },

  setProfile: (profile) => set({ profile }),

  updateProfile: (updates) =>
    set(state => ({ profile: { ...state.profile, ...updates } })),

  signOut: async () => {
    await firebaseSignOut(auth)
    // We don't sign out of Supabase because we're not using their Auth sessions anymore
    set({ user: null, profile: null })
  }
}))
