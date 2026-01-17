import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "rider" | "driver" | "both" | null;
  rating: string | null;
}

export interface DriverProfile {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number | null;
  vehicleColor: string;
  vehiclePlate: string;
  vehicleTier: "economy" | "comfort" | "premium" | "luxury";
  licenseNumber: string | null;
  isVerified: boolean | null;
  isOnline: boolean | null;
  currentLatitude: string | null;
  currentLongitude: string | null;
  totalTrips: number | null;
  totalEarnings: string | null;
  driverRating: string | null;
}

interface AuthState {
  user: User | null;
  driverProfile: DriverProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setDriverProfile: (profile: DriverProfile | null) => void;
  login: (user: User, driverProfile?: DriverProfile | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateDriverProfile: (updates: Partial<DriverProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      driverProfile: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setDriverProfile: (driverProfile) => set({ driverProfile }),
      
      login: (user, driverProfile = null) => set({ 
        user, 
        driverProfile, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        driverProfile: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      updateDriverProfile: (updates) => set((state) => ({
        driverProfile: state.driverProfile ? { ...state.driverProfile, ...updates } : null
      })),
    }),
    {
      name: "ridex-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
