
import React, { useState, useCallback } from 'react';
import { searchPreviousPapers } from '../../services/geminiService';
import type { QuestionPaper } from '../../types';
import { MOCK_QUESTION_PAPERS } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
// Fix: Added missing import for SparklesIcon
import { SparklesIcon } from '../icons/SparklesIcon';

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

    const paperList = searched ? results : MOCK_QUESTION_PAPERS;

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-32">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            {/* HIGH-VISIBILITY HUB HEADER */}
            <header className="bg-slate-950 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden mb-16 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-b-[12px] border-indigo-600">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                
                <div className="relative z-10">
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] w-fit mx-auto mb-10 border border-white/10 shadow-inner">
                        <ArchiveBoxIcon className="h-14 w-14 text-indigo-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
                        ക്യു-പേപ്പർ ഹബ്ബ്
                    </h1>
                    <p className="text-slate-400 text-xl font-bold max-w-2xl mx-auto leading-relaxed">
                        പി.എസ്.സി മുൻവർഷ ചോദ്യപേപ്പറുകൾ വർഷം തിരിച്ച് ഇവിടെനിന്നും <span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-8">ഡൗൺലോഡ്</span> ചെയ്യാം.
                    </p>

                    {/* FLOATING SEARCH BAR */}
                    <div className="max-w-3xl mx-auto mt-14 relative group">
                        <div className="flex items-center bg-white/10 backdrop-blur-3xl p-3 rounded-3xl border-2 border-white/10 focus-within:border-indigo-500 focus-within:ring-8 ring-indigo-500/20 transition-all shadow-2xl">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Year അല്ലെങ്കിൽ Exam Name നൽകുക (e.g. LDC 2021)..."
                                className="flex-1 px-8 py-5 bg-transparent outline-none font-black text-white text-xl placeholder-slate-600"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading || !query.trim()}
                                className="bg-indigo-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-indigo-50 transition-all shadow-[0_15px_30px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50 flex items-center space-x-3"
                            >
                                {loading ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                                <span className="hidden sm:inline uppercase tracking-[0.2em] text-xs">Search AI</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                <div className="lg:col-span-3 space-y-16">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                            <div className="w-20 h-20 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                            <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing PDF Data...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-50 p-12 rounded-[3rem] border-2 border-red-100 font-bold text-xl">{error}</div>
                    ) : (
                        <section className="animate-fade-in-up">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                                <div className="flex items-center space-x-5">
                                    <div className="h-12 w-3 bg-indigo-600 rounded-full shadow-lg"></div>
                                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {searched ? 'ലഭ്യമായ ഫലങ്ങൾ' : 'പ്രധാന ഡൗൺലോഡുകൾ'}
                                    </h2>
                                </div>
                                {searched && <button onClick={() => {setSearched(false); setQuery('');}} className="text-xs font-black text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 uppercase tracking-widest transition-all">Show Popular Hub</button>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {paperList.map((item, index) => (
                                    <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        key={index} 
                                        className="group bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 hover:shadow-[0_30px_60px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-400 transition-all flex items-center space-x-8 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[6rem] -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
                                        
                                        <div className="bg-slate-50 dark:bg-slate-800 p-7 rounded-3xl border dark:border-slate-700 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight mb-3">{item.title}</h3>
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center space-x-2">
                                                     <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.year || 'Official PDF'}</span>
                                                </div>
                                                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                                                    {item.size || '1.5 MB'}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            
                            {!loading && searched && results.length === 0 && (
                                <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                                    <ArchiveBoxIcon className="h-20 w-20 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-black text-2xl tracking-tighter">സെർച്ച് ചെയ്ത പേപ്പറുകൾ കണ്ടെത്താനായില്ല.</p>
                                    <p className="text-slate-400 font-bold mt-2">പരീക്ഷയുടെ പേരും വർഷവും നൽകി വീണ്ടും ശ്രമിക്കുക.</p>
                                </div>
                            )}
                        </section>
                    )}
                    <AdsenseWidget />
                </div>

                <aside className="space-y-10">
                    <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border-b-[12px] border-indigo-900">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="text-2xl font-black mb-6 tracking-tight leading-tight">സ്പെസിഫിക് പേപ്പറുകൾ വേണോ?</h4>
                        <p className="text-indigo-100 text-base font-bold leading-relaxed mb-10">മുകളിലെ AI സെർച്ച് ബാർ ഉപയോഗിച്ച് ഏത് പരീക്ഷയുടെയും പേരും വർഷവും നൽകുക. ഞങ്ങൾ ഒഫീഷ്യൽ ലിങ്കുകൾ കണ്ടെത്തി നൽകുന്നതാണ്.</p>
                        <div className="bg-indigo-950/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase text-amber-300 tracking-[0.3em] mb-3 flex items-center">
                                <SparklesIcon className="h-4 w-4 mr-2" />
                                Smart Search Tip
                            </p>
                            <p className="text-sm font-bold text-indigo-100 leading-relaxed">"LDC 2021 Phase 1" എന്ന് സെർച്ച് ചെയ്യുന്നത് ഏറ്റവും കൃത്യമായ ഫലം നൽകും.</p>
                        </div>
                    </div>
                    <div className="sticky top-32">
                        <AdsenseWidget />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PreviousPapersPage;
