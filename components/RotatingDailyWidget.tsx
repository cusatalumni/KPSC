
import React, { useState, useEffect } from 'react';
import { getGk, getCurrentAffairs } from '../services/pscDataService';
import type { Page } from '../types';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { SparklesIcon } from './icons/SparklesIcon';

interface RotatingDailyWidgetProps {
  onNavigate: (page: Page) => void;
}

const SEEN_STORAGE_KEY = 'psc_guru_seen_facts';
const SEEN_LIMIT = 50; // History of last 50 seen items

const RotatingDailyWidget: React.FC<RotatingDailyWidgetProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [displayItems, setDisplayItems] = useState<{ id: string, content: string, category: string, source?: string, type: 'gk' | 'ca' }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const shuffleArray = (array: any[]) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gk, ca] = await Promise.all([getGk(), getCurrentAffairs()]);
                
                // Load seen IDs from localStorage
                const seenRaw = localStorage.getItem(SEEN_STORAGE_KEY);
                let seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];

                // Standardize items
                const allItems = [
                    ...gk.map(it => ({ id: `gk_${it.id}`, content: it.fact, category: it.category, type: 'gk' as const })),
                    ...ca.map(it => ({ id: `ca_${it.id}`, content: it.title, category: 'Current Affairs', source: it.source, type: 'ca' as const }))
                ];

                if (allItems.length === 0) {
                    setLoading(false);
                    return;
                }

                // Filter out recently seen items
                let freshPool = allItems.filter(item => !seenIds.includes(item.id));
                
                // If pool is too small, reset seen list to start over
                if (freshPool.length < 10) {
                    freshPool = allItems;
                    seenIds = [];
                }

                // Pick 10 random unique items
                const selected = shuffleArray(freshPool).slice(0, 10);
                
                // Update seen IDs
                const newSeenIds = Array.from(new Set([...selected.map(s => s.id), ...seenIds])).slice(0, SEEN_LIMIT);
                localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(newSeenIds));

                setDisplayItems(selected);
            } catch (e) {
                console.error("Widget data error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (loading || displayItems.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev >= displayItems.length - 1 ? 0 : prev + 1));
        }, 6000); 
        return () => clearInterval(interval);
    }, [displayItems, loading]);

    if (loading) return (
        <div className="h-full bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] p-8 animate-pulse flex flex-col justify-center items-center">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
        </div>
    );

    if (displayItems.length === 0) return null;

    const current = displayItems[currentIndex];

    return (
        <div className="h-full bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        {current.type === 'ca' ? <NewspaperIcon className="h-5 w-5 text-amber-300" /> : <LightBulbIcon className="h-5 w-5 text-amber-300" />}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-100">
                        {current.type === 'ca' ? 'Latest News' : 'GK Fact'}
                    </span>
                </div>

                <div className="flex-grow flex flex-col justify-center animate-fade-in" key={current.id}>
                    <div className="space-y-4">
                        <p className={`font-black leading-tight line-clamp-5 drop-shadow-sm ${current.type === 'gk' ? 'text-lg italic text-indigo-50' : 'text-xl'}`}>
                            {current.type === 'gk' ? `"${current.content}"` : current.content}
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{current.category}</span>
                            {current.source && <span className="text-[9px] font-bold opacity-60 uppercase">{current.source}</span>}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex space-x-1">
                        {displayItems.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-6 bg-amber-400' : 'w-2 bg-white/20'}`}></div>
                        ))}
                    </div>
                    <button 
                        onClick={() => onNavigate(current.type === 'ca' ? 'current_affairs' : 'gk')}
                        className="text-[10px] font-black uppercase tracking-widest hover:text-amber-300 transition-colors flex items-center space-x-1"
                    >
                        <span>View All</span>
                        <SparklesIcon className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RotatingDailyWidget;
