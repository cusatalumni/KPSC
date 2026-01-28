
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
    <div className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 flex flex-col justify-between border border-slate-100 group`}>
      <div>
        <div className="flex items-start space-x-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
             {exam?.icon || <DocumentChartBarIcon className="h-8 w-8 text-slate-500" />}
          </div>
          <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h4 className="text-xl font-black text-slate-800 leading-tight">{test.title[language]}</h4>
                {isPro && <ProBadge />}
              </div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{exam?.title[language]}</p>
          </div>
        </div>
        <p className="text-slate-600 font-medium leading-relaxed">{test.description[language]}</p>
      </div>
      
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-t border-slate-50 pt-4">
           <div className="flex items-center space-x-4">
              <span>{test.questionsCount} Qs</span>
              <span>{test.duration} Mins</span>
           </div>
           <span className="text-red-400">-{test.negativeMarking} Neg</span>
        </div>
        <button 
          onClick={() => onStart(test)}
          className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>{t('startTest')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
    <div className="animate-fade-in pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none">
            {t('mockTests.title')}
          </h1>
          <p className="text-xl text-slate-500 font-medium mt-4 max-w-2xl">{t('mockTests.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-6 py-2.5 rounded-full font-black text-sm transition-all ${
                 activeCategory === cat 
                 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' 
                 : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
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
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
           <DocumentChartBarIcon className="h-20 w-20 text-slate-200 mx-auto mb-6" />
           <p className="text-2xl font-black text-slate-400">No mock tests available in this category yet.</p>
           <p className="text-slate-400 font-medium mt-2">New tests are added daily by our AI team.</p>
        </div>
      )}
    </div>
  );
};

export default MockTestHomePage;
