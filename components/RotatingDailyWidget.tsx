
import React, { useState, useEffect } from 'react';
import { getGk, getCurrentAffairs } from '../services/pscDataService';
import type { GkItem, CurrentAffairsItem, Page } from '../types';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { useTranslation } from '../contexts/LanguageContext';
import { SparklesIcon } from './icons/SparklesIcon';

interface RotatingDailyWidgetProps {
  onNavigate: (page: Page) => void;
}

const RotatingDailyWidget: React.FC<RotatingDailyWidgetProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [gkItems, setGkItems] = useState<GkItem[]>([]);
    const [caItems, setCaItems] = useState<CurrentAffairsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewType, setViewType] = useState<'gk' | 'ca'>('ca');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gk, ca] = await Promise.all([getGk(), getCurrentAffairs()]);
                setGkItems(gk);
                setCaItems(ca);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (loading) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const limit = viewType === 'ca' ? caItems.length : gkItems.length;
                if (prev >= limit - 1 || prev >= 4) { // Cycle through top 5
                    setViewType(v => v === 'ca' ? 'gk' : 'ca');
                    return 0;
                }
                return prev + 1;
            });
        }, 6000); // Rotate every 6 seconds
        return () => clearInterval(interval);
    }, [caItems, gkItems, loading, viewType]);

    if (loading) return (
        <div className="h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 animate-pulse flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
        </div>
    );

    const currentCa = caItems[currentIndex];
    const currentGk = gkItems[currentIndex];

    return (
        <div className="h-full bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        {viewType === 'ca' ? <NewspaperIcon className="h-5 w-5 text-amber-300" /> : <LightBulbIcon className="h-5 w-5 text-amber-300" />}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-100">
                        {viewType === 'ca' ? 'Daily Current Affairs' : 'Daily GK Facts'}
                    </span>
                </div>

                <div className="flex-grow flex flex-col justify-center animate-fade-in" key={`${viewType}-${currentIndex}`}>
                    {viewType === 'ca' && currentCa ? (
                        <div className="space-y-4">
                            <h4 className="text-xl font-black leading-tight line-clamp-4">{currentCa.title}</h4>
                            <div className="flex items-center space-x-2 opacity-60">
                                <span className="text-[9px] font-bold uppercase tracking-widest">{currentCa.source}</span>
                            </div>
                        </div>
                    ) : currentGk ? (
                        <div className="space-y-4">
                            <p className="text-lg font-bold leading-relaxed italic text-indigo-50">"{currentGk.fact}"</p>
                            <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{currentGk.category}</span>
                        </div>
                    ) : null}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex space-x-1">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-6 bg-amber-400' : 'w-2 bg-white/20'}`}></div>
                        ))}
                    </div>
                    <button 
                        onClick={() => onNavigate(viewType === 'ca' ? 'current_affairs' : 'gk')}
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
