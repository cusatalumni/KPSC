import React, { useState, useEffect } from 'react';
import { getNotifications } from '../services/pscDataService';
import type { Notification } from '../types';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

const NewsTicker: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                // We only need the first few for a ticker
                setNotifications(data.slice(0, 5)); 
            } catch (err) {
                console.error("Failed to load notifications for ticker:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading || notifications.length === 0) {
        // Render a placeholder or nothing if it's loading or empty
        return (
            <div className="bg-slate-100 p-3 rounded-lg text-center text-sm text-slate-500 animate-pulse">
                Loading latest news...
            </div>
        );
    }
    
    // Duplicate the content to create a seamless loop
    const tickerContent = [...notifications, ...notifications];

    return (
        <section className="bg-white p-3 rounded-xl shadow-md border border-slate-200 flex items-center space-x-3 ticker-wrap">
            <div className="flex-shrink-0 bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-md flex items-center">
                <MegaphoneIcon className="h-5 w-5 mr-2" />
                <span>പുതിയ വാർത്ത</span>
            </div>
            <div className="flex-grow ticker-move">
                {tickerContent.map((item, index) => (
                    <a 
                        href={`/go?url=${encodeURIComponent(item.link)}`} 
                        key={`${item.id}-${index}`} 
                        className="mx-6 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
                    >
                        <span className="font-semibold">{item.title}</span> (Cat No: {item.categoryNumber}) - Last Date: {item.lastDate}
                    </a>
                ))}
            </div>
        </section>
    );
};

export default NewsTicker;
