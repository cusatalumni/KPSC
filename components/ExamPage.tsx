
import React from 'react';
import type { Exam, ExamPageContent, PracticeTest } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import RecommendedBooks from './RecommendedBooks';

interface ExamPageProps {
  exam: Exam;
  content: ExamPageContent;
  onBack: () => void;
  onStartTest: (test: PracticeTest | { title: string; questions: number }, examTitle: string) => void;
}

const ExamPage: React.FC<ExamPageProps> = ({ exam, content, onBack, onStartTest }) => {
  
  const handleStartFullMockTest = () => {
    // Let's assume a full mock test has 50 questions
    onStartTest({ title: 'പൂർണ്ണമായ മോക്ക് ടെസ്റ്റ്', questions: 50 }, exam.title.ml);
  };
  
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">{exam.title.ml}</h1>
        <p className="text-2xl text-slate-500">{exam.title.en}</p>
        <p className="text-lg text-slate-600 mt-2">{exam.description.ml}</p>
      </header>

      <div className="space-y-10">
        
        {/* Practice Tests */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 flex items-center">
            <ClipboardListIcon className="h-7 w-7 text-indigo-500 mr-3" />
            പരിശീലന പരീക്ഷകൾ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.practiceTests.map(test => (
              <div key={test.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{test.title}</h3>
                  <p className="text-sm text-slate-500">{test.questions} ചോദ്യങ്ങൾ • {test.duration} മിനിറ്റ്</p>
                </div>
                <button onClick={() => onStartTest(test, exam.title.ml)} className="bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-md hover:bg-indigo-200 transition">
                  തുടങ്ങുക
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Full Mock Test CTA */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-xl text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-2">പൂർണ്ണമായ മോക്ക് ടെസ്റ്റ് എടുക്കുക</h2>
            <p className="mb-6">യഥാർത്ഥ പരീക്ഷയുടെ അതേ മാതൃകയിൽ നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കുക.</p>
            <button onClick={handleStartFullMockTest} className="bg-teal-500 text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-teal-600 transform hover:scale-105 transition duration-300">
                മോക്ക് ടെസ്റ്റ് ആരംഭിക്കുക
            </button>
        </section>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Study Notes */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4 flex items-center">
                <DocumentTextIcon className="h-7 w-7 text-green-500 mr-3" />
                പഠന സാമഗ്രികൾ
              </h2>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3">
                 {content.studyNotes.map(note => (
                   <a key={note.id} href={note.link} className="flex items-center p-2 rounded hover:bg-slate-50 group">
                      <span className="text-slate-700 font-medium group-hover:text-indigo-600">{note.title}</span>
                      <span className="ml-auto text-indigo-500 opacity-0 group-hover:opacity-100 transition">→</span>
                   </a>
                 ))}
               </div>
            </section>

            {/* Previous Year Papers */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4 flex items-center">
                <DocumentDuplicateIcon className="h-7 w-7 text-yellow-500 mr-3" />
                മുൻവർഷത്തെ ചോദ്യപേപ്പറുകൾ
              </h2>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3">
                 {content.previousPapers.map(paper => (
                   <a key={paper.id} href={paper.link} className="flex items-center p-2 rounded hover:bg-slate-50 group">
                      <span className="text-slate-700 font-medium group-hover:text-indigo-600">{paper.title}</span>
                      <span className="ml-auto text-indigo-500 opacity-0 group-hover:opacity-100 transition">→</span>
                   </a>
                 ))}
               </div>
            </section>
        </div>
        
        <RecommendedBooks />

      </div>
    </div>
  );
};

export default ExamPage;