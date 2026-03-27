import { create } from 'zustand'

export const useOnboardingStore = create((set) => ({
  step: 1,
  data: {
    avatar_url: '',
    full_name: '',
    department: '',
    year_of_study: '',
    bio: '',
    skills_to_teach: [],
    skills_to_learn: [],
  },

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  
  updateData: (updates) => set((state) => ({
    data: { ...state.data, ...updates }
  })),

  reset: () => set({
    step: 1,
    data: {
      avatar_url: '',
      full_name: '',
      department: '',
      year_of_study: '',
      bio: '',
      skills_to_teach: [],
      skills_to_learn: [],
    }
  })
}))
