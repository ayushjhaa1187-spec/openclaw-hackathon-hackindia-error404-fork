import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeModal: null,
  sidebarOpen: false,
  toasts: [],
  
  setActiveModal: (modalId) => set({ activeModal: modalId }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
}))
