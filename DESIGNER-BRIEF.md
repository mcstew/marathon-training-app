# Marathon Training Plan - Designer Brief

> **For the designer:** This document contains everything you need to create mockups for our iOS app. Start with the "Key Screens to Mock" section if you want to dive right in.

## The Product in One Sentence

A free, offline-first iOS app that generates personalized 18-week marathon training plans and helps runners track their progress to race day.

---

## Why This App Exists

**The problem:** Runners preparing for a marathon need a structured training plan. Most options are either:
- Expensive coaching apps with subscriptions ($15-30/month)
- Static PDFs that don't adapt to their schedule
- Overly complex apps with features they don't need

**Our solution:** A simple, free app that:
1. Generates a proven training plan based on your race date
2. Shows your daily workouts in a clean calendar
3. Lets you track completions and stay motivated
4. Works completely offline (your data, your device)

---

## Target Users

### Primary: First-Time Marathoners
- Age 25-45
- Has run shorter races (5K, 10K, half marathon)
- Training for their first marathon
- Wants guidance but not hand-holding
- Values simplicity over feature overload

### Secondary: Experienced Runners
- Has run marathons before
- Knows what they need
- Wants a reliable tool without subscription fatigue
- May want more advanced training options

---

## Core User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ONBOARDING                                │
│                                                                  │
│  1. Welcome        2. Race Date      3. Choose Plan             │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐               │
│  │          │      │          │      │ ○ Novice │               │
│  │  [icon]  │ ──▶  │ 📅 Pick  │ ──▶  │ ○ Inter. │ ──▶ [Generate]│
│  │  Ready?  │      │   Date   │      │ ○ Advanc │               │
│  └──────────┘      └──────────┘      └──────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MAIN APP (Tabs)                             │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  Today  │  │Calendar │  │Progress │  │Settings │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
│                                                                  │
│  Today: Hero card with today's workout                          │
│  Calendar: Week/month view of all workouts                      │
│  Progress: Stats, streaks, completion rate                      │
│  Settings: Notifications, units, theme, etc.                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen-by-Screen Breakdown

### 1. Onboarding: Welcome
**Purpose:** Set the tone, build confidence

**Content:**
- App icon/logo
- Headline: "Your Marathon Journey Starts Here"
- Subhead: "Get a personalized 18-week training plan in 30 seconds"
- CTA button: "Get Started"

**Design notes:**
- Should feel confident, athletic, but not intimidating
- Minimal—one clear action

---

### 2. Onboarding: Race Date
**Purpose:** Capture the most important input

**Content:**
- Question: "When is your marathon?"
- Date picker (scrollable or calendar-style)
- Optional: Race name input (e.g., "Boston Marathon")
- Validation: Must be 12+ weeks away (show friendly message if too soon)

**Design notes:**
- The date picker should feel celebratory—this is THE date
- Consider showing "X weeks away" as they pick

---

### 3. Onboarding: Choose Plan
**Purpose:** Match them with the right training program

**Content:**
- Brief question: "What's your experience level?"
- Plan cards (3-6 options), each showing:
  - Plan name (e.g., "Novice 1", "Intermediate 2")
  - One-line description
  - Runs per week
  - Weekly mileage range
  - "Best for: [audience]"

**Available Plans (from existing system):**

| Plan | Runs/Week | Peak Mileage | Best For |
|------|-----------|--------------|----------|
| Novice 1 | 4 | 40 mi | First-timers, completion focus |
| Novice 2 | 4 | 40 mi | First-timers wanting pace work |
| Intermediate 1 | 5 | 45 mi | Some experience, ready for more |
| Intermediate 2 | 5 | 50 mi | Experienced, time goal |
| Advanced 1 | 6 | 55 mi | Serious runners, includes speedwork |
| Advanced 2 | 6 | 55+ mi | Competitive, marathon pace focus |

**Design notes:**
- Cards should be scannable at a glance
- Consider a "Help me choose" option for uncertain users
- Selected state should be clear

---

### 4. Onboarding: Plan Preview (Optional)
**Purpose:** Confirm before generating

**Content:**
- Summary: "Your 18-Week Plan"
- Race date, plan name
- Quick week-by-week mileage chart
- "Generate Plan" button

**Design notes:**
- This is the "wow" moment—make it feel real
- Could skip this and go straight to generation

---

### 5. Main Screen: Today Tab
**Purpose:** Daily motivation and quick action

**Content:**
- Date display ("Tuesday, March 15")
- Hero workout card:
  - Workout type (Easy Run, Long Run, Tempo, etc.)
  - Distance (e.g., "5 miles")
  - Description (e.g., "Easy run at conversational pace")
  - Mark Complete button
- Week progress (dots or mini calendar showing this week)
- Days until race countdown
- Current streak (if applicable)

**States:**
- Rest day: Celebratory "Rest Day" message
- Completed: Checkmark, stats from the completed workout
- Upcoming race: Special race day treatment

**Design notes:**
- This is the most-visited screen—make it feel good daily
- The "Mark Complete" action should be satisfying (haptic, animation)
- Consider motivational copy that changes

---

### 6. Main Screen: Calendar Tab
**Purpose:** See the full training plan

**Content:**
- Toggle: Week view / Month view
- Calendar grid with workouts
- Each day shows:
  - Workout type (color-coded)
  - Distance or "Rest"
  - Completion status (done, skipped, upcoming)
