# Premium Ride-Sharing iOS App - Design Guidelines

## 1. Brand Identity

**Purpose**: A premium ride-sharing platform that makes transportation feel luxurious, safe, and effortless.

**Aesthetic Direction**: Luxurious/refined - Premium materials, subtle glass-morphism effects, restrained elegance with breathing room. Think high-end hospitality meets seamless technology.

**Memorable Element**: Glass-morphism cards floating over maps with subtle haptic feedback at every key interaction. The app should feel like driving a luxury vehicle - smooth, responsive, and premium at every touchpoint.

## 2. Navigation Architecture

**Root Navigation**: Tab Navigation (4 tabs) with floating action button for core "Book Ride" action

**Tabs**:
1. **Home** - Map interface and ride booking (default tab)
2. **Activity** - Ride history and scheduled rides
3. **Book Ride** - Floating action button (primary CTA)
4. **Account** - Profile, payment methods, settings, safety

**Authentication**: Required (SSO with Apple Sign-In mandatory for iOS)

## 3. Screen-by-Screen Specifications

### Onboarding Flow (Stack-Only)
**Welcome Screen**
- Full-screen hero illustration (splash-hero.png)
- Large heading: "Premium rides, anytime"
- Subheading explaining value proposition
- "Continue with Apple" button (primary)
- Terms & privacy links at bottom
- Root view: non-scrollable, safe area top: insets.top + 60, bottom: insets.bottom + 40

**Location Permission Screen**
- Icon illustration (location-permission.png)
- Explanation of why location is needed
- "Allow Location" button
- Root view: non-scrollable, centered content

### Home Tab (Map Screen)
**Purpose**: Book rides and view real-time driver locations

**Layout**:
- Header: Transparent with search bar ("Where to?") - tappable, opens destination search
- Main content: Full-screen map centered on user location
- Floating elements:
  - Saved location quick-access pills (top, below search)
  - Vehicle tier selector bottom sheet (slides up when destination selected)
  - "Book Ride" floating action button (bottom center)
- Safe area: None (map fills screen), floating elements respect insets

**Components**:
- Interactive map with custom map markers
- Search bar with glassmorphism background (blur, 10% white overlay)
- Bottom sheet with vehicle cards (Economy, Comfort, Premium, Luxury)
- Each vehicle card shows: icon, name, ETA, price estimate, capacity
- Floating action button with subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)

### Destination Search Screen (Modal)
**Purpose**: Select pickup and destination

**Layout**:
- Header: Custom with back button (left), title "Where to?"
- Main content: Scrollable list
- Root view: scrollable, safe area top: headerHeight + 16, bottom: insets.bottom + 16

**Components**:
- Two input fields: "Pickup location" (pre-filled), "Where to?" (focused)
- Saved locations list: Home, Work, Recent locations
- Each location row: icon, primary text, secondary text (address)

### Ride Confirmation Screen (Modal)
**Purpose**: Review and confirm ride details

**Layout**:
- Header: Custom with back button, title "Confirm Ride"
- Main content: Scrollable form
- Submit button: In header (right side, "Confirm")
- Safe area: top: headerHeight + 16, bottom: insets.bottom + 24

**Components**:
- Selected vehicle card (large, prominent)
- Route summary: pickup → destination with ETA
- Fare breakdown (transparent pricing)
- Payment method selector
- "Request Ride" primary button

### Active Ride Screen (Replaces Home when ride active)
**Purpose**: Track ongoing ride

**Layout**:
- Header: Transparent
- Main content: Map showing route
- Floating bottom sheet: Driver info and ride status
- Safe area: None for map, bottom sheet respects insets

**Components**:
- Map with route line and driver marker (animated)
- Bottom sheet (glassmorphism) with:
  - Driver photo (circular, verification badge)
  - Driver name, rating, vehicle details
  - ETA and progress bar
  - "Contact" and "SOS" buttons
  - Trip fare (updating in real-time)

### Activity Tab
**Purpose**: View ride history and scheduled rides

