
import React, { useState, useMemo } from 'react';
import { MOCK_TESTS_DATA, EXAMS_DATA } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { DocumentChartBarIcon } from '../icons/DocumentChartBarIcon';
import ProBadge from '../ProBadge';
import type { MockTest } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { ClockIcon } from '../icons/ClockIcon';

interface MockTestCardProps {
  test: MockTest;
  onStart: (test: MockTest) => void;
}

const MockTestCard: React.FC<MockTestCardProps> = ({ test, onStart }) => {
  const { t, language } = useTranslation();
  const exam = EXAMS_DATA.find(e => e.id === test.examId);
  const isPro = test.isPro;

  // Pattern styling based on exam type
  const getCardTheme = () => {
    if (test.examId === 'ldc_lgs') return 'border-indigo-100 bg-indigo-50/20 text-indigo-600';
    if (test.examId === 'university_assistant') return 'border-emerald-100 bg-emerald-50/20 text-emerald-600';
    return 'border-amber-100 bg-amber-50/20 text-amber-600';
  };

  const themeClass = getCardTheme();

  return (
    <div className={`bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-500 flex flex-col justify-between border-2 border-slate-50 dark:border-slate-800 group relative overflow-hidden h-full`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-current pointer-events-none rounded-bl-[5rem] -mr-12 -mt-12 transition-transform group-hover:scale-125"></div>
      
      <div>
        <div className="flex items-start space-x-5 mb-6">
          <div className={`p-4 rounded-2xl shadow-inner group-hover:rotate-3 transition-transform ${themeClass.split(' ')[2] + ' bg-white dark:bg-slate-800 border'}`}>
             {exam?.icon || <DocumentChartBarIcon className="h-8 w-8" />}
          </div>
          <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h4 className="text-xl font-black text-slate-800 dark:text-white leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">{test.title[language]}</h4>
                {isPro && <ProBadge />}
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{exam?.title[language] || 'PSC Official'}</span>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed mb-8 line-clamp-2 italic opacity-80">"{test.description[language]}"</p>
      </div>
      
      <div className="mt-auto">
        <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border dark:border-slate-700 flex flex-col items-center">
                <span className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Questions</span>
                <span className="text-xs font-black text-slate-700 dark:text-white">{test.questionsCount}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border dark:border-slate-700 flex flex-col items-center">
                <span className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Duration</span>
                <span className="text-xs font-black text-slate-700 dark:text-white">{test.duration}m</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border dark:border-slate-700 flex flex-col items-center">
                <span className="text-[7px] font-black text-rose-400 uppercase mb-0.5">Negative</span>
                <span className="text-xs font-black text-rose-600">-{test.negativeMarking}</span>
            </div>
        </div>

        <button 
          onClick={() => onStart(test)}
          className="w-full btn-vibrant-indigo text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          പരീക്ഷ ആരംഭിക്കുക
        </button>
      </div>
    </div>
  );
};

interface PageProps {
  onBack: () => void;
  onStartTest: (test: MockTest) => void;
}

const MockTestHomePage: React.FC<PageProps> = ({ onBack, onStartTest }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(EXAMS_DATA.map(e => e.category)))];

  const filteredTests = useMemo(() => {
    if (activeCategory === 'All') return MOCK_TESTS_DATA;
    return MOCK_TESTS_DATA.filter(test => {
      const exam = EXAMS_DATA.find(e => e.id === test.examId);
      return exam?.category === activeCategory;
    });
  }, [activeCategory]);

  return (
    <div className="animate-fade-in pb-32 max-w-7xl mx-auto px-4">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-8 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
            {t('mockTests.title')}
          </h1>
          <p className="text-lg text-slate-500 font-bold max-w-2xl leading-relaxed">
            കേരള PSC ഒറിജിനൽ പരീക്ഷയുടെ അതേ സിലബസ്സിലും സമയക്രമത്തിലും തയ്യാറാക്കിയ മോഡൽ പരീക്ഷകൾ.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl shadow-inner">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                 activeCategory === cat 
                 ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg' 
                 : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </header>

      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map((test) => (
            <MockTestCard key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
           <p className="text-2xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">Updating Exam Hall...</p>
        </div>
      )}
    </div>
  );
};

export default MockTestHomePage;
