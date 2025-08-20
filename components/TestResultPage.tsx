
import React from 'react';
import { TrophyIcon } from './icons/TrophyIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface TestResultPageProps {
  score: number;
  total: number;
  onBackToPrevious: () => void;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ score, total, onBackToPrevious }) => {
  const percentage = Math.round((score / total) * 100);
  
  const getFeedback = () => {
    if (percentage >= 80) return { message: "വളരെ മികച്ചത്!", color: "text-green-600" };
    if (percentage >= 60) return { message: "നല്ല ശ്രമം!", color: "text-sky-600" };
    if (percentage >= 40) return { message: "കൂടുതൽ മെച്ചപ്പെടുത്താം", color: "text-amber-600" };
    return { message: "കഠിനമായി പരിശ്രമിക്കുക", color: "text-red-600" };
  };

  const feedback = getFeedback();

  return (
    <div className="flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-lg w-full transform transition-all animate-fade-in-up">
        <TrophyIcon className="h-20 w-20 mx-auto text-amber-400" />
        <h1 className="text-3xl font-bold text-slate-800 mt-4">പരീക്ഷാഫലം</h1>
        
        <div className="my-8">
            <p className="text-xl text-slate-600">നിങ്ങളുടെ സ്കോർ</p>
            <p className="text-6xl font-bold text-sky-600 my-2">{score} <span className="text-4xl text-slate-500">/ {total}</span></p>
            <p className={`text-2xl font-semibold ${feedback.color}`}>{feedback.message}</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-lg">
            <p className="text-lg text-slate-700">നിങ്ങൾ <span className="font-bold">{total}</span> ചോദ്യങ്ങളിൽ <span className="font-bold">{score}</span> എണ്ണത്തിന് ശരിയുത്തരം നൽകി.</p>
        </div>

        <button 
            onClick={onBackToPrevious}
            className="mt-8 w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2"
        >
           <ArrowPathIcon className="h-5 w-5" />
           <span>മുമ്പത്തെ പേജിലേക്ക് മടങ്ങുക</span>
        </button>
      </div>
    </div>
  );
};

export default TestResultPage;
