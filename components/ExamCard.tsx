
import React from 'react';
import type { Exam } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ExamCardProps {
  exam: Exam;
  onNavigate: (exam: Exam) => void;
  language: 'ml' | 'en';
  theme?: 'indigo' | 'amber' | 'rose' | 'emerald' | 'cyan';
  syllabusPreview?: string[];
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onNavigate, language, theme = 'indigo', syllabusPreview = [] }) => {
  const { t } = useTranslation();
  
  const themeClasses = {
    indigo: 'bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-indigo-200/50',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-200/50',
    rose: 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-200/50',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-200/50',
    cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-cyan-200/50'
  };

  const accentTextClasses = {
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
    cyan: 'text-cyan-600'
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col border border-slate-100 dark:border-slate-800 relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-bl-[4rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
      
      <div className="relative z-10 flex-grow">
        <div className="flex items-center space-x-4 mb-5">
          <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 ${accentTextClasses[theme]} shadow-inner group-hover:scale-110 transition-transform flex-shrink-0`}>
              {exam.icon}
          </div>
          <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-1">
                 <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{exam.level}</span>
              </div>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight truncate">{exam.title[language]}</h4>
          </div>
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed line-clamp-2 min-h-[2.5rem]">{exam.description[language]}</p>

        {syllabusPreview.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                    {syllabusPreview.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
      
       <button 
        onClick={() => onNavigate(exam)}
        className={`mt-6 w-full text-center text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg text-xs uppercase tracking-widest ${themeClasses[theme]}`}
       >
          {t('start')}
        </button>
    </div>
  );
};

export default ExamCard;
