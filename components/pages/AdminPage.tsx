
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    getExams,
    testConnection,
    getExamSyllabus,
    getSubscriptions,
    getBooks
} from '../../services/pscDataService';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BeakerIcon } from '../icons/BeakerIcon';
import { TagIcon } from '../icons/TagIcon';
import type { Exam, PracticeTest, Book } from '../../types';

type AdminTab = 'tools' | 'exams' | 'syllabus' | 'questions' | 'books' | 'access';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('tools');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [dbStatus, setDbStatus] = useState({sheets: false, supabase: false});
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [syllabusItems, setSyllabusItems] = useState<PracticeTest[]>([]);
    const [auditReport, setAuditReport] = useState<any[]>([]);

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, subs, bks] = await Promise.all([getExams(), getSubscriptions(), getBooks()]);
            setExams(examRes.exams);
            setSubscriptions(subs || []);
            setBooks(bks || []);
        } catch (e) { console.error(e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if (selectedExamId) getExamSyllabus(selectedExamId).then(setSyllabusItems); }, [selectedExamId]);

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
        setStatus("Processing..."); setIsError(false);
        try { const r = await fn(); setStatus(r.message || "Done!"); await refresh(true); } 
        catch(e:any) { setStatus(e.message); setIsError(true); }
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 border border-transparent hover:border-indigo-500'}`}>{React.createElement(icon, { className: "h-4 w-4" })}<span>{label}</span></button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${dbStatus.sheets ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black uppercase">Sheets: <span className={dbStatus.sheets ? 'text-emerald-500' : 'text-red-500'}>{dbStatus.sheets ? 'READY' : 'OFF'}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black uppercase">Supabase: <span className={dbStatus.supabase ? 'text-emerald-500' : 'text-red-500'}>{dbStatus.supabase ? 'READY' : 'OFF'}</span></span>
                    </div>
                </div>
                <button onClick={onBack} className="bg-slate-800 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center space-x-2 font-black text-xs uppercase hover:bg-slate-950 transition-all"><ChevronLeftIcon className="h-4 w-4" /><span>Dashboard</span></button>
            </div>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className="flex items-center space-x-3">{isError ? <XMarkIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}<p className="font-black text-xs uppercase tracking-widest">{status}</p></div>
                    <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {tabBtn('tools', 'Automation', BeakerIcon)}
                {tabBtn('questions', 'Q-Bank', PlusIcon)}
                {tabBtn('books', 'Books', BookOpenIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('access', 'Users', ShieldCheckIcon)}
            </div>

            <main className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border dark:border-slate-800 min-h-[600px]">
                {activeTab === 'tools' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Gap Filler Card */}
                             <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform -mr-10 -mt-10"><SparklesIcon className="h-48 w-48" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Auto Gap Filler</h3>
                                    <p className="text-indigo-100 font-bold mt-2 text-sm">Analyzes syllabus coverage and generates missing questions automatically.</p>
                                    <button onClick={() => handleAction(() => adminOp('run-gap-filler'))} className="mt-6 bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Start Gap Filling</button>
                                </div>
                             </div>
                             {/* Affiliate Tool Card */}
                             <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform -mr-10 -mt-10"><TagIcon className="h-48 w-48" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Affiliate Auditor</h3>
                                    <p className="text-emerald-100 font-bold mt-2 text-sm">Scans bookstore database and ensures all Amazon links have your tag.</p>
                                    <button onClick={() => handleAction(() => adminOp('verify-affiliate-links'))} className="mt-6 bg-white text-emerald-600 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Fix All Links</button>
                                </div>
                             </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center space-x-3"><RssIcon className="h-6 w-6 text-indigo-500" /><span>Scraper Controls</span></h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button onClick={() => handleAction(() => adminOp('run-scraper-notifications'))} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-transparent hover:border-indigo-500 text-left transition-all">
                                    <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-1">Source: keralapsc.gov.in</p>
                                    <p className="font-black text-sm">Sync Job Notifications</p>
                                </button>
                                <button onClick={() => handleAction(() => adminOp('run-scraper-updates'))} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-transparent hover:border-indigo-500 text-left transition-all">
                                    <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-1">Source: keralapsc.gov.in</p>
                                    <p className="font-black text-sm">Sync Live Updates</p>
                                </button>
                                <button onClick={() => handleAction(() => adminOp('run-batch-qa'))} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-transparent hover:border-indigo-500 text-left transition-all">
                                    <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-1">Source: AI Auditor</p>
                                    <p className="font-black text-sm">Question Quality Audit</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Coverage Audit</h3>
                            <button onClick={async () => { setLoading(true); try { const d = await adminOp('get-audit-report'); setAuditReport(d); } finally { setLoading(false); } }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase">Generate Report</button>
                        </div>
                        {auditReport.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr className="border-b dark:border-slate-700"><th className="px-8 py-5">Topic</th><th className="px-8 py-5">Count</th><th className="px-8 py-5 text-right">Status</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {auditReport.map(r => (
                                            <tr key={r.id} className="text-sm">
                                                <td className="px-8 py-5 font-bold">{r.subject} • {r.topic}</td>
                                                <td className="px-8 py-5 font-black">{r.count}</td>
                                                <td className="px-8 py-5 text-right">{r.count < 5 ? <span className="text-red-500 font-black uppercase text-[9px]">Critical</span> : <span className="text-emerald-500 font-black uppercase text-[9px]">Good</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="space-y-8">
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border-2 border-dashed border-indigo-100 dark:border-indigo-800 flex flex-col items-center text-center">
                            <BookOpenIcon className="h-12 w-12 text-indigo-500 mb-4" />
                            <h3 className="text-2xl font-black uppercase tracking-tight">Amazon Scraper</h3>
                            <p className="text-slate-500 font-bold mt-2 max-w-md">Find and import the latest PSC rank files and guides directly from Amazon.in with your affiliate tag.</p>
                            <button onClick={() => handleAction(() => adminOp('run-book-scraper'))} className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-700">Start Scraper</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {books.map(b => (
                                <div key={b.id} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-transparent hover:border-indigo-200 transition-all group flex items-center space-x-4">
                                    <img src={b.imageUrl} className="w-12 h-16 object-cover rounded-lg shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm truncate">{b.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{b.author}</p>
                                    </div>
                                    <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Bookstore', id: b.id }))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">User</th><th className="px-8 py-5">Plan</th><th className="px-8 py-5">Expiry</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {subscriptions.map(sub => (
                                    <tr key={sub.user_id} className="text-sm font-bold">
                                        <td className="px-8 py-6 font-mono text-xs">{sub.user_id}</td>
                                        <td className="px-8 py-6"><span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] uppercase font-black">{sub.plan_type}</span></td>
                                        <td className="px-8 py-6 text-slate-500">{new Date(sub.expiry_date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-right"><button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Subscriptions', id: sub.user_id }))} className="text-red-500"><TrashIcon className="h-5 w-5" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
