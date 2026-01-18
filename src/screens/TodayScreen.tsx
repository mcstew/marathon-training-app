import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';
import { WorkoutCard } from '../components/WorkoutCard';
import { Colors } from '../constants/theme';
import { parseDateString } from '../services/planGenerator';
import {
  useAppStore,
  usePlan,
  useTodayWorkout,
  useCurrentWeek,
  usePlanStats,
} from '../store/useAppStore';

interface TodayScreenProps {
  onWorkoutPress: (workoutId: string) => void;
}

export function TodayScreen({ onWorkoutPress }: TodayScreenProps) {
  const plan = usePlan();
  const todayData = useTodayWorkout();
  const currentWeek = useCurrentWeek();
  const stats = usePlanStats();
  const toggleWorkoutCompletion = useAppStore(state => state.toggleWorkoutCompletion);

  const [showConfetti, setShowConfetti] = useState(false);

  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d');

  if (!plan) return null;

  const daysUntilRace = differenceInDays(parseDateString(plan.raceDate), today);

  const handleQuickComplete = () => {
    if (todayData?.workout) {
      toggleWorkoutCompletion(todayData.workout.id);
      if (!todayData.workout.isCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  };

  const weekProgress = currentWeek
    ? currentWeek.workouts.filter(w => w.isCompleted).length / currentWeek.workouts.length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{todayFormatted}</Text>
            <Text style={styles.title}>
              {todayData?.workout ? "Today's Run" : 'Rest Day'}
            </Text>
          </View>
          {currentWeek && (
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>Week {currentWeek.weekNumber}</Text>
            </View>
          )}
        </View>

        {/* Today's Workout Card */}
        <View style={styles.section}>
          {todayData?.workout ? (
            <View>
              <WorkoutCard
                workout={todayData.workout}
                onPress={() => onWorkoutPress(todayData.workout.id)}
              />
              <Text style={styles.tapHint}>Tap card for details</Text>
            </View>
          ) : (
            <View style={styles.restDayCard}>
              <View style={styles.restDayIcon}>
                <Ionicons name="bed" size={32} color={Colors.gray400} />
              </View>
              <Text style={styles.restDayTitle}>No workout scheduled</Text>
              <Text style={styles.restDaySubtitle}>
                Enjoy your rest day or check the calendar for upcoming runs.
              </Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statNumber}>{daysUntilRace}</Text>
            <Text style={styles.statLabel}>Days to Race</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statSectionTitle}>This Week</Text>
            <View style={styles.weekDots}>
              {currentWeek?.workouts.map((w, i) => (
                <View
                  key={i}
                  style={[
                    styles.weekDot,
                    w.isCompleted && styles.weekDotCompleted,
                    w.type === 'rest' && styles.weekDotRest,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.statLabel}>
              {Math.round(weekProgress * 100)}% Done
            </Text>
          </View>
        </View>

        {/* Streak */}
        {stats && stats.currentStreak > 0 && (
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={24} color={Colors.warning} />
            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        )}

        {/* Quick Actions */}
        {todayData?.workout && !todayData.workout.isCompleted && !todayData.workout.isSkipped && (
          <TouchableOpacity
            style={styles.quickCompleteButton}
            onPress={handleQuickComplete}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
            <Text style={styles.quickCompleteText}>Mark Complete</Text>
          </TouchableOpacity>
        )}

        {/* Confetti */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            <Text style={styles.confettiEmoji}>🎉</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
    marginTop: 4,
  },
  weekBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.gray400,
    marginTop: 8,
  },
  restDayCard: {
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  restDayIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray700,
    marginBottom: 8,
  },
  restDaySubtitle: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.warningLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray400,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 4,
  },
  weekDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  weekDot: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
  },
  weekDotCompleted: {
    backgroundColor: Colors.success,
  },
  weekDotRest: {
    backgroundColor: Colors.gray100,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 24,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray900,
    marginLeft: 8,
  },
  streakLabel: {
    fontSize: 16,
    color: Colors.gray500,
    marginLeft: 4,
  },
  quickCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  quickCompleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  confettiEmoji: {
    fontSize: 64,
  },
});
