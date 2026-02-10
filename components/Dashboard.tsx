import React, { useState, useEffect, useMemo, Fragment } from 'react';
import ExamCard from './ExamCard';
import { getDetectedExams, getExams, getGk, getCurrentAffairs } from '../services/pscDataService';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition-all h-full flex flex-col" 
             onClick={() => onNavigate(current.type === 'gk' ? 'gk' : 'current_affairs')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[5rem] -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${current.type === 'gk' ? 'bg-yellow-100 text-yellow-600' : 'bg-teal-100 text-teal-600'}`}>
                        {current.type === 'gk' ? <LightBulbIcon className="h-5 w-5" /> : <NewspaperIcon className="h-5 w-5" />}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                        {current.type === 'gk' ? 'Daily Fact' : 'Current Affair'}
                    </span>
                </div>
            </div>
            <div className="flex-grow flex flex-col justify-center">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight animate-fade-in">{current.type === 'gk' ? current.data.fact : current.data.title}</h4>
            </div>
        </div>
    );
};

const Dashboard: React.FC<{ onNavigateToExam: (exam: Exam) => void; onNavigate: (page: Page) => void; onStartStudy: (topic: string) => void; }> = ({ onNavigateToExam, onNavigate, onStartStudy }) => {
  const { t, language } = useTranslation();
  const [detectedExams, setDetectedExams] = useState<Exam[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDetectedExams(), getExams()]).then(([detected, examsResult]) => {
        setDetectedExams(detected); setAllExams(examsResult.exams); setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  const groupedExams = useMemo(() => {
    const groups: Record<string, Exam[]> = {};
    if (detectedExams.length > 0) groups['Live'] = detectedExams;
    allExams.forEach(exam => {
        const cat = exam.category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(exam);
    });
    return groups;
  }, [detectedExams, allExams]);

  const sortedCategoryIds = useMemo(() => {
    const priority = ['Live', 'General', 'Technical', 'Special'];
    const others = Object.keys(groupedExams).filter(id => !priority.includes(id)).sort();
    return [...priority.filter(p => groupedExams[p]), ...others];
  }, [groupedExams]);

  if (loading) return <div className="space-y-12 animate-pulse"><div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div></div>;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2"><HeroSlider onNavigate={onNavigate} /></div>
          <div className="h-full"><DailyPulse onNavigate={onNavigate} /></div>
      </div>
      <NewsTicker />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-16">
          {sortedCategoryIds.map((catId) => (
              <section key={catId} className="animate-fade-in-up">
                  <div className="flex items-center space-x-4 mb-8 border-b dark:border-slate-800 pb-4">
                    <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t(`dashboard.examCategories.${catId}`) || catId}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {(groupedExams[catId] || []).map((exam, idx) => (
                        <Fragment key={exam.id}>
                            <ExamCard exam={exam} onNavigate={onNavigateToExam} language={language} theme="indigo" />
                            {(idx + 1) % 7 === 0 && <div className="sm:col-span-2 py-4"><AdsenseWidget /></div>}
                        </Fragment>
                    ))}
                  </div>
              </section>
          ))}
        </div>
        <div className="space-y-8">
          <PscLiveWidget onNavigate={() => onNavigate('psc_live_updates')} />
          <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
          <CurrentAffairsWidget onNavigate={() => onNavigate('current_affairs')} />
          <AdsenseWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;