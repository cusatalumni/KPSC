
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { QuizQuestion, UserAnswers, SubscriptionStatus, ActiveTest } from '../types';
import { getQuestionsForTest } from '../services/pscDataService';
import Modal from './Modal';
import { ClockIcon } from './icons/ClockIcon';
import { ArrowsPointingOutIcon } from './icons/ArrowsPointingOutIcon';
import { ArrowsPointingInIcon } from './icons/ArrowsPointingInIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface TestPageProps {
  activeTest: ActiveTest;
  subscriptionStatus: SubscriptionStatus;
  onTestComplete: (score: number, total: number, stats?: any) => void;
  onBack: () => void;
  onNavigateToUpgrade: () => void;
}

const DURATION_PER_QUESTION = 60; // 1 minute per question as per PSC standard

const TestPage: React.FC<TestPageProps> = ({ activeTest, subscriptionStatus, onTestComplete, onBack, onNavigateToUpgrade }) => {
  const { t } = useTranslation();
  const { isSignedIn } = useUser();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(activeTest.questionsCount * DURATION_PER_QUESTION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const testPageRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    let score = 0;
    let correct = 0;
    let wrong = 0;
    const negativeValue = activeTest.negativeMarking || 0.33;
    const subjectBreakdown: Record<string, { correct: number, total: number }> = {};

    questions.forEach((q, index) => {
      const sub = q.subject || 'General Knowledge';
      if (!subjectBreakdown[sub]) {
        subjectBreakdown[sub] = { correct: 0, total: 0 };
      }
      subjectBreakdown[sub].total++;

      const selected = answers[index];
      if (selected !== undefined) {
        if (selected === q.correctAnswerIndex) {
          correct++;
          score += 1;
          subjectBreakdown[sub].correct++;
        } else {
          wrong++;
          score -= negativeValue;
        }
      }
    });

    const finalScore = parseFloat(score.toFixed(2));
    onTestComplete(finalScore, questions.length, { 
      correct, 
      wrong, 
      skipped: questions.length - (correct + wrong),
      subjectBreakdown 
    });
  }, [questions, answers, onTestComplete, activeTest.negativeMarking]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const questionRequestCount = (subscriptionStatus === 'free' && activeTest.isPro) ? 10 : activeTest.questionsCount;
      const data = await getQuestionsForTest(activeTest.topic, questionRequestCount);
      
      if (data.length === 0) {
        setError(t('test.noQuestionsError'));
      } else {
        setQuestions(data);
        const timerDuration = activeTest.questionsCount * DURATION_PER_QUESTION;
        setTimeLeft(timerDuration);
      }
    } catch (err) {
      setError(t('test.fetchError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTest, subscriptionStatus, t]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleNext = useCallback(() => {
    if (subscriptionStatus === 'free' && activeTest.isPro && currentIndex === 9) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length, subscriptionStatus, activeTest.isPro]);

  const handleAnswerSelect = (optionIndex: number, isDoubleClick = false) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    if (isDoubleClick) {
      setTimeout(handleNext, 200);
    }
  };
  
  const handleKeyboardNav = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (currentIndex === questions.length - 1) {
        setIsSubmitModalOpen(true);
      } else {
        handleNext();
      }
    }
  }, [currentIndex, questions.length, handleNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardNav);
    return () => {
      window.removeEventListener('keydown', handleKeyboardNav);
    };
  }, [handleKeyboardNav]);

  const toggleFullscreen = useCallback(() => {
    if (!testPageRef.current) return;
    if (!document.fullscreenElement) {
        testPageRef.current.requestFullscreen().catch(err => {
            alert(`Fullscreen error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="mt-8 text-center">
            <p className="text-2xl font-black text-slate-800 tracking-tight">{t('test.loading.ml')}</p>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t('test.loading.en')}</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-slate-50">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
                <p className="text-xl font-black text-red-600 mb-6">{error || t('test.noQuestionsError')}</p>
                <button onClick={onBack} className="btn-vibrant-indigo text-white font-black py-4 px-10 rounded-2xl transition-all active:scale-95">
                    {t('test.backToPrevious')}
                </button>
            </div>
        </div>
    );
  }
  
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div ref={testPageRef} className="bg-slate-50 min-h-screen flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-4xl animate-fade-in-up">
        {!isSignedIn && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-2xl text-sm flex items-center space-x-4 shadow-sm">
              <UserCircleIcon className="h-6 w-6 flex-shrink-0 text-amber-600" />
              <p className="font-bold">{t('test.guestMode')}</p>
          </div>
        )}

        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden glass-card">
            {/* Header */}
            <header className="mb-10 border-b border-slate-100 pb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="btn-vibrant-indigo text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">
                        {currentIndex + 1}
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-800 line-clamp-1 tracking-tight">{activeTest.title}</h1>
                      <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-wider space-x-3 mt-1">
                        <span className="text-red-500">Neg: -{activeTest.negativeMarking || 0.33}</span>
                        <span>•</span>
                        <span className="text-indigo-600">{currentQuestion.subject || 'General'}</span>
                        {currentQuestion.difficulty && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600">{currentQuestion.difficulty}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 font-mono font-black px-6 py-3 rounded-2xl border-2 transition-all ${timeLeft < 300 ? 'text-red-600 bg-red-50 border-red-200 animate-pulse' : 'text-slate-700 bg-slate-50 border-slate-100'}`}>
                          <ClockIcon className="h-6 w-6"/>
                          <span className="text-2xl">{formatTime(timeLeft)}</span>
                      </div>
                      <button onClick={toggleFullscreen} className="p-3 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">
                          {isFullscreen ? <ArrowsPointingInIcon className="h-7 w-7" /> : <ArrowsPointingOutIcon className="h-7 w-7" />}
                      </button>
                  </div>
              </div>
              
              <div className="mt-8">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                      <span>Course Progress</span>
                      <span>{currentIndex + 1} / {totalQuestions}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 p-1 shadow-inner">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full transition-all duration-700 ease-out shadow-lg" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
            </header>

            {/* Question Section */}
            <div className="mb-12 min-h-[160px]">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                  {currentQuestion.question}
                </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentQuestion.options.map((option, index) => (
                <label 
                  key={index} 
                  onDoubleClick={() => handleAnswerSelect(index, true)} 
                  className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                    answers[currentIndex] === index 
                      ? 'bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.03] ring-4 ring-indigo-50' 
                      : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-5 border-2 font-black text-lg transition-all ${
                       answers[currentIndex] === index 
                       ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                       : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <input 
                        type="radio" 
                        name="option" 
                        value={index} 
                        checked={answers[currentIndex] === index}
                        onChange={() => handleAnswerSelect(index)}
                        className="hidden"
                    />
                    <span className={`text-xl font-bold ${answers[currentIndex] === index ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {option}
                    </span>
                </label>
            ))}
            </div>

            {/* Controls */}
            <footer className="mt-16 pt-10 border-t border-slate-100 flex flex-wrap justify-between items-center gap-6">
                <button 
                    onClick={() => setCurrentIndex(prev => prev - 1)} 
                    disabled={currentIndex === 0}
                    className="flex-1 sm:flex-none order-2 sm:order-1 bg-slate-100 text-slate-600 font-black py-5 px-10 rounded-2xl hover:bg-slate-200 disabled:opacity-30 transition-all active:scale-95"
                >
                    {t('test.previous')}
                </button>
                
                <div className="flex-1 sm:flex-none order-1 sm:order-2 flex gap-4 w-full sm:w-auto">
                  {currentIndex === questions.length - 1 ? (
                      <button 
                          onClick={() => setIsSubmitModalOpen(true)}
                          className="w-full btn-vibrant-emerald text-white font-black py-5 px-12 rounded-2xl transition-all transform active:scale-95 text-lg"
                      >
                      {t('test.submit')}
                      </button>
                  ) : (
                      <button 
                          onClick={handleNext} 
                          className="w-full btn-vibrant-indigo text-white font-black py-5 px-12 rounded-2xl transition-all transform active:scale-95 text-lg"
                      >
                          {t('test.next')}
                      </button>
                  )}
                </div>
            </footer>
        </div>
        
        <div className="flex justify-center mt-12">
            <button onClick={onBack} className="text-slate-400 font-black hover:text-red-500 transition-colors uppercase tracking-widest text-[10px] flex items-center space-x-3">
                <span className="w-8 h-px bg-slate-200"></span>
                <span>Quit and Exit Examination</span>
                <span className="w-8 h-px bg-slate-200"></span>
            </button>
        </div>
      </div>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={() => {
            setIsSubmitModalOpen(false);
            handleSubmit();
        }}
        title={t('test.modal.title')}
        confirmText={t('test.submit')}
        cancelText={t('test.modal.cancel')}
      >
        <p className="text-slate-600 font-medium leading-relaxed">
          {t('test.modal.body')} You have answered {Object.keys(answers).length} out of {questions.length} questions.
        </p>
      </Modal>

      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onConfirm={onNavigateToUpgrade}
        title={t('upgradeModal.title')}
        confirmText={t('upgradeModal.confirm')}
        cancelText={t('upgradeModal.cancel')}
      >
        <p className="font-medium text-slate-600">{t('upgradeModal.body')}</p>
      </Modal>
    </div>
  );
};

export default TestPage;
