
import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion, UserAnswers, SubscriptionStatus, ActiveTest } from '../types';
import { getQuestionsForTest } from '../services/pscDataService';
import Modal from './Modal';
import { ClockIcon } from './icons/ClockIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface TestPageProps {
  activeTest: ActiveTest;
  subscriptionStatus: SubscriptionStatus;
  onTestComplete: (score: number, total: number, stats: any, questions: QuizQuestion[], answers: UserAnswers) => void;
  onBack: () => void;
  onNavigateToUpgrade: () => void;
}

const QUESTION_TIME_LIMIT = 25; // per question limit for practice

const TestPage: React.FC<TestPageProps> = ({ activeTest, subscriptionStatus, onTestComplete, onBack, onNavigateToUpgrade }) => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(activeTest.questionsCount * 45); // Default: 45s per Q for generic
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);

  // Is this an official 100 Qs KPSC model?
  const isFullMock = activeTest.questionsCount >= 100;

  useEffect(() => {
      // Set correct time for official 75 min / 100 Qs model
      if (isFullMock) {
          setTimeLeft(75 * 60); // 75 Minutes exactly
      }
  }, [isFullMock]);

  const handleSubmit = useCallback(() => {
    let score = 0;
    let correct = 0;
    let wrong = 0;
    const neg = activeTest.negativeMarking || 0.33;

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected !== undefined) {
        let correctIdx = Number(q.correctAnswerIndex);
        if (correctIdx === 0) correctIdx = 1; 
        const userSelectionIdx = Number(selected) + 1;
        if (userSelectionIdx === correctIdx) {
          correct++;
          score += 1;
        } else {
          wrong++;
          score -= neg;
        }
      }
    });

    onTestComplete(parseFloat(score.toFixed(2)), questions.length, { correct, wrong, skipped: questions.length - (correct + wrong) }, questions, answers);
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

  // Individual question timer (only for Practice Mode, not for Full Mock)
  useEffect(() => {
    if (loading || questions.length === 0 || isSubmitModalOpen || isFullMock) return;
    const qTimer = setInterval(() => {
        setQuestionTimeLeft(prev => {
            if (prev <= 1) {
                if (currentIndex < questions.length - 1) { setCurrentIndex(c => c + 1); return QUESTION_TIME_LIMIT; }
                else { clearInterval(qTimer); setIsSubmitModalOpen(true); return 0; }
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentIndex, questions.length, loading, isSubmitModalOpen, isFullMock]);

  useEffect(() => {
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
  }, [currentIndex]);

  useEffect(() => {
    getQuestionsForTest(activeTest.subject, activeTest.topic, activeTest.questionsCount)
      .then(data => {
        setQuestions(data as QuizQuestion[]);
        setLoading(false);
      });
  }, [activeTest]);

  const selectOption = (idx: number) => setAnswers(prev => ({...prev, [currentIndex]: idx}));

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
        <div className="relative">
            <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600 text-xs">AI</div>
        </div>
        <div className="text-center space-y-2">
            <p className="font-black text-2xl text-slate-800 dark:text-white tracking-tighter uppercase">Initializing Exam Environment...</p>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Loading 100+ Model Questions</p>
        </div>
    </div>
  );

  if (!questions.length) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 max-w-md">
            <h2 className="text-2xl font-black text-red-600 mb-4">No Questions Found</h2>
            <button onClick={onBack} className="w-full bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg">Back to Previous Page</button>
        </div>
    </div>
  );

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-10">
      {isFullMock && (
          <div className="bg-slate-900 text-white p-4 rounded-t-[2.5rem] flex items-center justify-center space-x-4 border-b border-white/5">
              <span className="bg-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase animate-pulse">Official KPSC Mode</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time: 75 Mins | Negative: 0.33</span>
          </div>
      )}
      
      <div className={`bg-white dark:bg-slate-900 p-6 md:p-10 ${isFullMock ? 'rounded-b-[2.5rem]' : 'rounded-[2.5rem]'} shadow-2xl border dark:border-slate-800 flex flex-col h-full overflow-hidden`}>
        <div className="flex justify-between items-center mb-8 border-b pb-6 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl ring-4 ring-indigo-500/10">{currentIndex + 1}</div>
            <div>
                <h2 className="text-xl font-black dark:text-white leading-none mb-1.5 tracking-tight">{activeTest.title}</h2>
                <div className="flex items-center space-x-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('test.question')} {currentIndex + 1} / {questions.length}</p>
                    {!isFullMock && (
                        <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className={`text-[10px] font-black uppercase ${questionTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`}>Q-Timer: {questionTimeLeft}s</span>
                        </>
                    )}
                </div>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-2xl flex items-center space-x-3 font-mono font-bold dark:text-white shadow-inner border-2 transition-colors ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
            <ClockIcon className={`h-5 w-5 ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-500'}`} />
            <span className="text-lg">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
          </div>
        </div>

        <div className="mb-10 flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-black dark:text-white leading-snug tracking-tight">{q.question}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {q.options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => selectOption(idx)}
              className={`p-6 rounded-3xl border-2 text-left font-black transition-all flex items-center group relative overflow-hidden h-fit ${
                answers[currentIndex] === idx 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-white' 
                : 'border-slate-100 dark:border-slate-800 dark:text-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-4 w-full relative z-10">
                <span className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center border-2 font-black text-sm transition-all ${answers[currentIndex] === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>{String.fromCharCode(65+idx)}</span>
                <span className="text-base md:text-lg leading-tight flex-1">{opt}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8 pt-8 border-t dark:border-slate-800 flex-shrink-0">
          <button onClick={() => setCurrentIndex(c => Math.max(0, c-1))} disabled={currentIndex===0} className="px-8 py-4 font-black text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors uppercase tracking-widest text-[10px]">{t('test.previous')}</button>
          <div className="flex space-x-3">
            {!isLast && <button onClick={() => setCurrentIndex(c => c+1)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-10 py-4 rounded-2xl font-black shadow-md hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]">{t('test.next')}</button>}
            <button onClick={() => setIsSubmitModalOpen(true)} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-[10px] border-b-4 border-indigo-900">പരീക്ഷ അവസാനിപ്പിക്കുക</button>
          </div>
        </div>
      </div>
      <Modal isOpen={isSubmitModalOpen} onClose={()=>setIsSubmitModalOpen(false)} onConfirm={handleSubmit} title="നിങ്ങൾ പരീക്ഷ അവസാനിപ്പിക്കുകയാണോ?">
          <div className="space-y-4">
              <p className="font-bold text-slate-600 leading-relaxed italic">"പരീക്ഷ സബ്മിറ്റ് ചെയ്യുന്നതിന് മുൻപ് എല്ലാ ഉത്തരങ്ങളും ഒരിക്കൽ കൂടി പരിശോധിക്കുന്നത് നന്നായിരിക്കും."</p>
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Progress Summary</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">Answered: {Object.keys(answers).length} / {questions.length}</p>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default TestPage;
