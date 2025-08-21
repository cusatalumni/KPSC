import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { QuizQuestion, UserAnswers, SubscriptionStatus, ActiveTest } from '../types';
import { getQuestionsForTest } from '../services/pscDataService';
import Modal from './Modal';
import { ClockIcon } from './icons/ClockIcon';
import { ArrowsPointingOutIcon } from './icons/ArrowsPointingOutIcon';
import { ArrowsPointingInIcon } from './icons/ArrowsPointingInIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface TestPageProps {
  activeTest: ActiveTest;
  subscriptionStatus: SubscriptionStatus;
  onTestComplete: (score: number, total: number) => void;
  onBack: () => void;
  onNavigateToUpgrade: () => void;
}

const DURATION_PER_QUESTION = 90; // 1.5 minutes per question

const TestPage: React.FC<TestPageProps> = ({ activeTest, subscriptionStatus, onTestComplete, onBack, onNavigateToUpgrade }) => {
  const { t } = useTranslation();
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
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswerIndex) {
        score++;
      }
    });
    onTestComplete(score, questions.length);
  }, [questions, answers, onTestComplete]);

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
      // For freemium pro tests, we only fetch 10 questions for the free user
      const questionRequestCount = (subscriptionStatus === 'free' && activeTest.isPro) ? 10 : activeTest.questionsCount;
      const data = await getQuestionsForTest(activeTest.topic, questionRequestCount);
      
      if (data.length === 0) {
        setError(t('test.noQuestionsError'));
      } else {
        setQuestions(data);
        // Timer should be based on the full test length for pro users to show what they're getting
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
    // Freemium logic: check before moving to the 11th question
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
      setTimeout(handleNext, 200); // Short delay to show selection
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
    if (!document.fullscreenElement) {
        testPageRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
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
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-slate-600">{t('test.loading.ml')}</p>
        <p className="text-sm text-slate-500">{t('test.loading.en')}</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <p className="text-xl font-semibold text-red-600">{error || t('test.noQuestionsError')}</p>
            <button onClick={onBack} className="mt-4 flex items-center space-x-2 bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition">
                <span>{t('test.backToPrevious')}</span>
            </button>
        </div>
    );
  }
  
  const currentQuestion = questions[currentIndex];
  // Progress bar should reflect the full test length for Pro tests to entice users
  const totalQuestionsForProgress = activeTest.questionsCount;
  const progress = ((currentIndex + 1) / totalQuestionsForProgress) * 100;

  return (
    <div ref={testPageRef} className="bg-slate-50 min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-200">
            <header className="mb-6 border-b border-slate-200 pb-4">
            <div className="flex justify-between items-start gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{activeTest.title}</h1>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center space-x-2 font-bold p-2 rounded-md ${timeLeft < 60 ? 'text-red-600 bg-red-100' : 'text-slate-700'}`}>
                        <ClockIcon className="h-6 w-6"/>
                        <span className="text-lg">{formatTime(timeLeft)}</span>
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
                        {isFullscreen ? <ArrowsPointingInIcon className="h-6 w-6" /> : <ArrowsPointingOutIcon className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>{t('test.question')} {currentIndex + 1} / {totalQuestionsForProgress}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            </header>

            <div className="mb-8 min-h-[6rem]">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 leading-relaxed">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
                <label key={index} onDoubleClick={() => handleAnswerSelect(index, true)} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${answers[currentIndex] === index ? 'bg-indigo-50 border-indigo-500 shadow-inner' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                    <input 
                        type="radio" 
                        name="option" 
                        value={index} 
                        checked={answers[currentIndex] === index}
                        onChange={() => handleAnswerSelect(index)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="ml-4 text-lg text-slate-800">{option}</span>
                </label>
            ))}
            </div>

            <footer className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentIndex(prev => prev - 1)} 
                    disabled={currentIndex === 0}
                    className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {t('test.previous')}
                </button>
                {currentIndex === questions.length - 1 ? (
                    <button 
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition"
                    >
                    {t('test.submit')}
                    </button>
                ) : (
                    <button 
                        onClick={handleNext} 
                        className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
                    >
                        {t('test.next')}
                    </button>
                )}
            </footer>
        </div>
        <div className="text-center mt-4">
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-indigo-600 hover:underline">
                {t('test.endTest')}
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
        {t('test.modal.body')}
      </Modal>
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onConfirm={onNavigateToUpgrade}
        title={t('upgradeModal.title')}
        confirmText={t('upgradeModal.confirm')}
        cancelText={t('upgradeModal.cancel')}
      >
        {t('upgradeModal.body')}
      </Modal>
    </div>
  );
};

export default TestPage;