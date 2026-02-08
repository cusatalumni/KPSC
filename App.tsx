
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
import LoadingScreen from './components/LoadingScreen';
import type { Exam, MockTest, SubscriptionStatus, ActiveTest, Page } from './types';
import { EXAMS_DATA, EXAM_CONTENT_MAP, LDC_EXAM_CONTENT } from './constants'; 
import { subscriptionService } from './services/subscriptionService';
import { useTranslation } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTest, setActiveTest] = useState<ActiveTest | null>(null);
  const [testResult, setTestResult] = useState<{ score: number; total: number; stats?: any } | null>(null);
  const [activeStudyTopic, setActiveStudyTopic] = useState<string | null>(null);
  
  const { user, isSignedIn } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('free');
  const { language } = useTranslation();
  const { theme } = useTheme();

  useEffect(() => {
      // Show splash for at least 2 seconds for branding
      const timer = setTimeout(() => setIsAppLoading(false), 2000);
      return () => clearTimeout(timer);
  }, []);

  const syncStateFromHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
        setCurrentPage('dashboard');
        return;
    }

    const parts = hash.split('/');
    const page = parts[0] as Page;
    const id = parts[1];
    
    const validPages: Page[] = [
      'dashboard', 'exam_details', 'test', 'results', 'bookstore', 
      'about', 'privacy', 'terms', 'disclosure', 'exam_calendar', 
      'quiz_home', 'mock_test_home', 'upgrade', 'psc_live_updates', 
      'previous_papers', 'current_affairs', 'gk', 'admin_panel', 
      'study_material', 'sitemap'
    ];

    const targetPage = validPages.includes(page) ? page : 'dashboard';
    
    if (targetPage === 'exam_details' && id) {
        const exam = EXAMS_DATA.find(e => e.id === id);
        if (exam) setSelectedExam(exam);
    } else if (targetPage !== 'exam_details') {
        setSelectedExam(null);
    }
    
    if (targetPage === 'study_material' && id) {
        setActiveStudyTopic(decodeURIComponent(id));
    } else if (targetPage !== 'study_material') {
        setActiveStudyTopic(null);
    }

    if (targetPage !== 'test' && targetPage !== 'results') {
        setActiveTest(null);
        setTestResult(null);
    }

    setCurrentPage(targetPage);
  }, []);

  useEffect(() => {
    syncStateFromHash();
    window.addEventListener('hashchange', syncStateFromHash);
    return () => window.removeEventListener('hashchange', syncStateFromHash);
  }, [syncStateFromHash]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const status = subscriptionService.getSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } else {
      setSubscriptionStatus('free');
    }
  }, [user, isSignedIn]);

  const handleNavigate = (page: Page) => {
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  const handleNavigateToExam = (exam: Exam) => {
    window.location.hash = `exam_details/${exam.id}`;
  };

  const handleStartPracticeTest = (test: { title: string, questions: number, topic?: string }, examTitle: string) => {
    setActiveTest({ 
        title: `${examTitle} - ${test.title}`, 
        questionsCount: test.questions,
        topic: test.topic || 'mixed',
        isPro: false
    });
    setCurrentPage('test');
  };

  const handleFinishTest = (score: number, total: number, stats?: any) => {
    setTestResult({ score, total, stats });
    setCurrentPage('results');
  };
  
  const handleStartStudyMaterial = (topic: string) => {
    window.location.hash = `study_material/${encodeURIComponent(topic)}`;
  };

  const handleBackToPreviousPage = () => {
    window.history.back();
  }

  const renderContent = () => {
    switch(currentPage) {
      case 'test':
        if (!activeTest) return null;
        return <TestPage 
                  activeTest={activeTest}
                  subscriptionStatus={subscriptionStatus}
                  onTestComplete={handleFinishTest} 
                  onBack={handleBackToPreviousPage}
                  onNavigateToUpgrade={() => handleNavigate('upgrade')}
                />;
      case 'results':
        if (!testResult) return null;
        return <TestResultPage 
                  score={testResult.score} 
                  total={testResult.total} 
                  stats={testResult.stats}
                  onBackToPrevious={handleBackToPreviousPage} 
                />;
      case 'exam_details':
        if (!selectedExam) return null;
         const examContent = EXAM_CONTENT_MAP[selectedExam.id] || LDC_EXAM_CONTENT;
         return <ExamPage 
            exam={selectedExam} 
            content={examContent}
            onBack={() => handleNavigate('dashboard')}
            onStartTest={handleStartPracticeTest}
            onStartStudy={handleStartStudyMaterial}
            onNavigate={handleNavigate}
          />;
      case 'bookstore':
        return <BookstorePage onBack={() => handleNavigate('dashboard')} />;
      case 'admin_panel':
        return <AdminPage onBack={() => handleNavigate('dashboard')} />;
      case 'study_material':
        if (!activeStudyTopic) return null;
        return <StudyMaterialPage topic={activeStudyTopic} onBack={handleBackToPreviousPage} />;
      case 'dashboard':
      default:
        return <Dashboard 
                  onNavigateToExam={handleNavigateToExam} 
                  onNavigate={handleNavigate}
                  onStartStudy={handleStartStudyMaterial}
                />;
    }
  }
  
  if (isAppLoading) return <LoadingScreen />;

  const isTestPage = currentPage === 'test';

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {!isTestPage && <Header onNavigate={handleNavigate} />}
      <main className={`flex-grow container mx-auto px-4 py-8`}>
        {renderContent()}
      </main>
      {!isTestPage && <Footer onNavigate={handleNavigate}/>}
    </div>
  );
};

export default App;
