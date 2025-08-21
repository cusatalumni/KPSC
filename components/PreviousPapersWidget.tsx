
import React from 'react';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface PreviousPapersWidgetProps {
  onNavigate: () => void;
}

const PreviousPapersWidget: React.FC<PreviousPapersWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <ArchiveBoxIcon className="h-7 w-7 text-indigo-500" />
        <h4 className="text-xl font-bold text-slate-800">മുൻവർഷ ചോദ്യപേപ്പറുകൾ</h4>
      </div>
      <p className="text-slate-600 mb-4">AI ഉപയോഗിച്ച് പഴയ ചോദ്യപേപ്പറുകൾ തിരയൂ, ഡൗൺലോഡ് ചെയ്യൂ.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition duration-200"
      >
        ഇപ്പോൾ തിരയുക
      </button>
    </div>
  );
};

export default PreviousPapersWidget;
