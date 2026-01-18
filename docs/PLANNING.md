# Marathon Training Plan - iOS App

## Project Overview

A free, offline-first iOS app for marathon training plan generation and tracking. Built on proven 18-week training programs, works without internet, and respects your privacy.

**Domain:** marathontrainingplan.com
**Platform:** iOS only (via React Native/Expo)
**Monetization:** Free (future: optional premium features like AI plan adjustments)
**Target:** Runners preparing for marathons who want a simple, reliable training plan

---

## Core Value Proposition

Unlike subscription-heavy fitness apps:
- **Completely free** - No paywalls, no subscriptions
- **Works offline** - Your plan lives on your device
- **Privacy-first** - No account required, data stays local
- **Proven plans** - Based on Hal Higdon's trusted methodology
- **Simple and focused** - Does one thing well

---

## Technical Architecture Decisions

### Why React Native (Expo)?

1. **Reuses your existing skills** - React + TypeScript from the web app
2. **Shared logic** - Plan generation can be a shared TypeScript package
3. **True native feel** - Not a web wrapper, real iOS components
4. **Offline-first friendly** - SQLite/AsyncStorage work great
5. **Expo simplifies deployment** - EAS Build handles App Store submission
6. **Replit compatibility** - Expo projects work in Replit's mobile preview

### Architecture: Offline-First with Optional Sync

```
┌─────────────────────────────────────────────────────────┐
│                    iOS App (Expo)                        │
├─────────────────────────────────────────────────────────┤
│  UI Layer (React Native)                                │
│  ├── Screens (Onboarding, Calendar, Settings, etc.)    │
│  ├── Components (WorkoutCard, WeekView, etc.)          │
│  └── Navigation (React Navigation)                      │
├─────────────────────────────────────────────────────────┤
│  State & Storage                                        │
│  ├── Zustand (app state)                               │
│  ├── SQLite (plans, workouts, completions)             │
│  └── AsyncStorage (preferences, auth tokens)           │
├─────────────────────────────────────────────────────────┤
│  Core Logic (shared TypeScript package)                 │
│  ├── Plan Generation Engine                            │
│  ├── Workout Definitions                               │
│  └── Date/Schedule Calculations                        │
├─────────────────────────────────────────────────────────┤
│  Native Integrations                                    │
│  ├── Push Notifications (expo-notifications)           │
│  ├── Calendar Export (expo-calendar)                   │
│  ├── HealthKit (optional, future)                      │
│  └── In-App Purchase (expo-in-app-purchases)           │
└─────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
// Core types for the app

interface TrainingPlan {
  id: string;
  name: string;
  raceDate: Date;
  startDate: Date;
  templateId: string;        // e.g., "beginner-16-week"
  customizations: PlanCustomizations;
  createdAt: Date;
  updatedAt: Date;
}

interface PlanCustomizations {
  restDays: number[];        // 0=Sunday, 6=Saturday
  longRunDay: number;
  units: 'miles' | 'kilometers';
  crossTrainingPreference: 'cycling' | 'swimming' | 'elliptical' | 'none';
  adjustedWorkouts: WorkoutOverride[];
}

interface Workout {
  id: string;
  planId: string;
  date: Date;
  weekNumber: number;
  dayOfWeek: number;
  type: WorkoutType;
  description: string;
  distance?: number;
  duration?: number;
  paceGuidance?: string;
  notes?: string;
}

type WorkoutType =
  | 'easy'
  | 'long'
  | 'tempo'
  | 'interval'
  | 'recovery'
  | 'cross-training'
  | 'rest'
  | 'race';

interface WorkoutCompletion {
  id: string;
  workoutId: string;
  completedAt: Date;
  actualDistance?: number;
  actualDuration?: number;
  perceivedEffort?: 1 | 2 | 3 | 4 | 5;  // RPE scale simplified
  notes?: string;
  skipped: boolean;
  skipReason?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;  // "07:00"
  dayBeforeReminder: boolean;
  longRunSpecialReminder: boolean;
  weekSummary: boolean;
  weekSummaryDay: number;     // 0=Sunday
  streakCelebrations: boolean;
}
```

---

## Feature Specification

### Phase 1: Core MVP (Launch)

#### 1.1 Onboarding Flow
- [ ] Welcome screen with value proposition
- [ ] Race date picker (when is your marathon?)
- [ ] Experience level selection (beginner/intermediate/advanced)
- [ ] Plan template selection with previews
- [ ] Customization basics:
  - Preferred rest days
  - Long run day preference
  - Units (miles/km)
- [ ] Plan generation and confirmation

#### 1.2 Plan View (Main Screen)
- [ ] Weekly calendar view (primary)
- [ ] Monthly calendar view (secondary)
- [ ] Today's workout prominently displayed
- [ ] Workout detail modal with:
  - Full description
  - Purpose/why this workout
  - Pace guidance
  - Tips
