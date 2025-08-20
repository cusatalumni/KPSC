
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { StarIcon } from '../icons/StarIcon';

interface PageProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const ProFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start space-x-3">
        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
        <span className="text-slate-700">{children}</span>
    </li>
);

const UpgradePage: React.FC<PageProps> = ({ onBack, onUpgrade }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <button onClick={onBack} className="flex items-center space-x-2 text-sky-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>മുമ്പത്തെ പേജിലേക്ക് മടങ്ങുക</span>
      </button>
      
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-center">
            <StarIcon className="h-16 w-16 mx-auto text-amber-400" />
            <h1 className="text-4xl font-bold text-white mt-4">PRO-യിലേക്ക് അപ്‌ഗ്രേഡ് ചെയ്യുക</h1>
            <p className="text-lg text-slate-300 mt-2">ഞങ്ങളുടെ എല്ലാ പ്രീമിയം ഫീച്ചറുകളും അൺലോക്ക് ചെയ്ത് നിങ്ങളുടെ പഠനം അടുത്ത ഘട്ടത്തിലേക്ക് കൊണ്ടുപോകൂ!</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">പ്രോ അംഗത്വത്തിന്റെ പ്രയോജനങ്ങൾ:</h2>
                <ul className="space-y-4 text-lg">
                    <ProFeature>പരിധിയില്ലാത്ത മോക്ക് ടെസ്റ്റുകൾ</ProFeature>
                    <ProFeature>എല്ലാ ക്വിസ് വിഭാഗങ്ങളിലേക്കും പ്രവേശനം</ProFeature>
                    <ProFeature>വിശദമായ പ്രകടന റിപ്പോർട്ടുകൾ (త్వరలో వస్తుంది)</ProFeature>
                    <ProFeature>പരസ്യരഹിത പഠനാനുഭവം</ProFeature>
                    <ProFeature>പ്രത്യേക പഠന സാമഗ്രികളും PDF-കളും</ProFeature>
                </ul>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl text-center">
                <p className="text-lg font-semibold text-slate-600">വാർഷിക പ്ലാൻ</p>
                <p className="text-5xl font-bold text-slate-800 my-2">₹499 <span className="text-xl font-normal text-slate-500">/വർഷം</span></p>
                <p className="text-slate-500">എല്ലാ ഫീച്ചറുകളും ഒരു വർഷത്തേക്ക്.</p>
                
                <button 
                    onClick={onUpgrade}
                    className="mt-6 w-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 font-bold py-3 px-6 rounded-lg text-lg hover:scale-105 transform transition-transform duration-300 shadow-lg"
                >
                    ഇപ്പോൾ അപ്‌ഗ്രേഡ് ചെയ്യുക
                </button>
                <p className="text-xs text-slate-400 mt-4">സുരക്ഷിതമായ പണമിടപാട്.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
