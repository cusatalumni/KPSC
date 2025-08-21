import React, { useState, useCallback } from 'react';
import { searchPreviousPapers } from '../../services/geminiService';
import type { QuestionPaper } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';

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
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>{t('backToDashboard')}</span>
            </button>

            <header className="mb-8 text-center border-b border-slate-200 pb-6">
                <ArchiveBoxIcon className="h-16 w-16 mx-auto text-indigo-400" />
                <h1 className="text-4xl font-bold text-slate-800 mt-4">
                {t('previousPapers.title')}
                <span className="block text-2xl text-slate-500 mt-1 font-normal">Previous Question Papers</span>
                </h1>
                <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">{t('previousPapers.subtitle')}</p>
            </header>

            <div className="max-w-2xl mx-auto mb-8">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('previousPapers.searchPlaceholder')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        aria-label="Search for question papers"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="flex items-center justify-center bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        )}
                        <span className="ml-2 hidden sm:inline">{t('search')}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-slate-600">{t('previousPapers.aiSearching')}</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">{error}</div>
            ) : searched && results.length === 0 ? (
                <div className="text-center text-slate-600 bg-slate-50 p-10 rounded-lg">
                    <h3 className="text-xl font-semibold">{t('previousPapers.noResults.title')}</h3>
                    <p>{t('previousPapers.noResults.message')}</p>
                </div>
            ) : results.length > 0 && (
                <div className="space-y-4">
                    {results.map((item, index) => (
                        <a href={`/go?url=${encodeURIComponent(item.url)}`} key={index} className="block bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 flex-1">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-medium whitespace-nowrap bg-slate-100 px-2 py-1 rounded">{t('date')}: {item.date}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
            {searched && (
                <div className="mt-8">
                    <AdsenseWidget />
                </div>
            )}
        </div>
    );
};

export default PreviousPapersPage;