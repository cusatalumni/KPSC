import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface QuizHomeWidgetProps {
  onNavigate: () => void;
}

const QuizHomeWidget: React.FC<QuizHomeWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <div className="flex items-center space-x-3 mb-4">
        <SparklesIcon className="h-7 w-7 text-indigo-500" />
        <h4 className="text-xl font-bold text-slate-800">ക്വിസ് കോർണർ</h4>
      </div>
      <p className="text-slate-600 mb-4">വിവിധ വിഷയങ്ങളിൽ നിങ്ങളുടെ അറിവ് പരീക്ഷിച്ച് റാങ്കുകളിൽ മുന്നിലെത്തൂ.</p>
      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-teal-50 text-teal-700 font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition duration-200"
      >
        ക്വിസുകൾ എടുക്കുക
      </button>
    </div>
  );
};

export default QuizHomeWidget;
