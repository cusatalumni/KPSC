
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
import { SparklesIcon } from './icons/SparklesIcon';
import AiDisclaimer from './AiDisclaimer';

interface TestResultPageProps {
  score: number;
  total: number;
  stats?: { correct: number; wrong: number; skipped: number; };
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
    saveTestResult({ userId: user?.id, userEmail: user?.primaryEmailAddress?.emailAddress, testTitle, score, total });
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
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-center w-full animate-fade-in-up border border-slate-100 dark:border-slate-800">
        <TrophyIcon className="h-20 w-20 mx-auto text-teal-400" />
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mt-4">{t('results.title')}</h1>
        
        <div className="my-8">
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('results.yourScore')}</p>
            <p className="text-7xl font-black text-indigo-600 dark:text-indigo-400 my-2">{score} <span className="text-4xl text-slate-400">/ {total}</span></p>
            <p className={`text-2xl font-black ${feedback.color}`}>{feedback.message}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
            <span className="block text-[10px] text-green-600 font-black uppercase tracking-widest">Correct</span>
            <span className="text-3xl font-black text-green-700 dark:text-green-300">{stats?.correct || 0}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
            <span className="block text-[10px] text-red-600 font-black uppercase tracking-widest">Wrong</span>
            <span className="text-3xl font-black text-red-700 dark:text-red-300">{stats?.wrong || 0}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200">
            <span className="block text-[10px] text-slate-500 font-black uppercase tracking-widest">Skipped</span>
            <span className="text-3xl font-black text-slate-600 dark:text-slate-300">{stats?.skipped || 0}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setShowReview(!showReview)} className="flex-1 bg-white text-indigo-600 border-2 border-indigo-100 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg">{showReview ? 'Hide Review' : 'Review Answers'}</button>
            <button onClick={onBackToPrevious} className="flex-1 bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center space-x-2 shadow-xl"><ArrowPathIcon className="h-5 w-5" /><span>{t('test.backToPrevious')}</span></button>
        </div>
      </div>

      {showReview && questions && (
          <div className="w-full space-y-6 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Detailed Review</h2>
                  <AiDisclaimer variant="minimal" />
              </div>
              <div className="space-y-4">
                  {questions.map((q, idx) => {
                      const userAns = answers[idx];
                      let correctIdx = Number(q.correctAnswerIndex);
                      if (correctIdx === 0) correctIdx = 1;
                      const isCorrect = userAns !== undefined && (Number(userAns) + 1) === correctIdx;
                      const isSkipped = userAns === undefined;

                      return (
                          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg">
                              <div className="flex items-start space-x-4">
                                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-sm ${isCorrect ? 'bg-green-100 text-green-600' : isSkipped ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}`}>{idx + 1}</div>
                                  <div className="flex-1">
                                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-4">{q.question}</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {q.options.map((opt, optIdx) => {
                                              const isThisCorrect = (Number(optIdx) + 1) === correctIdx;
                                              const isThisUserSelection = userAns !== undefined && Number(optIdx) === Number(userAns);
                                              let bClass = "border-slate-100 dark:border-slate-800";
                                              if (isThisCorrect) bClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold";
                                              else if (isThisUserSelection) bClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-bold";
                                              return (
                                                  <div key={optIdx} className={`p-3 rounded-xl border-2 flex items-center justify-between ${bClass}`}>
                                                      <span className="text-sm leading-tight">{opt}</span>
                                                      {isThisCorrect && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                                                      {isThisUserSelection && !isThisCorrect && <XCircleIcon className="h-4 w-4 text-red-500" />}
                                                  </div>
                                              );
                                          })}
                                      </div>
                                      {q.explanation && (
                                          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start space-x-3">
                                              <SparklesIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                              <div>
                                                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">AI Explanation</p>
                                                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{q.explanation}</p>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}
      <div className="w-full"><AdsenseWidget /></div>
    </div>
  );
};

export default TestResultPage;
