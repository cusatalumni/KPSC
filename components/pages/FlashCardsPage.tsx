
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { FlashCard } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import { SparklesIcon } from '../icons/SparklesIcon';

const Card: React.FC<{ card: FlashCard }> = ({ card }) => {
    const [flipped, setFlipped] = useState(false);
    return (
        <div className="perspective-1000 h-64 w-full cursor-pointer group" onClick={() => setFlipped(!flipped)}>
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1 rounded-full mb-4">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{card.topic}</p>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">{card.front}</h3>
                    <p className="mt-8 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Click to Reveal Answer</p>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center text-white">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Answer</p>
                    <h3 className="text-2xl font-black leading-relaxed">{card.back}</h3>
                    <div className="h-1 w-12 bg-white/20 my-6 rounded-full"></div>
                    <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Click to flip back</p>
                </div>
            </div>
        </div>
    );
};

const FlashCardsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [activeTopic, setActiveTopic] = useState('All');
    
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore || activeTopic !== 'All') return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setOffset(prev => prev + 20);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, activeTopic]);

    const fetchCards = useCallback(async (currentOffset: number) => {
        if (currentOffset === 0) setLoading(true);
        else setLoadingMore(true);
        
        try {
            const res = await fetch(`/api/data?type=flash_cards&offset=${currentOffset}&limit=20`);
            const data = await res.json();
            if (Array.isArray(data)) {
                if (data.length < 20) setHasMore(false);
                setCards(prev => currentOffset === 0 ? data : [...prev, ...data]);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); setLoadingMore(false); }
    }, []);

    useEffect(() => { fetchCards(offset); }, [offset, fetchCards]);

    const topics = useMemo(() => ['All', ...Array.from(new Set(cards.map(c => c.topic)))], [cards]);
    const filtered = useMemo(() => activeTopic === 'All' ? cards : cards.filter(c => c.topic === activeTopic), [cards, activeTopic]);

    return (
        <div className="animate-fade-in pb-20 max-w-7xl mx-auto px-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-indigo-600">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"><SparklesIcon className="h-6 w-6" /></div>
                        <span className="font-black tracking-[0.2em] uppercase text-[10px]">Active Recall Method</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{t('flashCards.title')}</h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl">{t('flashCards.subtitle')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {topics.map(topic => (
                        <button key={topic} onClick={() => setActiveTopic(topic)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTopic === topic ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>{topic}</button>
                    ))}
                </div>
            </header>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((card, idx) => <Card key={card.id || idx} card={card} />)}
                </div>
            ) : !loading && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
                    <p className="text-slate-400 font-black text-2xl tracking-tight">{t('flashCards.noCards')}</p>
                </div>
            )}

            {loadingMore && (
                <div className="py-10 text-center flex justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            <div ref={lastElementRef} className="h-10"></div>
            
            {loading && cards.length === 0 && (
                <div className="py-24 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            )}

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default FlashCardsPage;
