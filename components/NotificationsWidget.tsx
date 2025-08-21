import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '../services/pscDataService';
import type { Notification } from '../types';
import { BellIcon } from './icons/BellIcon';

const NotificationsWidget: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getNotifications();
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
             <p className="text-sm text-slate-500 mb-4 -mt-2">ദിവസവും പുതുക്കിയ ഏറ്റവും പുതിയ അപ്‌ഡേറ്റുകൾ</p>

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
                        <a href={`/go?url=${encodeURIComponent(item.link)}`} key={item.id} className="block p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                            <h4 className="font-semibold text-slate-700 leading-snug">{item.title}</h4>
                            <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
                                <span>Cat No: <span className="font-medium text-slate-700 font-mono">{item.categoryNumber}</span></span>
                                <span>Last Date: <span className="font-medium text-slate-700">{item.lastDate}</span></span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
             <div className="text-xs text-slate-500 mt-4 text-center bg-slate-100 p-2 rounded-md border border-slate-200">
                <span className="font-semibold">Automated:</span> ഈ വിവരങ്ങൾ ദിവസവും സ്വയം പുതുക്കുന്നു.
            </div>
        </section>
    );
};

export default NotificationsWidget;