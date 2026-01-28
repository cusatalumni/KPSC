
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import ExamPage from './components/ExamPage';
import TestPage from './components/TestPage';
import TestResultPage from './components/TestResultPage';
import AboutUsPage from './components/pages/AboutUsPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsPage from './components/pages/TermsPage';
import DisclosurePage from './components/pages/DisclosurePage';
import BookstorePage from './components/pages/BookstorePage';
import ExamCalendarPage from './components/pages/ExamCalendarPage';
import QuizHomePage from './components/pages/QuizHomePage';
import MockTestHomePage from './components/pages/MockTestHomePage';
import UpgradePage from './components/pages/UpgradePage';
import PscLiveUpdatesPage from './components/pages/PscLiveUpdatesPage';
import PreviousPapersPage from './components/pages/PreviousPapersPage';
import CurrentAffairsPage from './components/pages/CurrentAffairsPage';
import GkPage from './components/pages/GkPage';
import AdminPage from './components/pages/AdminPage';
import StudyMaterialPage from './components/pages/StudyMaterialPage';
import SitemapPage from './components/pages/SitemapPage';
import type { Exam, MockTest, QuizCategory, SubscriptionStatus, ActiveTest, PracticeTest } from './types';
import { LDC_EXAM_CONTENT, EXAMS_DATA } from './constants'; 
import { subscriptionService } from './services/subscriptionService';
import { useTranslation } from './contexts/LanguageContext';
import type { Page } from './types';

