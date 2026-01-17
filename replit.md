# RideX - Premium iOS Ride-Sharing App

## Overview
RideX is a premium ride-sharing platform built with Expo React Native for iOS, featuring an Uber-inspired dark-mode design. The platform consists of **two separate apps** that can be published independently to the App Store:
- **RideX** (Rider App) - For passengers to book rides
- **RideX Driver** (Driver App) - For drivers to accept trips and manage earnings

## Architecture

### Two-App Build System
The project uses a single codebase with environment-based builds:
- `APP_VARIANT=rider` builds the Rider app (com.ridex.rider)
- `APP_VARIANT=driver` builds the Driver app (com.ridex.driver)

Configuration is managed via `app.config.js` which dynamically sets:
- App name, bundle identifier, and slug
- App icons and splash screens
- Location permission descriptions

### Frontend (Expo React Native)
- **Navigation**: React Navigation 7 with native stack (no bottom tabs)
- **Layout**: Single Dashboard with full-screen map and bottom sheet (Uber-style)
- **State Management**: React Query for server state
- **Styling**: StyleSheet with custom dark theme system
- **Components**: Custom glass-morphism cards, premium buttons, animated interactions
- **App Detection**: `client/lib/appVariant.ts` detects which app is running at runtime

### Backend (Express.js)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints for rides, users, drivers, and payment methods
- **Authentication**: Email/password signup and login with user profiles
- **Ride Matching**: Real-time pending ride polling for online drivers (3-second interval)

## Project Structure
```
├── client/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   │   ├── RoleSelectorScreen.tsx    # Choose Rider or Driver mode
│   │   ├── DashboardScreen.tsx       # Rider main screen with map
│   │   ├── DestinationSearchScreen.tsx
│   │   ├── RideConfirmationScreen.tsx
│   │   ├── ActiveRideScreen.tsx
│   │   ├── RideCompleteScreen.tsx
│   │   ├── ActivityScreen.tsx
│   │   ├── AccountScreen.tsx
│   │   └── driver/                   # Driver-specific screens
│   │       ├── DriverOnboardingScreen.tsx  # 5-step onboarding
│   │       ├── DriverHomeScreen.tsx        # Map with online/offline toggle
│   │       ├── DriverActiveTripScreen.tsx  # Navigate/arrived/start/complete
│   │       ├── DriverTripCompleteScreen.tsx
│   │       ├── DriverEarningsScreen.tsx    # Today/Week/Month earnings
│   │       └── DriverProfileScreen.tsx
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

## Rider App Features
1. **Dashboard**: Full-screen dark map with bottom sheet, time-based greetings
2. **Destination Search**: Saved places (Home, Work, Gym), recent locations, search autocomplete
3. **Vehicle Selection**: Economy, Comfort, Premium, Luxury tiers with driver earnings visibility
4. **Ride Preferences**: Quiet ride, music allowed, temperature preference toggles
5. **Fare Lock Timer**: 120-second countdown with confidence indicator
6. **Ride Tracking**: Real-time driver location with progress bar and trip sharing
7. **Ride Complete**: 5-star rating, iOS-style tip slider ($0-$20), detailed fare breakdown
8. **Ride History**: Past trips with monthly spend insights
9. **Account Management**: Profile, payment methods, saved places
10. **Safety Center**: SOS button, emergency contacts, trip sharing

## Driver App Features
1. **Driver Onboarding**: Single-screen vehicle registration form
2. **Driver Home Screen**: 
   - Full-screen map with online/offline toggle
   - Today's earnings and trips summary
   - Smart zone suggestions (demand hotspots, surge alerts)
   - Searching for trips animation when online
4. **Trip Request Inbox**:
   - Incoming request card with pickup/dropoff details
   - Estimated earnings display
   - Rider rating and timer countdown
   - Accept/Decline with haptic feedback
5. **Active Trip Flow**:
   - Navigate to pickup → Arrived → Start Trip → Complete Trip
   - Progress bar with 4-state visualization
   - Rider info with message/call buttons
   - Real-time ETA and route preview
6. **Trip Complete Screen**:
   - Earnings breakdown (fare, platform fee 20%, net earnings)
   - Trip stats (duration, distance)
   - Rider feedback notification
7. **Earnings Dashboard**:
   - Today/Week/Month segmented tabs
   - Total earnings, trips, online hours
   - Earnings breakdown (fares, tips, platform fee)
   - Recent trip history with individual fare details
8. **Driver Profile**:
   - Rating and total trips
   - Achievement badges (Gold Driver, Safe Driver, Top Rated)
   - Vehicle information
   - Trip preferences and navigation settings
   - Safety center access
   - Switch to Rider mode option

## Design System
- **Theme**: Dark mode forced (no light mode toggle)
- **Primary Background**: Deep Black (#000000)
- **Secondary Background**: Dark Gray (#1C1C1E)
- **Accent Color**: Champagne Gold (#D4B87A)
- **Success Color**: Green (#30D158)
- **Error Color**: Red (#FF453A)
- **Text Color**: White (#FFFFFF)
- **Glass-morphism effects** with blur on iOS
- **SF Pro typography** (iOS system font)
- **React Native Reanimated** for smooth FadeIn, SlideIn, ZoomIn animations
- **Haptic feedback** throughout (Light, Medium, Selection, Success)

## Navigation Structure

### Rider Flow
- Dashboard (initial)
- Dashboard → DestinationSearch (modal)
- Dashboard → Activity (stack)
- Dashboard → Account (stack)
- DestinationSearch → RideConfirmation → ActiveRide → RideComplete
- Account → PaymentMethods, SavedPlaces, SafetyCenter

### Driver Flow
- DriverOnboarding → DriverHome
- DriverHome → DriverActiveTrip → DriverTripComplete
- DriverHome → DriverEarnings
- DriverHome → DriverProfile

## Real Data Integration
- **Trip requests**: Real-time polling from /api/rides/pending every 3 seconds when driver online
- **Earnings calculation**: 20% platform fee deducted from trip fares (real database)
- **Driver earnings screen**: Fetches completed trips from database with Today/Week/Month filtering
- **Active trip flow**: All status updates (arrive, start, complete) save to database
- **Zone suggestions**: UI placeholder for future demand hotspots integration

## Authentication Flow
- Login → Dashboard (with role selector in debug mode)
- Signup → Creates new user → Dashboard
- Driver onboarding required for first-time drivers

## Known Limitations
- **Web Version**: Has import.meta compatibility issues with some React Native libraries. Use **Expo Go** on mobile for best experience.

## Recent Changes
- January 17, 2026: Replaced mock data with real API calls in driver screens (active trip, earnings, trip complete)
- January 17, 2026: Added authentication flow (login/signup screens with AuthStackNavigator)
- January 17, 2026: Fixed database schema for user creation
- January 17, 2026: Simplified driver onboarding to single-screen vehicle registration
- January 17, 2026: Connected driver home screen to real-time pending ride API
- January 17, 2026: Added complete Driver App with onboarding, trip management, and earnings tracking
- January 17, 2026: Implemented Role Selector to switch between Rider and Driver modes
- January 17, 2026: Initial app creation with full rider functionality

## Development Commands
- `npm run server:dev` - Start Express backend
- `npm run expo:dev` - Start Expo development server
- `npm run db:push` - Push database schema changes
