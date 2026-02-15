
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    getBooks, 
    getExams,
    testConnection,
    getExamSyllabus,
    getSettings,
    updateSetting
} from '../../services/pscDataService';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { StarIcon } from '../icons/StarIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { BellIcon } from '../icons/BellIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import type { Book, Exam, PracticeTest, QuizQuestion } from '../../types';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore' | 'subscriptions';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [syllabusItems, setSyllabusItems] = useState<PracticeTest[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [dbStatus, setDbStatus] = useState<{sheets: boolean, supabase: boolean}>({sheets: false, supabase: false});
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
    const [paypalClientId, setPaypalClientId] = useState('sb');

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, b, s] = await Promise.all([getExams(), getBooks(), getSettings()]);
            setExams(examRes.exams);
            setBooks(b);
            if (s?.subscription_model_active !== undefined) setIsSubscriptionActive(s.subscription_model_active === 'true');
            if (s?.paypal_client_id) setPaypalClientId(s.paypal_client_id);
        } catch (e) { console.error(e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);
    
    useEffect(() => { 
        if (selectedExamId) getExamSyllabus(selectedExamId).then(setSyllabusItems); 
    }, [selectedExamId]);

    const adminOp = async (action: string, payload: any = {}) => {
        const token = await getToken();
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action, ...payload })
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    };

    const handleAction = async (fn: () => Promise<any>) => {
        setStatus("Processing request..."); setIsError(false); setLoading(true);
        try { 
            const r = await fn(); 
            setStatus(r.message || "Done!"); 
            await refresh(true); 
        } 
        catch(e:any) { setStatus(e.message); setIsError(true); } finally { setLoading(false); }
    };

    const handleFlush = (table: string) => {
        if (!confirm(`CAUTION: Are you sure you want to wipe ALL data from ${table}?`)) return;
        handleAction(() => adminOp('flush-data', { targetTable: table }));
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500 border border-transparent'}`}>{React.createElement(icon, { className: "h-4 w-4" })}<span>{label}</span></button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Status & Exit */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex space-x-4">
                    <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black uppercase">Database Link</span>
                    </div>
                </div>
                <button onClick={onBack} className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center space-x-2 font-black text-xs uppercase hover:bg-slate-950 transition-all"><ChevronLeftIcon className="h-4 w-4" /><span>Dashboard</span></button>
            </div>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <p className="font-black text-xs uppercase tracking-widest">{status}</p>
                    <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('bookstore', 'Books', BookOpenIcon)}
                {tabBtn('subscriptions', 'Access', StarIcon)}
            </div>

            <main className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border dark:border-slate-800 min-h-[600px]">
                {activeTab === 'automation' && (
                    <div className="space-y-12">
                         <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 -mr-20 -mt-20"><ArrowPathIcon className="h-64 w-64" /></div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Sync & Audit</h3>
                                <p className="text-indigo-100 font-bold mt-2">Pull manual Google Sheet changes into Cloud DB & fix topic counts.</p>
                            </div>
                            <div className="flex flex-wrap gap-3 relative z-10">
                                <button onClick={() => handleAction(() => adminOp('sync-all'))} className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Sync All Data</button>
                                <button onClick={() => handleAction(() => adminOp('sync-syllabus-linking'))} className="bg-indigo-500 text-white border border-white/20 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-400 transition-all flex items-center space-x-2">
                                    <ArrowPathIcon className="h-4 w-4" />
                                    <span>Audit Topic Counts</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: BellIcon, color: 'bg-indigo-600', title: 'Job Scraper', action: 'run-scraper-notifications' },
                                { icon: RssIcon, color: 'bg-indigo-500', title: 'Feed Scraper', action: 'run-scraper-updates' },
                                { icon: NewspaperIcon, color: 'bg-teal-600', title: 'News Scraper', action: 'run-scraper-affairs' },
                                { icon: LightBulbIcon, color: 'bg-amber-500', title: 'GK Scraper', action: 'run-scraper-gk' },
                                { icon: PlusIcon, color: 'bg-rose-600', title: 'AI Questions', action: 'run-scraper-questions' },
                                { icon: BookOpenIcon, color: 'bg-emerald-600', title: 'Book Scraper', action: 'run-book-scraper' }
                            ].map((card, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col">
                                    <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}><card.icon className="h-6 w-6 text-white" /></div>
                                    <h4 className="font-black text-sm uppercase mb-6">{card.title}</h4>
                                    <button onClick={() => handleAction(() => adminOp(card.action))} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Run Now</button>
                                </div>
                            ))}
                        </div>

                        {/* Maintenance Tools */}
                        <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/30">
                            <div className="flex items-center space-x-4 mb-8 text-red-600">
                                <TrashIcon className="h-8 w-8" />
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Maintenance Mode</h3>
                                    <p className="text-xs font-bold uppercase opacity-60">Destructive Actions (Use with Care)</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['questionbank', 'syllabus', 'results', 'notifications'].map(table => (
                                    <button 
                                        key={table} 
                                        onClick={() => handleFlush(table)} 
                                        className="bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/50 text-red-600 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Flush {table}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exams.map(e => (
                            <div key={e.id} className="p-6 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2rem] flex justify-between items-center group">
                                <div>
                                    <p className="font-black text-sm">{e.title.ml}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{e.id} • {e.category}</p>
                                </div>
                                <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Exams', id: e.id }))} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-w-md mx-auto py-10 space-y-8">
                         <div className={`p-10 rounded-[3rem] border-4 text-center ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                            <StarIcon className={`h-16 w-16 mx-auto mb-8 ${isSubscriptionActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <h3 className="text-4xl font-black mb-8 uppercase tracking-tighter">Pro Lock</h3>
                            <button onClick={async () => { const token = await getToken(); handleAction(() => updateSetting('subscription_model_active', String(!isSubscriptionActive), token)); }} className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>{isSubscriptionActive ? 'Disable Lock' : 'Enable Lock'}</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl">
                            <h4 className="text-sm font-black uppercase mb-4 tracking-widest">PayPal Client ID</h4>
                            <input value={paypalClientId} onChange={e => setPaypalClientId(e.target.value)} className="w-full p-4 rounded-xl border-2 dark:bg-slate-800 font-mono text-xs mb-4" />
                            <button onClick={async () => { const token = await getToken(); handleAction(() => updateSetting('paypal_client_id', paypalClientId, token)); }} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-xs">Update Key</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
