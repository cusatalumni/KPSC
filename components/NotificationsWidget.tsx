import React, { useState, useEffect, useCallback } from 'react';
import { getLatestNotifications } from '../services/geminiService';
import type { Notification } from '../types';
import { BellIcon } from './icons/BellIcon';

const getCategoryChipClass = (category: string) => {
    switch (category) {
        case 'പുതിയ വിജ്ഞാപനം':
            return 'bg-indigo-100 text-indigo-800';
        case 'ഷോർട്ട് ലിസ്റ്റ്':
            return 'bg-yellow-100 text-yellow-800';
        case 'റാങ്ക് ലിസ്റ്റ്':
            return 'bg-green-100 text-green-800';
        case 'പരീക്ഷാ കലണ്ടർ':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-slate-100 text-slate-800';
    }
}

const NotificationsWidget: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLatestNotifications();
            setNotifications(data);
        } catch (err) {
            setError('അറിയിപ്പുകൾ ലഭിക്കുന്നതിൽ പിഴവ് സംഭവിച്ചു.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                     <BellIcon className="h-7 w-7 text-indigo-500" />
                    <h3 className="text-xl font-bold text-slate-800">പുതിയ അറിയിപ്പുകൾ</h3>
                </div>
                <button onClick={fetchNotifications} disabled={loading} className="text-slate-400 hover:text-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Refresh notifications">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120 10M20 20l-1.5-1.5A9 9 0 004 14" />
                    </svg>
                </button>
            </div>
             <p className="text-sm text-slate-500 mb-4 -mt-2">keralapsc.gov.in-ൽ നിന്നുള്ള ഏറ്റവും പുതിയ അപ്‌ഡേറ്റുകൾ</p>

            {loading ? (
                <div className="flex-grow flex items-center justify-center py-10">
                    <div className="text-center text-slate-500">
                         <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                         പുതിയ വിവരങ്ങൾ ശേഖരിക്കുന്നു...
                    </div>
                </div>
            ) : error ? (
                 <div className="flex-grow flex items-center justify-center py-10">
                    <div className="text-center text-red-500">{error}</div>
                </div>
            ) : (
                <div className="space-y-1 -mr-2 pr-2 flex-grow max-h-80 overflow-y-auto">
                    {notifications.map(item => (
                        <a href={item.link} key={item.id} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-slate-700 flex-1">{item.title}</p>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getCategoryChipClass(item.category)}`}>
                                    {item.category}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{item.date}</p>
                        </a>
                    ))}
                </div>
            )}
             <p className="text-xs text-slate-400 mt-4 text-center italic">AI-യുടെ സഹായത്തോടെ തയ്യാറാക്കിയ അറിയിപ്പുകൾ</p>
        </section>
    );
};

export default NotificationsWidget;
