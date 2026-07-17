-- Sync hardening + RLS security fixes (July 2026).
-- Run in the Supabase SQL editor AFTER schema.sql and the phase0 analytics
-- migration. Safe to re-run (idempotent).

-- =============================================
-- 1. Fix recursive admin RLS policies
-- The old "Admins can view all profiles" policy selected from profiles
-- inside a policy ON profiles - the classic infinite-recursion footgun.
-- A SECURITY DEFINER helper bypasses RLS for the role check itself.
-- =============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all training plans" ON training_plans;
CREATE POLICY "Admins can view all training plans"
  ON training_plans FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all workouts" ON workouts;
CREATE POLICY "Admins can view all workouts"
  ON workouts FOR SELECT
  USING (is_admin());

-- =============================================
-- 2. One active plan per user
-- Duplicate active plans wedge sync permanently (.single() errors).
-- First abandon all but the most recent active plan per user, then
-- enforce uniqueness going forward.
-- =============================================

UPDATE training_plans tp
SET status = 'abandoned'
WHERE tp.status = 'active'
  AND tp.id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM training_plans
    WHERE status = 'active'
    ORDER BY user_id, created_at DESC
  );

CREATE UNIQUE INDEX IF NOT EXISTS one_active_plan_per_user
  ON training_plans (user_id)
  WHERE status = 'active';

-- =============================================
-- 3. Unique client_id per user
-- getWorkoutByClientId assumed uniqueness that was never enforced.
-- Null out client_id on older duplicates (rows remain, just lose the
-- client mapping), then enforce uniqueness.
-- =============================================

UPDATE workouts w
SET client_id = NULL
WHERE w.client_id IS NOT NULL
  AND w.id NOT IN (
    SELECT DISTINCT ON (user_id, client_id) id
    FROM workouts
    WHERE client_id IS NOT NULL
    ORDER BY user_id, client_id, updated_at DESC
  );

CREATE UNIQUE INDEX IF NOT EXISTS workouts_user_client_id_unique
  ON workouts (user_id, client_id)
  WHERE client_id IS NOT NULL;

-- =============================================
-- 4. Tighten app_events inserts
-- The anon key is public, so the old policy allowed arbitrary rows into
-- the analytics table. Constrain event names to the known set and cap
-- field sizes so junk inserts can't pollute admin metrics.
-- =============================================

DROP POLICY IF EXISTS "Clients can insert app events" ON app_events;
CREATE POLICY "Clients can insert app events"
  ON app_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR auth.uid() = user_id)
    AND event_name IN (
      'marketing_landing_viewed',
      'admin_login_viewed',
      'admin_login_attempted',
      'onboarding_started',
      'race_date_selected',
      'plan_generated',
      'account_created',
      'account_signed_in',
      'password_reset_requested',
      'sync_requested',
      'sync_failed',
      'workout_completed',
      'workout_marked_incomplete',
      'workout_skipped'
    )
    AND length(anonymous_id) <= 64
    AND (platform IS NULL OR length(platform) <= 32)
    AND (path IS NULL OR length(path) <= 256)
    AND pg_column_size(properties) <= 4096
  );
