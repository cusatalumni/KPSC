import React from 'react';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface CalendarWidgetProps {
  onNavigate: () => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <CalendarDaysIcon className="h-7 w-7 text-teal-500" />
        <h4 className="text-xl font-bold text-slate-800">പരീക്ഷാ കലണ്ടർ</h4>
      </div>
      <p className="text-slate-600 mb-4">സെപ്റ്റംബർ, ഒക്ടോബർ 2025 മാസങ്ങളിലെ ഏറ്റവും പുതിയ പരീക്ഷാ ഷെഡ്യൂളുകൾ കാണുക.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-teal-50 text-teal-700 font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition duration-200"
      >
        കലണ്ടർ കാണുക
      </button>
    </div>
  );
};
export default CalendarWidget;
