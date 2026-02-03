
import React, { useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { TrophyIcon } from './icons/TrophyIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { useTranslation } from '../contexts/LanguageContext';
import AdsenseWidget from './AdsenseWidget';
import { saveTestResult } from '../services/pscDataService';

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
  testTitle?: string;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ score, total, stats, onBackToPrevious, testTitle = "General Test" }) => {
  const { t } = useTranslation();
  const { isSignedIn, user } = useUser();
  const percentage = Math.round((score / total) * 100);
  
  useEffect(() => {
    // Auto-save result to sheet
    const saveResultToSheet = async () => {
        try {
            await saveTestResult({
                userId: user?.id,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                testTitle,
                score,
                total
            });
        } catch (e) {
            console.error("Failed to save result to Google Sheets:", e);
        }
    };
    saveResultToSheet();
  }, [user, score, total, testTitle]);

  const getFeedback = () => {
    if (percentage >= 80) return { message: t('results.feedback.excellent'), color: "text-green-600" };
    if (percentage >= 60) return { message: t('results.feedback.good'), color: "text-indigo-600" };
    if (percentage >= 40) return { message: t('results.feedback.average'), color: "text-yellow-600" };
    return { message: t('results.feedback.poor'), color: "text-red-600" };
  };

  const feedback = getFeedback();

  return (
    <div className="flex flex-col items-center justify-center py-10 max-w-4xl mx-auto px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl text-center w-full transform transition-all animate-fade-in-up border border-slate-100 dark:border-slate-800">
        <TrophyIcon className="h-20 w-20 mx-auto text-teal-400" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">{t('results.title')}</h1>
        
        {!isSignedIn && (
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
             <p className="text-indigo-900 dark:text-indigo-300 font-bold mb-4">{t('results.saveProgress')}</p>
             <SignInButton mode="modal">
               <button className="bg-indigo-600 text-white font-black px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  {t('login')}
               </button>
             </SignInButton>
          </div>
        )}

        <div className="my-8">
            <p className="text-xl text-slate-600 dark:text-slate-400">{t('results.yourScore')}</p>
            <p className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 my-2">{score} <span className="text-4xl text-slate-500">/ {total}</span></p>
            <p className={`text-2xl font-semibold ${feedback.color}`}>{feedback.message}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
            <span className="block text-sm text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Correct</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.correct || 0}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <span className="block text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Wrong</span>
            <span className="text-2xl font-bold text-red-700 dark:text-red-300">{stats?.wrong || 0}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="block text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Skipped</span>
            <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">{stats?.skipped || 0}</span>
          </div>
        </div>

        <div className="my-8">
            <AdsenseWidget />
        </div>

        <button 
            onClick={onBackToPrevious}
            className="mt-8 w-full bg-slate-800 dark:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-transform transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg"
        >
           <ArrowPathIcon className="h-5 w-5" />
           <span>{t('test.backToPrevious')}</span>
        </button>
      </div>
    </div>
  );
};

export default TestResultPage;