- [ ] Week overview card showing weekly mileage/time

#### 1.3 Workout Tracking
- [ ] Mark workout complete (simple tap)
- [ ] Log actual distance/time (optional)
- [ ] Rate perceived effort (optional, 1-5 scale)
- [ ] Add notes (optional)
- [ ] Mark as skipped with reason
- [ ] Edit past completions

#### 1.4 Progress & Stats
- [ ] Current streak display
- [ ] Weekly/monthly completion rate
- [ ] Total distance trained
- [ ] Weeks until race countdown
- [ ] Simple progress visualization

#### 1.5 Notifications (Highly Configurable)
- [ ] Enable/disable all notifications
- [ ] Daily workout reminder (configurable time)
- [ ] Day-before preparation reminder
- [ ] Long run special reminder
- [ ] Weekly summary notification
- [ ] Streak milestone celebrations
- [ ] Custom notification sound options

#### 1.6 Plan Management
- [ ] View current plan details
- [ ] Edit plan customizations
- [ ] Regenerate plan (with confirmation)
- [ ] Start new plan (archives current)
- [ ] View archived plans

#### 1.7 Settings
- [ ] Notification preferences (full control)
- [ ] Units preference
- [ ] Theme (light/dark/system)
- [ ] Export plan to Apple Calendar
- [ ] Export data (JSON)
- [ ] Delete all data
- [ ] About / Help

### Phase 2: Enhanced Features (Post-Launch)

#### 2.1 Advanced Plan Customization
- [ ] Swap workouts between days
- [ ] Adjust individual workout intensity
- [ ] Add custom workouts
- [ ] "Life happens" mode - shift week forward
- [ ] Taper customization

#### 2.2 Multiple Plans
- [ ] Support multiple active plans
- [ ] A/B race calendars
- [ ] Plan comparison view

#### 2.3 Enhanced Analytics
- [ ] Training load visualization
- [ ] Pace progression charts
- [ ] Completion trends
- [ ] Personal records tracking

#### 2.4 Integrations (Future)
- [ ] Apple Health integration
- [ ] Strava import (completed runs)
- [ ] Garmin Connect
- [ ] Watch complications

---

## Available Training Plans

We're using Hal Higdon's proven marathon training methodology. All plans are 18 weeks and work backwards from race day.

### Plan Options (from existing web app)

| Plan ID | Name | Runs/Week | Peak Long Run | Best For |
|---------|------|-----------|---------------|----------|
| `novice1` | Novice 1 | 4 | 20 mi | First-timers, completion focus |
| `novice2` | Novice 2 | 4 | 20 mi | First-timers + pace work |
| `intermediate1` | Intermediate 1 | 5 | 20 mi | Some experience |
| `intermediate2` | Intermediate 2 | 5 | 20 mi | Time goal focus |
| `advanced1` | Advanced 1 | 6 | 20 mi | Speedwork + hills |
| `advanced2` | Advanced 2 | 6 | 20 mi | Marathon pace focus |

### Workout Types in Plans

| Type | Description | Example |
|------|-------------|---------|
| Easy Run | Conversational pace | "5 m run" |
| Long Run | Endurance building | "18 m run" |
| Pace Run | Race pace practice | "5 m pace" |
| Cross Training | Non-running cardio | "Cross" |
| Speed Work | Intervals, hills, tempo | "4 x 800", "30 tempo" |
| Rest | Recovery day | "Rest" |
| Race | Half marathon or marathon | "Half Marathon", "Marathon" |

### IP Considerations

Hal Higdon's training plans are widely shared and referenced. For the free app:
- We're implementing the publicly-available training schedules
- Workout descriptions are functional (not copied prose)
- Attribution to methodology where appropriate
- If scaling commercially, consider formal licensing discussion

---

## Monetization Strategy

### MVP: Free App

The core app is **completely free**:
- All 6 training plans
- Full workout tracking
- Notifications
- Calendar export
- Progress stats

**Why free?**
- Lower barrier to entry = more users
- Build audience and reputation first
- Offline-first = minimal server costs
- Differentiate from subscription-heavy competitors

### Future Premium Features (Optional, ~$1.99-4.99)

If we add significant value later:
- **AI Plan Adjustments** - Automatically adapt plan when life happens
- **Advanced Analytics** - Pace predictions, training load graphs
- **Custom Plan Builder** - Create your own plan from scratch
- **Multi-Race Calendar** - Train for multiple races simultaneously

### Revenue Alternatives

- Tip jar / "Support the developer"
- Affiliate links (running gear, race registration)
- Sponsored content (very carefully, if at all)

---

## Authentication Strategy

For an offline-first, one-time-purchase app, heavy auth is unnecessary. Recommended approach:

