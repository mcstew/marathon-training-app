# Marathon Training Plan - Design & Technical Documentation

## 1. Product Vision
A free, offline-first iOS web application (PWA) designed to generate personalized 18-week marathon training plans. The design philosophy prioritizes simplicity, native iOS aesthetics, and zero-latency performance.

## 2. Technical Architecture

### Stack
- **Framework:** React 18+ (Functional Components, Hooks)
- **Styling:** Tailwind CSS (CDN loaded for portability)
- **Icons:** Tabler Icons (`@tabler/icons-react`)
- **State Management:** React Context API (`AppContext`)
- **Persistence:** `localStorage` (Offline-first architecture)
- **Charts:** Recharts

### Key Design Decisions

#### A. Mobile-First / iOS Native Feel
The app is engineered to mimic a native iOS application within a browser environment:
1.  **Viewport settings:** `user-scalable=0` and `viewport-fit=cover` in `index.html` to prevent browser zooming and handle the notch/dynamic island.
2.  **Safe Areas:** Custom Tailwind utilities `.pt-safe` and `.pb-safe` use CSS environment variables (`env(safe-area-inset-...)`) to respect the home indicator and status bar.
3.  **Touch Feedback:** Buttons and cards use `active:scale-95` to replicate the squishy feel of native iOS controls.
4.  **Font Stack:** Uses the Apple System font stack (`-apple-system`, `BlinkMacSystemFont`, etc.) for native text rendering.
5.  **Scroll Behavior:** `overscroll-behavior-y: none` prevents the pull-to-refresh gesture, making the app feel like a fixed UI.

#### B. Offline Strategy
- **Zero Backend:** The app generates training plans client-side using a deterministic algorithm in `services/planGenerator.ts`.
- **Data Persistence:** User progress, configuration, and the generated plan are serialized to JSON and stored in the browser's `localStorage`. This ensures the app works immediately upon reload without network requests.

#### C. Navigation
- Uses a fixed bottom tab bar (`TabNav.tsx`) with a blur backdrop, similar to `UITabBar`.
- Navigation state is managed via a simple string state (`currentTab`) in `App.tsx` rather than a complex router, keeping the bundle size small and transitions instant.

## 3. Component Hierarchy

- **App.tsx**: Main entry point, handles routing logic (Onboarding vs Main Tabs).
- **AppContext**: Global store for the Plan object and User Config.
- **Onboarding Flow**:
    - Step 1: Welcome/Value Prop
    - Step 2: Date Selection (Validation logic for <12 weeks)
    - Step 3: Plan Level Selection
- **Views**:
    - `TodayView`: The primary dashboard. Computes "Today" based on system date vs plan start date.
    - `CalendarView`: Full 18-week grid.
    - `ProgressView`: Statistical analysis using Recharts.
    - `SettingsView`: Configuration and Data management.

## 4. Plan Generation Logic (`services/planGenerator.ts`)

The generator uses a "Reverse Calculation" method:
1.  **Anchor Point:** The user inputs their **Race Date**.
2.  **Backwards Calculation:** The start date is calculated as exactly 18 weeks (126 days) prior to the race date.
3.  **Pattern Application:** 
    - A base "Long Run" array defines the Saturday distance for all 18 weeks.
    - A "Weekday Pattern" defines the run types (Easy, Tempo, Rest) for Mon-Fri and Sun based on the user's selected difficulty level (Novice vs Intermediate).
    - Taper weeks (Weeks 16 & 17) automatically reduce volume.
4.  **Output:** A JSON object containing `weeks` -> `workouts` with specific dates, types, and distances.

## 5. Visual System

- **Colors:**
    - Primary: Blue-600 (Actionable elements)
    - Success: Green-500 (Completion)
    - Background: Gray-50 (App background) / White (Cards)
- **Typography:**
    - Headings: Bold, Tight tracking.
    - Body: Gray-500/Gray-900 contrast for hierarchy.

## 6. Icons
- **Library:** Tabler Icons React
- **Usage:** Imported via `esm.sh` in `index.html` and used throughout components. Standard naming convention `Icon[Name]`.

## 7. Future Considerations
- **Push Notifications:** Currently simulated. Requires Service Worker implementation for real local notifications.
- **PWA Manifest:** Needs a `manifest.json` to allow "Add to Home Screen" with a proper icon and name.
- **Data Export:** Current settings allow data deletion; adding JSON export/import would aid data portability.
