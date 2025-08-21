import React from 'react';
import type { Exam } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ExamCardProps {
  exam: Exam;
  onNavigate: (exam: Exam) => void;
  language: 'ml' | 'en';
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onNavigate, language }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1.5 transform transition-all duration-300 flex flex-col justify-between border border-slate-100 bg-gradient-to-br from-white to-slate-50">
      <div>
        <div className="flex items-start space-x-4">
          <div className="bg-slate-100 p-3 rounded-full border border-slate-200">
              {exam.icon}
          </div>
          <div>
              <h4 className="text-xl font-bold text-slate-800">{exam.title[language]}</h4>
              <p className="text-sm text-slate-500 -mt-1">{exam.title[language === 'ml' ? 'en' : 'ml']}</p>
              <p className="text-slate-600 mt-2 text-base">{exam.description[language]}</p>
          </div>
        </div>
      </div>
       <button 
        onClick={() => onNavigate(exam)}
        className="mt-6 w-full text-center bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-sm hover:shadow-md"
       >
          {t('start')}
        </button>
    </div>
  );
};

export default ExamCard;