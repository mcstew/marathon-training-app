import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Colors, WORKOUT_COLORS } from '../constants/theme';
import { usePlan, useUserConfig } from '../store/useAppStore';
import { Workout } from '../types';
import { parseDateString } from '../services/planGenerator';
import { todayLocalStr } from '../utils/dates';
import { displayDistanceValue, formatDistance, unitAbbrev } from '../utils/units';

interface CalendarScreenProps {
  onWorkoutPress: (workoutId: string) => void;
}

type ViewMode = 'calendar' | 'plan';

export function CalendarScreen({ onWorkoutPress }: CalendarScreenProps) {
  const plan = usePlan();
  const { units } = useUserConfig();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  // Always start calendar on current month (today)
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = todayLocalStr();

  // Build a map of date -> workout for quick lookup
  const workoutsByDate = useMemo(() => {
    if (!plan) return new Map<string, Workout>();
    const map = new Map<string, Workout>();
    plan.weeks.forEach(week => {
      week.workouts.forEach(workout => {
        map.set(workout.date, workout);
      });
    });
    return map;
  }, [plan]);

  if (!plan) return null;

  const getWorkoutColor = (workout: Workout) => {
    return WORKOUT_COLORS[workout.type].bg;
  };

  const getWorkoutTextColor = (workout: Workout) => {
    return WORKOUT_COLORS[workout.type].text;
  };

  const getDayLabel = (dateStr: string) => {
    const date = parseDateString(dateStr);
    return format(date, 'EEE').charAt(0);
  };

  // Calendar view helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const isCurrentMonth = isSameMonth(currentMonth, new Date());

  const renderCalendarView = () => {
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.calendarContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.monthNavButton}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <Ionicons name="chevron-back" size={24} color={Colors.gray600} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToToday}
            style={styles.monthTitleButton}
            accessibilityRole="button"
            accessibilityLabel={`${format(currentMonth, 'MMMM yyyy')}. Tap to jump to today`}
          >
            <Text style={styles.monthTitle}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            {!isCurrentMonth && (
              <Text style={styles.todayLink}>Today</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.monthNavButton}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Ionicons name="chevron-forward" size={24} color={Colors.gray600} />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {weekDays.map((day, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={styles.weekdayLabel}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.calendarCell} />
          ))}

          {/* Days of the month */}
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const workout = workoutsByDate.get(dateStr);
            const isToday = dateStr === today;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.calendarCell,
                  workout && { backgroundColor: getWorkoutColor(workout) },
                  workout?.isCompleted && styles.calendarCellCompleted,
                  isToday && styles.calendarCellToday,
                ]}
                onPress={() => workout && onWorkoutPress(workout.id)}
                disabled={!workout}
                activeOpacity={0.7}
                accessibilityRole={workout ? 'button' : undefined}
                accessibilityLabel={
                  workout
                    ? `${format(day, 'MMMM d')}: ${workout.title}${
                        workout.isCompleted
                          ? ', completed'
                          : workout.isSkipped
                          ? ', skipped'
                          : ''
                      }`
                    : format(day, 'MMMM d')
                }
              >
                <Text style={[
                  styles.calendarDayNumber,
                  isToday && styles.calendarDayToday,
                  !workout && styles.calendarDayNoWorkout,
                  workout && { color: getWorkoutTextColor(workout) },
                ]}>
                  {format(day, 'd')}
                </Text>
                {workout && (
                  <Text style={[styles.calendarWorkoutLabel, { color: getWorkoutTextColor(workout) }]}>
                    {workout.isCompleted ? '✓' : workout.type === 'rest' ? 'Rest' : workout.type === 'cross' ? 'XT' : workout.type === 'race' ? '🏁' : workout.distance ? `${displayDistanceValue(workout.distance, units)}${unitAbbrev(units)}` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: WORKOUT_COLORS.run.bg }]} />
            <Text style={styles.legendText}>Run</Text>
            <View style={[styles.legendDot, { backgroundColor: WORKOUT_COLORS.pace.bg }]} />
            <Text style={styles.legendText}>Pace</Text>
            <View style={[styles.legendDot, { backgroundColor: WORKOUT_COLORS.cross.bg }]} />
            <Text style={styles.legendText}>Cross</Text>
            <View style={[styles.legendDot, { backgroundColor: WORKOUT_COLORS.rest.bg }]} />
            <Text style={styles.legendText}>Rest</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPlanView = () => (
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
              {formatDistance(week.totalPlannedMileage, units)} total
            </Text>
          </View>

          <View style={styles.weekGrid}>
            {week.workouts.map(workout => {
              const isToday = workout.date === today;

              return (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.dayContainer}
                  onPress={() => onWorkoutPress(workout.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Week ${week.weekNumber}, ${format(
                    parseDateString(workout.date),
                    'EEEE MMMM d'
                  )}: ${workout.title}${
                    workout.isCompleted
                      ? ', completed'
                      : workout.isSkipped
                      ? ', skipped'
                      : ''
                  }`}
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
                    {workout.isCompleted ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : workout.type === 'rest' ? null : workout.type === 'cross' ? (
                      <Text style={[styles.crossLabel, { color: getWorkoutTextColor(workout) }]}>XT</Text>
                    ) : workout.type === 'race' ? (
                      <Text style={styles.raceEmoji}>🏁</Text>
                    ) : (
                      <Text style={[styles.distanceLabel, { color: getWorkoutTextColor(workout) }]}>
                        {workout.distance ? displayDistanceValue(workout.distance, units) : ''}
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>
          Race Day: {format(parseDateString(plan.raceDate), 'MMM d, yyyy')}
        </Text>
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer} accessibilityRole="tablist">
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
          onPress={() => setViewMode('calendar')}
          accessibilityRole="tab"
          accessibilityLabel="Calendar view"
          accessibilityState={{ selected: viewMode === 'calendar' }}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={viewMode === 'calendar' ? Colors.white : Colors.gray500}
          />
          <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'plan' && styles.toggleButtonActive]}
          onPress={() => setViewMode('plan')}
          accessibilityRole="tab"
          accessibilityLabel="Plan view"
          accessibilityState={{ selected: viewMode === 'plan' }}
        >
          <Ionicons
            name="list"
            size={16}
            color={viewMode === 'plan' ? Colors.white : Colors.gray500}
          />
          <Text style={[styles.toggleText, viewMode === 'plan' && styles.toggleTextActive]}>
            Plan
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'calendar' ? renderCalendarView() : renderPlanView()}
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray500,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  calendarContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Calendar View Styles
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitleButton: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray900,
  },
  todayLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray400,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  calendarCellCompleted: {
    opacity: 0.7,
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  calendarDayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray700,
  },
  calendarDayToday: {
    fontWeight: '800',
    color: Colors.primary,
  },
  calendarDayNoWorkout: {
    color: Colors.gray300,
  },
  calendarWorkoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  legendContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.gray500,
    marginRight: 12,
  },

  // Plan View Styles
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
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.successDark,
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  crossLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  raceEmoji: {
    fontSize: 20,
  },
});
