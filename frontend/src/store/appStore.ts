import { create } from 'zustand';

interface AppStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
