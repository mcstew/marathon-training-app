import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { Colors } from '../constants/theme';
import { parseDateString } from '../services/planGenerator';
import {
  useAppStore,
  usePlan,
  useUserConfig,
  useIsSyncing,
  useLastSyncAt,
  useSyncError,
  usePendingSyncCount,
} from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { AuthScreen } from './AuthScreen';
import { trackEventFireAndForget } from '../services/analytics';

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
  const { setUnits, resetApp, performSync, uploadPlanToCloud } = useAppStore();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const isSyncing = useIsSyncing();
  const lastSyncAt = useLastSyncAt();
  const syncError = useSyncError();
  const pendingSyncCount = usePendingSyncCount();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Trigger sync when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      performSync(user.id);
    }
  }, [isAuthenticated, user?.id]);

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

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your local data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleSync = async () => {
    if (user?.id) {
      trackEventFireAndForget('sync_requested', {
        pendingSyncCount,
      });
      const result = await performSync(user.id);
      if (result.error) {
        trackEventFireAndForget('sync_failed', {
          error: result.error,
        });
      }
    }
  };

  const getSyncStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (syncError) return 'Sync failed';
    if (pendingSyncCount > 0) return `${pendingSyncCount} pending`;
    if (lastSyncAt) return `Synced ${formatDistanceToNow(lastSyncAt, { addSuffix: true })}`;
    return 'Not synced';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            {isAuthenticated ? (
              <>
                <View style={styles.accountInfo}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={24} color={Colors.white} />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountEmail}>{user?.email}</Text>
                    <Text style={styles.accountStatus}>
                      {user?.email_confirmed_at ? 'Verified' : 'Pending verification'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={handleSync}
                  disabled={isSyncing}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      {isSyncing ? (
                        <ActivityIndicator size="small" color={Colors.gray600} />
                      ) : (
                        <Ionicons
                          name={syncError ? 'cloud-offline' : 'cloud-done'}
                          size={20}
                          color={syncError ? Colors.warning : Colors.gray600}
                        />
                      )}
                    </View>
                    <Text style={styles.settingLabel}>Sync Status</Text>
                  </View>
                  <View style={styles.settingRight}>
                    <Text style={[
                      styles.settingValue,
                      syncError && styles.syncErrorText
                    ]}>
                      {getSyncStatusText()}
                    </Text>
                    {!isSyncing && (
                      <Ionicons name="refresh" size={16} color={Colors.gray300} />
                    )}
                  </View>
                </TouchableOpacity>
                <SettingRow
                  icon="log-out"
                  label="Sign Out"
                  onPress={handleSignOut}
                />
              </>
            ) : (
              <>
                <View style={styles.signInPrompt}>
                  <Ionicons name="cloud-outline" size={32} color={Colors.gray400} />
                  <Text style={styles.signInPromptTitle}>Sync Your Training</Text>
                  <Text style={styles.signInPromptText}>
                    Sign in to back up your data and access it from any device
                  </Text>
                </View>
                <SettingRow
                  icon="person-add"
                  label="Sign In or Create Account"
                  onPress={() => setShowAuthModal(true)}
                />
              </>
            )}
          </View>
        </View>

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

      {/* Auth Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <AuthScreen
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </Modal>
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
    gap: 12,
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
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetails: {
    marginLeft: 12,
    flex: 1,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
  },
  accountStatus: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  signInPrompt: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  signInPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
    marginTop: 12,
  },
  signInPromptText: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  syncErrorText: {
    color: Colors.warning,
  },
});
