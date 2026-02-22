
import React from 'react';
import { RssIcon } from './icons/RssIcon';

interface PscLiveWidgetProps {
  onNavigate: () => void;
}

const PscLiveWidget: React.FC<PscLiveWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <RssIcon className="h-7 w-7 text-indigo-500" />
        <h4 className="text-xl font-bold text-slate-800">PSC Live</h4>
      </div>
      <p className="text-slate-600 mb-4">keralapsc.gov.in-ൽ നിന്നുള്ള ഏറ്റവും പുതിയ അറിയിപ്പുകൾ തത്സമയം അറിയൂ.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition duration-200"
      >
        അപ്‌ഡേറ്റുകൾ കാണുക
      </button>
    </div>
  );
};

export default PscLiveWidget;
