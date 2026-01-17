import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface RiderState {
  savedLocations: SavedLocation[];
  recentSearches: string[];
  preferredVehicleTier: string;
  ridePreferences: {
    quietRide: boolean;
    musicAllowed: boolean;
    temperaturePreference: "cool" | "warm" | "no_preference";
  };
  addSavedLocation: (location: SavedLocation) => void;
  removeSavedLocation: (id: string) => void;
  addRecentSearch: (search: string) => void;
  setPreferredVehicleTier: (tier: string) => void;
  setRidePreferences: (prefs: Partial<RiderState["ridePreferences"]>) => void;
}

export const useRiderStore = create<RiderState>()(
  persist(
    (set) => ({
      savedLocations: [],
      recentSearches: [],
      preferredVehicleTier: "economy",
      ridePreferences: {
        quietRide: false,
        musicAllowed: true,
        temperaturePreference: "no_preference",
      },
      addSavedLocation: (location) =>
        set((state) => ({
          savedLocations: [...state.savedLocations, location],
        })),
      removeSavedLocation: (id) =>
        set((state) => ({
          savedLocations: state.savedLocations.filter((loc) => loc.id !== id),
        })),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter((s) => s !== search),
          ].slice(0, 10),
        })),
      setPreferredVehicleTier: (tier) => set({ preferredVehicleTier: tier }),
      setRidePreferences: (prefs) =>
        set((state) => ({
          ridePreferences: { ...state.ridePreferences, ...prefs },
        })),
    }),
    {
      name: "ridex-rider-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
