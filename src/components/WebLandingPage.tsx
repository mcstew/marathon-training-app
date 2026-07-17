import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface WebLandingPageProps {
  onGetStarted: () => void;
}

const FEATURES = [
  {
    icon: 'calendar-outline' as const,
    title: '18-Week Training Plans',
    description:
      'Scientifically-designed schedules based on proven methodology used by thousands of runners.',
  },
  {
    icon: 'trophy-outline' as const,
    title: 'Multiple Difficulty Levels',
    description:
      'From Novice 1 for first-timers to Advanced plans for experienced marathoners chasing a PR.',
  },
  {
    icon: 'checkmark-circle-outline' as const,
    title: 'Track Your Progress',
    description:
      'Mark workouts complete, add notes, and watch your consistency build week over week.',
  },
  {
    icon: 'cloud-offline-outline' as const,
    title: 'Works Offline',
    description:
      'Your training plan is always available, even without an internet connection.',
  },
  {
    icon: 'sync-outline' as const,
    title: 'Sync Across Devices',
    description:
      'Create a free account to access your plan from any device and never lose your progress.',
  },
  {
    icon: 'pricetag-outline' as const,
    title: 'Completely Free',
    description:
      'No subscriptions, no premium tiers, no ads. Just a great training plan to get you to the finish line.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How long is the marathon training plan?',
    answer:
      'All our plans are 18 weeks long, which is the optimal duration recommended by running experts to build endurance safely without risking overtraining or injury.',
  },
  {
    question: 'What training methodology do you use?',
    answer:
      'Our plans are based on proven marathon training principles popularized by Hal Higdon, featuring a mix of easy runs, long runs, pace work, and strategic rest days.',
  },
  {
    question: 'Which plan should I choose?',
    answer:
      'If you\'re running your first marathon, start with Novice 1. If you\'ve run a marathon before and want to improve, try Intermediate 1 or 2. Advanced plans are for experienced runners targeting specific time goals.',
  },
  {
    question: 'Can I adjust the plan to my schedule?',
    answer:
      'The plan is designed with rest days and easy days that can be swapped if needed. The key is to never skip your long run and to keep your easy days easy.',
  },
];

export function WebLandingPage({ onGetStarted }: WebLandingPageProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100% Free</Text>
          </View>
          <Text style={styles.heroTitle}>
            Your Marathon Journey{'\n'}Starts Here
          </Text>
          <Text style={styles.heroSubtitle}>
            Get a personalized 18-week training plan tailored to your race day.
            Based on proven methodology that's helped thousands of runners cross
            the finish line.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Create Your Free Plan</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>
            No account required to get started
          </Text>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Everything You Need to Succeed</Text>
        <Text style={styles.sectionSubtitle}>
          Simple, focused tools to keep you on track from day one to race day
        </Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name={feature.icon}
                  size={28}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* How It Works Section */}
      <View style={[styles.section, styles.sectionAlt]}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionSubtitle}>
          Get your personalized plan in less than a minute
        </Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Pick Your Race Date</Text>
            <Text style={styles.stepDescription}>
              Enter the date of your marathon and we'll calculate your 18-week
              training schedule.
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Choose Your Level</Text>
            <Text style={styles.stepDescription}>
              Select from Novice, Intermediate, or Advanced plans based on your
              experience.
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Start Training</Text>
            <Text style={styles.stepDescription}>
              Follow your daily workouts, track your progress, and build toward
              race day.
            </Text>
          </View>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Final CTA Section */}
      <View style={[styles.section, styles.finalCta]}>
        <Text style={styles.finalCtaTitle}>Ready to Start Training?</Text>
        <Text style={styles.finalCtaSubtitle}>
          Join thousands of runners who've used our plans to achieve their
          marathon goals.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Get Your Free Plan</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Marathon Training Plan</Text>
        <Text style={styles.footerSubtext}>
          Built with passion for runners, by runners.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingBottom: 40,
  },
  // Hero
  hero: {
    backgroundColor: Colors.gray50,
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 700,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 14,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: '800',
    color: Colors.gray900,
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 56 : 44,
    marginBottom: 20,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  ctaSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray400,
  },
  // Sections
  section: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionAlt: {
    backgroundColor: Colors.gray50,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 500,
  },
  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 1000,
  },
  featureCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 16,
    padding: 24,
    width: Platform.OS === 'web' ? 300 : '100%',
    ...(Platform.OS === 'web' && {
      minWidth: 280,
      maxWidth: 320,
    }),
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 15,
    color: Colors.gray500,
    lineHeight: 22,
  },
  // Steps
  stepsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Platform.OS === 'web' ? 0 : 16,
    maxWidth: 900,
  },
  step: {
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 280,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 15,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepConnector: {
    width: Platform.OS === 'web' ? 60 : 2,
    height: Platform.OS === 'web' ? 2 : 40,
    backgroundColor: Colors.gray200,
  },
  // FAQ
  faqContainer: {
    maxWidth: 700,
    width: '100%',
  },
  faqItem: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 16,
    color: Colors.gray500,
    lineHeight: 24,
  },
  // Final CTA
  finalCta: {
    backgroundColor: Colors.gray900,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  finalCtaSubtitle: {
    fontSize: 18,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 500,
  },
  // Footer
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: Colors.gray50,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray500,
  },
  footerSubtext: {
    fontSize: 14,
    color: Colors.gray400,
    marginTop: 4,
  },
});
