
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

  return (
    <div className={`bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.2)] hover:-translate-y-3 transform transition-all duration-500 flex flex-col justify-between border-2 border-slate-50 dark:border-slate-800 group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[6rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
      
      <div>
        <div className="flex items-start space-x-6 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-3">
             {exam?.icon || <DocumentChartBarIcon className="h-10 w-10 text-indigo-500" />}
          </div>
          <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors tracking-tighter">{test.title[language]}</h4>
                {isPro && <ProBadge />}
              </div>
              <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.3em]">{exam?.title[language] || 'PSC Official Model'}</span>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed mb-8 line-clamp-3 italic">"{test.description[language]}"</p>
      </div>
      
      <div className="mt-auto">
        <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Questions</span>
                <span className="text-sm font-black text-slate-700 dark:text-white">{test.questionsCount}</span>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex flex-col items-center">
                <span className="text-[8px] font-black text-indigo-400 uppercase mb-1">Duration</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{test.duration}m</span>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-800 flex flex-col items-center">
                <span className="text-[8px] font-black text-rose-400 uppercase mb-1">Negative</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">-{test.negativeMarking}</span>
            </div>
        </div>

        <button 
          onClick={() => onStart(test)}
          className="w-full btn-vibrant-indigo text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center space-x-3 text-sm uppercase tracking-[0.2em]"
        >
          <span>പരീക്ഷ ആരംഭിക്കുക</span>
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
    <div className="animate-fade-in pb-32 max-w-7xl mx-auto px-4">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
              <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg ring-4 ring-indigo-500/20">
                  <DocumentChartBarIcon className="h-8 w-8" />
              </div>
              <span className="font-black tracking-[0.4em] uppercase text-xs text-indigo-500">Professional Exam Hall</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
            {t('mockTests.title')}
          </h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl leading-relaxed">
            കേരള PSC ഒറിജിനൽ പരീക്ഷയുടെ അതേ സിലബസ്സിലും സമയക്രമത്തിലും തയ്യാറാക്കിയ ഫുൾ-ലെങ്ത് മോഡൽ പരീക്ഷകൾ.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-slate-100 dark:bg-slate-900 p-2 rounded-[2rem] shadow-inner">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                 activeCategory === cat 
                 ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl scale-105' 
                 : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </header>

      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredTests.map((test) => (
            <MockTestCard key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
           <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <DocumentChartBarIcon className="h-12 w-12 text-slate-200 dark:text-slate-700" />
           </div>
           <p className="text-4xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">Preparing New Hall...</p>
           <p className="text-slate-400 font-bold mt-4 max-w-sm mx-auto uppercase tracking-widest text-[10px]">Fresh questions as per latest 2025 pattern are being uploaded.</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-20 bg-slate-950 p-10 md:p-14 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden border-2 border-white/5 shadow-2xl">
         <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mt-20"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center space-x-0 md:space-x-10 text-center md:text-left gap-8">
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10">
                <ClockIcon className="h-12 w-12 text-indigo-400" />
            </div>
            <div>
                <h4 className="text-3xl font-black tracking-tight mb-2">നിങ്ങളുടെ വേഗത വർദ്ധിപ്പിക്കൂ</h4>
                <p className="text-slate-400 font-bold leading-relaxed max-w-md">75 മിനിറ്റിൽ 100 ചോദ്യങ്ങൾ എന്ന PSC രീതി പരിശീലിക്കുന്നത് പരീക്ഷാ ഹാളിൽ സമയം ലാഭിക്കാൻ നിങ്ങളെ സഹായിക്കും.</p>
            </div>
         </div>
         <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="relative z-10 bg-indigo-600 text-white font-black px-12 py-5 rounded-2xl shadow-xl hover:bg-indigo-500 transition-all uppercase tracking-widest text-xs">മുകളിലേക്ക് മടങ്ങുക</button>
      </div>
    </div>
  );
};

export default MockTestHomePage;
