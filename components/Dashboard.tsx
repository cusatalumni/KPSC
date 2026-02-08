
import React, { useState, useEffect, useMemo, Fragment, useCallback } from 'react';
import ExamCard from './ExamCard';
import { getDetectedExams, getExams, getGk, getCurrentAffairs } from '../services/pscDataService';
import type { Exam, Page, GkItem, CurrentAffairsItem } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import NewsTicker from './NewsTicker';
import HeroSlider from './HeroSlider';
import AdsenseWidget from './AdsenseWidget';
import PscLiveWidget from './PscLiveWidget';
import QuizHomeWidget from './QuizHomeWidget';
import CurrentAffairsWidget from './CurrentAffairsWidget';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { EXAM_CONTENT_MAP } from '../constants';

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
        });
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
                <div className="flex space-x-1">
                    {items.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-indigo-500' : 'w-1 bg-slate-200'}`}></div>
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight animate-fade-in">
                    {current.type === 'gk' ? current.data.fact : current.data.title}
                </h4>
                {current.type === 'news' && (
                    <p className="text-[10px] font-black text-teal-600 uppercase mt-3">{current.data.source} • {current.data.date}</p>
                )}
                {current.type === 'gk' && (
                    <p className="text-[10px] font-black text-yellow-600 uppercase mt-3">{current.data.category}</p>
                )}
            </div>

            <div className="mt-6 flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
                <span>Read More</span>
                <ChevronRightIcon className="h-3 w-3 ml-1" />
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
    Promise.all([
        getDetectedExams(),
        getExams()
    ]).then(([detected, exams]) => {
        setDetectedExams(detected);
        setAllExams(exams);
        setLoading(false);
    }).catch(err => {
        console.error("Dashboard Load Error:", err);
        setLoading(false);
    });
  }, []);

  const categoryThemes: Record<string, 'indigo' | 'amber' | 'rose' | 'emerald' | 'cyan'> = {
    'General': 'indigo',
    'Technical': 'amber',
    'Special': 'rose',
    'Live': 'rose',
    'Degree': 'emerald',
    '10th': 'cyan',
    'Preliminary': 'indigo'
  };

  const groupedExams = useMemo(() => {
    const groups: Record<string, Exam[]> = {};
    if (detectedExams.length > 0) {
        groups['Live'] = detectedExams;
    }
    allExams.forEach(exam => {
        const cat = exam.category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(exam);
    });
    return groups;
  }, [detectedExams, allExams]);

  const sortedCategoryIds = useMemo(() => {
    const priority = ['Live', 'General', 'Technical', 'Special'];
    const otherCategories = Object.keys(groupedExams).filter(id => !priority.includes(id)).sort();
    return [...priority.filter(p => groupedExams[p]), ...otherCategories];
  }, [groupedExams]);

  // Helper to get unique subjects for an exam to show on the card
  const getSyllabusPreview = useCallback((examId: string) => {
    const content = EXAM_CONTENT_MAP[examId];
    if (!content) return [];
    
    // Get unique subject names from practice tests
    const subjects = new Set<string>();
    content.practiceTests.forEach(test => {
        if (test.subject && test.subject !== 'mixed') {
            subjects.add(test.subject);
        }
    });
    
    return Array.from(subjects).slice(0, 4); // Limit to 4 for clean UI
  }, []);

  if (loading) {
    return (
        <div className="space-y-12 animate-pulse">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>)}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Layer: Clean Header with Hero & Daily Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2">
              <HeroSlider onNavigate={onNavigate} />
          </div>
          <div className="h-full">
              <DailyPulse onNavigate={onNavigate} />
          </div>
      </div>

      <NewsTicker />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-16">
          {sortedCategoryIds.map((catId, index) => {
            const list = groupedExams[catId] || [];
            const theme = categoryThemes[catId] || 'indigo';
            const displayTitle = t(`dashboard.examCategories.${catId}`) || catId;

            return (
              <Fragment key={catId}>
                <section className="animate-fade-in-up">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`h-8 w-1.5 ${
                        theme === 'indigo' ? 'bg-indigo-600' : 
                        theme === 'amber' ? 'bg-amber-600' : 
                        theme === 'rose' ? 'bg-rose-600' : 
                        theme === 'emerald' ? 'bg-emerald-600' : 'bg-cyan-600'
                      } rounded-full`}></div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{displayTitle}</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">{list.length} {t('nav.mockTests')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {list.map(exam => (
                        <ExamCard 
                            key={exam.id} 
                            exam={exam} 
                            onNavigate={onNavigateToExam} 
                            language={language} 
                            theme={theme as any} 
                            syllabusPreview={getSyllabusPreview(exam.id)}
                        />
                    ))}
                  </div>
                </section>
                
                {/* Insert ad after every 2 categories */}
                {(index + 1) % 2 === 0 && index !== sortedCategoryIds.length - 1 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                         <AdsenseWidget />
                    </div>
                )}
              </Fragment>
            );
          })}

          {sortedCategoryIds.length === 0 && (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 font-bold">{t('error.fetchData')}</p>
              </div>
          )}
        </div>

        {/* Sidebar Widgets Area */}
        <div className="space-y-8">
          <PscLiveWidget onNavigate={() => onNavigate('psc_live_updates')} />
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Advertisement</span>
              <AdsenseWidget />
          </div>
          
          <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
          <CurrentAffairsWidget onNavigate={() => onNavigate('current_affairs')} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
