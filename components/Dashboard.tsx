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

  return (
    <div className="space-y-8">
      <HeroSlider onNavigate={onNavigate} />
      
      <NewsTicker />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-slate-700 mb-6">{t('dashboard.topCourses')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {EXAMS_DATA.map((exam) => (
                <ExamCard key={exam.id} exam={exam} onNavigate={onNavigateToExam} language={language} />
              ))}
            </div>
          </section>
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