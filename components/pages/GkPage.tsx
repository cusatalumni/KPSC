
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getGk } from '../../services/pscDataService';
import type { GkItem } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';

const GkCarousel: React.FC<{ items: GkItem[] }> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [items]);

    const item = items[currentIndex];

    return (
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -ml-20 -mt-20 blur-3xl animate-bounce"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full -mr-10 -mb-10 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="bg-white/20 p-8 rounded-[2.5rem] backdrop-blur-md border border-white/30 hidden md:block">
                    <LightBulbIcon className="h-16 w-16 text-white" />
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">Daily Wisdom</span>
                        <div className="flex space-x-1">
                            {items.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}></div>
                            ))}
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black italic leading-snug drop-shadow-md animate-fade-in min-h-[140px] md:min-h-0 flex items-center">
                        "{item.fact}"
                    </h2>
                    <div className="inline-block bg-black/20 px-6 py-2 rounded-full border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{item.category}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

    // Pick 5 random items for the carousel, others stay in grid
    const { carouselItems, gridItems } = useMemo(() => {
        if (items.length <= 5) return { carouselItems: items, gridItems: [] };
        
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        const selectedIds = new Set(selected.map(i => i.id));
        const remaining = items.filter(i => !selectedIds.has(i.id));
        
        return { carouselItems: selected, gridItems: remaining };
    }, [items]);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-20">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-8 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">{t('loading')}</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-12 rounded-[2.5rem] border border-red-100 font-bold">{error}</div>
            ) : (
                <div className="space-y-16">
                    {/* Top Row Carousel - Now Random 5 */}
                    {carouselItems.length > 0 && <GkCarousel items={carouselItems} />}

                    {/* Horizontal Ad after Carousel */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <AdsenseWidget />
                    </div>

                    {/* Remaining Grid */}
                    <div>
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
                                <LightBulbIcon className="h-8 w-8 text-yellow-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Comprehensive GK Facts</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gridItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 hover:border-yellow-200 dark:hover:border-yellow-900 transition-all duration-300 relative overflow-hidden group min-h-[220px]">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-125"></div>
                                        <div className="relative z-10 h-full flex flex-col justify-between">
                                            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic drop-shadow-sm">"{item.fact}"</p>
                                            <div className="mt-8 flex items-center">
                                                <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-yellow-200 dark:border-yellow-800/50 shadow-sm">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Ad every 6 items */}
                                    {(index + 1) % 6 === 0 && (
                                        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-md">
                                            <AdsenseWidget />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GkPage;
