import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Colors } from '../constants/theme';
import { PLANS } from '../constants/plans';
import { useAppStore } from '../store/useAppStore';
import { PlanId } from '../types';
import { addWeeks, differenceInWeeks, format } from 'date-fns';
import { WebLandingPage } from '../components/WebLandingPage';
import { trackEventFireAndForget } from '../services/analytics';
import { useResponsive } from '../utils/useResponsive';

type Step = 'landing' | 'welcome' | 'date' | 'plan';

interface OnboardingScreenProps {
  onLoginPress?: () => void;
}

function isAppHost(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;

  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === 'app.marathontrainingplan.com' ||
    hostname.startsWith('app.') ||
    hostname.includes('marathon-training-app')
  );
}

function getInitialStep(): Step {
  if (Platform.OS !== 'web') return 'welcome';
  if (typeof window === 'undefined') return 'landing';

  const params = new URLSearchParams(window.location.search);
  const start = params.get('start') ?? params.get('flow') ?? '';
  const hash = window.location.hash.replace(/^#\/?/, '');
  const directRaceDateEntries = new Set([
    'create-plan',
    'date',
    'plan',
    'race',
    'race-date',
    'start',
    'when-is-your-race',
  ]);

  if (directRaceDateEntries.has(start) || directRaceDateEntries.has(hash)) {
    return 'date';
  }

  if (isAppHost()) {
    return 'date';
  }

  return 'landing';
}

export function OnboardingScreen({ onLoginPress }: OnboardingScreenProps) {
  // On the app subdomain, start in the product flow. The marketing site owns the public landing page.
  const [step, setStep] = useState<Step>(() => getInitialStep());
  const { isDesktop } = useResponsive();
  const startsAtDate = useRef(step === 'date');
  const [raceDate, setRaceDate] = useState<Date | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const generateUserPlan = useAppStore(state => state.generateUserPlan);

  // Allow any future date (minimum is tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Tomorrow
  const weeksUntilRace = raceDate
    ? differenceInWeeks(raceDate, new Date())
    : null;

  const webDateInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (step === 'landing') {
      trackEventFireAndForget('marketing_landing_viewed');
    } else {
      trackEventFireAndForget('onboarding_started', {
        entry: Platform.OS === 'web' ? 'direct_race_date' : 'mobile',
        platform: Platform.OS,
      });
    }
  }, []);

  const handleStart = () => {
    trackEventFireAndForget('onboarding_started', { platform: Platform.OS });
    setStep('date');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setRaceDate(selectedDate);
      trackEventFireAndForget('race_date_selected', {
        raceDate: format(selectedDate, 'yyyy-MM-dd'),
      });
    }
  };

  const handleWebDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString + 'T00:00:00');
      setRaceDate(date);
      trackEventFireAndForget('race_date_selected', {
        raceDate: dateString,
      });
    }
  };

  const handleGenerate = () => {
    if (raceDate && selectedPlanId) {
      trackEventFireAndForget('plan_generated', {
        planId: selectedPlanId,
        raceDate: format(raceDate, 'yyyy-MM-dd'),
        weeksUntilRace,
      });
      generateUserPlan(raceDate, selectedPlanId);
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Your Marathon Journey Starts Here</Text>
        <Text style={styles.subtitle}>
          Get a personalized 18-week training plan tailored to your race day.
          Simple, offline, and free.
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Ionicons name="calendar" size={20} color={Colors.primary} />
          <Text style={styles.featureText}>Proven training schedules</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.featureText}>Track your progress</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="cloud-offline" size={20} color={Colors.gray500} />
          <Text style={styles.featureText}>Works offline</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Button
          title="Get Started"
          onPress={handleStart}
          size="large"
          fullWidth
        />
      </View>
    </View>
  );

  const renderDatePicker = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        {!startsAtDate.current && (
          <TouchableOpacity onPress={() => setStep('welcome')}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray600} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.stepTitle}>When is your race?</Text>
        <Text style={styles.stepSubtitle}>
          We'll build your schedule backwards from the big day.
        </Text>

        {Platform.OS === 'web' ? (
          <View style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
            <input
              type="date"
              style={{
                flex: 1,
                fontSize: 18,
                color: Colors.gray900,
                marginLeft: 12,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
              }}
              value={raceDate ? format(raceDate, 'yyyy-MM-dd') : ''}
              onChange={(e: any) => handleWebDateChange(e.target.value)}
              min={format(minDate, 'yyyy-MM-dd')}
            />
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
              <Text style={styles.dateButtonText}>
                {raceDate ? format(raceDate, 'MMMM d, yyyy') : 'Select race date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={raceDate || minDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={minDate}
              />
            )}
          </>
        )}

        {raceDate && weeksUntilRace !== null && (
          <View style={styles.weeksContainer}>
            <Text style={styles.weeksNumber}>{weeksUntilRace}</Text>
            <Text style={styles.weeksLabel}>weeks away</Text>
          </View>
        )}

        {raceDate && weeksUntilRace !== null && weeksUntilRace < 18 && (
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={20} color={Colors.warning} />
            <Text style={styles.warningText}>
              Ideally, select a date at least 18 weeks away for the full training
              cycle. We can still make a plan, but it will start mid-program.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <Button
          title="Next"
          onPress={() => setStep('plan')}
          size="large"
          fullWidth
          disabled={!raceDate}
        />
        {onLoginPress && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have a plan?</Text>
            <TouchableOpacity onPress={onLoginPress}>
              <Text style={styles.loginPromptLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderPlanSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => setStep('date')}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      <View style={styles.planHeaderSection}>
        <Text style={styles.stepTitle}>Choose your level</Text>
        <Text style={styles.stepSubtitle}>
          Select a plan that fits your current running experience.
        </Text>
      </View>

      <ScrollView
        style={styles.planList}
        contentContainerStyle={styles.planListContent}
        showsVerticalScrollIndicator={false}
      >
        {PLANS.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlanId === plan.id && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlanId(plan.id)}
            activeOpacity={0.7}
          >
            <View style={styles.planCardHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              {selectedPlanId === plan.id && (
                <View style={styles.selectedIndicator} />
              )}
            </View>
            <Text style={styles.planDescription}>{plan.description}</Text>
            <View style={styles.planMeta}>
              <View style={styles.planMetaItem}>
                <Text style={styles.planMetaText}>{plan.runsPerWeek} runs/wk</Text>
              </View>
              <View style={styles.planMetaItem}>
                <Text style={styles.planMetaText}>Peak: {plan.peakMileage}mi</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomSection}>
        <Button
          title="Generate Plan"
          onPress={handleGenerate}
          size="large"
          fullWidth
          disabled={!selectedPlanId}
        />
      </View>
    </View>
  );

  // Web landing page
  if (step === 'landing' && Platform.OS === 'web') {
    return <WebLandingPage onGetStarted={handleStart} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Desktop web centers the flow in a card-width column */}
      <View style={[styles.stepWrapper, isDesktop && styles.stepWrapperDesktop]}>
        {step === 'welcome' && renderWelcome()}
        {step === 'date' && renderDatePicker()}
        {step === 'plan' && renderPlanSelection()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  stepWrapper: {
    flex: 1,
  },
  stepWrapperDesktop: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.gray700,
    marginLeft: 12,
  },
  contentSection: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.gray500,
    marginBottom: 32,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  dateButtonText: {
    fontSize: 18,
    color: Colors.gray900,
    marginLeft: 12,
  },
  webDateInput: {
    flex: 1,
    fontSize: 18,
    color: Colors.gray900,
    marginLeft: 12,
    borderWidth: 0,
    outlineWidth: 0,
  } as any,
  weeksContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  weeksNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
  },
  weeksLabel: {
    fontSize: 16,
    color: Colors.gray500,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight + '30',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray700,
    marginLeft: 12,
    lineHeight: 20,
  },
  planHeaderSection: {
    marginBottom: 16,
  },
  planList: {
    flex: 1,
  },
  planListContent: {
    paddingBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray100,
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray900,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 12,
  },
  planMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  planMetaItem: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planMetaText: {
    fontSize: 12,
    color: Colors.gray600,
    fontWeight: '500',
  },
  bottomSection: {
    paddingTop: 16,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  loginPromptText: {
    color: Colors.gray500,
    fontSize: 14,
  },
  loginPromptLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
