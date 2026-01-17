# RideX - Premium iOS Ride-Sharing App

## Overview
RideX is a premium ride-sharing mobile application built with Expo React Native for iOS, featuring a clean and sophisticated design inspired by luxury automotive experiences. The app provides riders with a seamless booking experience, real-time tracking, and transparent pricing.

## Architecture

### Frontend (Expo React Native)
- **Navigation**: React Navigation 7 with native stack and bottom tabs
- **State Management**: React Query for server state
- **Styling**: StyleSheet with custom theme system
- **Components**: Custom glass-morphism cards, premium buttons, animated interactions

### Backend (Express.js)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints for rides, users, drivers, and payment methods

## Project Structure
```
├── client/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
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
1. **Home Screen**: Interactive map with location search
2. **Destination Search**: Saved places and recent locations
3. **Vehicle Selection**: Economy, Comfort, Premium, Luxury tiers
4. **Ride Tracking**: Real-time driver location updates
5. **Ride History**: Past trips with detailed receipts
6. **Account Management**: Profile, payment methods, safety settings
7. **Safety Center**: SOS button and emergency features

## Design System
- **Primary Color**: Deep Black (#000000)
- **Accent Color**: Champagne Gold (#C9AA70)
- **Background**: Pure White (#FFFFFF)
- **Glass-morphism effects on iOS
- **SF Pro typography (iOS system font)

## Recent Changes
- January 17, 2026: Initial app creation with full rider functionality

## Development Commands
- `npm run server:dev` - Start Express backend
- `npm run expo:dev` - Start Expo development server
- `npm run db:push` - Push database schema changes
