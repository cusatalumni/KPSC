
import React, { useState } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ArrowsPointingOutIcon } from '../icons/ArrowsPointingOutIcon';
import { useTranslation } from '../../contexts/LanguageContext';

interface ExternalViewerPageProps {
  url: string;
  onBack: () => void;
}

const ExternalViewerPage: React.FC<ExternalViewerPageProps> = ({ url, onBack }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    
    // Extract hostname for display
    const getHostName = (urlStr: string) => {
        try {
            return new URL(urlStr).hostname;
        } catch (e) {
            return 'External Source';
        }
    };

    return (
        <div className="flex flex-col h-screen animate-fade-in bg-slate-100 dark:bg-slate-900">
            {/* Viewer Control Bar */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={onBack} 
                        className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-black hover:bg-slate-50 dark:hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                        <span className="text-sm uppercase tracking-tighter">{t('backToDashboard')}</span>
                    </button>
                    <div className="hidden sm:flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source:</span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{getHostName(url)}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800"
                    >
                        <ArrowsPointingOutIcon className="h-4 w-4" />
                        <span>Open Full Screen</span>
                    </a>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow relative bg-white overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-20">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading external content...</p>
                    </div>
                )}
                
                {/* 
                  Note: Many sites block framing via X-Frame-Options or CSP.
                  If a site blocks framing, it will appear empty or show an error.
                  The "Open Full Screen" button above is the mandatory fallback.
                */}
                <iframe 
                    src={url} 
                    className="w-full h-full border-none"
                    onLoad={() => setIsLoading(false)}
                    title="External Content Viewer"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />

                {/* Bottom Helper for failed loads */}
                {!isLoading && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white px-6 py-2 rounded-full text-xs font-bold opacity-0 hover:opacity-100 transition-opacity flex items-center space-x-3 pointer-events-none sm:pointer-events-auto">
                        <span>Content not loading correctly?</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline pointer-events-auto">Click here to open in new window</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExternalViewerPage;
