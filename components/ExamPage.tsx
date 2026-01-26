
import React, { useState } from 'react';
import type { Exam, ExamPageContent, PracticeTest, Page } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import RecommendedBooks from './RecommendedBooks';
import AdsenseWidget from './AdsenseWidget';
import TestConfigModal from './TestConfigModal';

interface ExamPageProps {
  exam: Exam;
  content: ExamPageContent;
  onBack: () => void;
  onStartTest: (test: { title: string; questions: number; negativeMarking?: number }, examTitle: string) => void;
  onStartStudy: (topic: string) => void;
  onNavigate: (page: Page) => void;
}

const ExamPage: React.FC<ExamPageProps> = ({ exam, content, onBack, onStartTest, onStartStudy, onNavigate }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleStartCustomMock = (config: { questions: number; duration: number; negativeMarking: number }) => {
    setIsConfigOpen(false);
    onStartTest({
      title: 'Full Mock Examination',
      questions: config.questions,
      negativeMarking: config.negativeMarking
    }, exam.title.ml);
  };
  
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-8 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക (Back to Dashboard)</span>
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start space-x-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                {exam.icon}
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{exam.title.ml}</h1>
              <p className="text-xl text-slate-500 font-medium">{exam.title.en}</p>
              <div className="flex items-center space-x-3 mt-3">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{exam.category}</span>
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{exam.level}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="bg-indigo-600 text-white font-black px-10 py-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transform hover:scale-105 transition-all"
          >
            ഫുൾ മോക്ക് ടെസ്റ്റ് (Take Full Mock Test)
          </button>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Subject-Wise Modules */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <ClipboardListIcon className="h-7 w-7 text-indigo-500" />
              <h2 className="text-2xl font-bold text-slate-800">വിഷയങ്ങൾ തിരിച്ചുള്ള പരിശീലനം (Subject-wise Practice)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.practiceTests.map(test => (
                <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center group hover:border-indigo-300 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{test.title}</h3>
                    <p className="text-sm text-slate-500">{test.questions} Qs • {test.duration} mins</p>
                  </div>
                  <button onClick={() => onStartTest(test, exam.title.ml)} className="bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Start
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="my-8">
            <AdsenseWidget />
          </div>

          <RecommendedBooks />
        </div>

        <aside className="space-y-10">
           {/* Study Notes */}
           <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-green-500 mr-3" />
                പഠനക്കുറിപ്പുകൾ (Study Notes)
              </h2>
               <div className="space-y-3">
                 {content.studyNotes.map(note => (
                   <button key={note.id} onClick={() => onStartStudy(note.title)} className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 group text-left transition-all">
                      <span className="text-slate-700 font-bold group-hover:text-indigo-600">{note.title}</span>
                      <span className="ml-auto text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">→</span>
                   </button>
                 ))}
               </div>
            </section>

            {/* Previous Papers */}
            <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <DocumentDuplicateIcon className="h-6 w-6 text-yellow-500 mr-3" />
                മുൻവർഷ ചോദ്യങ്ങൾ (Previous Papers)
              </h2>
               <div className="space-y-3">
                 {content.previousPapers.map(paper => (
                   <button key={paper.id} onClick={() => onNavigate('previous_papers')} className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 group text-left transition-all">
                      <span className="text-slate-700 font-bold group-hover:text-indigo-600">{paper.title}</span>
                      <span className="ml-auto text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">→</span>
                   </button>
                 ))}
               </div>
            </section>
        </aside>
      </div>

      <TestConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfirm={handleStartCustomMock}
        title={`${exam.title.ml} - Custom Mock Test`}
      />
    </div>
  );
};

export default ExamPage;
