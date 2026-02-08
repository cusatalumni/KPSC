
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
import ExternalViewerPage from './components/pages/ExternalViewerPage';
import LoadingScreen from './components/LoadingScreen';
import AdsenseWidget from './components/AdsenseWidget';
import type { Exam, SubscriptionStatus, ActiveTest, Page } from './types';
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
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  
  const { user, isSignedIn } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('free');
  const { theme } = useTheme();

  useEffect(() => {
      const timer = setTimeout(() => setIsAppLoading(false), 2500);
      return () => clearTimeout(timer);
  }, []);

  const syncStateFromHash = useCallback(() => {
    const rawHash = window.location.hash || '#dashboard';
    const [hashPath, hashQuery] = rawHash.replace(/^#\/?/, '').split('?');
    
    // Handle special /go style URLs if they hit the app root
    const searchParams = new URLSearchParams(window.location.search);
    const urlFromSearch = searchParams.get('url');
    if (urlFromSearch) {
        setExternalUrl(urlFromSearch);
        setCurrentPage('external_viewer');
        // Clear search to prevent reload loop
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        return;
    }

    if (!hashPath || hashPath === '' || hashPath === 'dashboard') {
        setCurrentPage('dashboard');
        setSelectedExam(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const parts = hashPath.split('/');
    const pageName = parts[0] as Page;
    const id = parts[1];
    
    const validPages: Page[] = [
      'dashboard', 'exam_details', 'test', 'results', 'bookstore', 
      'about', 'privacy', 'terms', 'disclosure', 'exam_calendar', 
      'quiz_home', 'mock_test_home', 'upgrade', 'psc_live_updates', 
      'previous_papers', 'current_affairs', 'gk', 'admin_panel', 
      'study_material', 'sitemap', 'external_viewer'
    ];

    const targetPage = validPages.includes(pageName) ? pageName : 'dashboard';
    
    if (targetPage === 'exam_details' && id) {
        const exam = EXAMS_DATA.find(e => e.id === id);
        if (exam) setSelectedExam(exam);
    } else {
        setSelectedExam(null);
    }
    
    if (targetPage === 'study_material' && id) {
        setActiveStudyTopic(decodeURIComponent(id));
    } else {
        setActiveStudyTopic(null);
    }

    if (targetPage === 'external_viewer' && hashQuery) {
        const urlParams = new URLSearchParams(hashQuery);
        setExternalUrl(urlParams.get('url'));
    } else if (targetPage !== 'external_viewer') {
        setExternalUrl(null);
    }

    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    syncStateFromHash();
    window.addEventListener('hashchange', syncStateFromHash);
    return () => window.removeEventListener('hashchange', syncStateFromHash);
  }, [syncStateFromHash]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      setSubscriptionStatus(subscriptionService.getSubscriptionStatus(user.id));
    } else {
      setSubscriptionStatus('free');
    }
  }, [user, isSignedIn]);

  const handleNavigate = (page: string) => {
    window.location.hash = page.startsWith('#') ? page : `#${page}`;
  };

  const renderContent = () => {
    switch(currentPage) {
      case 'external_viewer':
        return externalUrl ? <ExternalViewerPage url={externalUrl} onBack={() => window.history.back()} /> : <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} />;
      case 'test':
        return activeTest ? (
          <TestPage activeTest={activeTest} subscriptionStatus={subscriptionStatus} onTestComplete={(score, total, stats) => { setTestResult({ score, total, stats }); handleNavigate('results'); }} onBack={() => window.history.back()} onNavigateToUpgrade={() => handleNavigate('upgrade')} />
        ) : <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} />;
      case 'results':
        return testResult ? <TestResultPage score={testResult.score} total={testResult.total} stats={testResult.stats} onBackToPrevious={() => handleNavigate('dashboard')} /> : <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} />;
      case 'exam_details':
        return selectedExam ? (
          <ExamPage exam={selectedExam} content={EXAM_CONTENT_MAP[selectedExam.id] || LDC_EXAM_CONTENT} onBack={() => handleNavigate('dashboard')} onStartTest={(test: any, examTitle: string) => { setActiveTest({ title: `${examTitle} - ${test.title}`, questionsCount: test.questions, subject: test.subject || 'mixed', topic: test.topic || 'mixed' }); handleNavigate('test'); }} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} onNavigate={handleNavigate} />
        ) : <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} />;
      case 'bookstore': return <BookstorePage onBack={() => handleNavigate('dashboard')} />;
      case 'about': return <AboutUsPage onBack={() => handleNavigate('dashboard')} />;
      case 'privacy': return <PrivacyPolicyPage onBack={() => handleNavigate('dashboard')} />;
      case 'terms': return <TermsPage onBack={() => handleNavigate('dashboard')} />;
      case 'disclosure': return <DisclosurePage onBack={() => handleNavigate('dashboard')} />;
      case 'exam_calendar': return <ExamCalendarPage onBack={() => handleNavigate('dashboard')} />;
      case 'quiz_home': return <QuizHomePage onBack={() => handleNavigate('dashboard')} onStartQuiz={() => handleNavigate('test')} subscriptionStatus={subscriptionStatus} />;
      case 'mock_test_home': return <MockTestHomePage onBack={() => handleNavigate('dashboard')} onStartTest={(test) => { setActiveTest({ title: test.title.ml, questionsCount: test.questionsCount, subject: 'mixed', topic: 'mixed' }); handleNavigate('test'); }} />;
      case 'psc_live_updates': return <PscLiveUpdatesPage onBack={() => handleNavigate('dashboard')} />;
      case 'previous_papers': return <PreviousPapersPage onBack={() => handleNavigate('dashboard')} />;
      case 'current_affairs': return <CurrentAffairsPage onBack={() => handleNavigate('dashboard')} />;
      case 'gk': return <GkPage onBack={() => handleNavigate('dashboard')} />;
      case 'admin_panel': return <AdminPage onBack={() => handleNavigate('dashboard')} />;
      case 'sitemap': return <SitemapPage onBack={() => handleNavigate('dashboard')} onNavigate={handleNavigate as any} />;
      case 'study_material':
        return activeStudyTopic ? <StudyMaterialPage topic={activeStudyTopic} onBack={() => window.history.back()} /> : <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} />;
      default:
        return <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={t => handleNavigate(`study_material/${encodeURIComponent(t)}`)} />;
    }
  }
  
  if (isAppLoading) return <LoadingScreen />;

  const isFullPage = ['test', 'external_viewer'].includes(currentPage);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {!isFullPage && <Header onNavigate={handleNavigate as any} />}
      
      {!isFullPage && (
          <div className="container mx-auto px-4 mt-4">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden text-center">
                  <AdsenseWidget />
              </div>
          </div>
      )}

      <main className={`flex-grow ${isFullPage ? '' : 'container mx-auto px-4 py-8'}`}>
        {renderContent()}
      </main>
      {!isFullPage && <Footer onNavigate={handleNavigate as any}/>}
    </div>
  );
};

export default App;
