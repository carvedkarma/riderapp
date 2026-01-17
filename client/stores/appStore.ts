import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppMode = "rider" | "driver";

interface AppState {
  mode: AppMode;
  debugMode: boolean;
  setMode: (mode: AppMode) => void;
  toggleDebugMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: "rider",
      debugMode: false,
      setMode: (mode) => set({ mode }),
      toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
    }),
    {
      name: "ridex-app-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
