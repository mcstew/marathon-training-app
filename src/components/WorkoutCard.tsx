import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Workout } from '../types';
import { Colors, WORKOUT_COLORS } from '../constants/theme';

interface WorkoutCardProps {
  workout: Workout;
  onPress?: () => void;
  showDate?: boolean;
  compact?: boolean;
}

export function WorkoutCard({
  workout,
  onPress,
  showDate = false,
  compact = false,
}: WorkoutCardProps) {
  const colors = WORKOUT_COLORS[workout.type];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = () => {
    if (workout.isCompleted) {
      return (
        <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
      );
    }
    if (workout.isSkipped) {
      return (
        <Ionicons name="close-circle" size={28} color={Colors.gray400} />
      );
    }
    return (
      <Ionicons name="ellipse-outline" size={28} color={Colors.gray300} />
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        workout.isCompleted && styles.completed,
        workout.isSkipped && styles.skipped,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        {showDate && (
          <Text style={styles.date}>{formatDate(workout.date)}</Text>
        )}

        <View style={styles.header}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.typeText, { color: colors.text }]}>
              {workout.type === 'run'
                ? 'EASY RUN'
                : workout.type === 'pace'
                ? 'PACE'
                : workout.type === 'cross'
                ? 'CROSS'
                : workout.type === 'race'
                ? 'RACE'
                : 'REST'}
            </Text>
          </View>
        </View>

        <View style={styles.main}>
          {workout.distance ? (
            <View style={styles.distanceContainer}>
              <Text style={styles.distance}>{workout.distance}</Text>
              <Text style={styles.unit}>{workout.unit}</Text>
            </View>
          ) : (
            <Text style={styles.title}>{workout.title}</Text>
          )}
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {workout.description}
          </Text>
        )}
      </View>

      <View style={styles.statusContainer}>{getStatusIcon()}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completed: {
    opacity: 0.7,
    backgroundColor: Colors.gray50,
  },
  skipped: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  main: {
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  distance: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
  },
  unit: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray500,
    marginLeft: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray900,
  },
  description: {
    fontSize: 14,
    color: Colors.gray500,
    lineHeight: 20,
  },
  statusContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
});
