
import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentAffairs } from '../../services/pscDataService';
import type { CurrentAffairsItem } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';

const CurrentAffairsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState<CurrentAffairsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCurrentAffairs();
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
                <div className="bg-teal-50 dark:bg-teal-950/30 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <NewspaperIcon className="h-10 w-10 text-teal-600" />
                </div>
                <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                {t('currentAffairs.title')}
                </h1>
                <p className="text-xl text-slate-500 font-medium mt-4 max-w-2xl mx-auto">{t('currentAffairs.subtitle')}</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">{t('loading')}</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-12 rounded-[2.5rem] border border-red-100 font-bold">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-teal-600 transition-colors">{item.title}</h3>
                                <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('currentAffairs.source')}</span>
                                        <span className="font-black text-teal-600 text-xs tracking-tight">{item.source}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('date')}</span>
                                        <span className="block font-bold text-slate-500 text-xs">{item.date}</span>
                                    </div>
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

export default CurrentAffairsPage;
