
import React from 'react';
import { QUIZ_CATEGORIES } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import type { QuizCategory, SubscriptionStatus } from '../../types';
import ProBadge from '../ProBadge';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { useTranslation } from '../../contexts/LanguageContext';

interface QuizCategoryCardProps {
  category: QuizCategory;
  onStart: (category: QuizCategory) => void;
  subscriptionStatus: SubscriptionStatus;
}

const QuizCategoryCard: React.FC<QuizCategoryCardProps> = ({ category, onStart, subscriptionStatus }) => {
  const { language } = useTranslation();
  const isPro = category.isPro;
  const canStart = !isPro || subscriptionStatus === 'pro';
  
  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border border-slate-200 dark:border-slate-800 ${!canStart ? 'bg-slate-50 dark:bg-slate-950' : ''}`}>
      <div>
        <div className="flex items-start space-x-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
            {category.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xl font-black text-slate-800 dark:text-white">{category.title[language]}</h4>
              {isPro && <ProBadge />}
            </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">{category.title[language === 'ml' ? 'en' : 'ml']}</p>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium line-clamp-2">{category.description[language]}</p>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onStart(category)}
        className={`mt-6 w-full flex items-center justify-center space-x-2 text-center font-black px-4 py-3 rounded-xl transition duration-200 active:scale-95 ${canStart ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'}`}
      >
        {!canStart && <LockClosedIcon className="h-4 w-4" />}
        <span>{canStart ? 'ക്വിസ് തുടങ്ങുക' : 'Pro Only'}</span>
      </button>
    </div>
  );
}

interface PageProps {
  onBack: () => void;
  onStartQuiz: (category: QuizCategory) => void;
  subscriptionStatus: SubscriptionStatus;
}

const QuizHomePage: React.FC<PageProps> = ({ onBack, onStartQuiz, subscriptionStatus }) => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-8 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
          {t('nav.quizzes')}
        </h1>
        <p className="text-xl text-slate-500 font-medium mt-4">നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കാൻ ഒരു വിഷയം തിരഞ്ഞെടുക്കുക.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {QUIZ_CATEGORIES.map((category) => (
          <QuizCategoryCard key={category.id} category={category} onStart={onStartQuiz} subscriptionStatus={subscriptionStatus} />
        ))}
      </div>
    </div>
  );
};

export default QuizHomePage;
