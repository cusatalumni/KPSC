
import React, { useState, useEffect } from 'react';
import type { Exam, PracticeTest, Page, ExamPageContent, SubscriptionStatus } from '../types';
import { getExamSyllabus } from '../services/pscDataService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface ExamPageProps {
    exam: Exam; 
    content: ExamPageContent;
    subscriptionStatus: SubscriptionStatus;
    onBack: () => void; 
    onStartTest: any; 
    onStartStudy: (topic: string) => void; 
    onNavigate: any; 
    onNavigateToUpgrade: () => void;
}

const ExamPage: React.FC<ExamPageProps> = ({ exam, content, subscriptionStatus, onBack, onStartTest, onStartStudy, onNavigate, onNavigateToUpgrade }) => {
  const { t } = useTranslation();
  const [syllabus, setSyllabus] = useState<PracticeTest[]>(content?.practiceTests || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getExamSyllabus(exam.id).then(data => {
        if (isMounted && data && data.length > 0) setSyllabus(data);
    }).finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [exam.id]);

  const handleStudyClick = (test: PracticeTest) => {
    // Pro check for AI study notes
    if (subscriptionStatus !== 'pro') {
        onNavigateToUpgrade();
    } else {
        // Use granular Subject • Topic context for AI notes
        onStartStudy(`${test.subject} • ${test.topic}`);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-20 px-4">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('examPage.backToDashboard')}</span>
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-[10rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex flex-col md:flex-row md:items-center gap-10 relative z-10">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-800 shadow-inner flex-shrink-0">
             {exam.icon}
          </div>
          <div>
              <div className="flex items-center space-x-3 mb-3">
                 <span className="bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">{exam.category}</span>
                 <span className="bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">{exam.level}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{exam.title.ml}</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-3">{exam.title.en}</p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 md:p-10 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><ClipboardListIcon className="h-6 w-6" /></div>
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('examPage.topicPractice')}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Syllabus Breakdown: Subject-Wise Micro Topics</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b dark:border-slate-800">
                    <tr>
                        <th className="px-10 py-6">Micro-Topic (Subject • Part)</th>
                        <th className="px-6 py-6 text-center">Questions</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {syllabus.map((test, index) => {
                        const isLocked = subscriptionStatus === 'free' && index >= 2;
                        return (
                            <tr key={test.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isLocked ? 'opacity-60' : ''}`}>
                                <td className="px-10 py-7">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>{index + 1}</div>
                                        <div>
                                            <p className={`font-black text-base ${isLocked ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                               {test.subject} • {test.topic}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{test.title}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-7 text-center font-black text-slate-600 dark:text-slate-400 text-sm">
                                   {isLocked ? <LockClosedIcon className="h-4 w-4 mx-auto text-slate-400" /> : `${test.questions} Qs`}
                                </td>
                                <td className="px-10 py-7 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button 
                                            onClick={() => handleStudyClick(test)}
                                            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border-2 ${subscriptionStatus === 'pro' ? 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-slate-100 text-slate-400 bg-slate-50 hover:border-indigo-200'}`}
                                        >
                                            <SparklesIcon className="h-3.5 w-3.5" />
                                            <span>AI Notes</span>
                                            {subscriptionStatus !== 'pro' && <LockClosedIcon className="h-3 w-3" />}
                                        </button>
                                        <button 
                                            onClick={() => isLocked ? onNavigateToUpgrade() : onStartTest({ ...test })}
                                            className={`px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-md ${isLocked ? 'bg-slate-800 text-white' : 'btn-vibrant-indigo text-white hover:shadow-indigo-200'}`}
                                        >
                                            {isLocked ? 'Unlock Pro' : 'Start Test'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {loading && syllabus.length === 0 && <div className="p-20 text-center text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Micro-Topics...</div>}
        </div>
      </section>
    </div>
  );
};

export default ExamPage;
