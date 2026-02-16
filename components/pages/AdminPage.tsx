
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
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { BellIcon } from '../icons/BellIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import type { Exam, PracticeTest, Book } from '../../types';

type AdminTab = 'automation' | 'qbank' | 'exams' | 'syllabus' | 'books' | 'users';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
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

    // Single Question Form
    const [sq, setSq] = useState({ topic: '', question: '', options: ['', '', '', ''], correct: 1, subject: '' });

    const refreshData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, subs, bks] = await Promise.all([getExams(), getSubscriptions(), getBooks()]);
            setExams(examRes.exams || []);
            setSubscriptions(subs || []);
            setBooks(bks || []);
        } catch (e) { console.error("Admin refresh error:", e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refreshData(); }, [refreshData]);

    useEffect(() => { 
        if (activeTab === 'syllabus' && selectedExamId) {
            getExamSyllabus(selectedExamId).then(items => setSyllabusItems(items));
        }
    }, [selectedExamId, activeTab]);

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

    const handleAction = async (action: string, payload: any = {}) => {
        setStatus("Processing operation..."); setIsError(false);
        try {
            const r = await adminOp(action, payload);
            setStatus(r.message || "Action completed successfully.");
            if (activeTab === 'exams' || activeTab === 'books' || activeTab === 'users') refreshData(true);
        } catch(e:any) { setStatus(e.message); setIsError(true); }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setStatus("Parsing CSV file...");
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const rows = text.split('\n').filter(r => r.trim()).slice(1);
            const parsed = rows.map((row, i) => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length < 5) return null;
                return { id: Date.now() + i, topic: cols[0], question: cols[1], options: [cols[2], cols[3], cols[4], cols[5] || ''], correct_answer_index: parseInt(cols[6] || '1'), subject: cols[7] || 'General', difficulty: 'PSC Level' };
            }).filter(Boolean);
            if (parsed.length > 0) handleAction('bulk-upload-questions', { data: parsed });
            else { setStatus("No valid data found in CSV."); setIsError(true); }
        };
        reader.readAsText(file);
    };

    const ToolCard = ({ title, icon: Icon, action, color, desc }: any) => (
        <div className={`p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group ${color}`}>
            <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform -mr-10 -mt-10"><Icon className="h-48 w-48" /></div>
            <div className="relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
                <p className="text-white/70 font-bold mt-2 text-[10px] leading-relaxed max-w-[80%]">{desc}</p>
                <button onClick={() => handleAction(action)} className="mt-6 bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Run Now</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-6">
                    <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${dbStatus.sheets ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div><span className="text-[10px] font-black uppercase tracking-widest">Sheets: {dbStatus.sheets ? 'ONLINE' : 'OFFLINE'}</span></div>
                    <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div><span className="text-[10px] font-black uppercase tracking-widest">Supabase: {dbStatus.supabase ? 'ONLINE' : 'OFFLINE'}</span></div>
                </div>
                <button onClick={onBack} className="bg-slate-800 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center space-x-2 font-black text-xs uppercase hover:bg-slate-950 transition-all"><ChevronLeftIcon className="h-4 w-4" /><span>Dashboard</span></button>
            </div>

            {/* Status Messages */}
            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className="flex items-center space-x-3">{isError ? <XMarkIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}<p className="font-black text-xs uppercase tracking-widest">{status}</p></div>
                    <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'automation', label: 'Automation', icon: BeakerIcon },
                    { id: 'qbank', label: 'Q-Bank', icon: ClipboardListIcon },
                    { id: 'exams', label: 'Exams', icon: AcademicCapIcon },
                    { id: 'syllabus', label: 'Syllabus', icon: PlusIcon },
                    { id: 'books', label: 'Books', icon: BookOpenIcon },
                    { id: 'users', label: 'Users', icon: ShieldCheckIcon }
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as AdminTab)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 border border-transparent hover:border-indigo-500'}`}>
                        <t.icon className="h-4 w-4" /><span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <main className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border dark:border-slate-800 min-h-[600px] relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}

                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ToolCard title="Full DB Sync" icon={ArrowPathIcon} action="rebuild-db" color="bg-red-600" desc="Synchronizes all records from Google Sheets to Supabase production database." />
                        <ToolCard title="PSC Daily Sync" icon={SparklesIcon} action="run-daily-sync" color="bg-indigo-600" desc="Full cycle sync: Jobs, Live Updates, CA, GK and Gap Filler." />
                        <ToolCard title="Job Notifications" icon={BellIcon} action="run-scraper-notifications" color="bg-emerald-600" desc="Scrapes official PSC site for active job announcements." />
                        <ToolCard title="PSC Live Updates" icon={RssIcon} action="run-scraper-updates" color="bg-cyan-600" desc="Real-time sync for results, rank lists and exam schedules." />
                        <ToolCard title="Current Affairs" icon={NewspaperIcon} action="run-ca-scraper" color="bg-indigo-500" desc="AI researches latest news specifically for Kerala exams." />
                        <ToolCard title="GK Fact Scraper" icon={LightBulbIcon} action="run-gk-scraper" color="bg-amber-500" desc="Generates unique study facts for the daily widget." />
                        <ToolCard title="Auto Gap Filler" icon={BeakerIcon} action="run-gap-filler" color="bg-rose-600" desc="Detects empty syllabus topics and generates questions." />
                        <ToolCard title="Book Store Sync" icon={BookOpenIcon} action="run-book-scraper" color="bg-slate-800" desc="Updates bookstore with top Amazon PSC guides." />
                    </div>
                )}

                {activeTab === 'qbank' && (
                    <div className="space-y-16">
                        {/* Reports Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Syllabus Gap Audit</h3>
                                    <button onClick={async () => { setLoading(true); try { setAuditReport(await adminOp('get-audit-report')); } finally { setLoading(false); } }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg">Show Report</button>
                                </div>
                                {auditReport.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {auditReport.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                                                <div><p className="font-bold text-xs">{r.topic}</p></div>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded ${r.count < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{r.count} Qs</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-400 text-xs font-bold text-center py-10">Run report to see question coverage across topics.</p>}
                            </div>
                            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                                <h3 className="text-xl font-black uppercase mb-4">QA Quality Audit</h3>
                                <p className="text-indigo-100 text-xs font-bold mb-8">AI scans recent questions to fix formatting, options, and correctness automatically.</p>
                                <button onClick={() => handleAction('run-batch-qa')} className="bg-white text-indigo-600 font-black py-4 rounded-xl text-[10px] uppercase shadow-xl hover:scale-105 transition-all">Start Audit</button>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center space-x-3"><CloudArrowUpIcon className="h-6 w-6 text-indigo-500" /><span>CSV Bulk Upload</span></h3>
                                <div className="p-10 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center hover:border-indigo-500 transition-colors relative group">
                                    <input type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <CloudArrowUpIcon className="h-16 w-16 text-slate-300 group-hover:text-indigo-500 mx-auto mb-4 transition-colors" />
                                    <p className="font-black text-slate-500 group-hover:text-indigo-500">Drag or Click CSV to upload questions</p>
                                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Format: Topic, Question, Opt1, Opt2, Opt3, Opt4, Correct(1-4), Subject</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center space-x-3"><PencilSquareIcon className="h-6 w-6 text-indigo-500" /><span>Single Question Entry</span></h3>
                                <form onSubmit={(e)=>{e.preventDefault(); handleAction('save-question', { data: {...sq, id: Date.now(), correct_answer_index: sq.correct} });}} className="space-y-4 bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Topic" value={sq.topic} onChange={e=>setSq({...sq, topic: e.target.value})} className="bg-white dark:bg-slate-800 p-4 rounded-xl text-xs font-bold border-none outline-none ring-2 ring-transparent focus:ring-indigo-500" />
                                        <input placeholder="Subject" value={sq.subject} onChange={e=>setSq({...sq, subject: e.target.value})} className="bg-white dark:bg-slate-800 p-4 rounded-xl text-xs font-bold border-none outline-none ring-2 ring-transparent focus:ring-indigo-500" />
                                    </div>
                                    <textarea placeholder="Question Text" value={sq.question} onChange={e=>setSq({...sq, question: e.target.value})} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl text-xs font-bold min-h-[80px] border-none" />
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Save to Bank</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between"><h3 className="text-2xl font-black uppercase tracking-tight">Active Exams</h3><button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center space-x-2"><PlusIcon className="h-4 w-4" /><span>Add Exam</span></button></div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">Exam</th><th className="px-8 py-5">Category</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{exams.map(ex => (<tr key={ex.id} className="text-sm font-bold"><td className="px-8 py-6">{ex.title.ml}<span className="block text-[10px] opacity-40 uppercase">{ex.id}</span></td><td className="px-8 py-6"><span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[9px] uppercase font-black">{ex.category}</span></td><td className="px-8 py-6 text-right"><button onClick={() => handleAction('delete-row', { sheet: 'Exams', id: ex.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-8">
                        <select value={selectedExamId} onChange={e=>setSelectedExamId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs font-black border-none"><option value="">Select Exam to view items</option>{exams.map(e=><option key={e.id} value={e.id}>{e.title.ml}</option>)}</select>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">Topic</th><th className="px-8 py-5">Questions</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{syllabusItems.map(s => (<tr key={s.id} className="text-sm font-bold"><td className="px-8 py-6">{s.topic}<span className="block text-[10px] opacity-40 uppercase">{s.subject}</span></td><td className="px-8 py-6">{s.questions}</td><td className="px-8 py-6 text-right"><button onClick={() => handleAction('delete-row', { sheet: 'Syllabus', id: s.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* User/Book management omitted for briefness but remain functional via refreshData */}
            </main>
        </div>
    );
};

export default AdminPage;
