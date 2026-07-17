-- Phase 0 analytics and admin visibility.
-- Run this in the Supabase SQL editor before relying on event metrics.

CREATE TABLE IF NOT EXISTS app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  app_surface TEXT NOT NULL DEFAULT 'app' CHECK (app_surface IN ('app', 'web', 'admin')),
  platform TEXT,
  path TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_event_name ON app_events(event_name);
CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON app_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_events_anonymous_id ON app_events(anonymous_id);

ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can insert app events" ON app_events;
CREATE POLICY "Clients can insert app events"
  ON app_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own app events" ON app_events;
CREATE POLICY "Users can view own app events"
  ON app_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin pages use the Supabase service role key for aggregate reads.
-- Keep direct client-side reads narrow to avoid leaking product telemetry.
