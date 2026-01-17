# Marathon Training Plan - iOS App

A free, offline-first iOS app for marathon training. Pick your race date, choose a proven training plan, and track your progress to race day.

**Web version:** [marathontrainingplan.com](https://marathontrainingplan.com)

---

## Current Status

**Phase:** Core app built, ready for testing

The app is fully functional with:
- 3-screen onboarding flow
- All 6 Hal Higdon training plans
- Today view with workout cards
- Calendar view (18-week grid)
- Progress tracking with stats
- Workout completion/skip functionality
- Settings with reset option
- Data persistence (survives app restart)

---

## Project Structure

```
marathon-training-app/
├── App.tsx                      # Main app entry point
├── index.ts                     # Expo entry
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
│
├── src/
│   ├── types/index.ts           # TypeScript type definitions
│   ├── constants/
│   │   ├── plans.ts             # Plan metadata for selection
│   │   └── theme.ts             # Colors, workout colors
│   ├── services/
│   │   └── planGenerator.ts     # All 6 Higdon plan schedules
│   ├── store/
│   │   └── useAppStore.ts       # Zustand store + AsyncStorage
│   ├── screens/
│   │   ├── OnboardingScreen.tsx # Welcome → Date → Plan selection
│   │   ├── TodayScreen.tsx      # Today's workout, stats
│   │   ├── CalendarScreen.tsx   # 18-week plan grid
│   │   ├── ProgressScreen.tsx   # Stats, charts, streaks
│   │   └── SettingsScreen.tsx   # Preferences, reset
│   └── components/
│       ├── Button.tsx           # Reusable button
│       ├── TabBar.tsx           # Bottom navigation
│       ├── WorkoutCard.tsx      # Workout display card
│       └── WorkoutModal.tsx     # Workout detail/completion modal
│
├── reference/                   # Reference code (not part of app)
│   ├── Workout Generator.ts     # Original web app generator
│   └── designerversion/         # Designer's web mockup
│
└── docs/
    ├── PLANNING.md              # Full technical spec
    ├── DESIGNER-BRIEF.md        # Designer requirements
    ├── DECISIONS.md             # Architecture decisions
    └── TEMPLATES.md             # Training plan specs
```

---

## Tech Stack

- **Framework:** React Native with Expo (SDK 52)
- **Language:** TypeScript
- **State Management:** Zustand with AsyncStorage persistence
- **Date Handling:** date-fns
- **Icons:** @expo/vector-icons (Ionicons)

---

## Available Training Plans

All plans are 18 weeks, based on Hal Higdon methodology:

| Plan | Runs/Week | Peak Long Run | Best For |
|------|-----------|---------------|----------|
| Novice 1 | 4 | 20 mi | First marathon, just finish |
| Novice 2 | 4 | 20 mi | First marathon + pace work |
| Intermediate 1 | 5 | 20 mi | Some experience |
| Intermediate 2 | 5 | 20 mi | Time goal |
| Advanced 1 | 6 | 20 mi | Speedwork + hills |
| Advanced 2 | 6 | 20 mi | Marathon pace focus |

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn
- For iOS Simulator: Xcode (from App Store)
- For physical device: Expo Go app

### Start Development Server

```bash
cd marathon-training-app
npm install
npx expo start
```

### Testing Options

1. **iOS Simulator** (requires Xcode):
   - Press `i` in the Expo terminal

2. **Physical iPhone** (with Expo Go):
   - Install "Expo Go" from App Store
   - Scan the QR code from terminal with your Camera app
   - Or enter URL manually: `exp://YOUR_IP:8081`

3. **Web** (limited, for preview):
   - Press `w` in the Expo terminal

---

## Features Implemented

- [x] Onboarding flow (welcome, date picker, plan selection)
- [x] Plan generation with all 6 Higdon schedules
- [x] Today view with hero workout card
- [x] Calendar view (18-week color-coded grid)
- [x] Workout detail modal
- [x] Mark workout complete/skip
- [x] Progress stats (streak, completion rate, mileage)
- [x] Weekly mileage chart
- [x] Settings (units toggle, reset app)
- [x] Data persistence with AsyncStorage
- [x] Tab navigation

## Features Not Yet Implemented

- [ ] Push notifications
- [ ] Apple Calendar export
- [ ] Dark mode toggle (system mode works)
- [ ] Edit workout details (distance, time, notes)
- [ ] Multiple plans support

---

## Monetization

**Free** - No paywall, no subscriptions, no ads.

Potential future premium features:
- AI-powered plan adjustments
- Advanced analytics
- Custom plan builder

---

## Links

- Web app: [marathontrainingplan.com](https://marathontrainingplan.com)
- Designer brief: [DESIGNER-BRIEF.md](./DESIGNER-BRIEF.md)
- Technical spec: [PLANNING.md](./PLANNING.md)
