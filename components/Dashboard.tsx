
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import ExamCard from './ExamCard';
import { getExams, getGk, getCurrentAffairs } from '../services/pscDataService';
import type { Exam, Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import NewsTicker from './NewsTicker';
import HeroSlider from './HeroSlider';
import AdsenseWidget from './AdsenseWidget';
import PscLiveWidget from './PscLiveWidget';
import QuizHomeWidget from './QuizHomeWidget';
import CurrentAffairsWidget from './icons/CurrentAffairsWidget';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { SparklesIcon } from './icons/SparklesIcon';
// Added missing icon import
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const WelcomeBar: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-slate-950 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mb-12 border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 space-y-3">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg"><SparklesIcon className="h-5 w-5 text-white" /></div>
                    <span className="font-black text-[10px] uppercase tracking-[0.4em] text-indigo-400">Personalized Learning</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter">നിങ്ങളുടെ പരീക്ഷാ തയ്യാറെടുപ്പ് <br/><span className="text-indigo-500">ഇവിടെ തുടങ്ങാം!</span></h2>
                <p className="text-slate-400 font-bold max-w-md">1800+ ചോദ്യങ്ങളും 177 മൈക്രോ ടോപ്പിക്കുകളുമുള്ള കേരളത്തിലെ ഏറ്റവും വലിയ PSC സ്റ്റഡി ഹബ്ബ്.</p>
            </div>
            <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center space-x-10 shadow-inner">
                <div className="text-center">
                    <p className="text-3xl font-black text-indigo-400">1.8k+</p>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Questions</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400">177</p>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Micro Topics</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                    <p className="text-3xl font-black text-amber-400">AI</p>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Verified</p>
                </div>
            </div>
        </div>
    );
};

const DailyPulse: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState<{ type: 'gk' | 'news', data: any }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getGk(), getCurrentAffairs()]).then(([gk, news]) => {
            const combined = [
                ...gk.slice(0, 5).map(item => ({ type: 'gk' as const, data: item })),
                ...news.slice(0, 5).map(item => ({ type: 'news' as const, data: item }))
            ].sort(() => 0.5 - Math.random());
            setItems(combined);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (items.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [items]);

    if (loading || items.length === 0) return null;
    const current = items[currentIndex];

    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition-all h-full flex flex-col" 
             onClick={() => onNavigate(current.type === 'gk' ? 'gk' : 'current_affairs')}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-bl-[8rem] -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className={`p-4 rounded-2xl shadow-lg ${current.type === 'gk' ? 'bg-yellow-500 text-white' : 'bg-teal-500 text-white'}`}>
                        {current.type === 'gk' ? <LightBulbIcon className="h-6 w-6" /> : <NewspaperIcon className="h-6 w-6" />}
                    </div>
                    <div>
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 block">
                            {current.type === 'gk' ? 'Daily Intelligence' : 'Breaking Update'}
                        </span>
                        <span className="text-[11px] font-black text-indigo-600 uppercase">Flash Card</span>
                    </div>
                </div>
            </div>
            <div className="flex-grow flex flex-col justify-center">
                <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-tight animate-fade-in tracking-tighter italic">"{current.type === 'gk' ? current.data.fact : current.data.title}"</h4>
            </div>
            <div className="mt-8 flex items-center space-x-2 text-indigo-600">
                <span className="text-[10px] font-black uppercase tracking-widest">Learn More</span>
                <div className="h-0.5 flex-grow bg-indigo-50"></div>
                <ChevronRightIcon className="h-4 w-4" />
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
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-[3.5rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem]"></div>)}
        </div>
    </div>
  );

  return (
    <div className="space-y-16 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch px-4">
          <div className="lg:col-span-2"><HeroSlider onNavigate={onNavigate} /></div>
          <div className="h-full"><DailyPulse onNavigate={onNavigate} /></div>
      </div>
      
      <div className="px-4"><NewsTicker /></div>
      
      <div className="px-4"><WelcomeBar /></div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 px-4">
        <div className="lg:col-span-3 space-y-20">
          {sortedCategoryIds.map((catId) => (
              <section key={catId} className="animate-fade-in-up">
                  <div className="flex items-center space-x-5 mb-10 border-b-2 dark:border-slate-800 pb-6">
                    <div className="h-10 w-2 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{t(`dashboard.examCategories.${catId}`) || catId}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Curated Preparation Tracks</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {(groupedExams[catId] || []).map((exam, idx) => (
                        <Fragment key={exam.id}>
                            <ExamCard exam={exam} onNavigate={onNavigateToExam} language={language} theme="indigo" />
                            {(idx + 1) % 7 === 0 && <div className="sm:col-span-2 py-6"><AdsenseWidget /></div>}
                        </Fragment>
                    ))}
                  </div>
              </section>
          ))}
        </div>
        <div className="space-y-10">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-1 rounded-[2.5rem] shadow-2xl">
              <PscLiveWidget onNavigate={() => onNavigate('psc_live_updates')} />
          </div>
          <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
          <CurrentAffairsWidget onNavigate={() => onNavigate('current_affairs')} />
          <div className="sticky top-24">
             <AdsenseWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
