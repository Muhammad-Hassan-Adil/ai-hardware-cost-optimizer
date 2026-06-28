import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isDark: true,
      setIsDark: (dark) => set({ isDark: dark }),
    }),
    { name: 'gpurunner-ui' }
  )
);