**Layout**:
- Header: Default navigation, title "Activity", segmented control (History | Scheduled)
- Main content: Scrollable list
- Safe area: top: 16, bottom: tabBarHeight + 24

**Components**:
- Segmented control to switch between views
- Ride history cards: date, route, driver photo, fare
- Empty state: illustration (empty-activity.png) with "No rides yet"
- Pull to refresh

**Ride Receipt Screen** (Stack, tapped from history):
- Header: Default with back button, title "Trip Details"
- Main content: Scrollable
- Route map (static)
- Driver details
- Itemized fare breakdown
- Rating prompt (if not rated)
- "Get Receipt" button

### Account Tab
**Purpose**: Manage profile, payment, settings

**Layout**:
- Header: Default navigation, title "Account"
- Main content: Scrollable list (grouped style)
- Safe area: top: 16, bottom: tabBarHeight + 24

**Components**:
- Profile section: Avatar (circular), name, email, rating
- Grouped lists:
  - Payment methods (add card, saved cards)
  - Saved places (Home, Work, manage)
  - Safety (emergency contacts, SOS settings)
  - Settings (notifications, app preferences)
  - Support (help center, contact)
  - Sign out (at bottom)

## 4. Color Palette

**Primary**: #000000 (Deep Black) - Main UI elements, text
**Secondary**: #C9AA70 (Champagne Gold) - Accents, selected states, premium highlights
**Background**: #FFFFFF (Pure White) - Main backgrounds
**Surface**: #F8F8F8 (Off-White) - Cards, elevated surfaces
**Surface Dark**: #1C1C1E (iOS Dark Gray) - Dark mode surfaces
**Text Primary**: #000000
**Text Secondary**: #6E6E73
**Text Tertiary**: #AEAEB2
**Success**: #34C759 (iOS Green)
**Error**: #FF3B30 (iOS Red)
**Map Accent**: #007AFF (iOS Blue) - Route lines, current location

**Glassmorphism Effect**: 
- Background: white with 10% opacity
- Blur: 20px
- Border: 1px white with 20% opacity

## 5. Typography

**Primary Font**: SF Pro (iOS System Font)

**Type Scale**:
- Hero: 34pt, Bold (Large titles)
- H1: 28pt, Bold (Screen titles)
- H2: 22pt, Semibold (Section headers)
- H3: 17pt, Semibold (Card titles)
- Body: 17pt, Regular (Main content)
- Body Small: 15pt, Regular (Secondary content)
- Caption: 13pt, Regular (Tertiary, metadata)
- Button: 17pt, Semibold

**Line Height**: 1.4x for body text, 1.2x for headings

## 6. Assets to Generate

**App Icon** (icon.png)
- Minimalist logo: Stylized location pin with gold accent
- Black background with gold icon
- Used: Device home screen

**Splash Icon** (splash-icon.png)
- Same as app icon, centered on white
- Used: App launch screen

**Onboarding Hero** (splash-hero.png)
- Illustration: Premium sedan on clean city street, sunset gradient sky
- Style: Minimal, sophisticated, 3-4 colors max
- Used: Welcome screen

**Location Permission** (location-permission.png)
- Illustration: Map pin with radius waves
- Style: Simple line art, gold accent
- Used: Location permission request screen

**Empty Activity** (empty-activity.png)
- Illustration: Empty road stretching to horizon
- Style: Minimal line art, single gold accent line
- Used: Activity tab when no rides

**User Avatar Preset** (avatar-default.png)
- Clean silhouette on light gray circle
- Used: Profile screen default avatar

**Vehicle Icons** (vehicle-economy.png, vehicle-comfort.png, vehicle-premium.png, vehicle-luxury.png)
- Side-view car silhouettes, increasing in size/luxury
- Style: Clean, minimal, black outlines
- Used: Vehicle selection cards

**Driver Verification Badge** (badge-verified.png)
- Small checkmark in gold circle
- Used: Driver profile displays