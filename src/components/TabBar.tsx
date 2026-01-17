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
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = currentTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabChange(tab.name)}
              activeOpacity={0.7}
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
});
