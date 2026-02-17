
import React, { useState, useCallback } from 'react';
import { searchPreviousPapers } from '../../services/geminiService';
import type { QuestionPaper } from '../../types';
import { MOCK_QUESTION_PAPERS } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

const CategoryBadge: React.FC<{ category?: string }> = ({ category }) => {
    const styleMap: Record<string, string> = {
        'OMR Question': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        'Descriptive': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        'OMR Answer Key': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        'Online Exam Key': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
    };
    return (
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${styleMap[category || ''] || 'bg-slate-100 text-slate-500'}`}>
            {category || 'Document'}
        </span>
    );
};

const PreviousPapersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const { papers, sources: paperSources } = await searchPreviousPapers(query);
            setResults(papers);
            setSources(paperSources);
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

            {/* Hub Header */}
            <header className="bg-slate-950 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden mb-16 shadow-2xl border-b-[12px] border-indigo-600">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
                
                <div className="relative z-10">
                    <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[1.5rem] w-fit mx-auto mb-8 border border-white/10 flex items-center space-x-3">
                        <ShieldCheckIcon className="h-5 w-5 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em]">Verified Official Archives</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
                        ക്യു-പേപ്പർ ഹബ്ബ്
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
                        തെറ്റായ ലിങ്കുകൾ ഒഴിവാക്കാൻ AI നേരിട്ട് PSC സർവറുകളിൽ സെർച്ച് ചെയ്യുന്നു.
                    </p>

                    {/* AI Search Bar */}
                    <div className="max-w-3xl mx-auto mt-12 relative group">
                        <div className="flex items-center bg-white/10 backdrop-blur-3xl p-2 rounded-[2rem] border-2 border-white/10 focus-within:border-indigo-500 transition-all shadow-2xl">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Year അല്ലെങ്കിൽ Exam Name (e.g. LDC 2021)..."
                                className="flex-1 px-6 py-4 bg-transparent outline-none font-black text-white text-lg placeholder-slate-600"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading || !query.trim()}
                                className="bg-indigo-600 text-white font-black px-8 py-4 rounded-3xl hover:bg-indigo-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center space-x-3"
                            >
                                {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5" />}
                                <span className="uppercase tracking-widest text-[10px]">{loading ? 'Searching...' : 'Find Official PDF'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                            <div className="w-20 h-20 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                            <p className="text-xl font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-center">Scanning Verified PSC Links...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-50 p-12 rounded-[3rem] border-2 border-red-100 font-bold text-xl">{error}</div>
                    ) : (
                        <section className="animate-fade-in-up">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-2 bg-indigo-600 rounded-full shadow-lg"></div>
                                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {searched ? 'സെർച്ച് റിസൾട്ടുകൾ' : 'റീസെന്റ് ഡൗൺലോഡുകൾ'}
                                    </h2>
                                </div>
                                {searched && <button onClick={() => {setSearched(false); setQuery(''); setSources([]);}} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-xl hover:bg-indigo-100 uppercase tracking-widest transition-all">Reset Search</button>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {paperList.map((item, index) => (
                                    <div key={index} className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all flex flex-col justify-between relative overflow-hidden h-full">
                                        <div>
                                            <div className="flex items-start space-x-4 mb-6">
                                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <CategoryBadge category={item.category} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">{item.year}</span>
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight line-clamp-3">{item.title}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${item.isDirectPdf || item.url?.endsWith('.pdf') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {item.isDirectPdf || item.url?.endsWith('.pdf') ? 'Direct PDF' : 'Official Web Page'}
                                                </span>
                                            </div>
                                            <a 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white p-4 rounded-xl flex items-center justify-between transition-all group/btn"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {item.isDirectPdf || item.url?.endsWith('.pdf') ? 'Download PDF' : 'Go to Download Page'}
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {!loading && searched && results.length === 0 && (
                                <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                                    <ArchiveBoxIcon className="h-20 w-20 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-black text-2xl tracking-tighter uppercase">No Documents Found</p>
                                    <p className="text-slate-400 font-bold mt-2">പരീക്ഷയുടെ പേരും വർഷവും നൽകി വീണ്ടും ശ്രമിക്കുക.</p>
                                </div>
                            )}

                            {sources.length > 0 && (
                                <div className="mt-16 p-8 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Search Footprints (Sources)</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {sources.map((chunk, idx) => (
                                            chunk.web && (
                                                <a 
                                                    key={idx} 
                                                    href={chunk.web.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[9px] font-bold text-indigo-500 hover:text-white hover:bg-indigo-600 transition-colors bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700 truncate max-w-[250px]"
                                                >
                                                    {chunk.web.title || chunk.web.uri}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                    <AdsenseWidget />
                </div>

                <aside className="space-y-10">
                    <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group border-b-[8px] border-indigo-900">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h4 className="text-xl font-black mb-4 tracking-tight leading-tight">പിഴവുകൾ ഒഴിവാക്കാം</h4>
                        <p className="text-indigo-100 text-sm font-bold leading-relaxed mb-8 italic">"കേരള പി.എസ്.സി സൈറ്റിലെ ഓരോ വർഷത്തെയും ഫയലുകൾ വ്യത്യസ്ത ഫോൾഡറുകളിലാണ്. കൃത്യമായ ലിങ്ക് ലഭിക്കാൻ പരീക്ഷയുടെ പേരും വർഷവും ചേർത്ത് സെർച്ച് ചെയ്യുക."</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PreviousPapersPage;
