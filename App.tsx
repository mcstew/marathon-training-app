import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppStore, useIsOnboarded, useIsLoading, usePlan } from './src/store/useAppStore';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TabBar, TabName } from './src/components/TabBar';
import { WorkoutModal } from './src/components/WorkoutModal';
import { Colors } from './src/constants/theme';
import { Workout } from './src/types';

function AppContent() {
  const isLoading = useIsLoading();
  const isOnboarded = useIsOnboarded();
  const plan = usePlan();

  const [currentTab, setCurrentTab] = useState<TabName>('today');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

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

  // Show loading spinner while hydrating from storage
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show onboarding if not yet completed
  if (!isOnboarded) {
    return <OnboardingScreen />;
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
      <AppContent />
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
