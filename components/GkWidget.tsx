import React from 'react';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface GkWidgetProps {
  onNavigate: () => void;
}

const GkWidget: React.FC<GkWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <LightBulbIcon className="h-7 w-7 text-yellow-500" />
        <h4 className="text-xl font-bold text-slate-800">പൊതുവിജ്ഞാനം</h4>
      </div>
      <p className="text-slate-600 mb-4">പരീക്ഷകൾക്ക് ആവശ്യമായ പ്രധാനപ്പെട്ട പൊതുവിജ്ഞാന ശേഖരം.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-yellow-50 text-yellow-700 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-100 transition duration-200"
      >
        പഠിച്ചു തുടങ്ങാം
      </button>
    </div>
  );
};

export default GkWidget;