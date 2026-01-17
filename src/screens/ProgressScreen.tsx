import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { usePlan, usePlanStats } from '../store/useAppStore';

export function ProgressScreen() {
  const plan = usePlan();
  const stats = usePlanStats();

  if (!plan || !stats) return null;

  // Build weekly data for chart
  const weeklyData = plan.weeks.map(week => {
    const completed = week.workouts.reduce(
      (acc, w) => (w.isCompleted ? acc + (w.distance || 0) : acc),
      0
    );
    return {
      week: week.weekNumber,
      planned: week.totalPlannedMileage,
      completed,
    };
  });

  const maxMileage = Math.max(...weeklyData.map(w => Math.max(w.planned, w.completed)));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Progress</Text>

        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconRow}>
              <Ionicons name="trending-up" size={16} color={Colors.white} />
              <Text style={styles.statLabelLight}>Total Distance</Text>
            </View>
            <Text style={styles.statNumberLight}>
              {stats.totalCompletedMiles.toFixed(1)}
            </Text>
            <Text style={styles.statUnitLight}>miles</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Ionicons name="flame" size={16} color={Colors.warning} />
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
        </View>

        {/* Weekly Mileage Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Mileage</Text>
            <Text style={styles.chartSubtitle}>Completed vs Planned</Text>
          </View>

          <View style={styles.chart}>
            {weeklyData.map(data => (
              <View key={data.week} style={styles.barContainer}>
                <View style={styles.barStack}>
                  {/* Planned (background) */}
                  <View
                    style={[
                      styles.barPlanned,
                      {
                        height: `${(data.planned / maxMileage) * 100}%`,
                      },
                    ]}
                  />
                  {/* Completed (foreground) */}
                  <View
                    style={[
                      styles.barCompleted,
                      {
                        height: `${(data.completed / maxMileage) * 100}%`,
                      },
                      data.completed >= data.planned && styles.barCompletedFull,
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>W{data.week}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.gray200 }]} />
              <Text style={styles.legendText}>Planned</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Consistency Card */}
        <View style={styles.consistencyCard}>
          <View>
            <Text style={styles.consistencyLabel}>Consistency</Text>
            <Text style={styles.consistencyNumber}>{stats.completionRate}%</Text>
            <Text style={styles.consistencySubtitle}>Workout completion rate</Text>
          </View>
          <View style={styles.consistencyBadge}>
            <Ionicons name="ribbon" size={24} color={Colors.warning} />
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Workouts</Text>
            <Text style={styles.summaryValue}>
              {stats.completedWorkouts} / {stats.totalWorkouts}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Skipped</Text>
            <Text style={styles.summaryValue}>{stats.skippedWorkouts}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Week</Text>
            <Text style={styles.summaryValue}>{stats.currentWeek} of 18</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Longest Streak</Text>
            <Text style={styles.summaryValue}>{stats.longestStreak} days</Text>
          </View>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 24,
  },
  statsGrid: {
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
  statCardPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  statLabelLight: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gray900,
  },
  statNumberLight: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  statUnit: {
    fontSize: 14,
    color: Colors.gray400,
  },
  statUnitLight: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray800,
  },
  chartSubtitle: {
    fontSize: 12,
    color: Colors.gray400,
  },
  chart: {
    flexDirection: 'row',
    height: 120,
    gap: 2,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barStack: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barPlanned: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
  },
  barCompleted: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  barCompletedFull: {
    backgroundColor: Colors.success,
  },
  barLabel: {
    fontSize: 8,
    color: Colors.gray400,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.gray500,
  },
  consistencyCard: {
    backgroundColor: Colors.gray900,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  consistencyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray400,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  consistencyNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  consistencySubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  consistencyBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray600,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
  },
});
