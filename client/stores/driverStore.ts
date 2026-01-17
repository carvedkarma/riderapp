import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TripRecord {
  id: string;
  date: string;
  pickup: string;
  dropoff: string;
  fare: number;
  tip: number;
  duration: number;
  distance: number;
}

interface DriverState {
  isOnboarded: boolean;
  isOnline: boolean;
  todayEarnings: number;
  todayTrips: number;
  totalTrips: number;
  rating: number;
  tripHistory: TripRecord[];
  preferences: {
    acceptShortTrips: boolean;
    acceptLongTrips: boolean;
    acceptAirportTrips: boolean;
    navigationProvider: "apple" | "google";
  };
  setOnboarded: (value: boolean) => void;
  setOnline: (value: boolean) => void;
  addTrip: (trip: TripRecord) => void;
  updateEarnings: (amount: number) => void;
  setPreferences: (prefs: Partial<DriverState["preferences"]>) => void;
  resetDailyStats: () => void;
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      isOnline: false,
      todayEarnings: 0,
      todayTrips: 0,
      totalTrips: 0,
      rating: 4.92,
      tripHistory: [],
      preferences: {
        acceptShortTrips: true,
        acceptLongTrips: true,
        acceptAirportTrips: true,
        navigationProvider: "apple",
      },
      setOnboarded: (value) => set({ isOnboarded: value }),
      setOnline: (value) => set({ isOnline: value }),
      addTrip: (trip) =>
        set((state) => ({
          tripHistory: [trip, ...state.tripHistory].slice(0, 100),
          todayTrips: state.todayTrips + 1,
          totalTrips: state.totalTrips + 1,
        })),
      updateEarnings: (amount) =>
        set((state) => ({
          todayEarnings: state.todayEarnings + amount,
        })),
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      resetDailyStats: () =>
        set({
          todayEarnings: 0,
          todayTrips: 0,
        }),
    }),
    {
      name: "ridex-driver-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
