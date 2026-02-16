
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import ExamCard from './ExamCard';
import { getExams } from '../services/pscDataService';
import type { Exam, Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import NewsTicker from './NewsTicker';
import HeroSlider from './HeroSlider';
import AdsenseWidget from './AdsenseWidget';
import PscLiveWidget from './PscLiveWidget';
import QuizHomeWidget from './QuizHomeWidget';
import GkWidget from './GkWidget';
import CurrentAffairsWidget from './icons/CurrentAffairsWidget';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const WelcomeBar: React.FC = () => {
    return (
        <div className="bg-slate-950 p-10 md:p-14 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden mb-16 border-2 border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>
            
            <div className="relative z-10 space-y-6 max-w-2xl">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)]"><SparklesIcon className="h-6 w-6 text-white" /></div>
                    <span className="font-black text-[11px] uppercase tracking-[0.5em] text-indigo-400">Next Gen Learning</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
                   റാങ്ക് പട്ടികയിൽ <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-500">മുന്നിലെത്താം!</span>
                </h2>
                <p className="text-slate-400 font-bold text-lg leading-relaxed">
                   AI സാങ്കേതികവിദ്യയുടെ സഹായത്തോടെ സിലബസ് മൈക്രോ ടോപ്പിക്കുകളായി പഠിക്കാം. 
                   ലക്ഷക്കണക്കിന് ചോദ്യങ്ങൾ ഇപ്പോൾ ലഭ്യമാണ്.
                </p>
                <div className="flex flex-wrap gap-8 pt-4">
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-indigo-500">177+</span>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Micro Topics</span>
                   </div>
                   <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-emerald-500">100%</span>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Syllabus Sync</span>
                   </div>
                </div>
            </div>

            <div className="relative z-10 hidden lg:block">
                 <div className="w-64 h-64 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rotate-3 shadow-2xl">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                       <LightBulbIcon className="h-10 w-10 text-indigo-400" />
                    </div>
                    <p className="text-white font-black text-sm mb-1 uppercase tracking-widest">Smart Study</p>
                    <p className="text-slate-500 font-bold text-xs">Unlock your potential with PSC Guru Pro</p>
                 </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<{ onNavigateToExam: (exam: Exam) => void; onNavigate: (page: Page) => void; onStartStudy: (topic: string) => void; }> = ({ onNavigateToExam, onNavigate, onStartStudy }) => {
  const { t, language } = useTranslation();
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExams().then(res => {
        setAllExams(res.exams);
        setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const groupedExams = useMemo(() => {
    const groups: Record<string, Exam[]> = {};
    allExams.forEach(exam => {
        const cat = exam.category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(exam);
    });
    return groups;
  }, [allExams]);

  const sortedCategoryIds = useMemo(() => {
    const priority = ['Live', 'General', 'Technical', 'Special'];
    const others = Object.keys(groupedExams).filter(id => !priority.includes(id)).sort();
    return [...priority.filter(p => groupedExams[p]), ...others];
  }, [groupedExams]);

  if (loading) return (
    <div className="space-y-12 animate-pulse p-4">
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[3.5rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem]"></div>)}
        </div>
    </div>
  );

  return (
    <div className="space-y-20 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 px-4">
          <div className="lg:col-span-3"><HeroSlider onNavigate={onNavigate} /></div>
          <div className="hidden lg:block space-y-6">
              <PscLiveWidget onNavigate={() => onNavigate('psc_live_updates')} />
              <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
              <CurrentAffairsWidget onNavigate={() => onNavigate('current_affairs')} />
              <GkWidget onNavigate={() => onNavigate('gk')} />
          </div>
      </div>
      
      <div className="px-4"><NewsTicker /></div>
      
      <div className="px-4"><WelcomeBar /></div>

      <div className="px-4 space-y-24">
        {sortedCategoryIds.map((catId) => (
            <section key={catId} className="animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-2 dark:border-slate-800 pb-10">
                  <div className="flex items-center space-x-6">
                    <div className="h-16 w-3 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]"></div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{t(`dashboard.examCategories.${catId}`) || catId}</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Professional Training Tracks</p>
                    </div>
                  </div>
                  <button onClick={() => onNavigate('mock_test_home')} className="flex items-center space-x-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:translate-x-2 transition-transform">
                     <span>View All Tests</span>
                     <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                  {(groupedExams[catId] || []).map((exam, idx) => (
                      <Fragment key={exam.id}>
                          <ExamCard exam={exam} onNavigate={onNavigateToExam} language={language} theme="indigo" />
                          {(idx + 1) % 6 === 0 && <div className="sm:col-span-2 lg:col-span-3 py-6"><AdsenseWidget /></div>}
                      </Fragment>
                  ))}
                </div>
            </section>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
