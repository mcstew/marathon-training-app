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
  useCalendarWeekWorkouts,
  usePlanStats,
} from '../store/useAppStore';
import { trackEventFireAndForget } from '../services/analytics';
import { todayLocalStr } from '../utils/dates';

interface TodayScreenProps {
  onWorkoutPress: (workoutId: string) => void;
  onViewCalendar?: () => void;
}

export function TodayScreen({ onWorkoutPress, onViewCalendar }: TodayScreenProps) {
  const plan = usePlan();
  const todayData = useTodayWorkout();
  const currentWeek = useCurrentWeek();
  const calendarWeekWorkouts = useCalendarWeekWorkouts();
  const stats = usePlanStats();
  const toggleWorkoutCompletion = useAppStore(state => state.toggleWorkoutCompletion);

  const [showConfetti, setShowConfetti] = useState(false);

  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d');

  if (!plan) return null;

  const daysUntilRace = differenceInDays(parseDateString(plan.raceDate), today);
  const todayStr = todayLocalStr();
  const planStartsInFuture = !!plan.startDate && plan.startDate > todayStr;
  const raceHasPassed = plan.raceDate < todayStr;
  const daysUntilStart = planStartsInFuture
    ? differenceInDays(parseDateString(plan.startDate), today)
    : 0;
  // First real workout of the plan, for the pre-start preview
  const firstWorkout = planStartsInFuture
    ? plan.weeks[0]?.workouts.find(w => w.type !== 'rest' && w.type !== 'cross') || null
    : null;

  const handleQuickComplete = () => {
    if (todayData?.workout) {
      const wasCompleted = todayData.workout.isCompleted;
      toggleWorkoutCompletion(todayData.workout.id);
      trackEventFireAndForget(
        wasCompleted ? 'workout_marked_incomplete' : 'workout_completed',
        {
          source: 'today_quick_action',
          workoutType: todayData.workout.type,
          distance: todayData.workout.distance,
          planId: plan.planId,
        }
      );
      if (!wasCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  };

  // Calculate week progress based on calendar week workouts
  const weekProgress = calendarWeekWorkouts.length > 0
    ? calendarWeekWorkouts.filter(w => w.isCompleted).length / calendarWeekWorkouts.length
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
              {planStartsInFuture
                ? 'Plan Ready'
                : raceHasPassed
                ? 'Congrats!'
                : todayData?.workout
                ? "Today's Run"
                : 'Rest Day'}
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
          {planStartsInFuture ? (
            <View style={styles.planReadyCard}>
              <View style={styles.planReadyIcon}>
                <Ionicons name="rocket" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.planReadyTitle}>Your plan is ready</Text>
              <Text style={styles.planReadySubtitle}>
                Training starts{' '}
                {format(parseDateString(plan.startDate), 'EEEE, MMMM d')}
                {daysUntilStart === 1
                  ? ' — tomorrow!'
                  : ` — in ${daysUntilStart} days`}
              </Text>
              {firstWorkout && (
                <View style={styles.planReadyPreview}>
                  <Text style={styles.planReadyPreviewLabel}>First up</Text>
                  <WorkoutCard
                    workout={firstWorkout}
                    showDate
                    compact
                    onPress={() => onWorkoutPress(firstWorkout.id)}
                  />
                </View>
              )}
              {onViewCalendar && (
                <TouchableOpacity
                  style={styles.planReadyButton}
                  onPress={onViewCalendar}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="View your full training plan"
                >
                  <Ionicons name="calendar" size={18} color={Colors.white} />
                  <Text style={styles.planReadyButtonText}>See Your Full Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : raceHasPassed ? (
            <View style={styles.restDayCard}>
              <View style={styles.restDayIcon}>
                <Text style={styles.raceDoneEmoji}>🏁</Text>
              </View>
              <Text style={styles.restDayTitle}>You made it to race day</Text>
              <Text style={styles.restDaySubtitle}>
                This training block is complete. When you're ready for the next
                one, start a new plan from Settings.
              </Text>
            </View>
          ) : todayData?.workout ? (
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
              {calendarWeekWorkouts.length > 0 ? (
                calendarWeekWorkouts.map((w, i) => (
                  <View
                    key={i}
                    style={[
                      styles.weekDot,
                      w.isCompleted && styles.weekDotCompleted,
                      w.type === 'rest' && styles.weekDotRest,
                    ]}
                  />
                ))
              ) : (
                // Show 7 empty dots if no workouts this week
                Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={[styles.weekDot, styles.weekDotRest]} />
                ))
              )}
            </View>
            <Text style={styles.statLabel}>
              {calendarWeekWorkouts.length > 0
                ? `${Math.round(weekProgress * 100)}% Done`
                : planStartsInFuture
                ? `Starts in ${daysUntilStart} ${daysUntilStart === 1 ? 'day' : 'days'}`
                : 'No workouts'}
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
  planReadyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  planReadyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planReadyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 8,
  },
  planReadySubtitle: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  planReadyPreview: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  planReadyPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  planReadyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 16,
  },
  planReadyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  raceDoneEmoji: {
    fontSize: 32,
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
