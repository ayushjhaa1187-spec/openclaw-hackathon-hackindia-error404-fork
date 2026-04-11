import { create } from 'zustand'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

import { firebaseUidToUuid } from '../utils/uuidHelpers'
export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialize: () => {
    // Initial check (Firebase holds internal persistence)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.uid) {
        // Fetch or create profile in Supabase
        // IMPORTANT: Only query if we have a valid uid (not undefined/null)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', firebaseUidToUuid(firebaseUser.uid))
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          // Don't block the auth flow, just log the error
          set({ user: firebaseUser, profile: null, loading: false })
        } else {
          set({ user: firebaseUser, profile, loading: false })
        }
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
