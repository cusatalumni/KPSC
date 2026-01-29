
import React from 'react';
import { QUIZ_CATEGORIES } from '../constants';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import type { QuizCategory, SubscriptionStatus } from '../types';
import ProBadge from './ProBadge';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface QuizCategoryCardProps {
  category: QuizCategory;
  onStart: (category: QuizCategory) => void;
  subscriptionStatus: SubscriptionStatus;
}

const QuizCategoryCard: React.FC<QuizCategoryCardProps> = ({ category, onStart, subscriptionStatus }) => {
  const { language } = useTranslation();
  const isPro = category.isPro;
  const canStart = !isPro || subscriptionStatus === 'pro';
  
  // Theme selection based on ID
  const themes: Record<string, string> = {
    mixed: 'btn-vibrant-indigo',
    kerala_renaissance: 'btn-vibrant-indigo',
    kerala_geography: 'btn-vibrant-emerald',
    indian_constitution: 'btn-vibrant-cyan',
    indian_history: 'btn-vibrant-amber',
    economy: 'btn-vibrant-cyan',
    kerala_history: 'btn-vibrant-rose',
    kerala_culture: 'btn-vibrant-rose',
    indian_geography: 'btn-vibrant-emerald',
    science: 'btn-vibrant-cyan',
    current_affairs_cat: 'btn-vibrant-emerald',
    aptitude_reasoning: 'btn-vibrant-amber',
    english_malayalam: 'btn-vibrant-indigo'
  };

  const themeClass = themes[category.id] || 'btn-vibrant-indigo';

  return (
    <div className={`bg-white p-6 rounded-[2rem] shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 flex flex-col justify-between border border-slate-100 group ${!canStart ? 'bg-slate-50' : ''}`}>
      <div>
        <div className="flex items-center space-x-4 mb-5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
            {category.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h4 className="text-xl font-black text-slate-800 leading-tight">{category.title[language]}</h4>
              {isPro && <ProBadge />}
            </div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{category.title[language === 'ml' ? 'en' : 'ml']}</p>
          </div>
        </div>
        <p className="text-slate-600 font-medium leading-relaxed text-sm line-clamp-2">{category.description[language]}</p>
      </div>
      
      <button 
        onClick={() => onStart(category)}
        className={`mt-6 w-full flex items-center justify-center space-x-3 text-center font-black px-6 py-4 rounded-xl transition-all active:scale-95 ${canStart ? `${themeClass} text-white` : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'}`}
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
    <div className="animate-fade-in pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <header className="mb-16 text-center">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none">
          {t('nav.quizzes')}
        </h1>
        <p className="text-xl text-slate-500 font-medium mt-4 max-w-2xl mx-auto">{t('quiz_home.subtitle') || 'നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കാൻ ഒരു വിഷയം തിരഞ്ഞെടുക്കുക.'}</p>
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
