# Decision Log

This document tracks key architectural and product decisions for the Marathon Training Plan app.

---

## Decision 001: Platform Choice

**Date:** January 2025
**Decision:** React Native with Expo
**Status:** Proposed

### Context
We needed to choose between:
- Capacitor/Ionic (web wrapper)
- React Native (Expo)
- Native SwiftUI

### Decision
React Native with Expo, because:
1. Reuses existing React/TypeScript skills from web app
2. Can share plan generation logic as a TypeScript package
3. Provides native iOS feel (not a web wrapper)
4. Excellent offline-first support
5. Expo simplifies App Store deployment
6. Compatible with Replit's mobile tooling

### Consequences
- Will need to rebuild calendar UI (can't use FullCalendar)
- Some native features (HealthKit) require native modules
- Good community support and documentation

---

## Decision 002: Monetization Model

**Date:** January 2025
**Decision:** Free app
**Status:** Confirmed

### Context
Options considered:
- Subscription (recurring revenue, industry standard for fitness)
- One-time purchase (simple, user-friendly)
- Free with optional premium features
- Completely free

### Decision
**Completely free** for MVP, because:
1. Maximum distribution - no barrier to entry
2. Offline-first = minimal server costs to support
3. Build reputation and user base first
4. Differentiator in subscription-heavy market
5. Potential for premium features later (AI adjustments, advanced analytics)

### Consequences
- No immediate revenue
- Lower support burden (free users have lower expectations)
- Can add optional IAP later if valuable features emerge
- Focus on quality and word-of-mouth growth

---

## Decision 003: Authentication Strategy

**Date:** January 2025
**Decision:** Device-based for MVP, optional accounts later
**Status:** Proposed

### Context
Options considered:
- Full account system (email/password)
- Apple Sign In only
- No accounts (device-based)
- Hybrid (device-based with optional cloud sync)

### Decision
Device-based storage for MVP with no required accounts, because:
1. Offline-first design doesn't need accounts
2. Reduces friction (no signup required)
3. Privacy-friendly (data stays on device)
4. Purchase tied to Apple ID anyway
5. iCloud backup handles data persistence

### Consequences
- No cross-device sync at launch
- Easier implementation
- Can add optional accounts later for sync
- Users may lose data if they delete app without backup

---

## Decision 004: Plan Content / IP Strategy

**Date:** January 2025
**Decision:** Original templates inspired by training principles
**Status:** Proposed

### Context
Risk of using named plans (Higdon, FIRST) in a paid product:
- Ideas aren't copyrightable, but specific expression is
- A paid app is a bigger legal target than a free web tool
- Need defensible content strategy

### Decision
Create original plan templates that:
1. Follow proven periodization principles (public domain)
2. Use original workout descriptions and language
3. Don't reference trademarked names
4. Focus on training science, not copying tables
5. Allow user customization (templates as starting points)

### Consequences
- More work upfront to create original content
- Lower legal risk
- Templates can be a differentiator
- Can add "community templates" later

---

## Decision 005: Data Storage

**Date:** January 2025
**Decision:** SQLite for structured data, AsyncStorage for preferences
**Status:** Proposed

### Context
Options for local storage:
- AsyncStorage only (simple key-value)
- SQLite (relational, queryable)
- Realm (object-based)
- WatermelonDB (React Native optimized)

### Decision
SQLite (via expo-sqlite) for plans/workouts/completions, AsyncStorage for simple preferences, because:
1. SQLite handles complex queries well (calendar views, stats)
2. Well-supported in Expo
3. Familiar SQL semantics
4. Good performance for our data size
5. AsyncStorage for simple key-value settings

### Consequences
- Need to manage migrations carefully
- Slightly more complex than pure AsyncStorage
- Can export data easily (standard format)

---

## Decision 006: State Management

**Date:** January 2025
**Decision:** Zustand
**Status:** Proposed

### Context
Options:
- Redux Toolkit
- Zustand
- Jotai
- MobX
- React Context only

### Decision
Zustand, because:
1. Minimal boilerplate
2. TypeScript-first
3. Easy persistence integration
4. Small bundle size
5. Works well with React Native

### Consequences
- Simpler than Redux for our scale
- Good developer experience
- May need to be more intentional about store organization

---

## Pending Decisions

### Pricing Tier
- Need competitive research
- Options: $9.99, $12.99, $14.99
- May A/B test via soft launch

### Free Tier / Trial
- Options:
  - A) No free tier (paid app only)
  - B) Free tier with limited features
  - C) TestFlight trial period
- Leaning toward Option A for simplicity

### Watch App
- Defer to post-launch
- Focus on phone app quality first

### Analytics
- Minimal for privacy
- Consider: Amplitude, PostHog, or none
- Defer to MVP completion

---

*Add new decisions following the template above*
