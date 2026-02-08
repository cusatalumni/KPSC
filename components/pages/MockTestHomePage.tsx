
import React, { useState, useMemo } from 'react';
import { MOCK_TESTS_DATA, EXAMS_DATA } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { DocumentChartBarIcon } from '../icons/DocumentChartBarIcon';
import ProBadge from '../ProBadge';
import type { MockTest } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface MockTestCardProps {
  test: MockTest;
  onStart: (test: MockTest) => void;
}

const MockTestCard: React.FC<MockTestCardProps> = ({ test, onStart }) => {
  const { t, language } = useTranslation();
  const exam = EXAMS_DATA.find(e => e.id === test.examId);
  const isPro = test.isPro;

  return (
    <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 flex flex-col justify-between border-2 border-slate-50 dark:border-slate-800 group`}>
      <div>
        <div className="flex items-start space-x-5 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
             {exam?.icon || <DocumentChartBarIcon className="h-8 w-8 text-indigo-500" />}
          </div>
          <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h4 className="text-xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{test.title[language]}</h4>
                {isPro && <ProBadge />}
              </div>
              <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em]">{exam?.title[language]}</span>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 line-clamp-3">{test.description[language]}</p>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-t border-slate-50 dark:border-slate-800 pt-5">
           <div className="flex items-center space-x-4">
              <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">{test.questionsCount} Qs</span>
              <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">{test.duration} Mins</span>
           </div>
           <span className="text-red-500 font-black">-{test.negativeMarking} Neg</span>
        </div>
        <button 
          onClick={() => onStart(test)}
          className="w-full btn-vibrant-indigo text-white font-black py-4.5 rounded-2xl shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>{t('startTest')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
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
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto px-4">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-indigo-600">
              <DocumentChartBarIcon className="h-8 w-8" />
              <span className="font-black tracking-[0.2em] uppercase text-xs">Excellence Testing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
            {t('mockTests.title')}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">{t('mockTests.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                 activeCategory === cat 
                 ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-105 border-transparent' 
                 : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </header>

      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTests.map((test) => (
            <MockTestCard key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
           <DocumentChartBarIcon className="h-24 w-24 text-slate-200 dark:text-slate-800 mx-auto mb-8" />
           <p className="text-3xl font-black text-slate-400 dark:text-slate-600 tracking-tight">Coming Soon!</p>
           <p className="text-slate-400 font-medium mt-3">We are preparing fresh questions for this category.</p>
        </div>
      )}
    </div>
  );
};

export default MockTestHomePage;