### MVP: Device-Based (No Account Required)

- All data stored locally on device
- iCloud backup via app data
- Purchase tied to Apple ID (automatic)
- No email/password needed

### Future: Optional Account (Cloud Sync)

- Apple Sign In (recommended for iOS)
- Magic link email auth (simple, secure)
- Purpose: sync across devices, backup
- Never required, always optional

---

## File Structure

```
marathon-training-app/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # Today/Home screen
│   │   ├── calendar.tsx          # Full calendar view
│   │   ├── progress.tsx          # Stats and achievements
│   │   └── settings.tsx          # App settings
│   ├── onboarding/               # Onboarding flow
│   │   ├── welcome.tsx
│   │   ├── race-date.tsx
│   │   ├── experience.tsx
│   │   ├── customize.tsx
│   │   └── confirm.tsx
│   ├── workout/[id].tsx          # Workout detail modal
│   ├── plan/                     # Plan management
│   │   ├── edit.tsx
│   │   └── templates.tsx
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── calendar/
│   ├── workout/
│   ├── progress/
│   └── common/
├── core/                         # Shared business logic
│   ├── plan-generator/           # Plan generation engine
│   │   ├── templates/
│   │   ├── generator.ts
│   │   └── index.ts
│   ├── types/                    # TypeScript definitions
│   └── utils/                    # Date, formatting utilities
├── store/                        # State management (Zustand)
│   ├── planStore.ts
│   ├── workoutStore.ts
│   ├── settingsStore.ts
│   └── notificationStore.ts
├── db/                           # Local database (SQLite)
│   ├── schema.ts
│   ├── migrations/
│   └── queries.ts
├── services/                     # External integrations
│   ├── notifications.ts
│   ├── calendar.ts
│   ├── purchases.ts
│   └── analytics.ts
├── assets/                       # Images, fonts, etc.
├── constants/                    # App constants, colors
├── hooks/                        # Custom React hooks
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── PLANNING.md                   # This file
```

---

## Development Phases

### Phase 0: Setup (Week 1)
- [x] Create project structure
- [ ] Initialize Expo project
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint/Prettier
- [ ] Set up basic navigation structure
- [ ] Create component library foundation
- [ ] Implement local storage layer

### Phase 1: Core Engine (Week 2)
- [ ] Build plan generation logic
- [ ] Create workout type definitions
- [ ] Implement date calculation utilities
- [ ] Build template system
- [ ] Create at least 2 complete templates
- [ ] Unit tests for generator

### Phase 2: Onboarding (Week 3)
- [ ] Welcome screen
- [ ] Race date selection
- [ ] Experience level picker
- [ ] Template selection with previews
- [ ] Customization flow
- [ ] Plan confirmation and storage

### Phase 3: Core UI (Weeks 4-5)
- [ ] Today/home screen
- [ ] Weekly calendar view
- [ ] Monthly calendar view
- [ ] Workout detail modal
- [ ] Completion tracking UI
- [ ] Basic progress display

### Phase 4: Notifications (Week 6)
- [ ] Notification permission flow
- [ ] Daily reminder scheduling
- [ ] All notification types
- [ ] Full settings UI
- [ ] Background notification handling

### Phase 5: Polish & Launch Prep (Week 7)
- [ ] Calendar export functionality
- [ ] Settings completion
- [ ] App Store assets (screenshots, description)
- [ ] In-app purchase integration
- [ ] Testing on multiple devices
- [ ] Performance optimization
- [ ] App Store submission

---

## Open Questions

1. ~~**Pricing:**~~ → **Decided: Free**

2. ~~**Free tier?**~~ → **Decided: Entirely free for MVP**

3. ~~**Plan content:**~~ → **Decided: All 7 Higdon plans from existing web app**

4. **Watch app:** Defer to post-launch. Focus on phone app quality first.

5. **Analytics:** Minimal/none for privacy. Maybe anonymous crash reporting only.

6. **Onboarding depth:** Quick 3-screen flow, or include customization (rest days, long run day)?

7. ~~**FIRST plan:**~~ → **Decided: Omit for MVP** (placeholders not fleshed out)

---

## Success Metrics

### Launch Targets
- App Store approval within 2 weeks of submission
- 4.5+ star rating
- < 0.5% crash rate
- < 3 second cold start time

### Growth Targets (First 6 Months)
- 5,000+ downloads (free app should help)
- 4.5+ star rating maintained
- Positive review sentiment
- Featured in running communities/forums

### User Experience Targets
- 70%+ workout completion rate among active users
- 50%+ weekly retention
- High notification opt-in rate (60%+)

---

## Next Steps

1. Review and approve this plan
2. Initialize Expo project
3. Begin Phase 0 setup tasks
4. Start building plan generation engine

---

*Last updated: January 2025*
