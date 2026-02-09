
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentAffairs } from '../../services/pscDataService';
import type { CurrentAffairsItem } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';

const NewsCarousel: React.FC<{ items: CurrentAffairsItem[] }> = ({ items }) => {
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
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            
            <div className="relative z-10 space-y-6">
                <div className="flex items-center space-x-3">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">Breaking Update</span>
                    <div className="flex space-x-1">
                        {items.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}></div>
                        ))}
                    </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-lg animate-fade-in h-[140px] md:h-auto overflow-hidden">
                    {item.title}
                </h2>
                <div className="flex items-center space-x-6 pt-6 border-t border-white/20">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Source</p>
                        <p className="font-bold">{item.source}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Published</p>
                        <p className="font-bold">{item.date}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">{t('loading')}</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-12 rounded-[2.5rem] border border-red-100 font-bold">{error}</div>
            ) : (
                <div className="space-y-16">
                    {/* Top Row Carousel */}
                    {carouselItems.length > 0 && <NewsCarousel items={carouselItems} />}

                    {/* Remaining Grid */}
                    <div>
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl">
                                <NewspaperIcon className="h-8 w-8 text-teal-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Latest Current Affairs</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gridItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-teal-600 transition-colors line-clamp-3">{item.title}</h3>
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
                                    {/* In-feed Ad as a grid card rather than spanning all columns */}
                                    {(index + 1) % 5 === 0 && (
                                        <AdsenseWidget />
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

export default CurrentAffairsPage;
