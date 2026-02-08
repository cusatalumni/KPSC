
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
    indigo: 'btn-vibrant-indigo shadow-indigo-200/50',
    amber: 'bg-amber-600 shadow-amber-200/50',
    rose: 'bg-rose-600 shadow-rose-200/50',
    emerald: 'bg-emerald-600 shadow-emerald-200/50',
    cyan: 'bg-cyan-600 shadow-cyan-200/50'
  };

  const borderClasses = {
    indigo: 'border-indigo-100 dark:border-indigo-900 group-hover:border-indigo-400',
    amber: 'border-amber-100 dark:border-amber-900 group-hover:border-amber-400',
    rose: 'border-rose-100 dark:border-rose-900 group-hover:border-rose-400',
    emerald: 'border-emerald-100 dark:border-emerald-900 group-hover:border-emerald-400',
    cyan: 'border-cyan-100 dark:border-cyan-900 group-hover:border-cyan-400'
  };

  const iconBgClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600'
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col border-2 ${borderClasses[theme]} relative overflow-hidden group`}>
      <div className="relative z-10 flex-grow">
        <div className="flex items-center space-x-4 mb-5">
          <div className={`p-4 rounded-2xl ${iconBgClasses[theme]} shadow-inner group-hover:scale-110 transition-transform flex-shrink-0`}>
              {exam.icon}
          </div>
          <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-1">
                 <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">{exam.category}</span>
                 <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">{exam.level}</span>
              </div>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight truncate">{exam.title[language]}</h4>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">{exam.description[language]}</p>

        {/* Syllabus Preview Section */}
        {syllabusPreview.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full mr-1.5"></span>
                    {t('dashboard.examCard.syllabusTitle')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {syllabusPreview.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
      
       <button 
        onClick={() => onNavigate(exam)}
        className={`mt-6 w-full text-center text-white font-black py-4 rounded-xl transition-all duration-300 active:scale-95 shadow-lg text-sm uppercase tracking-widest ${themeClasses[theme]}`}
       >
          {t('start')}
        </button>
    </div>
  );
};

export default ExamCard;
