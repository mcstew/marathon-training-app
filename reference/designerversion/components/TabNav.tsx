import React from 'react';
import { IconCalendarEvent, IconHome, IconSettings, IconChartBar } from '@tabler/icons-react';

interface TabNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNav: React.FC<TabNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'today', icon: IconHome, label: 'Today' },
    { id: 'calendar', icon: IconCalendarEvent, label: 'Calendar' },
    { id: 'progress', icon: IconChartBar, label: 'Progress' },
    { id: 'settings', icon: IconSettings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe pt-2 px-4 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current opacity-20 stroke-2' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};