- Tap to open workout detail

**Workout type colors (suggestion):**
| Type | Color | Hex |
|------|-------|-----|
| Easy Run | Green | #22c55e |
| Long Run | Blue | #3b82f6 |
| Tempo/Pace | Amber | #f59e0b |
| Speed/Intervals | Red | #ef4444 |
| Cross Training | Purple | #8b5cf6 |
| Rest | Gray | #6b7280 |
| Race | Gold | #eab308 |

**Design notes:**
- Week view is probably more useful day-to-day
- Month view for "seeing the whole journey"
- Current week should be highlighted
- Past workouts should show completion state

---

### 7. Workout Detail Modal/Sheet
**Purpose:** Full info about a workout, logging completion

**Content:**
- Date and workout type
- Distance and estimated duration
- Full description
- Pace guidance (if applicable)
- Purpose: "Why this workout matters"
- Actions:
  - Mark Complete
  - Log details (optional): actual distance, time, effort (1-5), notes
  - Mark as Skipped (with reason picker)

**Design notes:**
- Bottom sheet on iOS feels natural
- Completing should feel rewarding
- Don't require logging details—make it optional

---

### 8. Main Screen: Progress Tab
**Purpose:** Motivation through metrics

**Content:**
- Countdown: "X weeks until race day"
- Completion rate: "85% of workouts completed"
- Current streak: "7 days" (flame icon)
- Total distance trained
- Weekly mileage chart (actual vs. planned)
- Achievements/milestones (optional):
  - "First long run over 15 miles"
  - "Completed taper week"
  - Etc.

**Design notes:**
- Should feel encouraging, not judgmental
- Missed workouts happen—don't shame
- Streaks are motivating but shouldn't be punishing

---

### 9. Main Screen: Settings Tab
**Purpose:** Customize the experience

**Sections:**

**Notifications**
- Enable/disable all
- Daily reminder time picker
- Day-before reminders
- Weekly summary
- Streak celebrations

**Display**
- Units (miles / kilometers)
- Theme (light / dark / system)
- Start of week (Sunday / Monday)

**Plan**
- View current plan details
- Change plan (with warning)
- Start new plan

**Data**
- Export plan to Apple Calendar
- Export all data (JSON)
- Delete all data

**About**
- App version
- Send feedback
- Rate the app

---

## Visual Design Direction

### Overall Feel
- **Clean and focused** - Not cluttered with features
- **Athletic but approachable** - Confident, not aggressive
- **Encouraging** - Celebrates progress, doesn't shame
- **Functional** - Form follows function

### Typography
- Clear, readable sans-serif
- Large, confident numbers for distances/stats
- Good hierarchy between headlines and body

### Color Palette
- Primary: A confident blue or teal
- Success/completion: Green
- Workout types: Distinct but harmonious (see color table above)
- Dark mode support essential

### Iconography
- Simple, consistent line icons
- Running-related icons where appropriate
- Workout type indicators should be instantly recognizable

### Motion
- Subtle, purposeful animations
- Completion actions should feel satisfying (confetti? Checkmark?)
- Don't overdo it—speed matters

---

## Key Screens to Mock

Priority order for design work:

1. **Today Tab** - The daily experience
2. **Calendar Tab (Week View)** - The plan at a glance
3. **Workout Detail Sheet** - Logging a workout
4. **Onboarding: Choose Plan** - Key decision point
5. **Progress Tab** - Motivation metrics
6. **Settings: Notifications** - Key customization

---

## Competitive Reference

Apps to look at (for inspiration, not copying):

- **Nike Run Club** - Clean workout cards, good celebration moments
- **Strava** - Stats presentation, social proof (we won't have social)
- **Apple Fitness** - Native iOS feel, ring completion
- **Streaks** - Simple habit tracking, streak motivation
- **Things 3** - Clean task/checklist interaction

---

## Technical Constraints

- **iOS only** (for now)
- **Offline-first** - Everything works without internet
- **No accounts required** - Data stored locally
- **Free app** - No paywall, no subscriptions
- **Future:** Possible premium features (AI adjustments, advanced analytics)

---

## Existing Web App

The web version lives at **marathontrainingplan.com** - worth looking at for context, though the mobile app will have its own native design.

Key differences from web:
- Native iOS components (not web views)
- Tab-based navigation instead of single page
- Workout tracking and completion (web is view-only)
- Push notifications

---

## Open Questions for Designer

1. **Onboarding length:** 3 screens enough, or should we add plan customization (rest days, long run day)?

2. **Calendar density:** How much info per day in month view? Just dots? Distances?

3. **Completion celebration:** How celebratory should marking complete feel? Quick and simple, or moment of joy?

4. **Empty states:** What does a fresh app look like before a plan is generated?

5. **Race day:** Special treatment for marathon day? Countdown screen?

6. **Skipped workouts:** How to handle gracefully without shame?

---

## Deliverables Requested

1. **Style guide:** Colors, typography, spacing, components
2. **Key screens:** High-fidelity mocks of priority screens
3. **Interaction notes:** Key animations/transitions to specify
4. **iOS assets:** App icon, launch screen

---

## Timeline Notes

- Want to ship a functional v1 for spring marathon season
- Can iterate on design post-launch
- Core experience matters more than polish

---

*Questions? Let's discuss!*
