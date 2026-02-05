
import React, { useState, useEffect, useCallback } from 'react';
import { getGk } from '../../services/pscDataService';
import type { GkItem } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';

const GkPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState<GkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGk();
            setItems(data);
        } catch (err) {
            setError(t('error.fetchData'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-20">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            <header className="mb-12 text-center">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <LightBulbIcon className="h-10 w-10 text-yellow-500" />
                </div>
                <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                {t('gk.title')}
                </h1>
                <p className="text-xl text-slate-500 font-medium mt-4 max-w-2xl mx-auto">{t('gk.subtitle')}</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">{t('loading')}</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-12 rounded-[2.5rem] border border-red-100 font-bold">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 hover:border-yellow-200 dark:hover:border-yellow-900 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-125"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic">"{item.fact}"</p>
                                <div className="mt-10 flex items-center">
                                    <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-yellow-200 dark:border-yellow-800/50 shadow-sm">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <div className="mt-16">
                <AdsenseWidget />
            </div>
        </div>
    );
};

export default GkPage;
