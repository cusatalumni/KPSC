
import React from 'react';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface CalendarWidgetProps {
  onNavigate: () => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:border-indigo-200 transition-all group">
      <div className="flex items-center space-x-3 mb-4">
        <CalendarDaysIcon className="h-7 w-7 text-indigo-500" />
        <h4 className="text-xl font-bold text-slate-800">പരീക്ഷാ കലണ്ടർ</h4>
      </div>
      <p className="text-slate-600 mb-6 text-sm font-medium leading-relaxed">മാർച്ച്, ഏപ്രിൽ 2026 മാസങ്ങളിലെ ഏറ്റവും പുതിയ പരീക്ഷാ ഷെഡ്യൂളുകൾ കാണുക.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-indigo-50 text-indigo-700 font-black px-4 py-3 rounded-xl hover:bg-indigo-100 transition duration-200 shadow-sm"
      >
        കലണ്ടർ കാണുക
      </button>
    </div>
  );
};
export default CalendarWidget;
