
import React, { useState, useCallback } from 'react';
import { searchPreviousPapers } from '../../services/geminiService';
import type { QuestionPaper } from '../../types';
import { MOCK_QUESTION_PAPERS } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';

const PreviousPapersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<QuestionPaper[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const data = await searchPreviousPapers(query);
            setResults(data);
        } catch (err) {
            setError(t('error.fetchData'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [query, t]);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-20">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            <header className="mb-12 text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ArchiveBoxIcon className="h-12 w-12 text-indigo-600" />
                </div>
                <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                {t('nav.previousPapers')}
                </h1>
                <p className="text-xl text-slate-500 font-medium mt-4 max-w-2xl mx-auto">മുൻവർഷ പരീക്ഷകളുടെ ഒഫീഷ്യൽ ചോദ്യപേപ്പറുകൾ ഇവിടെനിന്നും ഡൗൺലോഡ് ചെയ്യാം.</p>
            </header>

            <div className="max-w-3xl mx-auto mb-16 relative">
                <div className="flex items-center bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 focus-within:ring-4 ring-indigo-500/10 transition-all">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search for specific papers (e.g., LDC 2021, VEO)..."
                        className="flex-1 px-8 py-4 bg-transparent outline-none font-bold text-slate-700 dark:text-white text-lg"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="bg-indigo-600 text-white font-black px-10 py-4 rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                    >
                        {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                        <span className="hidden sm:inline uppercase tracking-widest text-xs">Search AI</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                            <p className="text-xl font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">AI is fetching documents...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-50 p-10 rounded-[2.5rem] border border-red-100">{error}</div>
                    ) : (
                        <section className="animate-fade-in">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="h-10 w-2 bg-indigo-600 rounded-full shadow-lg"></div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {searched ? 'Search Results' : 'Popular Downloads'}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {(searched ? results : MOCK_QUESTION_PAPERS).map((item, index) => (
                                    <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        key={index} 
                                        className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-50 dark:border-slate-800 hover:shadow-2xl hover:border-indigo-400 transition-all flex items-center space-x-6 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[4rem] -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                                        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <h3 className="text-lg font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors leading-tight">{item.title}</h3>
                                            <div className="flex items-center space-x-3 mt-2">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">{item.year || 'PDF'}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.size || '1.5 MB'}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                    <AdsenseWidget />
                </div>

                <aside className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border-b-[8px] border-indigo-600">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h4 className="text-xl font-black mb-4 tracking-tight">Need a specific paper?</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">If you can't find a paper, use the AI search above. It explores official PSC databases to find direct PDF links for you.</p>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Pro Tip</p>
                            <p className="text-xs font-bold text-slate-200">Include Year and Name in search for better results.</p>
                        </div>
                    </div>
                    <div className="sticky top-28">
                        <AdsenseWidget />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PreviousPapersPage;
