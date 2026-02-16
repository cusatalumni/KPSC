
import React, { useState, useEffect, useCallback, Fragment } from 'react';
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
        setLoading(true); setError(null);
        try { const data = await getGk(); setItems(data); } catch (err) { setError(t('error.fetchData')); } finally { setLoading(false); }
    }, [t]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-20">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-8 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            {loading ? (
                <div className="py-24 text-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : error ? (
                <div className="text-center text-red-500 font-bold">{error}</div>
            ) : (
                <div className="space-y-12">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl"><LightBulbIcon className="h-8 w-8 text-amber-500" /></div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">GK Fact Bank</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item, index) => (
                            <Fragment key={item.id}>
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 hover:border-amber-200 transition-all relative overflow-hidden group min-h-[200px] flex flex-col justify-between h-full">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-[5rem] -mr-10 -mt-10"></div>
                                    <div className="relative z-10">
                                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic">"{item.fact}"</p>
                                    </div>
                                    <div className="relative z-10 mt-8">
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-amber-200 inline-block">{item.category}</span>
                                    </div>
                                </div>
                                {/* Injected as a single grid item for symmetry */}
                                {(index + 1) % 7 === 0 && <AdsenseWidget />}
                            </Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GkPage;
