import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Button } from './Button';
import { Colors, WORKOUT_COLORS } from '../constants/theme';
import { Workout } from '../types';
import { useAppStore } from '../store/useAppStore';
import { parseDateString } from '../services/planGenerator';

interface WorkoutModalProps {
  workout: Workout | null;
  visible: boolean;
  onClose: () => void;
}

export function WorkoutModal({ workout, visible, onClose }: WorkoutModalProps) {
  const { toggleWorkoutCompletion, skipWorkout } = useAppStore();

  if (!workout) return null;

  const colors = WORKOUT_COLORS[workout.type];
  const dateFormatted = format(parseDateString(workout.date), 'EEEE, MMMM d');

  const handleComplete = () => {
    toggleWorkoutCompletion(workout.id);
    onClose();
  };

  const handleSkip = () => {
    skipWorkout(workout.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color={Colors.gray600} />
              </TouchableOpacity>

              {/* Header */}
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
                      ? 'PACE RUN'
                      : workout.type === 'cross'
                      ? 'CROSS TRAINING'
                      : workout.type === 'race'
                      ? 'RACE DAY'
                      : 'REST DAY'}
                  </Text>
                </View>

                {workout.distance ? (
                  <View style={styles.distanceContainer}>
                    <Text style={styles.distance}>{workout.distance}</Text>
                    <Text style={styles.unit}>Miles</Text>
                  </View>
                ) : (
                  <Text style={styles.title}>{workout.title}</Text>
                )}

                <Text style={styles.date}>{dateFormatted}</Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionBox}>
                <Text style={styles.description}>{workout.description}</Text>
              </View>

              {/* Status indicator */}
              {workout.isCompleted && (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              )}
              {workout.isSkipped && (
                <View style={styles.statusBadge}>
                  <Ionicons name="close-circle" size={20} color={Colors.gray400} />
                  <Text style={styles.statusText}>Skipped</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Skip"
                  variant="secondary"
                  onPress={handleSkip}
                  style={styles.actionButton}
                />
                <Button
                  title={workout.isCompleted ? 'Mark Incomplete' : 'Complete'}
                  variant={workout.isCompleted ? 'secondary' : 'primary'}
                  onPress={handleComplete}
                  style={styles.actionButtonPrimary}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    marginBottom: 24,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  distance: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.gray900,
  },
  unit: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.gray500,
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: Colors.gray500,
  },
  descriptionBox: {
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: Colors.gray700,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray600,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonPrimary: {
    flex: 1,
    flexGrow: 2,
  },
});
