import React, { useState } from 'react';
import { SEPTEMBER_EXAMS_DATA, OCTOBER_EXAMS_DATA } from '../../constants';
import type { ExamCalendarEntry } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const ExamCalendarTable: React.FC<{ data: ExamCalendarEntry[] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200">
            <thead className="bg-slate-100">
                <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 uppercase">ക്രമ. നം.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 uppercase">കാറ്റഗറി നം.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 uppercase">തസ്തികയുടെ പേര്</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 uppercase">വകുപ്പ്</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 uppercase">പരീക്ഷാ തീയതി</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 uppercase">സിലബസ്</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {data.map(item => (
                    <tr key={item.slNo} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-sm text-slate-700">{item.slNo}</td>
                        <td className="px-4 py-4 text-sm text-slate-700 font-mono">{item.catNo}</td>
                        <td className="px-4 py-4 text-sm text-slate-800 font-semibold">{item.postName}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{item.department}</td>
                        <td className="px-4 py-4 text-sm text-slate-700 whitespace-nowrap">{item.examDate}</td>
                        <td className="px-4 py-4 text-sm">
                            <a href={item.syllabusLink} target="_blank" rel="noopener noreferrer" className={`font-semibold ${item.syllabusLink === '#' ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:underline'}`}>
                                കാണുക
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const ExamCalendarPage: React.FC<PageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'september' | 'october'>('october');

  const getTabClass = (tabName: 'september' | 'october') => {
    return activeTab === tabName
      ? 'bg-indigo-600 text-white'
      : 'bg-white text-slate-600 hover:bg-slate-100';
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">
          പരീക്ഷാ കലണ്ടർ 2025
          <span className="block text-2xl text-slate-500 mt-1 font-normal">Exam Calendar 2025</span>
        </h1>
        <p className="text-lg text-slate-600 mt-2">കേരള PSC പ്രസിദ്ധീകരിച്ച ഔദ്യോഗിക പരീക്ഷാ തീയതികൾ</p>
      </header>
      
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
        <div className="flex justify-center border-b border-slate-200 mb-4">
            <div className="bg-slate-200 p-1 rounded-lg flex space-x-1">
                <button 
                    onClick={() => setActiveTab('october')}
                    className={`px-6 py-2 font-semibold rounded-md transition-colors duration-300 ${getTabClass('october')}`}
                >
                    ഒക്ടോബർ
                </button>
                <button 
                    onClick={() => setActiveTab('september')}
                    className={`px-6 py-2 font-semibold rounded-md transition-colors duration-300 ${getTabClass('september')}`}
                >
                    സെപ്റ്റംബർ
                </button>
            </div>
        </div>

        <div>
            {activeTab === 'october' && <ExamCalendarTable data={OCTOBER_EXAMS_DATA} />}
            {activeTab === 'september' && <ExamCalendarTable data={SEPTEMBER_EXAMS_DATA} />}
        </div>
      </div>
    </div>
  );
};

export default ExamCalendarPage;