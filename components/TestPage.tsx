
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { QuizQuestion, UserAnswers, SubscriptionStatus, ActiveTest } from '../types';
import { getQuestionsForTest } from '../services/pscDataService';
import Modal from './Modal';
import { ClockIcon } from './icons/ClockIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface TestPageProps {
  activeTest: ActiveTest;
  subscriptionStatus: SubscriptionStatus;
  onTestComplete: (score: number, total: number, stats?: any) => void;
  onBack: () => void;
  onNavigateToUpgrade: () => void;
}

const TestPage: React.FC<TestPageProps> = ({ activeTest, subscriptionStatus, onTestComplete, onBack, onNavigateToUpgrade }) => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(activeTest.questionsCount * 60);

  const handleSubmit = useCallback(() => {
    let score = 0;
    let correct = 0;
    let wrong = 0;
    const neg = activeTest.negativeMarking || 0.33;

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected !== undefined) {
        if (selected === q.correctAnswerIndex) {
          correct++;
          score += 1;
        } else {
          wrong++;
          score -= neg;
        }
      }
    });

    onTestComplete(parseFloat(score.toFixed(2)), questions.length, { correct, wrong, skipped: questions.length - (correct + wrong) });
  }, [questions, answers, onTestComplete, activeTest]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit]);

  useEffect(() => {
    getQuestionsForTest(activeTest.topic, activeTest.questionsCount)
      .then(data => {
        setQuestions(data);
        setLoading(false);
      });
  }, [activeTest]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black">AI LOADING QUESTIONS...</div>;
  if (!questions.length) return <div className="h-screen flex flex-col items-center justify-center p-10"><p className="mb-4">No questions found for this topic.</p><button onClick={onBack} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Back</button></div>;

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border dark:border-slate-800">
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl">{currentIndex + 1}</div>
            <h2 className="text-xl font-black dark:text-white">{activeTest.title}</h2>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl flex items-center space-x-2 font-mono font-bold dark:text-white">
            <ClockIcon className="h-5 w-5" />
            <span>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
          </div>
        </div>

        <h1 className="text-2xl font-black mb-8 dark:text-white leading-tight">{q.question}</h1>

        <div className="grid grid-cols-1 gap-4">
          {q.options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => setAnswers({...answers, [currentIndex]: idx})}
              className={`p-6 rounded-2xl border-2 text-left font-bold transition-all ${answers[currentIndex] === idx ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-white' : 'border-slate-100 dark:border-slate-800 dark:text-slate-300 hover:border-indigo-200'}`}
            >
              <span className="mr-4 opacity-40">{String.fromCharCode(65+idx)}.</span> {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-12 pt-8 border-t dark:border-slate-800">
          <button onClick={() => setCurrentIndex(c => Math.max(0, c-1))} disabled={currentIndex===0} className="px-8 py-4 font-black text-slate-400 disabled:opacity-20">PREVIOUS</button>
          {isLast ? (
            <button onClick={() => setIsSubmitModalOpen(true)} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg">SUBMIT EXAM</button>
          ) : (
            <button onClick={() => setCurrentIndex(c => c+1)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg">NEXT</button>
          )}
        </div>
      </div>

      <Modal isOpen={isSubmitModalOpen} onClose={()=>setIsSubmitModalOpen(false)} onConfirm={handleSubmit} title="Submit Exam?">
        <p>You have answered {Object.keys(answers).length} out of {questions.length} questions. Are you sure?</p>
      </Modal>
    </div>
  );
};

export default TestPage;
