import React, { useState, useEffect } from 'react';
import type { Exam, PracticeTest, Page, ExamPageContent } from '../types';
import { getExamSyllabus } from '../services/pscDataService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { EXAM_CONTENT_MAP } from '../constants';

const ExamPage: React.FC<{ 
    exam: Exam; 
    content: ExamPageContent;
    onBack: () => void; 
    onStartTest: any; 
    onStartStudy: any; 
    onNavigate: any; 
}> = ({ exam, content, onBack, onStartTest, onStartStudy, onNavigate }) => {
  const { t } = useTranslation();
  // Set initial syllabus from content prop (static) to show something immediately
  const [syllabus, setSyllabus] = useState<PracticeTest[]>(content?.practiceTests || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    getExamSyllabus(exam.id).then(data => {
        if (isMounted && data && data.length > 0) {
            setSyllabus(data);
        }
    }).finally(() => {
        if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [exam.id]);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('examPage.backToDashboard')}</span>
      </button>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 mb-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div className="flex items-start space-x-8">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-6 rounded-3xl border dark:border-indigo-900 shadow-inner">{exam.icon}</div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{exam.title.ml}</h1>
              <p className="text-xl text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{exam.title.en}</p>
              <div className="flex items-center space-x-4 mt-6">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">{exam.category}</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">{exam.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center space-x-4 mb-8 border-b dark:border-slate-800 pb-4">
          <ClipboardListIcon className="h-8 w-8 text-indigo-500" />
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('examPage.topicPractice')}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {syllabus.map(test => (
                <div key={test.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-400 transition-all">
                    <div className="flex-1 mr-4">
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg">{test.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{test.questions} {t('questions')} • {test.duration} {t('minutes')}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1 opacity-60">
                            {test.subject && `Subject: ${test.subject}`} {test.topic && ` | Topic: ${test.topic}`}
                        </p>
                    </div>
                    <button onClick={() => onStartTest({ 
                        title: test.title, 
                        questionsCount: test.questions, 
                        subject: test.subject,
                        topic: test.topic 
                    })} className="btn-vibrant-indigo text-white font-black px-6 py-3 rounded-xl shadow-sm flex-shrink-0">{t('start')}</button>
                </div>
            ))}
            {loading && syllabus.length === 0 && <p className="text-slate-400 font-bold col-span-full text-center py-10 animate-pulse">{t('loading')}</p>}
        </div>
      </section>
    </div>
  );
};

export default ExamPage;