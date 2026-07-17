-- Marathon Training App Database Schema
-- Run this in Supabase SQL Editor (SQL Editor in sidebar)

-- =============================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  units TEXT NOT NULL DEFAULT 'miles' CHECK (units IN ('miles', 'km')),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  is_onboarded BOOLEAN NOT NULL DEFAULT false,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 2. TRAINING_PLANS TABLE
-- User's active/historical training plans
-- =============================================

CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- 'novice1', 'novice2', etc.
  plan_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_plans_user ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_status ON training_plans(user_id, status);

-- =============================================
-- 3. WORKOUTS TABLE
-- Individual workout records
-- =============================================

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('rest', 'run', 'pace', 'cross', 'race')),
  planned_distance NUMERIC(5,2),
  unit TEXT NOT NULL DEFAULT 'mi' CHECK (unit IN ('mi', 'km')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_skipped BOOLEAN NOT NULL DEFAULT false,
  actual_distance NUMERIC(5,2),
  actual_duration INTEGER, -- minutes
  notes TEXT,
  perceived_effort INTEGER CHECK (perceived_effort IS NULL OR (perceived_effort >= 1 AND perceived_effort <= 5)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Client-side tracking for offline sync
  client_id TEXT, -- Original client-generated ID for sync
  version INTEGER NOT NULL DEFAULT 1 -- For conflict resolution
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workouts_plan ON workouts(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_client_id ON workouts(client_id) WHERE client_id IS NOT NULL;

-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS training_plans_updated_at ON training_plans;
CREATE TRIGGER training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS workouts_updated_at ON workouts;
CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TRAINING_PLANS POLICIES
DROP POLICY IF EXISTS "Users can view own training plans" ON training_plans;
CREATE POLICY "Users can view own training plans"
  ON training_plans FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own training plans" ON training_plans;
CREATE POLICY "Users can create own training plans"
  ON training_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own training plans" ON training_plans;
CREATE POLICY "Users can update own training plans"
  ON training_plans FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own training plans" ON training_plans;
CREATE POLICY "Users can delete own training plans"
  ON training_plans FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all training plans" ON training_plans;
CREATE POLICY "Admins can view all training plans"
  ON training_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- WORKOUTS POLICIES
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own workouts" ON workouts;
CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all workouts" ON workouts;
CREATE POLICY "Admins can view all workouts"
  ON workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 6. ADMIN HELPER FUNCTION
-- Get user stats for admin dashboard
-- =============================================

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_plans BIGINT,
  completed_workouts BIGINT,
  total_miles NUMERIC
) AS $$
BEGIN
  -- Only allow admins to call this
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles)::BIGINT as total_users,
    (SELECT COUNT(*) FROM training_plans WHERE status = 'active')::BIGINT as active_plans,
    (SELECT COUNT(*) FROM workouts WHERE is_completed = true)::BIGINT as completed_workouts,
    (SELECT COALESCE(SUM(actual_distance), 0) FROM workouts WHERE is_completed = true) as total_miles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
