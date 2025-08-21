import React from 'react';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface CurrentAffairsWidgetProps {
  onNavigate: () => void;
}

const CurrentAffairsWidget: React.FC<CurrentAffairsWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <NewspaperIcon className="h-7 w-7 text-teal-500" />
        <h4 className="text-xl font-bold text-slate-800">ആനുകാലികം</h4>
      </div>
      <p className="text-slate-600 mb-4">ഏറ്റവും പുതിയ വാർത്തകളും സംഭവങ്ങളും ദിവസവും അപ്ഡേറ്റ് ചെയ്യുന്നു.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-teal-50 text-teal-700 font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition duration-200"
      >
        വിശദമായി വായിക്കുക
      </button>
    </div>
  );
};

export default CurrentAffairsWidget;