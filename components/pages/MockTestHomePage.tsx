
import React from 'react';
import { MOCK_TESTS_DATA, EXAMS_DATA } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { DocumentChartBarIcon } from '../icons/DocumentChartBarIcon';
import type { MockTest } from '../../types';

interface MockTestCardProps {
  test: MockTest;
  onStart: (test: MockTest, examTitle: string) => void;
}

const MockTestCard: React.FC<MockTestCardProps> = ({ test, onStart }) => {
  const exam = EXAMS_DATA.find(e => e.id === test.examId);
  const examTitle = exam ? exam.title : 'Mock Test';
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border border-slate-200">
      <div>
        <div className="flex items-start space-x-4 mb-4">
          <div className="bg-slate-100 p-3 rounded-full">
             {exam?.icon || <DocumentChartBarIcon className="h-8 w-8 text-slate-500" />}
          </div>
          <div>
              <h4 className="text-xl font-bold text-slate-800">{test.title}</h4>
              <p className="text-sm text-slate-500">{examTitle}</p>
          </div>
        </div>
        <p className="text-slate-600 mt-1">{test.description}</p>
      </div>
      <div className="mt-6 border-t border-slate-200 pt-4 flex justify-between items-center text-sm text-slate-500">
         <span>{test.questionsCount} ചോദ്യങ്ങൾ</span>
         <span>{test.duration} മിനിറ്റ്</span>
         <button 
            onClick={() => onStart(test, examTitle)}
            className="text-center bg-amber-400 text-amber-900 font-bold px-4 py-2 rounded-lg hover:bg-amber-500 transition duration-200"
         >
            തുടങ്ങുക
          </button>
      </div>
    </div>
  );
};

interface PageProps {
  onBack: () => void;
  onStartTest: (test: MockTest, examTitle: string) => void;
}

const MockTestHomePage: React.FC<PageProps> = ({ onBack, onStartTest }) => {
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-sky-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <header className="mb-8 text-center">
        <DocumentChartBarIcon className="h-16 w-16 mx-auto text-slate-400" />
        <h1 className="text-4xl font-bold text-slate-800 mt-4">മോക്ക് ടെസ്റ്റുകൾ</h1>
        <p className="text-lg text-slate-600 mt-2">യഥാർത്ഥ പരീക്ഷയ്ക്ക് മുൻപ് നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കാൻ ഏറ്റവും മികച്ച അവസരം.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TESTS_DATA.map((test) => (
          <MockTestCard key={test.id} test={test} onStart={onStartTest} />
        ))}
      </div>
    </div>
  );
};

export default MockTestHomePage;