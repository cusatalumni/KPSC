
import React, { useState, useEffect, useCallback } from 'react';
import { getPscUpdates } from '../../services/geminiService';
import type { PscUpdateItem } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { RssIcon } from '../icons/RssIcon';

const getSectionChipClass = (section: string) => {
    if (section.toLowerCase().includes('rank')) return 'bg-green-100 text-green-800';
    if (section.toLowerCase().includes('short')) return 'bg-yellow-100 text-yellow-800';
    if (section.toLowerCase().includes('notification')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-slate-100 text-slate-800';
}

const PscLiveUpdatesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [updates, setUpdates] = useState<PscUpdateItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUpdates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPscUpdates();
            setUpdates(data);
        } catch (err) {
            setError('വിവരങ്ങൾ ലഭിക്കുന്നതിൽ പിഴവ് സംഭവിച്ചു.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUpdates();
    }, [fetchUpdates]);

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
            </button>

            <header className="mb-8 text-center border-b border-slate-200 pb-6">
                <RssIcon className="h-16 w-16 mx-auto text-indigo-400" />
                <h1 className="text-4xl font-bold text-slate-800 mt-4">
                PSC Live അപ്‌ഡേറ്റുകൾ
                <span className="block text-2xl text-slate-500 mt-1 font-normal">Live PSC Updates</span>
                </h1>
                <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">keralapsc.gov.in-ൽ നിന്നുള്ള ഏറ്റവും പുതിയ റാങ്ക് ലിസ്റ്റുകൾ, അറിയിപ്പുകൾ, അപ്‌ഡേറ്റുകൾ എന്നിവ AI ഉപയോഗിച്ച് തത്സമയം നേടൂ.</p>
            </header>

            <div className="flex justify-center mb-6">
                 <button onClick={fetchUpdates} disabled={loading} className="flex items-center space-x-2 bg-white text-slate-700 font-semibold px-5 py-2.5 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Refresh updates">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120 10M20 20l-1.5-1.5A9 9 0 004 14" />
                    </svg>
                    <span>{loading ? 'ലോഡ് ചെയ്യുന്നു...' : 'പുതുക്കുക'}</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-slate-600">AI ഏറ്റവും പുതിയ വിവരങ്ങൾ ശേഖരിക്കുന്നു...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">{error}</div>
            ) : (
                <div className="space-y-4">
                    {updates.map((item, index) => (
                        <a href={item.url} key={index} target="_blank" rel="noopener noreferrer" className="block bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getSectionChipClass(item.section)}`}>
                                    {item.section}
                                </span>
                                <p className="text-sm text-slate-500 font-medium whitespace-nowrap">Date: {item.published_date}</p>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600">{item.title}</h3>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PscLiveUpdatesPage;
