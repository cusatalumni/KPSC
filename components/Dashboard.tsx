
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
    { id: 'General', title: { ml: 'ജനറൽ പരീക്ഷകൾ', en: 'General Examinations' }, color: 'indigo' },
    { id: 'Technical', title: { ml: 'സാങ്കേതിക പരീക്ഷകൾ', en: 'Technical & Departmental' }, color: 'orange' },
    { id: 'Special', title: { ml: 'പ്രത്യേക മത്സര പരീക്ഷകൾ', en: 'Special Competitive' }, color: 'red' }
  ];

  return (
    <div className="space-y-10">
      <HeroSlider onNavigate={onNavigate} />
      
      <NewsTicker />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {categories.map(cat => {
            const examsInCat = EXAMS_DATA.filter(e => e.category === cat.id);
            if (examsInCat.length === 0) return null;
            
            return (
              <section key={cat.id} className="animate-fade-in-up">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`h-10 w-2 bg-${cat.color}-500 rounded-full shadow-lg`}></div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{cat.title[language]}</h3>
                    <p className="text-sm text-slate-500">{cat.title[language === 'ml' ? 'en' : 'ml']}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {examsInCat.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} onNavigate={onNavigateToExam} language={language} />
                  ))}
                </div>
              </section>
            );
          })}
          
          <NotificationsWidget />
        </div>
        
        <aside className="space-y-8">
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
      
      <div className="my-10">
        <AdsenseWidget />
      </div>
      
      <Testimonials />
    </div>
  );
};

export default Dashboard;
