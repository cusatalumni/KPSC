
import React from 'react';
import { EXAMS_DATA } from '../constants';
import ExamCard from './ExamCard';
import NotificationsWidget from './NotificationsWidget';
import StudyMaterialWidget from './StudyMaterialWidget';
import Testimonials from './Testimonials';
import CalendarWidget from './CalendarWidget';
import QuizHomeWidget from './QuizHomeWidget';
import PscLiveWidget from './PscLiveWidget';
import PreviousPapersWidget from './PreviousPapersWidget';
import CurrentAffairsWidget from './CurrentAffairsWidget';
import GkWidget from './GkWidget';
import NewsTicker from './NewsTicker';
import BookOfTheDayWidget from './BookOfTheDayWidget';
import type { Exam } from '../types';
import type { Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import AdsenseWidget from './AdsenseWidget';
import HeroSlider from './HeroSlider';

interface DashboardProps {
  onNavigateToExam: (exam: Exam) => void;
  onNavigate: (page: Page) => void;
  onStartStudy: (topic: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToExam, onNavigate, onStartStudy }) => {
  const { language } = useTranslation();

  const categories = [
    { 
      id: 'General', 
      title: { ml: 'ജനറൽ പരീക്ഷകൾ', en: 'General Exams' }, 
      theme: 'indigo',
      gradient: 'grad-indigo'
    },
    { 
      id: 'Technical', 
      title: { ml: 'സാങ്കേതിക പരീക്ഷകൾ', en: 'Technical Exams' }, 
      theme: 'amber',
      gradient: 'grad-amber'
    },
    { 
      id: 'Special', 
      title: { ml: 'പ്രത്യേക പരീക്ഷകൾ', en: 'Special Exams' }, 
      theme: 'rose',
      gradient: 'grad-rose'
    }
  ];

  return (
    <div className="space-y-12">
      <HeroSlider onNavigate={onNavigate} />
      
      <NewsTicker />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-16">
          {categories.map(cat => {
            const examsInCat = EXAMS_DATA.filter(e => e.category === cat.id);
            if (examsInCat.length === 0) return null;
            
            return (
              <section key={cat.id} className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-1.5 ${cat.theme === 'indigo' ? 'bg-indigo-600' : cat.theme === 'amber' ? 'bg-amber-600' : 'bg-rose-600'} rounded-full`}></div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{cat.title[language]}</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{cat.title[language === 'ml' ? 'en' : 'ml']}</p>
                    </div>
                  </div>
                  <button onClick={() => onNavigate('sitemap')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">See All →</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {examsInCat.map((exam) => (
                    <ExamCard 
                      key={exam.id} 
                      exam={exam} 
                      onNavigate={onNavigateToExam} 
                      language={language} 
                      theme={cat.theme as any} 
                    />
                  ))}
                </div>
              </section>
            );
          })}
          
          <NotificationsWidget />
        </div>
        
        <aside className="space-y-10">
           <BookOfTheDayWidget />
           <CurrentAffairsWidget onNavigate={() => onNavigate('current_affairs')} />
           <GkWidget onNavigate={() => onNavigate('gk')} />
           <PscLiveWidget onNavigate={() => onNavigate('psc_live_updates')} />
           <PreviousPapersWidget onNavigate={() => onNavigate('previous_papers')} />
           <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
           <CalendarWidget onNavigate={() => onNavigate('exam_calendar')} />
           <StudyMaterialWidget onStartStudy={onStartStudy} />
        </aside>
      </div>
      
      <div className="my-12">
        <AdsenseWidget />
      </div>
      
      <Testimonials />
    </div>
  );
};

export default Dashboard;
