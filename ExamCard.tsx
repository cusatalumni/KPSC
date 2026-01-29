
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
    indigo: 'btn-vibrant-indigo',
    amber: 'btn-vibrant-amber',
    rose: 'btn-vibrant-rose'
  };

  const iconBgClasses = {
    indigo: 'bg-indigo-50 border-indigo-100',
    amber: 'bg-amber-50 border-amber-100',
    rose: 'bg-rose-50 border-rose-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] premium-shadow hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 flex flex-col justify-between border border-slate-100 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${theme === 'indigo' ? 'bg-indigo-600' : theme === 'amber' ? 'bg-amber-600' : 'bg-rose-600'}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start space-x-4">
          <div className={`p-4 rounded-2xl border ${iconBgClasses[theme]} shadow-inner`}>
              {exam.icon}
          </div>
          <div>
              <h4 className="text-xl font-black text-slate-800 leading-tight">{exam.title[language]}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-1">{exam.title[language === 'ml' ? 'en' : 'ml']}</p>
          </div>
        </div>
        <p className="text-slate-600 mt-4 text-sm font-medium leading-relaxed line-clamp-2">{exam.description[language]}</p>
      </div>
      
       <button 
        onClick={() => onNavigate(exam)}
        className={`mt-6 w-full text-center text-white font-black px-4 py-3.5 rounded-2xl transition duration-300 active:scale-95 ${themeClasses[theme]}`}
       >
          {t('start')}
        </button>
    </div>
  );
};

export default ExamCard;
