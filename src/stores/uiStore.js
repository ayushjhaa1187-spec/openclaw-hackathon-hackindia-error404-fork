import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeModal: null, // 'NewSkill', 'UploadResource', etc.
  toasts: [],
  
  setActiveModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  addToast: (message, type = 'default') => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), message, type }]
  })),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}))

