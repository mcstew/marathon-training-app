# Marathon Training App - Roadmap Notes

## Future Considerations (Keep in Mind During Development)

### Phase 0: Visibility + Product Boundary (In Progress)
- Keep existing Supabase email/password auth for now so current users are not disrupted.
- Split web/admin from the Expo app:
  - `web/` owns marketing, SEO, admin, future billing, and server-only Supabase access.
  - Expo owns plan generation, tracking, offline use, and runner workflows.
- Add admin visibility:
  - Overview metrics
  - User list
  - User detail with plans/workouts/events
  - Admin access via `ADMIN_EMAILS` or `profiles.role = 'admin'`
- Add app event collection:
  - `marketing_landing_viewed`
  - `onboarding_started`
  - `race_date_selected`
  - `plan_generated`
  - `account_signed_in`
  - `account_created`
  - `sync_requested`
  - `sync_failed`
  - `workout_completed`
  - `workout_marked_incomplete`
  - `workout_skipped`
- Supabase migration: `supabase/2026-05-30_phase0_analytics.sql`
- Housekeeping:
  - Supabase client now fails soft when env vars are missing.
  - Root scripts added for the admin app: `admin:dev`, `admin:build`, `admin:type-check`.

### 1. Admin Functionality
- **Short-term:** Use the new `web/` `/admin` route for read-only visibility.
- **Long-term:** Expand `/admin` with superuser capabilities.
  - View active users and their stats
  - User management (support actions, etc.)
  - Analytics dashboard
- Admin role/flag needed in user schema

### 2. Web Version
- Production domain: **marathontrainingplan.com**
- Web/admin layer lives in `web/` and can become the marketing site.
- The Expo web export can move behind a dedicated app path/domain later.
- Consider SEO, sharing, and public plan pages for web.

### 3. Training Plans Expansion
- Currently: 6 Hal Higdon plans (hardcoded)
- Future: Many more plans from various sources
- **"Pick a plan for me" flow** - recommendation based on:
  - Current fitness level
  - Running history
  - Goal time
  - Available training days per week
- **"Import your own plan" feature**
  - Custom plan creation UI
  - Possibly import from CSV/spreadsheet
  - Integration with other training platforms?
- Plan schema should be flexible for user-created plans

---

## Completed: Supabase Auth + Database Integration ✅

**Completed:** January 2025

### What Was Built
1. **User accounts** via Supabase Auth (email/password)
2. **Cloud database** with PostgreSQL (profiles, training_plans, workouts tables)
3. **Offline-first sync** - app works offline, syncs when connected
4. **Sync queue** - workout changes queued locally, uploaded when online
5. **Row Level Security (RLS)** - users can only access their own data

### Key Files Created
- `src/services/supabase/client.ts` - Supabase client with AsyncStorage session
- `src/services/supabase/auth.ts` - Sign up, sign in, sign out, password reset
- `src/services/supabase/database.ts` - CRUD operations for plans/workouts
- `src/services/supabase/sync.ts` - Sync queue management, conflict resolution
- `src/store/useAuthStore.ts` - Auth state with Zustand
- `src/screens/AuthScreen.tsx` - Full auth UI with all flows
- `supabase/schema.sql` - Complete database schema with RLS policies

### Decisions Made
- **Email verification:** Disabled for now (deep link handling complex on mobile)
- **Admin policies:** Removed circular RLS policies that caused sync errors
- **Sync strategy:** Queue-based with last-write-wins conflict resolution

---

## Next: Web Version at marathontrainingplan.com

### Goals
1. Deploy app to web using Expo's web support
2. Verify cross-platform sync works (mobile ↔ web)
3. Create admin view for user/data management
4. Replace legacy website with new React app

### Technical Approach
- Use Expo Router's web export
- Same codebase, same Supabase backend
- Consider hosting: Vercel, Netlify, or EAS Hosting
- Domain: marathontrainingplan.com (already owned)

### Admin Features (Web-First)
- `/admin` route with protected access
- View all users and their training progress
- User support actions (password reset, plan fixes)
- Analytics dashboard

---
