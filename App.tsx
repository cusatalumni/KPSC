
import React, { useState, useEffect } from 'react';
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
import type { Exam, PracticeTest, MockTest, QuizCategory, User } from './types';
import { LDC_EXAM_CONTENT } from './constants'; 
import { authService } from './services/authService';

export type Page = 
  | 'dashboard' 
  | 'exam_details' 
  | 'test' 
  | 'results' 
  | 'bookstore' 
  | 'about' 
  | 'privacy' 
  | 'terms' 
  | 'disclosure'
  | 'exam_calendar'
  | 'quiz_home'
  | 'mock_test_home'
  | 'upgrade';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTest, setActiveTest] = useState<{ title: string; questionsCount: number; } | null>(null);
  const [testResult, setTestResult] = useState<{ score: number; total: number } | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());

  useEffect(() => {
    // This could be used to check session status on app load in a real app
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const handleLogin = () => {
    authService.login();
    setCurrentUser(authService.getCurrentUser());
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    handleNavigate('dashboard'); // Go to dashboard on logout
  };

  const handleUpgrade = () => {
    authService.upgradeToPro();
    setCurrentUser(authService.getCurrentUser());
    handleNavigate('dashboard'); // Or a "thank you" page
  };


  const resetState = () => {
    setSelectedExam(null);
    setActiveTest(null);
    setTestResult(null);
  }

  const handleNavigate = (page: Page) => {
    if (page === 'dashboard') {
      resetState();
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleNavigateToExam = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentPage('exam_details');
  };

  const handleStartTest = (test: PracticeTest | MockTest | { title: string; questions: number }, examTitle: string) => {
     const isProContent = 'isPro' in test && test.isPro;
    if (isProContent && currentUser?.subscription !== 'pro') {
        handleNavigate('upgrade');
        return;
    }
    setActiveTest({ title: `${examTitle} - ${test.title}`, questionsCount: 'questions' in test ? test.questions : test.questionsCount });
    setPreviousPage(currentPage);
    setCurrentPage('test');
  };
  
  const handleStartQuiz = (category: QuizCategory) => {
    if (category.isPro && currentUser?.subscription !== 'pro') {
      handleNavigate('upgrade');
      return;
    }
    setActiveTest({ title: category.title, questionsCount: 10 }); // All quizzes are 10 questions
    setPreviousPage(currentPage);
    setCurrentPage('test');
  }

  const handleFinishTest = (score: number, total: number) => {
    setTestResult({ score, total });
    setCurrentPage('results');
  };
  
  const handleBackToPreviousPage = () => {
    setActiveTest(null);
    setTestResult(null);
    setCurrentPage(previousPage);
  }

  const renderContent = () => {
    switch(currentPage) {
      case 'test':
        if (!activeTest) return null;
        return <TestPage 
                  title={activeTest.title} 
                  questionsCount={activeTest.questionsCount} 
                  onTestComplete={handleFinishTest} 
                  onBack={handleBackToPreviousPage}
                />;
      case 'results':
        if (!testResult) return null;
        return <TestResultPage 
                  score={testResult.score} 
                  total={testResult.total} 
                  onBackToPrevious={handleBackToPreviousPage} 
                />;
      case 'exam_details':
        if (!selectedExam) return null;
         return <ExamPage 
            exam={selectedExam} 
            content={LDC_EXAM_CONTENT} // NOTE: Using mock LDC content for now
            onBack={() => handleNavigate('dashboard')}
            onStartTest={(test) => handleStartTest(test, selectedExam.title)}
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
        return <QuizHomePage user={currentUser} onBack={() => handleNavigate('dashboard')} onStartQuiz={handleStartQuiz} />;
      case 'mock_test_home':
        return <MockTestHomePage user={currentUser} onBack={() => handleNavigate('dashboard')} onStartTest={handleStartTest} />;
      case 'upgrade':
        return <UpgradePage onBack={() => handleNavigate(previousPage)} onUpgrade={handleUpgrade} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigateToExam={handleNavigateToExam} onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Header user={currentUser} onNavigate={handleNavigate} onLogin={handleLogin} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderContent()}
      </main>
      <Footer onNavigate={handleNavigate}/>
    </div>
  );
};

export default App;
