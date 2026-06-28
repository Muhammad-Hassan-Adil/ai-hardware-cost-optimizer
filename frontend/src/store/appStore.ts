import { create } from 'zustand';

interface AppStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'matcher',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
