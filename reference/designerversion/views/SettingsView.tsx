import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { IconBell, IconMoon, IconRuler, IconTrash, IconChevronRight } from '@tabler/icons-react';

export const SettingsView: React.FC = () => {
  const { resetApp, userConfig, plan } = useApp();

  const SettingRow = ({ icon: Icon, label, value, onClick, destructive = false }: any) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${destructive ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`font-medium ${destructive ? 'text-red-600' : 'text-gray-900'}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-sm text-gray-400">{value}</span>}
            {!destructive && <IconChevronRight className="w-4 h-4 text-gray-300" />}
        </div>
    </button>
  );

  return (
    <div className="p-6 pb-24 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
             <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferences</h3>
             </div>
             <SettingRow icon={IconBell} label="Notifications" value="On" />
             <SettingRow icon={IconRuler} label="Units" value={userConfig.units === 'miles' ? 'Miles' : 'Kilometers'} />
             <SettingRow icon={IconMoon} label="Appearance" value={userConfig.theme === 'light' ? 'Light' : 'Dark'} />
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
             <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Management</h3>
             </div>
             <div className="p-4 border-b border-gray-100">
                 <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                 <p className="font-bold text-gray-900">{plan?.level}</p>
                 <p className="text-xs text-gray-400">Race: {plan?.raceDate}</p>
             </div>
             <SettingRow 
                icon={IconTrash} 
                label="Reset Data & Plan" 
                destructive 
                onClick={() => {
                    if(confirm("Are you sure? This will delete your plan and progress.")) {
                        resetApp();
                    }
                }}
            />
        </div>

        <div className="text-center">
            <p className="text-xs text-gray-400">Marathon Planner v1.0.0</p>
            <p className="text-xs text-gray-300 mt-1">Run fast, run far.</p>
        </div>
    </div>
  );
};