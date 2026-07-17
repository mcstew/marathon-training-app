import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase/client';

const ANONYMOUS_ID_KEY = '@marathon_analytics_anonymous_id';

export type AnalyticsEventName =
  | 'marketing_landing_viewed'
  | 'onboarding_started'
  | 'race_date_selected'
  | 'plan_generated'
  | 'account_signed_in'
  | 'account_created'
  | 'password_reset_requested'
  | 'sync_requested'
  | 'sync_failed'
  | 'workout_completed'
  | 'workout_marked_incomplete'
  | 'workout_skipped';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

function createAnonymousId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function getAnonymousId(): Promise<string> {
  const existing = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;

  const id = createAnonymousId();
  await AsyncStorage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

export async function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {}
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const anonymousId = await getAnonymousId();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('app_events').insert({
      user_id: user?.id ?? null,
      anonymous_id: anonymousId,
      event_name: eventName,
      app_surface: 'app',
      platform: Platform.OS,
      properties,
    });

    return !error;
  } catch {
    return false;
  }
}

export function trackEventFireAndForget(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {}
): void {
  void trackEvent(eventName, properties);
}
