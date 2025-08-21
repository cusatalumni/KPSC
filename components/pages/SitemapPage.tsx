import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import type { Page } from '../../types';
import { NAV_STRUCTURE, NavLink } from '../../constants';

interface PageProps {
  onNavigate: (page: Page) => void;
  onBack: () => void;
}

const SitemapPage: React.FC<PageProps> = ({ onNavigate, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>{t('backToDashboard')}</span>
      </button>
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-slate-800">{t('sitemap.title')}</h1>
        <p className="text-lg text-slate-500 mt-1">{t('sitemap.subtitle')}</p>
      </header>

      <div className="space-y-6">
        {(NAV_STRUCTURE as NavLink[]).map((link, index) => (
            <div key={index}>
            {link.target ? (
                <button onClick={() => onNavigate(link.target!)} className="text-xl font-bold text-indigo-700 hover:underline">
                {t(link.nameKey)}
                </button>
            ) : (
                <h2 className="text-2xl font-semibold text-slate-800">{t(link.nameKey)}</h2>
            )}
            {link.children && (
                <ul className="pl-6 mt-3 space-y-2 border-l-2 border-slate-200">
                {link.children.map((child, childIndex) => (
                    <li key={childIndex}>
                    <button onClick={() => onNavigate(child.target!)} className="text-lg text-indigo-700 hover:underline">
                        {t(child.nameKey)}
                    </button>
                    </li>
                ))}
                </ul>
            )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default SitemapPage;