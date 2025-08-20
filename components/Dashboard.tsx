
import React from 'react';
import { EXAMS_DATA } from '../constants';
import ExamCard from './ExamCard';
import QuizWidget from './QuizWidget';
import NotificationsWidget from './NotificationsWidget';
import StudyMaterialWidget from './StudyMaterialWidget';
import Testimonials from './Testimonials';
import CalendarWidget from './CalendarWidget';
import type { Exam } from '../types';
import type { Page } from '../App';

interface DashboardProps {
  onNavigateToExam: (exam: Exam) => void;
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToExam, onNavigate }) => {
  return (
    <div className="space-y-12">
      <section className="text-center bg-blue-50 py-12 px-6 rounded-xl">
        <h2 className="text-4xl font-bold text-blue-800 mb-2">PSC പരീക്ഷകൾക്ക് തയ്യാറെടുക്കാൻ ഒരു പുതിയ വഴി</h2>
        <p className="text-lg text-blue-700 max-w-2xl mx-auto">നിങ്ങളുടെ സർക്കാർ ജോലി സ്വപ്നം, ഞങ്ങളുടെ വഴികാട്ടി.</p>
         <button className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out">
            പഠനം ആരംഭിക്കുക
          </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">പ്രധാന കോഴ്സുകൾ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {EXAMS_DATA.map((exam) => (
                <ExamCard key={exam.id} exam={exam} onNavigate={onNavigateToExam} />
              ))}
            </div>
          </section>
          <NotificationsWidget />
        </div>
        <div className="space-y-8">
           <CalendarWidget onNavigate={() => onNavigate('exam_calendar')} />
           <QuizWidget />
           <StudyMaterialWidget />
        </div>
      </div>
      <Testimonials />
    </div>
  );
};

export default Dashboard;
