import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './components/Onboarding';
import { TabNav } from './components/TabNav';
import { TodayView } from './views/TodayView';
import { CalendarView } from './views/CalendarView';
import { ProgressView } from './views/ProgressView';
import { SettingsView } from './views/SettingsView';

const MainApp = () => {
  const { userConfig } = useApp();
  const [currentTab, setCurrentTab] = useState('today');

  if (!userConfig.isOnboarded) {
    return <Onboarding />;
  }

  const renderTab = () => {
    switch (currentTab) {
      case 'today': return <TodayView />;
      case 'calendar': return <CalendarView />;
      case 'progress': return <ProgressView />;
      case 'settings': return <SettingsView />;
      default: return <TodayView />;
    }
  };

  return (
    <div className="h-full w-full bg-gray-50 text-gray-900 overflow-hidden flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {renderTab()}
      </main>
      <TabNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;