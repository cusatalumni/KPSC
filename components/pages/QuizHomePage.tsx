
import React from 'react';
import { QUIZ_CATEGORIES } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import type { QuizCategory, SubscriptionStatus } from '../../types';
import ProBadge from '../ProBadge';
import { LockClosedIcon } from '../icons/LockClosedIcon';

interface QuizCategoryCardProps {
  category: QuizCategory;
  onStart: (category: QuizCategory) => void;
  subscriptionStatus: SubscriptionStatus;
}

const QuizCategoryCard: React.FC<QuizCategoryCardProps> = ({ category, onStart, subscriptionStatus }) => {
  const isPro = category.isPro;
  const canStart = !isPro || subscriptionStatus === 'pro';
  
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border border-slate-200 ${!canStart ? 'bg-slate-50' : ''}`}>
      <div>
        <div className="flex items-start space-x-4">
          <div className="bg-slate-100 p-3 rounded-full">
            {category.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xl font-bold text-slate-800">{category.title}</h4>
              {isPro && <ProBadge />}
            </div>
            <p className="text-slate-600 mt-1">{category.description}</p>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onStart(category)}
        className={`mt-4 w-full flex items-center justify-center space-x-2 text-center font-semibold px-4 py-2 rounded-lg transition duration-200 ${canStart ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
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
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">ക്വിസ് വിഭാഗം</h1>
        <p className="text-lg text-slate-600 mt-2">നിങ്ങളുടെ അറിവ് പരീക്ഷിക്കാൻ ഒരു വിഷയം തിരഞ്ഞെടുക്കുക.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {QUIZ_CATEGORIES.map((category) => (
          <QuizCategoryCard key={category.id} category={category} onStart={onStartQuiz} subscriptionStatus={subscriptionStatus} />
        ))}
      </div>
    </div>
  );
};

export default QuizHomePage;
