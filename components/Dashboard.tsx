
import React, { useState, useEffect, useMemo } from 'react';
import ExamCard from './ExamCard';
import { getDetectedExams, getExams } from '../services/pscDataService';
import type { Exam, Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import NewsTicker from './NewsTicker';
import HeroSlider from './HeroSlider';

const Dashboard: React.FC<{ onNavigateToExam: (exam: Exam) => void; onNavigate: (page: Page) => void; onStartStudy: (topic: string) => void; }> = ({ onNavigateToExam, onNavigate, onStartStudy }) => {
  const { language } = useTranslation();
  const [detectedExams, setDetectedExams] = useState<Exam[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);

  useEffect(() => {
    getDetectedExams().then(setDetectedExams).catch(console.error);
    getExams().then(setAllExams).catch(console.error);
  }, []);

  const categories = [
    { id: 'Live', title: { ml: 'പുതിയ വിജ്ഞാപനങ്ങൾ', en: 'Live Recruitment' }, theme: 'rose' },
    { id: 'General', title: { ml: 'ജനറൽ പരീക്ഷകൾ', en: 'General Exams' }, theme: 'indigo' },
    { id: 'Technical', title: { ml: 'സാങ്കേതിക പരീക്ഷകൾ', en: 'Technical Exams' }, theme: 'amber' },
    { id: 'Special', title: { ml: 'പ്രത്യേക പരീക്ഷകൾ', en: 'Special Exams' }, theme: 'rose' }
  ];

  // Group exams by category, putting unknown categories into 'General'
  const groupedExams = useMemo(() => {
    const groups: Record<string, Exam[]> = { Live: detectedExams };
    allExams.forEach(exam => {
        const cat = exam.category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(exam);
    });
    return groups;
  }, [detectedExams, allExams]);

  return (
    <div className="space-y-12">
      <HeroSlider onNavigate={onNavigate} />
      <NewsTicker />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-3 space-y-16">
          {categories.map(cat => {
            const list = groupedExams[cat.id] || [];
            if (list.length === 0) return null;
            return (
              <section key={cat.id} className="animate-fade-in-up">
                <div className="flex items-center space-x-4 mb-8 border-b pb-4">
                  <div className={`h-8 w-1.5 ${cat.theme === 'indigo' ? 'bg-indigo-600' : cat.theme === 'amber' ? 'bg-amber-600' : 'bg-rose-600'} rounded-full`}></div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{cat.title[language]}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {list.map(exam => <ExamCard key={exam.id} exam={exam} onNavigate={onNavigateToExam} language={language} theme={cat.theme as any} />)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
