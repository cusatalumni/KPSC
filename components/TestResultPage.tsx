
import React, { useEffect, useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { TrophyIcon } from './icons/TrophyIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { useTranslation } from '../contexts/LanguageContext';
import AdsenseWidget from './AdsenseWidget';
import { saveTestResult } from '../services/pscDataService';
import type { QuizQuestion, UserAnswers } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface TestResultPageProps {
  score: number;
  total: number;
  stats?: {
    correct: number;
    wrong: number;
    skipped: number;
    subjectBreakdown?: Record<string, { correct: number; total: number }>;
  };
  questions?: QuizQuestion[];
  answers?: UserAnswers;
  onBackToPrevious: () => void;
  testTitle?: string;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ score, total, stats, questions, answers = {}, onBackToPrevious, testTitle = "General Test" }) => {
  const { t } = useTranslation();
  const { isSignedIn, user } = useUser();
  const [showReview, setShowReview] = useState(false);
  const percentage = Math.round((score / total) * 100);
  
  useEffect(() => {
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
    <div className="flex flex-col items-center justify-center py-6 max-w-4xl mx-auto px-4 space-y-8">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-center w-full transform transition-all animate-fade-in-up border border-slate-100 dark:border-slate-800">
        <TrophyIcon className="h-20 w-20 mx-auto text-teal-400" />
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mt-4">{t('results.title')}</h1>
        
        {!isSignedIn && (
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/50">
             <p className="text-indigo-900 dark:text-indigo-300 font-bold mb-4">{t('results.saveProgress')}</p>
             <SignInButton mode="modal">
               <button className="bg-indigo-600 text-white font-black px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  {t('login')}
               </button>
             </SignInButton>
          </div>
        )}

        <div className="my-8">
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('results.yourScore')}</p>
            <p className="text-7xl font-black text-indigo-600 dark:text-indigo-400 my-2">{score} <span className="text-4xl text-slate-400">/ {total}</span></p>
            <p className={`text-2xl font-black ${feedback.color}`}>{feedback.message}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
            <span className="block text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest mb-1">Correct</span>
            <span className="text-3xl font-black text-green-700 dark:text-green-300">{stats?.correct || 0}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
            <span className="block text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest mb-1">Wrong</span>
            <span className="text-3xl font-black text-red-700 dark:text-red-300">{stats?.wrong || 0}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Skipped</span>
            <span className="text-3xl font-black text-slate-600 dark:text-slate-300">{stats?.skipped || 0}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => setShowReview(!showReview)}
                className="flex-1 bg-white text-indigo-600 border-2 border-indigo-100 font-black py-4 px-6 rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
               <span>{showReview ? 'Hide Review' : 'Review Answers'}</span>
            </button>
            <button 
                onClick={onBackToPrevious}
                className="flex-1 bg-slate-800 dark:bg-slate-700 text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all flex items-center justify-center space-x-2 shadow-xl"
            >
               <ArrowPathIcon className="h-5 w-5" />
               <span>{t('test.backToPrevious')}</span>
            </button>
        </div>
      </div>

      {showReview && questions && (
          <div className="w-full space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Detailed Review</h2>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{questions.length} Questions</span>
              </div>
              <div className="space-y-4">
                  {questions.map((q, idx) => {
                      const userAns = answers[idx];
                      const isCorrect = userAns === q.correctAnswerIndex;
                      const isSkipped = userAns === undefined;

                      return (
                          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg">
                              <div className="flex items-start space-x-4">
                                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-sm ${isCorrect ? 'bg-green-100 text-green-600' : isSkipped ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}`}>
                                      {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-4 leading-relaxed">{q.question}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {q.options.map((opt, optIdx) => {
                                              const isThisCorrect = optIdx === q.correctAnswerIndex;
                                              const isThisUserSelection = optIdx === userAns;
                                              
                                              let borderClass = "border-slate-100 dark:border-slate-800";
                                              let bgClass = "bg-slate-50/50 dark:bg-slate-800/30";
                                              let textClass = "text-slate-600 dark:text-slate-400";

                                              if (isThisCorrect) {
                                                  borderClass = "border-green-500 bg-green-50 dark:bg-green-900/20";
                                                  textClass = "text-green-700 dark:text-green-300 font-bold";
                                              } else if (isThisUserSelection && !isThisCorrect) {
                                                  borderClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
                                                  textClass = "text-red-700 dark:text-red-300 font-bold";
                                              }

                                              return (
                                                  <div key={optIdx} className={`p-3 rounded-xl border-2 flex items-center justify-between ${borderClass} ${bgClass} ${textClass}`}>
                                                      <span className="text-sm leading-tight">{opt}</span>
                                                      {isThisCorrect && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                                                      {isThisUserSelection && !isThisCorrect && <XCircleIcon className="h-4 w-4 text-red-500" />}
                                                  </div>
                                              );
                                          })}
                                      </div>
                                      
                                      {!isSkipped && !isCorrect && (
                                          <p className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg inline-block">
                                              Your Answer: {q.options[userAns]}
                                          </p>
                                      )}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      <div className="w-full">
          <AdsenseWidget />
      </div>
    </div>
  );
};

export default TestResultPage;
