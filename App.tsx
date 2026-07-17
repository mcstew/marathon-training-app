import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppStore, useIsOnboarded, useIsLoading, useIsSyncing, usePlan } from './src/store/useAppStore';
import { useAuthStore } from './src/store/useAuthStore';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { TabBar, TabName } from './src/components/TabBar';
import { WorkoutModal } from './src/components/WorkoutModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { Colors } from './src/constants/theme';
import { Workout } from './src/types';
import { isSupabaseConfigured } from './src/services/supabase/client';

type AuthDeepLinkMode = 'signIn' | 'signUp' | null;

function getInitialAuthDeepLinkMode(): AuthDeepLinkMode {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#\/?\??/, '');
  const hashParams = new URLSearchParams(hash);
  const authEntry = (
    params.get('auth') ??
    params.get('login') ??
    hashParams.get('auth') ??
    hashParams.get('login') ??
    hash
  ).toLowerCase();

  if (['login', 'sign-in', 'signin'].includes(authEntry)) {
    return 'signIn';
  }

  if (['create-account', 'sign-up', 'signup'].includes(authEntry)) {
    return 'signUp';
  }

  return null;
}

function clearAuthDeepLink() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('auth');
  url.searchParams.delete('login');

  if (/^#\/?\??(?:auth|login|sign-in|signin|create-account|sign-up|signup)/.test(url.hash)) {
    url.hash = '';
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function AppContent() {
  const isLoading = useIsLoading();
  const isOnboarded = useIsOnboarded();
  const plan = usePlan();
  const initializeAuth = useAuthStore((state) => state.initialize);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const performSync = useAppStore((state) => state.performSync);
  const isSyncing = useIsSyncing();

  const [currentTab, setCurrentTab] = useState<TabName>('today');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [authDeepLinkMode, setAuthDeepLinkMode] = useState<AuthDeepLinkMode>(() => getInitialAuthDeepLinkMode());
  const syncedUserIdRef = useRef<string | null>(null);

  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      syncedUserIdRef.current = null;
      return;
    }

    if (!user?.id || syncedUserIdRef.current === user.id) return;

    syncedUserIdRef.current = user.id;
    performSync(user.id);
  }, [isAuthenticated, performSync, user?.id]);

  // Find the selected workout
  const selectedWorkout: Workout | null = selectedWorkoutId && plan
    ? plan.weeks.flatMap(w => w.workouts).find(w => w.id === selectedWorkoutId) || null
    : null;

  const handleWorkoutPress = useCallback((workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedWorkoutId(null);
  }, []);

  const handleCloseAuthDeepLink = useCallback(() => {
    setAuthDeepLinkMode(null);
    clearAuthDeepLink();
  }, []);

  // Show loading spinner while hydrating from storage or auth
  if (isLoading || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && !isOnboarded && isSyncing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (authDeepLinkMode && !isAuthenticated && isSupabaseConfigured) {
    return (
      <AuthScreen
        initialMode={authDeepLinkMode}
        onClose={handleCloseAuthDeepLink}
        onSuccess={handleCloseAuthDeepLink}
      />
    );
  }

  // Show onboarding if not yet completed
  if (!isOnboarded) {
    return <OnboardingScreen onLoginPress={() => setAuthDeepLinkMode('signIn')} />;
  }

  // Main app with tab navigation
  return (
    <View style={styles.container}>
      {currentTab === 'today' && (
        <TodayScreen onWorkoutPress={handleWorkoutPress} />
      )}
      {currentTab === 'calendar' && (
        <CalendarScreen onWorkoutPress={handleWorkoutPress} />
      )}
      {currentTab === 'progress' && <ProgressScreen />}
      {currentTab === 'settings' && <SettingsScreen />}

      <TabBar currentTab={currentTab} onTabChange={setCurrentTab} />

      <WorkoutModal
        workout={selectedWorkout}
        visible={!!selectedWorkoutId}
        onClose={handleCloseModal}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
  },
});
