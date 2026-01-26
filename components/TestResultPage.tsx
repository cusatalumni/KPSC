
import React from 'react';
import { TrophyIcon } from './icons/TrophyIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { useTranslation } from '../contexts/LanguageContext';
import AdsenseWidget from './AdsenseWidget';
import type { TestResult } from '../types';

interface TestResultPageProps {
  score: number;
  total: number;
  stats?: {
    correct: number;
    wrong: number;
    skipped: number;
    subjectBreakdown?: Record<string, { correct: number; total: number }>;
  };
  onBackToPrevious: () => void;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ score, total, stats, onBackToPrevious }) => {
  const { t } = useTranslation();
  const percentage = Math.round((score / total) * 100);
  
  const getFeedback = () => {
    if (percentage >= 80) return { message: t('results.feedback.excellent'), color: "text-green-600" };
    if (percentage >= 60) return { message: t('results.feedback.good'), color: "text-indigo-600" };
    if (percentage >= 40) return { message: t('results.feedback.average'), color: "text-yellow-600" };
    return { message: t('results.feedback.poor'), color: "text-red-600" };
  };

  const feedback = getFeedback();

  return (
    <div className="flex flex-col items-center justify-center py-10 max-w-4xl mx-auto px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-full transform transition-all animate-fade-in-up">
        <TrophyIcon className="h-20 w-20 mx-auto text-teal-400" />
        <h1 className="text-3xl font-bold text-slate-800 mt-4">{t('results.title')}</h1>
        
        <div className="my-8">
            <p className="text-xl text-slate-600">{t('results.yourScore')}</p>
            <p className="text-6xl font-bold text-indigo-600 my-2">{score} <span className="text-4xl text-slate-500">/ {total}</span></p>
            <p className={`text-2xl font-semibold ${feedback.color}`}>{feedback.message}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <span className="block text-sm text-green-600 font-bold uppercase tracking-wider">Correct</span>
            <span className="text-2xl font-bold text-green-700">{stats?.correct || 0}</span>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <span className="block text-sm text-red-600 font-bold uppercase tracking-wider">Wrong</span>
            <span className="text-2xl font-bold text-red-700">{stats?.wrong || 0}</span>
          </div>
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <span className="block text-sm text-slate-500 font-bold uppercase tracking-wider">Skipped</span>
            <span className="text-2xl font-bold text-slate-600">{stats?.skipped || 0}</span>
          </div>
        </div>

        {/* Subject Analysis Module */}
        {stats?.subjectBreakdown && Object.keys(stats.subjectBreakdown).length > 0 && (
          <div className="mt-10 text-left">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
              Subject-wise Analysis
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.subjectBreakdown).map(([subject, data]) => {
                const subPercentage = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={subject} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-700">{subject}</span>
                      <span className="text-sm font-bold text-slate-500">{data.correct} / {data.total} ({subPercentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${subPercentage >= 75 ? 'bg-green-500' : subPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${subPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="my-8">
            <AdsenseWidget />
        </div>

        <button 
            onClick={onBackToPrevious}
            className="mt-8 w-full bg-slate-800 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-900 transition-transform transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg"
        >
           <ArrowPathIcon className="h-5 w-5" />
           <span>{t('test.backToPrevious')}</span>
        </button>
      </div>
    </div>
  );
};

export default TestResultPage;
