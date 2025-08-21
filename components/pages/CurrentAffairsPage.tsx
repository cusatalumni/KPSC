import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentAffairs } from '../../services/pscDataService';
import type { CurrentAffairsItem } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';

const CurrentAffairsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
            setError('വിവരങ്ങൾ ലഭിക്കുന്നതിൽ പിഴവ് സംഭവിച്ചു.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
            </button>

            <header className="mb-8 text-center border-b border-slate-200 pb-6">
                <NewspaperIcon className="h-16 w-16 mx-auto text-teal-500" />
                <h1 className="text-4xl font-bold text-slate-800 mt-4">
                ആനുകാലികം
                <span className="block text-2xl text-slate-500 mt-1 font-normal">Current Affairs</span>
                </h1>
                <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">PSC പരീക്ഷകൾക്ക് ആവശ്യമായ ഏറ്റവും പുതിയ വാർത്തകൾ.</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-slate-600">പുതിയ വിവരങ്ങൾ ശേഖരിക്കുന്നു...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">{error}</div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="block bg-white p-5 rounded-xl shadow-md border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                            <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                                <span>ഉറവിടം: <span className="font-medium text-slate-600">{item.source}</span></span>
                                <span>തീയതി: {item.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CurrentAffairsPage;