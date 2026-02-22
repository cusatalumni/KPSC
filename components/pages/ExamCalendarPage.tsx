
import React, { useState } from 'react';
import { MARCH_EXAMS_DATA, APRIL_EXAMS_DATA } from '../../constants';
import type { ExamCalendarEntry } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const ExamCalendarTable: React.FC<{ data: ExamCalendarEntry[] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                    <th className="px-4 py-3 text-left text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">ക്രമ. നം.</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">കാറ്റഗറി നം.</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">തസ്തികയുടെ പേര്</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">വകുപ്പ്</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">പരീക്ഷാ തീയതി</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">സിലബസ്</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.map(item => (
                    <tr key={item.slNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 font-bold">{item.slNo}</td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 font-mono">{item.catNo}</td>
                        <td className="px-4 py-4 text-sm text-slate-800 dark:text-slate-100 font-black">{item.postName}</td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-400 font-bold">{item.department}</td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap font-bold">{item.examDate}</td>
                        <td className="px-4 py-4 text-sm">
                            <a href={item.syllabusLink} target="_blank" rel="noopener noreferrer" className={`font-black uppercase text-xs ${item.syllabusLink === '#' ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:underline'}`}>
                                {item.syllabusLink === '#' ? 'NA' : 'കാണുക'}
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const ExamCalendarPage: React.FC<PageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'march' | 'april'>('march');

  const getTabClass = (tabName: 'march' | 'april') => {
    return activeTab === tabName
      ? 'bg-indigo-600 text-white shadow-lg scale-105'
      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50';
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>

      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
          പരീക്ഷാ കലണ്ടർ 2026
          <span className="block text-xl text-slate-500 mt-2 font-bold uppercase tracking-widest">Official PSC Exam Schedule</span>
        </h1>
        <p className="text-lg text-slate-400 mt-4 font-medium">കേരള PSC പ്രസിദ്ധീകരിച്ച ഏറ്റവും പുതിയ പരീക്ഷാ തീയതികൾ</p>
      </header>
      
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex justify-center mb-10">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl flex space-x-2 shadow-inner">
                <button 
                    onClick={() => setActiveTab('march')}
                    className={`px-10 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 ${getTabClass('march')}`}
                >
                    മാർച്ച് 2026
                </button>
                <button 
                    onClick={() => setActiveTab('april')}
                    className={`px-10 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 ${getTabClass('april')}`}
                >
                    ഏപ്രിൽ 2026
                </button>
            </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {activeTab === 'march' && <ExamCalendarTable data={MARCH_EXAMS_DATA} />}
            {activeTab === 'april' && <ExamCalendarTable data={APRIL_EXAMS_DATA} />}
        </div>
        
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">ശ്രദ്ധിക്കുക: പരീക്ഷാ തീയതികളിൽ മാറ്റം വരാൻ സാധ്യതയുണ്ട്. കൃത്യമായ വിവരങ്ങൾക്ക് ഔദ്യോഗിക വെബ്സൈറ്റ് സന്ദർശിക്കുക.</p>
        </div>
      </div>
    </div>
  );
};

export default ExamCalendarPage;
