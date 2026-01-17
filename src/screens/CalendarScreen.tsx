import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { format } from 'date-fns';
import { Colors, WORKOUT_COLORS } from '../constants/theme';
import { usePlan } from '../store/useAppStore';
import { Workout } from '../types';

interface CalendarScreenProps {
  onWorkoutPress: (workoutId: string) => void;
}

export function CalendarScreen({ onWorkoutPress }: CalendarScreenProps) {
  const plan = usePlan();

  if (!plan) return null;

  const today = new Date().toISOString().split('T')[0];

  const getWorkoutColor = (workout: Workout) => {
    const colors = WORKOUT_COLORS[workout.type];
    return colors.bg;
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEE').charAt(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Plan</Text>
        <Text style={styles.subtitle}>
          18 Weeks to {format(new Date(plan.raceDate), 'MMM d, yyyy')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {plan.weeks.map(week => (
          <View key={week.weekNumber} style={styles.weekContainer}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>
              <Text style={styles.weekMileage}>
                {week.totalPlannedMileage} mi total
              </Text>
            </View>

            <View style={styles.weekGrid}>
              {week.workouts.map(workout => {
                const isToday = workout.date === today;
                const isPast = workout.date < today;

                return (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.dayContainer}
                    onPress={() => onWorkoutPress(workout.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.dayLabel, isToday && styles.dayLabelToday]}
                    >
                      {getDayLabel(workout.date)}
                    </Text>
                    <View
                      style={[
                        styles.workoutCell,
                        { backgroundColor: getWorkoutColor(workout) },
                        workout.isCompleted && styles.workoutCellCompleted,
                        workout.isSkipped && styles.workoutCellSkipped,
                      ]}
                    >
                      {workout.isCompleted && (
                        <View style={styles.completedOverlay}>
                          <Text style={styles.checkmark}>✓</Text>
                        </View>
                      )}

                      {workout.type === 'rest' ? null : workout.type === 'cross' ? (
                        <Text style={styles.crossLabel}>XT</Text>
                      ) : workout.type === 'race' ? (
                        <Text style={styles.raceEmoji}>🏁</Text>
                      ) : (
                        <Text style={styles.distanceLabel}>
                          {workout.distance}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  weekContainer: {
    marginBottom: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray800,
  },
  weekMileage: {
    fontSize: 12,
    color: Colors.gray400,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.gray400,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  workoutCell: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutCellCompleted: {
    opacity: 0.6,
  },
  workoutCellSkipped: {
    opacity: 0.4,
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.successDark,
  },
  distanceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  crossLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  raceEmoji: {
    fontSize: 20,
  },
});
