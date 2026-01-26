
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
  onTestComplete: (score: number, total: number, stats?: any) => void;
  onBack: () => void;
  onNavigateToUpgrade: () => void;
}

const DURATION_PER_QUESTION = 60; // 1 minute per question as per PSC standard

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
    if (!document.fullscreenElement) {
        testPageRef.current?.requestFullscreen().catch(err => {
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
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-bold text-slate-800">{t('test.loading.ml')}</p>
        <p className="text-slate-500">{t('test.loading.en')}</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <p className="text-xl font-semibold text-red-600">{error || t('test.noQuestionsError')}</p>
            <button onClick={onBack} className="mt-4 bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">
                {t('test.backToPrevious')}
            </button>
        </div>
    );
  }
  
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div ref={testPageRef} className="bg-slate-50 min-h-screen flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
            {/* Header */}
            <header className="mb-8 border-b border-slate-100 pb-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
                        {currentIndex + 1}
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{activeTest.title}</h1>
                      <div className="flex items-center text-xs text-slate-500 space-x-2">
                        <span>Negative: -{activeTest.negativeMarking || 0.33}</span>
                        <span>•</span>
                        <span>{currentQuestion.subject || 'General'}</span>
                        {currentQuestion.difficulty && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-bold">{currentQuestion.difficulty}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'text-red-600 bg-red-50 animate-pulse' : 'text-slate-700 bg-slate-100'}`}>
                          <ClockIcon className="h-5 w-5"/>
                          <span className="text-xl">{formatTime(timeLeft)}</span>
                      </div>
                      <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          {isFullscreen ? <ArrowsPointingInIcon className="h-6 w-6" /> : <ArrowsPointingOutIcon className="h-6 w-6" />}
                      </button>
                  </div>
              </div>
              
              <div className="mt-6">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Progress</span>
                      <span>{currentIndex + 1} / {totalQuestions}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
            </header>

            {/* Question Section */}
            <div className="mb-10 min-h-[140px]">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
                  {currentQuestion.question}
                </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
                <label 
                  key={index} 
                  onDoubleClick={() => handleAnswerSelect(index, true)} 
                  className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                    answers[currentIndex] === index 
                      ? 'bg-indigo-50 border-indigo-600 shadow-md scale-[1.02]' 
                      : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 border-2 font-bold transition-colors ${
                       answers[currentIndex] === index ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:border-indigo-300'
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
                    <span className={`text-lg font-medium ${answers[currentIndex] === index ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {option}
                    </span>
                </label>
            ))}
            </div>

            {/* Controls */}
            <footer className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <button 
                    onClick={() => setCurrentIndex(prev => prev - 1)} 
                    disabled={currentIndex === 0}
                    className="flex-1 sm:flex-none order-2 sm:order-1 bg-slate-100 text-slate-600 font-bold py-3 px-8 rounded-xl hover:bg-slate-200 disabled:opacity-30 transition-all"
                >
                    {t('test.previous')}
                </button>
                
                <div className="flex-1 sm:flex-none order-1 sm:order-2 flex gap-4 w-full sm:w-auto">
                  {currentIndex === questions.length - 1 ? (
                      <button 
                          onClick={() => setIsSubmitModalOpen(true)}
                          className="w-full bg-green-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-95"
                      >
                      {t('test.submit')}
                      </button>
                  ) : (
                      <button 
                          onClick={handleNext} 
                          className="w-full bg-indigo-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-95"
                      >
                          {t('test.next')}
                      </button>
                  )}
                </div>
            </footer>
        </div>
        
        <div className="flex justify-center mt-8">
            <button onClick={onBack} className="text-slate-400 font-semibold hover:text-red-500 transition-colors flex items-center space-x-2">
                <span>Quit Examination</span>
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
        <p className="text-slate-600 leading-relaxed">
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
        {t('upgradeModal.body')}
      </Modal>
    </div>
  );
};

export default TestPage;
