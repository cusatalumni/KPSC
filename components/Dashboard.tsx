
import React, { useState, useEffect, useMemo } from 'react';
import ExamCard from './ExamCard';
import { getDetectedExams, getExams } from '../services/pscDataService';
import type { Exam, Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import NewsTicker from './NewsTicker';
import HeroSlider from './HeroSlider';

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
    <div className="space-y-12">
      <HeroSlider onNavigate={onNavigate} />
      <NewsTicker />
      
      <div className="space-y-16">
        {sortedCategoryIds.map(catId => {
          const list = groupedExams[catId] || [];
          const theme = categoryThemes[catId] || 'indigo';
          const displayTitle = t(`dashboard.examCategories.${catId}`) || catId;

          return (
            <section key={catId} className="animate-fade-in-up">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {list.map(exam => (
                    <ExamCard 
                        key={exam.id} 
                        exam={exam} 
                        onNavigate={onNavigateToExam} 
                        language={language} 
                        theme={theme as any} 
                    />
                ))}
              </div>
            </section>
          );
        })}

        {sortedCategoryIds.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">{t('error.fetchData')}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
