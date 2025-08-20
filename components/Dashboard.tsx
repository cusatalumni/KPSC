
import React from 'react';
import { EXAMS_DATA } from '../constants';
import ExamCard from './ExamCard';
import NotificationsWidget from './NotificationsWidget';
import StudyMaterialWidget from './StudyMaterialWidget';
import Testimonials from './Testimonials';
import CalendarWidget from './CalendarWidget';
import QuizHomeWidget from './QuizHomeWidget';
import type { Exam } from '../types';
import type { Page } from '../App';

interface DashboardProps {
  onNavigateToExam: (exam: Exam) => void;
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToExam, onNavigate }) => {
  return (
    <div className="space-y-12">
      <section className="text-center bg-gradient-to-br from-slate-50 to-indigo-100 py-16 px-6 rounded-2xl shadow-sm">
        <h2 className="text-4xl font-bold text-slate-800 mb-3">PSC പരീക്ഷകൾക്ക് തയ്യാറെടുക്കാൻ ഒരു പുതിയ വഴി</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">നിങ്ങളുടെ സർക്കാർ ജോലി സ്വപ്നം, ഞങ്ങളുടെ വഴികാട്ടി ഉപയോഗിച്ച് സാക്ഷാത്കരിക്കൂ.</p>
         <button 
            onClick={() => onNavigate('mock_test_home')}
            className="mt-8 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out text-lg"
        >
            മോക്ക് ടെസ്റ്റുകൾ പരിശീലിക്കൂ
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-slate-700 mb-6">പ്രധാന കോഴ്സുകൾ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {EXAMS_DATA.map((exam) => (
                <ExamCard key={exam.id} exam={exam} onNavigate={onNavigateToExam} />
              ))}
            </div>
          </section>
          <NotificationsWidget />
        </div>
        <aside className="space-y-8">
           <QuizHomeWidget onNavigate={() => onNavigate('quiz_home')} />
           <CalendarWidget onNavigate={() => onNavigate('exam_calendar')} />
           <StudyMaterialWidget />
        </aside>
      </div>
      <Testimonials />
    </div>
  );
};

export default Dashboard;
