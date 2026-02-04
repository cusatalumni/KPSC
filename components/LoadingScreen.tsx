
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { useTranslation } from '../contexts/LanguageContext';

const LoadingScreen: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 animate-fade-in">
            <div className="relative mb-8 animate-bounce">
                <LogoIcon className="h-32 w-32 md:h-48 md:48" />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            </div>
            
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                    {t('app.title')}
                </h1>
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    Powered by AI
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
