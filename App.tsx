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
import FeedbackPage from './components/pages/FeedbackPage';
import LoadingScreen from './components/LoadingScreen';
import type { Exam, SubscriptionStatus, ActiveTest, Page, QuizQuestion, UserAnswers } from './types';
import { EXAM_CONTENT_MAP, LDC_EXAM_CONTENT, MOCK_TESTS_DATA } from './constants'; 
import { subscriptionService } from './services/subscriptionService';
import { getSettings, getExams } from './services/pscDataService';
import { useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
  const { user, isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Data States
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTest, setActiveTest] = useState<ActiveTest | null>(null);
  const [testResult, setTestResult] = useState<{ score: number; total: number; stats?: any; questions?: QuizQuestion[]; answers?: UserAnswers } | null>(null);
  const [activeStudyTopic, setActiveStudyTopic] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('free');
  const { theme } = useTheme();

  // 1. Initial Load: Settings and All Exams
  useEffect(() => {
      let isMounted = true;
      const initApp = async () => {
          try {
              const [s, eRes] = await Promise.all([getSettings(), getExams()]);
              if (isMounted) {
                  setSettings(s);
                  setAllExams(eRes.exams);
              }
          } catch (e) {
              console.error("Initialization failed:", e);
          } finally {
              if (isMounted && clerkLoaded) {
                  setIsAppLoading(false);
              }
          }
      };
      initApp();
      return () => { isMounted = false; };
  }, [clerkLoaded]);

  // 2. Synchronize Page state from URL Hash
  const syncStateFromHash = useCallback(() => {
    const rawHash = window.location.hash || '#dashboard';
    const [hashPath, hashQuery] = rawHash.replace(/^#\/?/, '').split('?');
    const parts = hashPath.split('/');
    const pageName = parts[0] as Page;
    const id = parts[1];

    // Find the correct exam object if we are on details page
    if (pageName === 'exam_details' && id && allExams.length > 0) {
        const found = allExams.find(e => String(e.id).toLowerCase() === String(id).toLowerCase());
        setSelectedExam(found || null);
    }

    // Handle Study Material Deep Links
    if (pageName === 'study_material' && id) {
        setActiveStudyTopic(decodeURIComponent(id));
    }

    // Handle Mock Test Deep Links
    if (pageName === 'test' && id === 'mock' && parts[2]) {
        const mt = MOCK_TESTS_DATA.find(m => String(m.id) === String(parts[2]));
        if (mt) {
            setActiveTest({ title: mt.title.ml, questionsCount: mt.questionsCount, subject: 'mixed', topic: 'mixed' });
        }
    }

    // External Viewer
    if (pageName === 'external_viewer' && hashQuery) {
        const urlParams = new URLSearchParams(hashQuery);
        setExternalUrl(urlParams.get('url'));
    }

    setCurrentPage(pageName || 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [allExams]);

  useEffect(() => {
    if (!isAppLoading) {
        syncStateFromHash();
        window.addEventListener('hashchange', syncStateFromHash);
        return () => window.removeEventListener('hashchange', syncStateFromHash);
    }
  }, [syncStateFromHash, isAppLoading]);

  // 3. Handle Subscription Status
  useEffect(() => {
    if (settings.subscription_model_active === 'false') {
        setSubscriptionStatus('pro');
        return;
    }
    if (isSignedIn && user?.id) {
      setSubscriptionStatus(subscriptionService.getSubscriptionStatus(user.id));
    } else {
      setSubscriptionStatus('free');
    }
  }, [user, isSignedIn, settings]);

  const handleNavigate = (page: string) => {
    window.location.hash = page.startsWith('#') ? page : `#${page}`;
  };

  if (isAppLoading) return <LoadingScreen />;

  const isFullPage = currentPage === 'external_viewer';

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {!isFullPage && <Header onNavigate={handleNavigate as any} />}
      <main className={`flex-grow ${isFullPage ? '' : 'container mx-auto px-4 py-8'}`}>
        {(() => {
          switch(currentPage) {
            case 'admin_panel': return <AdminPage onBack={() => handleNavigate('dashboard')} />;
            case 'exam_details': 
                return selectedExam ? (
                    <ExamPage 
                        exam={selectedExam} 
                        content={EXAM_CONTENT_MAP[selectedExam.id] || LDC_EXAM_CONTENT} 
                        onBack={() => handleNavigate('dashboard')} 
                        onStartTest={(t: any) => handleNavigate(`test/${t.subject}/${t.topic}/${t.questions}/${encodeURIComponent(t.title)}`)} 
                        onStartStudy={()=>{}} 
                        onNavigate={handleNavigate}
                    />
                ) : (
                    <div className="p-20 text-center text-slate-400 font-bold tracking-widest animate-pulse uppercase">Searching for exam registry...</div>
                );
            case 'test': 
                return activeTest ? (
                    <TestPage 
                        activeTest={activeTest} 
                        subscriptionStatus={subscriptionStatus} 
                        onTestComplete={(s, t, st, q, a) => { 
                            setTestResult({ score: s, total: t, stats: st, questions: q, answers: a }); 
                            handleNavigate('results'); 
                        }} 
                        onBack={() => window.history.back()} 
                        onNavigateToUpgrade={() => handleNavigate('upgrade')} 
                    />
                ) : (
                    <div className="p-20 text-center font-black animate-pulse">PREPARING QUESTION BANK...</div>
                );
            case 'results': 
                return testResult ? (
                    <TestResultPage 
                        score={testResult.score} 
                        total={testResult.total} 
                        stats={testResult.stats} 
                        questions={testResult.questions} 
                        answers={testResult.answers} 
                        onBackToPrevious={() => handleNavigate('dashboard')} 
                    />
                ) : <Dashboard onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} onNavigate={handleNavigate} onStartStudy={()=>{}} />;
            case 'bookstore': return <BookstorePage onBack={() => handleNavigate('dashboard')} />;
            case 'quiz_home': return <QuizHomePage onBack={() => handleNavigate('dashboard')} onStartQuiz={(c) => handleNavigate(`test/${c.id.split('_')[0]}/mixed/15/${encodeURIComponent(c.title.ml)}`)} subscriptionStatus={subscriptionStatus} />;
            case 'mock_test_home': return <MockTestHomePage onBack={() => handleNavigate('dashboard')} onStartTest={(t) => handleNavigate(`test/mock/${t.id}`)} />;
            case 'psc_live_updates': return <PscLiveUpdatesPage onBack={() => handleNavigate('dashboard')} />;
            case 'current_affairs': return <CurrentAffairsPage onBack={() => handleNavigate('dashboard')} />;
            case 'gk': return <GkPage onBack={() => handleNavigate('dashboard')} />;
            case 'upgrade': return <UpgradePage onBack={() => window.history.back()} onUpgrade={() => {}} />;
            case 'study_material': return <StudyMaterialPage topic={activeStudyTopic || 'General Study'} onBack={() => handleNavigate('dashboard')} />;
            case 'external_viewer': return <ExternalViewerPage url={externalUrl || ''} onBack={() => handleNavigate('dashboard')} />;
            case 'exam_calendar': return <ExamCalendarPage onBack={() => handleNavigate('dashboard')} />;
            case 'sitemap': return <SitemapPage onBack={() => handleNavigate('dashboard')} onNavigate={handleNavigate as any} />;
            case 'feedback': return <FeedbackPage onBack={() => handleNavigate('dashboard')} />;
            case 'about': return <AboutUsPage onBack={() => handleNavigate('dashboard')} />;
            case 'privacy': return <PrivacyPolicyPage onBack={() => handleNavigate('dashboard')} />;
            case 'terms': return <TermsPage onBack={() => handleNavigate('dashboard')} />;
            case 'disclosure': return <DisclosurePage onBack={() => handleNavigate('dashboard')} />;
            default: return (
                <Dashboard 
                    onNavigateToExam={e => handleNavigate(`exam_details/${e.id}`)} 
                    onNavigate={handleNavigate} 
                    onStartStudy={(t) => handleNavigate(`study_material/${encodeURIComponent(t)}`)} 
                />
            );
          }
        })()}
      </main>
      {!isFullPage && <Footer onNavigate={handleNavigate as any}/>}
    </div>
  );
};

export default App;