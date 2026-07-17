import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export type TabName = 'today' | 'calendar' | 'progress' | 'settings';

interface TabBarProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const TABS: { name: TabName; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'today', label: 'Today', icon: 'today-outline', iconActive: 'today' },
  { name: 'calendar', label: 'Calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'progress', label: 'Progress', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { name: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

export function TabBar({ currentTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar} accessibilityRole="tablist">
        {TABS.map(tab => {
          const isActive = currentTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabChange(tab.name)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? Colors.primary : Colors.gray400}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Desktop-web navigation: a left sidebar instead of phone bottom tabs.
export function SideNav({ currentTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.sideNav}>
      <View style={styles.sideNavBrand}>
        <View style={styles.sideNavBrandMark}>
          <Text style={styles.sideNavBrandMarkText}>M</Text>
        </View>
        <Text style={styles.sideNavBrandText}>Marathon{'\n'}Training Plan</Text>
      </View>
      <View accessibilityRole="tablist">
        {TABS.map(tab => {
          const isActive = currentTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.sideNavItem, isActive && styles.sideNavItemActive]}
              onPress={() => onTabChange(tab.name)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={20}
                color={isActive ? Colors.primary : Colors.gray500}
              />
              <Text
                style={[
                  styles.sideNavLabel,
                  isActive && styles.sideNavLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingBottom: 20, // Safe area padding
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.gray400,
    marginTop: 4,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Desktop sidebar
  sideNav: {
    width: 232,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.gray100,
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  sideNavBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  sideNavBrandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideNavBrandMarkText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  sideNavBrandText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray900,
    lineHeight: 16,
  },
  sideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sideNavItemActive: {
    backgroundColor: Colors.primary + '12',
  },
  sideNavLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray600,
  },
  sideNavLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
