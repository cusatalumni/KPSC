
import React from 'react';
import type { Exam } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ExamCardProps {
  exam: Exam;
  onNavigate: (exam: Exam) => void;
  language: 'ml' | 'en';
  theme?: 'indigo' | 'amber' | 'rose';
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onNavigate, language, theme = 'indigo' }) => {
  const { t } = useTranslation();
  
  const themeClasses = {
    indigo: 'btn-vibrant-indigo ring-indigo-50 dark:ring-indigo-900/20 hover:shadow-indigo-200/50',
    amber: 'bg-amber-600 ring-amber-50 dark:ring-amber-900/20 hover:shadow-amber-200/50',
    rose: 'bg-rose-600 ring-rose-50 dark:ring-rose-900/20 hover:shadow-rose-200/50'
  };

  const borderClasses = {
    indigo: 'border-indigo-100 dark:border-indigo-900 group-hover:border-indigo-400',
    amber: 'border-amber-100 dark:border-amber-900 group-hover:border-amber-400',
    rose: 'border-rose-100 dark:border-rose-900 group-hover:border-rose-400'
  };

  const iconBgClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400'
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 flex flex-col justify-between border-2 ${borderClasses[theme]} relative overflow-hidden group`}>
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${theme === 'indigo' ? 'bg-indigo-600' : theme === 'amber' ? 'bg-amber-600' : 'bg-rose-600'}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start space-x-5">
          <div className={`p-4 rounded-2xl border-2 ${iconBgClasses[theme]} shadow-inner group-hover:scale-110 transition-transform`}>
              {exam.icon}
          </div>
          <div>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{exam.title[language]}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.1em] mt-1">{exam.title[language === 'ml' ? 'en' : 'ml']}</p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-5 text-sm font-medium leading-relaxed line-clamp-2">{exam.description[language]}</p>
      </div>
      
       <button 
        onClick={() => onNavigate(exam)}
        className={`mt-7 w-full text-center text-white font-black px-4 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-lg ${themeClasses[theme]}`}
       >
          {t('start')}
        </button>
    </div>
  );
};

export default ExamCard;
