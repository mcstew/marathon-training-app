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
**Status:** Confirmed — clarified and extended by Decision 011

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

## Decision 007: Authentication Implementation

**Date:** January 2025
**Decision:** Supabase Auth with email/password
**Status:** Implemented / retained for Phase 0

### Context
Now that we're adding cloud sync and planning a web version, we need real authentication.

### Decision
Supabase Auth with email/password, because:
1. Same backend for auth and database (simpler architecture)
2. Works on both mobile and web
3. Built-in session management
4. RLS policies integrate directly with auth
5. Free tier sufficient for MVP

### Key Choices Made
- **Email verification:** Disabled for now - deep links don't work well with Expo Go, will enable later
- **Password requirements:** Using Supabase defaults
- **Session storage:** AsyncStorage on mobile, localStorage on web

### Consequences
- Users need to remember password (or use reset flow)
- Can add OAuth providers (Google, Apple) later
- Admin users identified by flag in profiles table
- Phase 0 explicitly preserves this flow because existing users already exist
  in Supabase. Magic Link remains attractive, but should be planned as a
  migration rather than bundled into admin/analytics work.

---

## Decision 008: Sync Strategy

**Date:** January 2025
**Decision:** Queue-based offline-first sync
**Status:** Implemented

### Context
App must work offline but sync to cloud when connected.

### Decision
Queue-based sync with last-write-wins conflict resolution:
1. All changes apply locally first (immediate UI feedback)
2. Changes queue for sync with `pendingSyncCount` tracking
3. Sync attempts on: login, manual trigger, app foreground
4. Server timestamp wins in conflicts (simple, predictable)

### Implementation
- Workouts have `remoteId`, `version`, `updatedAt` fields
- Plans have `remoteId`, `syncedAt`, `status` fields
- Sync queue stored in Zustand (persisted to AsyncStorage)
- NetInfo checks connectivity before sync attempts

### Consequences
- Works fully offline
- Last-write-wins may lose data in rare edge cases
- Can add smarter merge logic later if needed

---

## Decision 009: Web Platform Support

**Date:** January 2025
**Decision:** Split marketing/admin into a Next.js web layer
**Status:** In progress

### Context
Want to:
1. Verify cross-platform sync before App Store launch
2. Provide web access for users who prefer browser
3. Build admin dashboard (easier on web)
4. Replace legacy website

### Decision
Use a dedicated Next.js app in `web/` for the public marketing and admin
surface:
1. Marketing, SEO, admin, and future billing need server-first web behavior.
2. Admin pages need service-role Supabase access, which should never ship in
   the Expo static bundle.
3. The Expo app can stay focused on offline plan generation and tracking.
4. Existing Supabase password auth is retained for Phase 0.

### Hosting Options Under Consideration
- **Vercel** - Great for Next.js, easy deploys, already used
- **EAS Hosting** - still viable for Expo app hosting if we keep a separate app surface

### Consequences
- There are now two packages: root Expo app and `web/` Next.js app.
- Vercel should eventually point `marathontrainingplan.com` at `web/`.
- The Expo web app may move to an app subdomain or app path later.
- Admin can safely use service-role Supabase code on the server.

---

## Decision 010: SEO Strategy

**Date:** January 2025
**Decision:** Post-build SEO enhancement with structured data
**Status:** Implemented

### Context
Web version needs to rank well in search engines for marathon training queries.

### Decision
1. Use Expo's built-in web config for basic meta tags (app.json)
2. Post-process with `scripts/enhance-seo.js` to inject:
   - Extended meta tags (keywords, author, robots, canonical)
   - Open Graph tags for social sharing
   - Twitter Card meta tags
   - Structured data (JSON-LD for WebApplication and FAQPage)
3. Static files in `public/` copied to dist (robots.txt, sitemap.xml, manifest.json)

### Target Keywords
- marathon training plan
- marathon training schedule
- 18 week marathon plan
- hal higdon marathon
- free marathon training
- beginner marathon plan

### Build Process
```bash
npm run build:web  # Runs expo export + SEO enhancement
```

