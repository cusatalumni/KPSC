
import React, { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';
import AiDisclaimer from '../AiDisclaimer';

const CurrentAffairsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setOffset(prev => prev + 20);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchItems = useCallback(async (currentOffset: number) => {
        if (currentOffset === 0) setLoading(true);
        else setLoadingMore(true);
        
        setError(null);
        try {
            const res = await fetch(`/api/data?type=affairs&offset=${currentOffset}&limit=20`);
            const data = await res.json();
            if (Array.isArray(data)) {
                if (data.length < 20) setHasMore(false);
                setItems(prev => currentOffset === 0 ? data : [...prev, ...data]);
            }
        } catch (err) {
            setError(t('error.fetchData'));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [t]);

    useEffect(() => { fetchItems(offset); }, [offset, fetchItems]);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-20">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-8 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            <div className="space-y-12">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl"><NewspaperIcon className="h-8 w-8 text-teal-600" /></div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Latest Current Affairs</h2>
                </div>

                <AiDisclaimer className="mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                        <Fragment key={item.id || index}>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-800 hover:shadow-2xl transition-all flex flex-col justify-between h-full">
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight line-clamp-4">{item.title}</h3>
                                <div className="mt-8 pt-5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Source</p><p className="font-black text-teal-600 text-xs">{item.source}</p></div>
                                    <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="font-bold text-slate-500 text-xs">{item.date}</p></div>
                                </div>
                            </div>
                            {(index + 1) % 11 === 0 && <AdsenseWidget />}
                        </Fragment>
                    ))}
                </div>

                {loadingMore && (
                    <div className="py-10 text-center flex justify-center">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                
                <div ref={lastElementRef} className="h-10"></div>
                
                {loading && items.length === 0 && (
                    <div className="py-24 text-center"><div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                )}

                {error && <div className="text-center text-red-500 font-bold">{error}</div>}
            </div>
        </div>
    );
};

export default CurrentAffairsPage;
