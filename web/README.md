# Marathon Training Plan Web/Admin

This is the Phase 0 web layer for `marathontrainingplan.com`.

It is intentionally separate from the Expo app:

- Marketing, SEO, auth entry points, billing, and admin live here.
- The Expo app stays focused on plan generation and runner workflows.
- Existing Supabase email/password users are preserved for now.

## Local Development

```bash
npm install
npm run dev
```

From the repo root:

```bash
npm run admin:dev
```

## Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=michael@example.com
```

`ADMIN_EMAILS` is a comma-separated allowlist. A user can also access admin
when their `profiles.role` is `admin`.

## Phase 0 Admin Surface

- `/admin` - overview metrics, recent users, recent events.
- `/admin/users` - joined auth users with profile, active plan, and workout counts.
- `/admin/users/[id]` - user detail, plans, workouts, and event stream.

## Database Setup

Run `supabase/2026-05-30_phase0_analytics.sql` in the Supabase SQL editor to
enable event collection. The admin pages still work without it, but event
panels will show empty states.
