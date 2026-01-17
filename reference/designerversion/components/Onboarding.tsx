import React, { useState } from 'react';
import { IconCalendar, IconChevronRight, IconTrophy, IconActivity, IconInfoCircle } from '@tabler/icons-react';
import { useApp } from '../context/AppContext';
import { PLANS_METADATA } from '../constants';
import { PlanLevel } from '../types';
import { Button } from './Button';

export const Onboarding: React.FC = () => {
  const { generateUserPlan } = useApp();
  const [step, setStep] = useState(1);
  const [raceDate, setRaceDate] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<PlanLevel | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaceDate(e.target.value);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleGenerate = () => {
    if (raceDate && selectedPlanId) {
      // Need to adjust date input to actual Date object. Input is YYYY-MM-DD
      const [y, m, d] = raceDate.split('-').map(Number);
      // Create date at noon to avoid timezone shift issues
      const date = new Date(y, m - 1, d, 12, 0, 0); 
      generateUserPlan(date, selectedPlanId);
    }
  };

  // Helper to validate date is at least 12 weeks out
  const isDateValid = () => {
    if (!raceDate) return false;
    const today = new Date();
    const selected = new Date(raceDate);
    const diffTime = Math.abs(selected.getTime() - today.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks >= 12;
  };

  const renderWelcome = () => (
    <div className="flex flex-col h-full justify-between p-8 pt-20 animate-fade-in">
      <div className="text-center">
        <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-100">
           <IconTrophy className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Marathon Journey Starts Here</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Get a personalized 18-week training plan tailored to your race day. Simple, offline, and free.
        </p>
      </div>
      <Button onClick={nextStep} fullWidth>Get Started</Button>
    </div>
  );

  const renderDate = () => (
    <div className="flex flex-col h-full p-6 pt-12">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2">When is your race?</h2>
        <p className="text-gray-500 mb-8">We'll build your schedule backwards from the big day.</p>
        
        <label className="block mb-4">
          <span className="text-sm font-semibold text-gray-700 mb-2 block">Race Date</span>
          <input 
            type="date" 
            value={raceDate}
            onChange={handleDateChange}
            className="w-full p-4 text-xl bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
          />
        </label>

        {raceDate && !isDateValid() && (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm flex gap-2 items-start">
                <IconInfoCircle className="w-5 h-5 flex-shrink-0" />
                <p>Ideally, select a date at least 12 weeks away for a full training cycle. We can still make a plan, but it will be compressed!</p>
            </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep} disabled={!raceDate} className="flex-1">Next</Button>
      </div>
    </div>
  );

  const renderPlan = () => (
    <div className="flex flex-col h-full p-6 pt-12 overflow-hidden">
       <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-2">Choose your level</h2>
        <p className="text-gray-500">Select a plan that fits your current running experience.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4">
        {PLANS_METADATA.map((p) => (
          <div 
            key={p.id}
            onClick={() => setSelectedPlanId(p.id)}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlanId === p.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-100 bg-white hover:border-blue-200'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-gray-900">{p.name}</h3>
              {selectedPlanId === p.id && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">{p.description}</p>
            <div className="flex gap-3 text-xs text-gray-500">
               <span className="bg-gray-100 px-2 py-1 rounded-md">{p.runsPerWeek} runs/wk</span>
               <span className="bg-gray-100 px-2 py-1 rounded-md">Peak: {p.peakMileage}mi</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4 flex-shrink-0 bg-gray-50">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={handleGenerate} disabled={!selectedPlanId} className="flex-1">Generate Plan</Button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50">
      {step === 1 && renderWelcome()}
      {step === 2 && renderDate()}
      {step === 3 && renderPlan()}
    </div>
  );
};