
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
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക (Back to Dashboard)</span>
      </button>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-[0.03] rounded-full -mr-32 -mt-32"></div>
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 relative z-10">
          <div className="flex items-start space-x-8">
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-inner flex-shrink-0">
                {exam.icon}
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-2">{exam.title.ml}</h1>
              <p className="text-xl text-slate-400 font-bold uppercase tracking-widest text-xs">{exam.title.en}</p>
              <div className="flex items-center space-x-4 mt-6">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-indigo-100 uppercase tracking-widest">{exam.category}</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-emerald-100 uppercase tracking-widest">{exam.level}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="btn-vibrant-indigo text-white font-black px-12 py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 text-lg"
          >
            ഫുൾ മോക്ക് ടെസ്റ്റ് (Take Full Mock)
          </button>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          {/* Subject-Wise Modules */}
          <section>
            <div className="flex items-center space-x-4 mb-8 border-b border-slate-100 pb-4">
              <ClipboardListIcon className="h-8 w-8 text-indigo-500" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">വിഷയങ്ങൾ തിരിച്ചുള്ള പരിശീലനം</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {content.practiceTests.map(test => (
                <div key={test.id} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex justify-between items-center group hover:border-indigo-400 transition-all hover:shadow-2xl">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{test.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{test.questions} Qs • {test.duration} mins</p>
                  </div>
                  <button onClick={() => onStartTest(test, exam.title.ml)} className="bg-slate-50 text-slate-400 font-black px-6 py-3 rounded-xl group-hover:btn-vibrant-indigo group-hover:text-white transition-all shadow-sm">
                    Start
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="my-10">
            <AdsenseWidget />
          </div>

          <RecommendedBooks />
        </div>

        <aside className="space-y-12">
           {/* Study Notes */}
           <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 glass-card">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center border-b border-slate-50 pb-4">
                <DocumentTextIcon className="h-6 w-6 text-emerald-500 mr-4" />
                പഠനക്കുറിപ്പുകൾ (Notes)
              </h2>
               <div className="space-y-4">
                 {content.studyNotes.map(note => (
                   <button key={note.id} onClick={() => onStartStudy(note.title)} className="w-full flex items-center p-4 rounded-2xl hover:bg-emerald-50 border border-slate-50 group text-left transition-all">
                      <span className="text-slate-700 font-bold group-hover:text-emerald-700">{note.title}</span>
                      <span className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">→</span>
                   </button>
                 ))}
               </div>
            </section>

            {/* Previous Papers */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 glass-card">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center border-b border-slate-50 pb-4">
                <DocumentDuplicateIcon className="h-6 w-6 text-amber-500 mr-4" />
                മുൻവർഷ ചോദ്യങ്ങൾ
              </h2>
               <div className="space-y-4">
                 {content.previousPapers.map(paper => (
                   <button key={paper.id} onClick={() => onNavigate('previous_papers')} className="w-full flex items-center p-4 rounded-2xl hover:bg-amber-50 border border-slate-50 group text-left transition-all">
                      <span className="text-slate-700 font-bold group-hover:text-amber-700">{paper.title}</span>
                      <span className="ml-auto text-amber-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">→</span>
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
