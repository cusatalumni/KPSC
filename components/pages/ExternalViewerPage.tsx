
import React, { useState, useEffect } from 'react';
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
    const [hasError, setHasError] = useState(false);
    
    // Check if the URL is known to block iframes
    const isRestricted = url.includes('keralapsc.gov.in') || url.includes('thulasi.keralapsc.gov.in');

    useEffect(() => {
        if (isRestricted) {
            setIsLoading(false);
        }
    }, [isRestricted]);

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
                        className="flex items-center space-x-2 bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                    >
                        <ArrowsPointingOutIcon className="h-4 w-4" />
                        <span>Open in New Tab</span>
                    </a>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow relative bg-white overflow-hidden">
                {isRestricted ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-10 text-center">
                        <div className="max-w-md bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-indigo-100 dark:border-indigo-800">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4M17 16l4-4m0 0l-4-4m4 4H7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">External Site Redirect</h2>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                സുരക്ഷാ കാരണങ്ങളാൽ കേരള PSC വെബ്‌സൈറ്റ് ഈ ആപ്പിനുള്ളിൽ നേരിട്ട് കാണാൻ കഴിയില്ല. താഴെ കാണുന്ന ബട്ടണിൽ ക്ലിക്ക് ചെയ്ത് വെബ്‌സൈറ്റ് പുതിയ ടാബിൽ തുറക്കുക.
                            </p>
                            <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-block w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                വെബ്‌സൈറ്റ് സന്ദർശിക്കുക
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-20">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading content...</p>
                            </div>
                        )}
                        <iframe 
                            src={url} 
                            className="w-full h-full border-none"
                            onLoad={() => setIsLoading(false)}
                            title="External Content Viewer"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ExternalViewerPage;
