
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
  
  // To track last click time for double click logic if browser support varies
  const lastClickTime = useRef<number>(0);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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
    getQuestionsForTest(activeTest.subject, activeTest.topic, activeTest.questionsCount)
      .then(data => {
        if (!data || data.length === 0) {
            setQuestions([]);
            setLoading(false);
            return;
        }
        const processed = data.map(q => {
           const correctText = q.options[q.correctAnswerIndex];
           const shuffledOptions = shuffleArray(q.options);
           const newCorrectIndex = shuffledOptions.indexOf(correctText);
           return {
             ...q,
             options: shuffledOptions,
             correctAnswerIndex: newCorrectIndex === -1 ? q.correctAnswerIndex : newCorrectIndex
           };
        });
        setQuestions(processed);
        setLoading(false);
      });
  }, [activeTest]);

  const selectOption = (idx: number) => {
    setAnswers(prev => ({...prev, [currentIndex]: idx}));
  };

  const handleOptionDoubleClick = (idx: number) => {
    selectOption(idx);
    // Auto-advance to next question after a small delay for feedback
    setTimeout(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsSubmitModalOpen(true);
        }
    }, 200);
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="font-black text-xl text-slate-700 animate-pulse uppercase tracking-widest">AI LOADING QUESTIONS...</p>
    </div>
  );

  if (!questions.length) return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 max-w-md">
            <h2 className="text-2xl font-black text-red-600 mb-4">No Questions Found</h2>
            <p className="text-slate-600 mb-8 font-medium">ചോദ്യങ്ങൾ തയ്യാറായിക്കൊണ്ടിരിക്കുന്നു. ദയവായി അല്പസമയത്തിന് ശേഷം വീണ്ടും ശ്രമിക്കുക.</p>
            <button onClick={onBack} className="w-full bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg">Back to Previous Page</button>
        </div>
    </div>
  );

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] shadow-2xl border dark:border-slate-800 flex flex-col h-full overflow-hidden">
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">{currentIndex + 1}</div>
            <div>
                <h2 className="text-lg font-black dark:text-white leading-none mb-1 line-clamp-1">{activeTest.title}</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {t('test.question')} {currentIndex + 1} {t('of')} {questions.length}
                </p>
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono font-bold dark:text-white border border-slate-200 dark:border-slate-700 shadow-inner">
            <ClockIcon className="h-4 w-4 text-indigo-500" />
            <span className="text-sm">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
          </div>
        </div>

        {/* Question Area - Flex Grow but scrollable if text is massive */}
        <div className="mb-6 flex-shrink-0">
            <h1 className="text-lg md:text-xl font-black dark:text-white leading-snug">{q.question}</h1>
        </div>

        {/* Options Area - Grid layout to save space */}
        <div className="grid grid-cols-1 gap-2 flex-grow overflow-y-auto pr-1">
          {q.options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => selectOption(idx)}
              onDoubleClick={() => handleOptionDoubleClick(idx)}
              className={`p-3 md:p-4 rounded-xl border-2 text-left font-bold transition-all flex items-center group relative overflow-hidden ${
                answers[currentIndex] === idx 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-white' 
                : 'border-slate-100 dark:border-slate-800 dark:text-slate-300 hover:border-indigo-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3 w-full relative z-10">
                <span className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center border-2 text-xs transition-colors ${
                    answers[currentIndex] === idx 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 group-hover:border-indigo-300'
                }`}>
                    {String.fromCharCode(65+idx)}
                </span>
                <span className="text-sm md:text-base leading-tight flex-1">{opt}</span>
                {/* Visual hint for double click selection */}
                <div className="opacity-0 group-hover:opacity-100 text-[8px] font-black text-slate-300 uppercase tracking-tighter hidden md:block">Double-click to select & next</div>
              </div>
            </button>
          ))}
        </div>

        {/* Compact Footer */}
        <div className="flex justify-between mt-4 pt-4 border-t dark:border-slate-800 flex-shrink-0">
          <button 
            onClick={() => setCurrentIndex(c => Math.max(0, c-1))} 
            disabled={currentIndex===0} 
            className="px-6 py-3 font-black text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors uppercase tracking-widest text-[10px]"
          >
            {t('test.previous')}
          </button>
          
          <div className="flex space-x-2">
            {!isLast && (
                <button 
                    onClick={() => setCurrentIndex(c => c+1)} 
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
                >
                    {t('test.next')}
                </button>
            )}
            <button 
                onClick={() => setIsSubmitModalOpen(true)} 
                className={`${isLast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} px-8 py-3 rounded-xl font-black shadow-md active:scale-95 transition-all uppercase tracking-widest text-[10px]`}
            >
                {t('test.submit')}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isSubmitModalOpen} onClose={()=>setIsSubmitModalOpen(false)} onConfirm={handleSubmit} title={t('test.modal.title')}>
        <p className="font-medium text-slate-600 leading-relaxed">{t('test.modal.body')}</p>
        <p className="text-xs text-slate-400 mt-2 italic">നിങ്ങൾ {Object.keys(answers).length} ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകിയിട്ടുണ്ട്.</p>
      </Modal>
    </div>
  );
};

export default TestPage;
