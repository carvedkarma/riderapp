# RideX - Premium iOS Ride-Sharing App

## Overview
RideX is a premium ride-sharing mobile application built with Expo React Native for iOS, featuring an Uber-inspired dark-mode design with a single dashboard layout. The app provides riders with a seamless booking experience, real-time tracking, and transparent pricing.

## Architecture

### Frontend (Expo React Native)
- **Navigation**: React Navigation 7 with native stack (no bottom tabs)
- **Layout**: Single Dashboard with full-screen map and bottom sheet (Uber-style)
- **State Management**: React Query for server state
- **Styling**: StyleSheet with custom dark theme system
- **Components**: Custom glass-morphism cards, premium buttons, animated interactions

### Backend (Express.js)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints for rides, users, drivers, and payment methods

## Project Structure
```
├── client/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   │   ├── DashboardScreen.tsx  # Main screen with map and bottom sheet
│   │   ├── ActivityScreen.tsx   # Ride history
│   │   └── AccountScreen.tsx    # User profile
│   ├── navigation/        # Navigation configuration
│   │   └── RootStackNavigator.tsx  # Main stack navigator
│   ├── hooks/             # Custom hooks
│   ├── constants/         # Theme and constants
│   └── lib/               # Utilities and API client
├── server/
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   └── routes.ts          # API endpoints
├── shared/
│   └── schema.ts          # Drizzle schema definitions
└── assets/
    └── images/            # App icons and illustrations
```

## Key Features
1. **Dashboard**: Full-screen dark map with bottom sheet, Activity and Account accessible via top icons
2. **Destination Search**: Saved places (Home, Work) and recent locations
3. **Vehicle Selection**: Economy, Comfort, Premium, Luxury tiers with driver earnings visibility
4. **Ride Preferences**: Quiet ride, music allowed, temperature preference toggles
5. **Fare Lock Timer**: 120-second countdown with confidence indicator
6. **Ride Tracking**: Real-time driver location with progress bar and trip sharing
7. **Ride Complete**: 5-star rating, iOS-style tip slider ($0-$20), detailed fare breakdown
8. **Ride History**: Past trips with monthly spend insights, time saved, suggested booking times
9. **Account Management**: Profile, payment methods, saved places
10. **Safety Center**: SOS button, emergency contacts, trip sharing

## Enhanced Components
- **DashboardScreen**: Full-screen map with center pin marker and bottom sheet
- **InsightPanel**: Shows demand rising/falling, suggested booking timing, driver density
- **RidePreferences**: Quiet ride, music, temperature preferences with iOS toggles
- **FareLockTimer**: Countdown with color-coded urgency and confidence indicator
- **TipSlider**: iOS-style slider with preset buttons (web-compatible)
- **RideInsights**: Monthly stats, total rides, time saved visualization
- **TripShareButton**: Share ride status with contacts
- **DriverEarningsBadge**: Transparent driver earnings visibility

## Design System
- **Theme**: Dark mode forced (no light mode toggle)
- **Primary Background**: Deep Black (#000000)
- **Secondary Background**: Dark Gray (#1C1C1E)
- **Accent Color**: Champagne Gold (#D4B87A)
- **Text Color**: White (#FFFFFF)
- **Glass-morphism effects** with blur on iOS
- **SF Pro typography** (iOS system font)
- **React Native Reanimated** for smooth FadeIn, SlideIn, ZoomIn animations
- **Haptic feedback** throughout (Light, Medium, Selection, Success)

## Navigation Structure
- Dashboard (initial) → DestinationSearch (modal)
- Dashboard → Activity (stack)
- Dashboard → Account (stack)
- DestinationSearch → RideConfirmation → ActiveRide → RideComplete
- Account → PaymentMethods, SavedPlaces, SafetyCenter

## Recent Changes
- January 17, 2026: Redesigned to Uber-style single dashboard layout with full-screen dark map and bottom sheet
- January 17, 2026: Removed bottom tab navigation, Activity and Account now accessible from dashboard icons
- January 17, 2026: Forced dark theme for premium appearance
- January 17, 2026: Enhanced UI/UX with insight panels, fare lock timer, ride preferences, tip slider
- January 17, 2026: Initial app creation with full rider functionality

## Development Commands
- `npm run server:dev` - Start Express backend
- `npm run expo:dev` - Start Expo development server
- `npm run db:push` - Push database schema changes
