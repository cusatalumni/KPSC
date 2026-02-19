
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface AiDisclaimerProps {
    variant?: 'minimal' | 'full';
    className?: string;
}

const AiDisclaimer: React.FC<AiDisclaimerProps> = ({ variant = 'full', className = "" }) => {
    const { t } = useTranslation();

    const handleReadMore = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.hash = '#disclaimer';
    };

    if (variant === 'minimal') {
        return (
            <div className={`flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-70 ${className}`}>
                <SparklesIcon className="h-3 w-3" />
                <span>AI Generated Content • <a href="#disclaimer" onClick={handleReadMore} className="underline hover:text-indigo-500">Read Ethics Policy</a></span>
            </div>
        );
    }

    return (
        <div className={`bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-4 text-center md:text-left ${className}`}>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600 shrink-0">
                <SparklesIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                    <p className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest leading-none">AI Insight Disclaimer</p>
                    <a href="#disclaimer" onClick={handleReadMore} className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 underline uppercase tracking-widest">Learn More</a>
                </div>
                <p className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('common.aiDisclaimer')}
                </p>
            </div>
        </div>
    );
};

export default AiDisclaimer;
