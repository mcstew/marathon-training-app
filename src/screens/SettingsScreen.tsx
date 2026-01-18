import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '../constants/theme';
import { parseDateString } from '../services/planGenerator';
import { useAppStore, usePlan, useUserConfig } from '../store/useAppStore';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingRow({ icon, label, value, onPress, destructive }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIconContainer,
            destructive && styles.settingIconDestructive,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? Colors.error : Colors.gray600}
          />
        </View>
        <Text
          style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && !destructive && (
          <Ionicons name="chevron-forward" size={16} color={Colors.gray300} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const plan = usePlan();
  const userConfig = useUserConfig();
  const { setUnits, resetApp } = useAppStore();

  const handleToggleUnits = () => {
    setUnits(userConfig.units === 'miles' ? 'km' : 'miles');
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'Are you sure? This will delete your training plan and all progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetApp(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="notifications"
              label="Notifications"
              value="Coming soon"
            />
            <SettingRow
              icon="resize"
              label="Units"
              value={userConfig.units === 'miles' ? 'Miles' : 'Kilometers'}
              onPress={handleToggleUnits}
            />
            <SettingRow
              icon="moon"
              label="Appearance"
              value="System"
            />
          </View>
        </View>

        {/* Plan Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Management</Text>
          <View style={styles.sectionContent}>
            {plan && (
              <View style={styles.planInfo}>
                <Text style={styles.planInfoLabel}>Current Plan</Text>
                <Text style={styles.planInfoValue}>{plan.planName}</Text>
                <Text style={styles.planInfoSubtext}>
                  Race: {format(parseDateString(plan.raceDate), 'MMMM d, yyyy')}
                </Text>
              </View>
            )}
            <SettingRow
              icon="trash"
              label="Reset Data & Plan"
              onPress={handleResetApp}
              destructive
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <SettingRow icon="information-circle" label="Version" value="1.0.0" />
            <SettingRow icon="heart" label="Send Feedback" />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Marathon Training Plan</Text>
          <Text style={styles.footerSubtext}>Run fast, run far.</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconDestructive: {
    backgroundColor: Colors.errorLight + '30',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray900,
  },
  settingLabelDestructive: {
    color: Colors.error,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.gray400,
  },
  planInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  planInfoLabel: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 4,
  },
  planInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
  },
  planInfoSubtext: {
    fontSize: 12,
    color: Colors.gray400,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray400,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.gray300,
    marginTop: 4,
  },
});
