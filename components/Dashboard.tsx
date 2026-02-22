
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
import RotatingDailyWidget from './RotatingDailyWidget';
import CalendarWidget from './CalendarWidget';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const WelcomeBar: React.FC = () => {
    return (
        <div className="bg-slate-950 p-10 md:p-14 rounded-[4rem] text-white flex flex-col md:row items-center justify-between gap-10 relative overflow-hidden mb-16 border-2 border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="relative z-10 space-y-6 max-w-2xl text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg"><SparklesIcon className="h-6 w-6 text-white" /></div>
                    <span className="font-black text-[11px] uppercase tracking-[0.5em] text-indigo-400">Premium Learning</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">റാങ്ക് പട്ടികയിൽ <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-500">മുന്നിലെത്താം!</span></h2>
                <p className="text-slate-400 font-bold text-lg leading-relaxed">AI സാങ്കേതികവിദ്യയുടെ സഹായത്തോടെ തയ്യാറാക്കിയ ലക്ഷക്കണക്കിന് ചോദ്യങ്ങൾ ഇപ്പോൾ നിങ്ങളുടെ വിരൽത്തുമ്പിൽ.</p>
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
    const priority = ['General', 'Technical', 'Special', 'Live'];
    const existing = Object.keys(groupedExams);
    const allIds = Array.from(new Set([...priority, ...existing]));
    return allIds.filter(id => groupedExams[id] && groupedExams[id].length > 0);
  }, [groupedExams]);

  const themes: ('indigo' | 'emerald' | 'rose' | 'amber' | 'cyan')[] = ['indigo', 'emerald', 'rose', 'amber', 'cyan'];

  if (loading) return (
    <div className="space-y-12 animate-pulse p-4">
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[3.5rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem]"></div>)}
        </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4">
          <div className="lg:col-span-3"><HeroSlider onNavigate={onNavigate} /></div>
          <div className="hidden lg:block h-full"><RotatingDailyWidget onNavigate={onNavigate} /></div>
      </div>
      <div className="px-4"><NewsTicker /></div>
      <div className="px-4"><WelcomeBar /></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 px-4">
        <div className="lg:col-span-3 space-y-24">
            {sortedCategoryIds.map((catId) => (
                <section key={catId} className="animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-2 dark:border-slate-800 pb-10">
                      <div className="flex items-center space-x-6">
                        <div className="h-16 w-3 bg-indigo-600 rounded-full shadow-lg"></div>
                        <div>
                            <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{t(`dashboard.examCategories.${catId}`) || catId}</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Professional PSC Tracks</p>
                        </div>
                      </div>
                      <button onClick={() => onNavigate('mock_test_home')} className="flex items-center space-x-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:translate-x-2 transition-transform">
                         <span>View All</span>
                         <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                      {(groupedExams[catId] || []).map((exam, idx) => (
                          <Fragment key={exam.id}>
                              <div className="h-full flex flex-col">
                                  <ExamCard 
                                    exam={exam} 
                                    onNavigate={onNavigateToExam} 
                                    language={language} 
                                    theme={themes[idx % themes.length]} 
                                  />
                              </div>
                              {(idx + 1) % 7 === 0 && <AdsenseWidget />}
                          </Fragment>
                      ))}
                    </div>
                </section>
            ))}
        </div>

        <aside className="hidden lg:block space-y-8">
            <PscLiveWidget onNavigate={() => onNavigate('psc_live_updates')} />
            <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
            <CalendarWidget onNavigate={() => onNavigate('exam_calendar')} />
            <div className="sticky top-28 py-4 flex flex-col gap-4">
                <AdsenseWidget />
            </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
