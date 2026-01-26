
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
  const { t, language } = useTranslation();

  const categories = [
    { id: 'General', title: 'പൊതു പരീക്ഷകൾ (General Exams)' },
    { id: 'Technical', title: 'സാങ്കേതിക പരീക്ഷകൾ (Technical)' },
    { id: 'Special', title: 'പ്രത്യേക പരീക്ഷകൾ (Special Competitive)' }
  ];

  return (
    <div className="space-y-8">
      <HeroSlider onNavigate={onNavigate} />
      
      <NewsTicker />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {categories.map(cat => {
            const examsInCat = EXAMS_DATA.filter(e => e.category === cat.id);
            if (examsInCat.length === 0) return null;
            
            return (
              <section key={cat.id}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{cat.title}</h3>
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
      
      <div className="my-8">
        <AdsenseWidget />
      </div>
      
      <Testimonials />
    </div>
  );
};

export default Dashboard;