### Assets Needed (TODO)
- `og-image.png` (1200x630) for social sharing
- App icons for PWA (192x192, 512x512)
- Apple touch icon (180x180)

### Consequences
- Better search visibility for marathon training queries
- Rich snippets in search results (FAQ schema)
- Good social sharing previews
- PWA installable from browser
- Note (July 2026): the SEO assets currently ship only with the Expo export
  (app subdomain). The apex marketing site (`web/`) needs its own robots.ts,
  sitemap.ts, JSON-LD, and analytics — tracked as part of the fundamentals work.

---

## Decision 011: Monetization Model (settled)

**Date:** July 2026
**Decision:** Free core product; paid premium features later
**Status:** Confirmed — supersedes the pending "Pricing Tier" / "Free Tier"
questions and resolves the tension with Decision 002

### Context
Earlier notes drifted between "completely free," "paid app only ($9.99–14.99),"
and "free with premium later." That ambiguity was blocking product decisions.

### Decision
- Plan generation and tracking stay **free forever** — free distribution is the
  moat for a domain that earns passive search traffic.
- Monetization comes from **premium features layered on top**, in likely order:
  1. Custom plan builder / import-your-own-plan
  2. AI coach (plan adjustments, missed-workout replanning, Q&A)
- No paid-app-only option. The web product remains freely accessible.
- Pricing/packaging decided later, informed by analytics on real usage.

### Consequences
- The old $9.99–14.99 one-time-purchase options are dropped.
- Fundamentals (usability, reliability, analytics) come before any paywall.
- Decision 004 (original plan templates, no trademarked names) becomes a
  prerequisite for charging money — revisit before the premium launch.

---

## Decision 012: Improvement Priority Order

**Date:** July 2026
**Decision:** Stability → Usability → SEO/analytics → App-store prep → Monetization
**Status:** Confirmed

### Context
Full product review (July 2026) surfaced work across stability, usability,
SEO, and app-store readiness. Usability explicitly ranks ahead of SEO work.

### Decision
1. **Stability first:** commit/push discipline, UTC "today" bug, sync conflict
   safety, Supabase RLS/app_events hardening, error boundary.
2. **Usability second:** functional km/mi units, short-timeline race stats,
   first-run landing payoff, desktop web layout, accessibility.
3. **SEO/analytics third:** apex robots/sitemap/JSON-LD/GA (prereq for ads).
4. **App-store prep fourth:** scheme, EAS, notifications decision, a11y polish.
5. **Monetization last**, on top of the above.

---

## Decision 013: Web Layout Strategy

**Date:** July 2026
**Decision:** Desktop web gets a real desktop layout; the phone layout is for phones
**Status:** Confirmed

### Context
The Expo web export currently stretches the phone UI across desktop viewports
(full-width buttons, unusable month calendar at 1280px+). Search traffic
includes many desktop visitors.

### Decision
- Take advantage of the web: responsive layouts that use desktop width
  (constrained content columns, side-by-side panels, a month calendar that
  works at desktop sizes).
- The phone-optimized layout renders only on phone-sized viewports and in the
  future native iOS/Android app.
- One codebase: responsive breakpoints in the Expo app, not a fork.

---

## Decision 014: Accessibility Is a Requirement

**Date:** July 2026
**Decision:** Accessibility is a first-class requirement, not polish
**Status:** Confirmed

### Context
Audit found zero accessibility annotations; the web app exposes an almost
empty accessibility tree (icon-only buttons unlabeled, no roles).

### Decision
- All interactive elements get `accessibilityRole` + `accessibilityLabel`.
- Icon-only controls (modal close, calendar nav, sync refresh, password eye)
  are the first targets; forms get labels.
- A11y review is part of definition-of-done for new UI, and part of
  App Store readiness.

---

## Pending Decisions

### Watch App
- Defer to post-launch
- Focus on phone app quality first

### Analytics stack (partially settled)
- In place: Google Analytics `G-W2VBGR482T` on the app subdomain + first-party
  `app_events` in Supabase.
- Remaining: add analytics to the apex marketing site; decide whether GA is
  enough or a product-analytics tool (PostHog etc.) joins later.

---

*Add new decisions following the template above*
