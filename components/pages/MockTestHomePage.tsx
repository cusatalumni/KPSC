import React from 'react';
import { MOCK_TESTS_DATA, EXAMS_DATA } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { DocumentChartBarIcon } from '../icons/DocumentChartBarIcon';
import ProBadge from '../ProBadge';
import type { MockTest } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface MockTestCardProps {
  test: MockTest;
  onStart: (test: MockTest) => void;
}

const MockTestCard: React.FC<MockTestCardProps> = ({ test, onStart }) => {
  const { t, language } = useTranslation();
  const exam = EXAMS_DATA.find(e => e.id === test.examId);
  const examTitle = exam ? exam.title[language] : t('mockTest');
  const isPro = test.isPro;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border border-slate-200`}>
      <div>
        <div className="flex items-start space-x-4 mb-4">
          <div className="bg-slate-100 p-3 rounded-full">
             {exam?.icon || <DocumentChartBarIcon className="h-8 w-8 text-slate-500" />}
          </div>
          <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-bold text-slate-800">{test.title[language]}</h4>
                {isPro && <ProBadge />}
              </div>
              <p className="text-sm text-slate-500 -mt-1">{test.title[language === 'ml' ? 'en' : 'ml']}</p>
          </div>
        </div>
        <p className="text-slate-600 mt-1">{test.description[language]}</p>
      </div>
      <div className="mt-6 border-t border-slate-200 pt-4 flex justify-between items-center text-sm text-slate-500">
         <span>{test.questionsCount} {t('questions')}</span>
         <span>{test.duration} {t('minutes')}</span>
         <button 
            onClick={() => onStart(test)}
            className="flex items-center space-x-2 text-center font-bold px-4 py-2 rounded-lg transition duration-200 bg-indigo-600 text-white hover:bg-indigo-700"
         >
            <span>{t('startTest')}</span>
          </button>
      </div>
    </div>
  );
};

interface PageProps {
  onBack: () => void;
  onStartTest: (test: MockTest) => void;
}

const MockTestHomePage: React.FC<PageProps> = ({ onBack, onStartTest }) => {
  const { t } = useTranslation();
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>{t('backToDashboard')}</span>
      </button>
      <header className="mb-8 text-center">
        <DocumentChartBarIcon className="h-16 w-16 mx-auto text-slate-400" />
        <h1 className="text-4xl font-bold text-slate-800 mt-4">
          {t('mockTests.title')}
          <span className="block text-2xl text-slate-500 mt-1 font-normal">Mock Tests</span>
        </h1>
        <p className="text-lg text-slate-600 mt-2">{t('mockTests.subtitle')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TESTS_DATA.map((test) => (
          <MockTestCard key={test.id} test={test} onStart={onStartTest} />
        ))}
      </div>
    </div>
  );
};

export default MockTestHomePage;