const App: React.FC = () => {
  // Routing State derived from Hash
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTest, setActiveTest] = useState<ActiveTest | null>(null);
  const [testResult, setTestResult] = useState<{ score: number; total: number; stats?: any } | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>('dashboard');
  const [activeStudyTopic, setActiveStudyTopic] = useState<string | null>(null);
  
  const { user, isSignedIn } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('free');
  const { language } = useTranslation();

  // Sync state with URL Hash
  const syncStateFromHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    const [page, id] = hash.split('/');
    
    const validPages: Page[] = [
      'dashboard', 'exam_details', 'test', 'results', 'bookstore', 
      'about', 'privacy', 'terms', 'disclosure', 'exam_calendar', 
      'quiz_home', 'mock_test_home', 'upgrade', 'psc_live_updates', 
      'previous_papers', 'current_affairs', 'gk', 'admin_panel', 
      'study_material', 'sitemap'
    ];

    const targetPage = validPages.includes(page as Page) ? (page as Page) : 'dashboard';
    
    // Reset specific states if moving away from their contexts
    if (targetPage !== 'exam_details') setSelectedExam(null);
    if (targetPage !== 'study_material') setActiveStudyTopic(null);
    if (targetPage !== 'test' && targetPage !== 'results') {
        setActiveTest(null);
        setTestResult(null);
    }

    // Restore context if ID is present
    if (targetPage === 'exam_details' && id) {
        const exam = EXAMS_DATA.find(e => e.id === id);
        if (exam) setSelectedExam(exam);
    }
    
    if (targetPage === 'study_material' && id) {
        setActiveStudyTopic(decodeURIComponent(id));
    }

    setCurrentPage(targetPage);
  }, []);

  useEffect(() => {
    syncStateFromHash();
    window.addEventListener('hashchange', syncStateFromHash);
    return () => window.removeEventListener('hashchange', syncStateFromHash);
  }, [syncStateFromHash]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const status = subscriptionService.getSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } else {
      setSubscriptionStatus('free');
    }
  }, [user, isSignedIn]);

  const handleUpgrade = () => {
    if (user?.id) {
      subscriptionService.upgradeToPro(user.id);
      setSubscriptionStatus('pro');
      handleNavigate('dashboard');
    }
  };

  const handleNavigate = (page: Page) => {
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  const handleNavigateToExam = (exam: Exam) => {
    window.location.hash = `exam_details/${exam.id}`;
  };

  const handleStartTest = (test: MockTest) => {
    const testTitle = test.title[language];
    setActiveTest({ 
        title: testTitle, 
        questionsCount: test.questionsCount,
        topic: testTitle,
        isPro: test.isPro,
        negativeMarking: test.negativeMarking
    });
    setPreviousPage(currentPage);
    setCurrentPage('test'); // Tests usually aren't bookmarked for safety
  };
  
  const handleStartPracticeTest = (test: PracticeTest | { title: string, questions: number }, examTitle: string) => {
    const testTitle = `${examTitle} - ${test.title}`;
    setActiveTest({ 
        title: testTitle, 
        questionsCount: test.questions,
        topic: testTitle,
        isPro: false
    });
    setPreviousPage('exam_details');
    setCurrentPage('test');
  };

  const handleStartQuiz = (category: QuizCategory) => {
    const quizTitle = category.title[language];
    setActiveTest({ 
        title: quizTitle, 
        questionsCount: 25,
        topic: quizTitle,
        isPro: category.isPro 
    });
    setPreviousPage(currentPage);
    setCurrentPage('test');
  }

  const handleFinishTest = (score: number, total: number, stats?: any) => {
    setTestResult({ score, total, stats });
    setCurrentPage('results');
  };
  
  const handleStartStudyMaterial = (topic: string) => {
    window.location.hash = `study_material/${encodeURIComponent(topic)}`;
  };

  const handleBackToPreviousPage = () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        handleNavigate('dashboard');
    }
  }

  const renderContent = () => {
    switch(currentPage) {
      case 'test':
        if (!activeTest) return <Dashboard onNavigateToExam={handleNavigateToExam} onNavigate={handleNavigate} onStartStudy={handleStartStudyMaterial} />;
        return <TestPage 
                  activeTest={activeTest}
                  subscriptionStatus={subscriptionStatus}
                  onTestComplete={handleFinishTest} 
                  onBack={handleBackToPreviousPage}
                  onNavigateToUpgrade={() => handleNavigate('upgrade')}
                />;
      case 'results':
        if (!testResult) return <Dashboard onNavigateToExam={handleNavigateToExam} onNavigate={handleNavigate} onStartStudy={handleStartStudyMaterial} />;
        return <TestResultPage 
                  score={testResult.score} 
                  total={testResult.total} 
                  stats={testResult.stats}
                  onBackToPrevious={handleBackToPreviousPage} 
                />;
      case 'exam_details':
        if (!selectedExam) return <Dashboard onNavigateToExam={handleNavigateToExam} onNavigate={handleNavigate} onStartStudy={handleStartStudyMaterial} />;
         return <ExamPage 
            exam={selectedExam} 
            content={LDC_EXAM_CONTENT}
            onBack={() => handleNavigate('dashboard')}
            onStartTest={handleStartPracticeTest}
            onStartStudy={handleStartStudyMaterial}
            onNavigate={handleNavigate}
          />;
      case 'bookstore':
        return <BookstorePage onBack={() => handleNavigate('dashboard')} />;
      case 'about':
        return <AboutUsPage onBack={() => handleNavigate('dashboard')} />;
      case 'privacy':
        return <PrivacyPolicyPage onBack={() => handleNavigate('dashboard')} />;
      case 'terms':
        return <TermsPage onBack={() => handleNavigate('dashboard')} />;
      case 'disclosure':
        return <DisclosurePage onBack={() => handleNavigate('dashboard')} />;
      case 'exam_calendar':
        return <ExamCalendarPage onBack={() => handleNavigate('dashboard')} />;
      case 'quiz_home':
        return <QuizHomePage subscriptionStatus={subscriptionStatus} onBack={() => handleNavigate('dashboard')} onStartQuiz={handleStartQuiz} />;
      case 'mock_test_home':
        return <MockTestHomePage onBack={() => handleNavigate('dashboard')} onStartTest={handleStartTest} />;
      case 'upgrade':
        return <UpgradePage onBack={() => handleBackToPreviousPage()} onUpgrade={handleUpgrade} />;
      case 'psc_live_updates':
        return <PscLiveUpdatesPage onBack={() => handleNavigate('dashboard')} />;
      case 'previous_papers':
        return <PreviousPapersPage onBack={() => handleNavigate('dashboard')} />;
      case 'current_affairs':
        return <CurrentAffairsPage onBack={() => handleNavigate('dashboard')} />;
      case 'gk':
        return <GkPage onBack={() => handleNavigate('dashboard')} />;
      case 'admin_panel':
        return <AdminPage onBack={() => handleNavigate('dashboard')} />;
      case 'study_material':
        if (!activeStudyTopic) return <Dashboard onNavigateToExam={handleNavigateToExam} onNavigate={handleNavigate} onStartStudy={handleStartStudyMaterial} />;
        return <StudyMaterialPage 
                  topic={activeStudyTopic} 
                  onBack={handleBackToPreviousPage} 
                />;
      case 'sitemap':
        return <SitemapPage onBack={() => handleNavigate('dashboard')} onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <Dashboard 
                  onNavigateToExam={handleNavigateToExam} 
                  onNavigate={handleNavigate}
                  onStartStudy={handleStartStudyMaterial}
                />;
    }
  }
  
  const isTestPage = currentPage === 'test';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {!isTestPage && <Header onNavigate={handleNavigate} />}
      <main className={`flex-grow ${isTestPage ? '' : 'container mx-auto px-4 py-8'}`}>
        {renderContent()}
      </main>
      {!isTestPage && <Footer onNavigate={handleNavigate}/>}
    </div>
  );
};

export default App;
