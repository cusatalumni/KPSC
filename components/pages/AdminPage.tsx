
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    getExams,
    testConnection,
    getExamSyllabus,
    getSubscriptions,
    getBooks,
    getSettings,
    updateSetting
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
import { TagIcon } from '../icons/TagIcon';
import { WrenchScrewdriverIcon } from '../icons/WrenchScrewdriverIcon';
import { Cog6ToothIcon } from '../icons/Cog6ToothIcon';
import { LanguageIcon } from '../icons/LanguageIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import type { Exam, PracticeTest, Book } from '../../types';

type AdminTab = 'automation' | 'qbank' | 'exams' | 'syllabus' | 'books' | 'users' | 'settings';

interface AuditReport {
    syllabusReport: { id: string; topic: string; count: number }[];
    orphanCount: number;
    orphanTopics: string[];
}

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
    const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
    const [settings, setSettings] = useState<any>({});
    const [bulkQuestions, setBulkQuestions] = useState<any[]>([]);
    
    // Modals
    const [showSingleModal, setShowSingleModal] = useState(false);
    const [editingExam, setEditingExam] = useState<any | null>(null);
    const [editingBook, setEditingBook] = useState<any | null>(null);

    const [singleQ, setSingleQ] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 1,
        topic: '',
        subject: '',
        explanation: ''
    });

    const totalGaps = useMemo(() => auditReport?.syllabusReport.filter(r => r.count === 0).length || 0, [auditReport]);

    const refreshData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, subs, bks, s] = await Promise.all([getExams(), getSubscriptions(), getBooks(), getSettings()]);
            setExams(examRes.exams || []);
            setSubscriptions(subs || []);
            setBooks(bks || []);
            if (s) setSettings(s);
        } catch (e) { console.error("Admin refresh error:", e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refreshData(); }, [refreshData]);

    useEffect(() => { 
        if (activeTab === 'syllabus' && selectedExamId) {
            getExamSyllabus(selectedExamId).then(items => setSyllabusItems(items));
        }
        if (activeTab === 'qbank' && !auditReport) {
            adminOp('get-audit-report').then(report => setAuditReport(report)).catch(() => {});
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
        setStatus("Processing operation..."); 
        setIsError(false);
        
        try {
            const r = await adminOp(action, payload);
            setStatus(r.message || "Action completed successfully.");
            
            if (['delete-row', 'rebuild-db', 'run-daily-sync', 'run-book-scraper', 'update-setting', 'upload-questions', 'save-row'].includes(action)) {
                await refreshData(true);
            }
        } catch(e:any) { setStatus(e.message); setIsError(true); }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const parsed = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const obj: any = {};
                headers.forEach((h, i) => { if (h === 'options') obj[h] = values[i].includes('|') ? values[i].split('|') : [values[i]]; else obj[h] = values[i]; });
                return obj;
            });
            setBulkQuestions(parsed);
            setStatus(`${parsed.length} questions ready for upload.`);
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
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-6">
                    <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${dbStatus.sheets ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div><span className="text-[10px] font-black uppercase tracking-widest">Sheets: {dbStatus.sheets ? 'ONLINE' : 'OFFLINE'}</span></div>
                    <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div><span className="text-[10px] font-black uppercase tracking-widest">Supabase: {dbStatus.supabase ? 'ONLINE' : 'OFFLINE'}</span></div>
                </div>
                <button onClick={onBack} className="bg-slate-800 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center space-x-2 font-black text-xs uppercase hover:bg-slate-950 transition-all"><ChevronLeftIcon className="h-4 w-4" /><span>Dashboard</span></button>
            </div>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className="flex items-center space-x-3">{isError ? <XMarkIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}<p className="font-black text-xs uppercase tracking-widest">{status}</p></div>
                    <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'automation', label: 'Automation', icon: BeakerIcon },
                    { id: 'qbank', label: 'Q-Bank', icon: ClipboardListIcon },
                    { id: 'exams', label: 'Exams', icon: AcademicCapIcon },
                    { id: 'syllabus', label: 'Syllabus', icon: PlusIcon },
                    { id: 'books', label: 'Books', icon: BookOpenIcon },
                    { id: 'users', label: 'Users', icon: UserGroupIcon },
                    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as AdminTab)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 border border-transparent hover:border-indigo-500'}`}>
                        <t.icon className="h-4 w-4" /><span>{t.label}</span>
                    </button>
                ))}
            </div>

            <main className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border dark:border-slate-800 min-h-[600px] relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}

                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ToolCard title="Full DB Sync" icon={ArrowPathIcon} action="rebuild-db" color="bg-red-600" desc="Synchronizes all records from Google Sheets to Supabase production database." />
                        <ToolCard title="PSC Daily Sync" icon={SparklesIcon} action="run-daily-sync" color="bg-indigo-600" desc="Full cycle sync: Jobs, Live Updates, CA, GK and Gap Filler." />
                        <ToolCard title="Job Notifications" icon={BellIcon} action="run-scraper-notifications" color="bg-emerald-600" desc="Scrapes official PSC site for active job announcements." />
                        <ToolCard title="PSC Live Updates" icon={RssIcon} action="run-scraper-updates" color="bg-cyan-600" desc="Real-time sync for results, rank lists and exam schedules." />
                        <ToolCard title="GK Fact Scraper" icon={LightBulbIcon} action="run-gk-scraper" color="bg-amber-500" desc="Generates unique study facts for the daily widget." />
                        <ToolCard title="Book Store Sync" icon={BookOpenIcon} action="run-book-scraper" color="bg-slate-800" desc="Updates bookstore with top Amazon PSC guides." />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                        <h3 className="text-2xl font-black uppercase tracking-tight">App Configuration</h3>
                        <div className="space-y-6">
                            {Object.entries(settings).map(([key, value]) => (
                                <div key={key} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{key.replace(/_/g, ' ')}</label>
                                    <div className="flex items-center space-x-3">
                                        <input 
                                            type="text" 
                                            defaultValue={String(value)}
                                            onBlur={async (e) => await handleAction('update-setting', { setting: { key, value: e.target.value } })}
                                            className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border-none font-bold text-sm shadow-inner" 
                                        />
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircleIcon className="h-4 w-4" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-8 animate-fade-in">
                         <div className="flex items-center justify-between"><h3 className="text-2xl font-black uppercase tracking-tight">Registered Subscribers</h3><p className="text-sm font-bold text-slate-400">{subscriptions.length} Users Total</p></div>
                         <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">
                                    <tr><th className="px-8 py-5">User ID</th><th className="px-8 py-5">Plan</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Expiry</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subscriptions.map(sub => (
                                        <tr key={sub.user_id} className="text-sm font-bold">
                                            <td className="px-8 py-6 font-mono text-xs">{sub.user_id}</td>
                                            <td className="px-8 py-6">{sub.plan_type}</td>
                                            <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${sub.status === 'pro' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{sub.status}</span></td>
                                            <td className="px-8 py-6 text-right text-slate-400 text-xs">{new Date(sub.expiry_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between"><h3 className="text-2xl font-black uppercase tracking-tight">Active Exams</h3><button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center space-x-2"><PlusIcon className="h-4 w-4" /><span>Add Exam</span></button></div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">Exam</th><th className="px-8 py-5">Category</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{exams.map(ex => (<tr key={ex.id} className="text-sm font-bold"><td className="px-8 py-6">{ex.title.ml}<span className="block text-[10px] opacity-40 uppercase">{ex.id}</span></td><td className="px-8 py-6"><span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[9px] uppercase font-black">{ex.category}</span></td><td className="px-8 py-6 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => setEditingExam({...ex, title_ml: ex.title.ml, title_en: ex.title.en, description_ml: ex.description.ml, description_en: ex.description.en, icon_type: 'book'})} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilSquareIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleAction('delete-row', { sheet: 'Exams', id: ex.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Manage Bookstore</h3>
                            <button onClick={() => handleAction('run-book-scraper')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center space-x-2 hover:bg-indigo-700 transition-all"><SparklesIcon className="h-4 w-4" /><span>Scrape New</span></button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">Book Title</th><th className="px-8 py-5">Author</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{books.map(book => (<tr key={book.id} className="text-sm font-bold"><td className="px-8 py-6 max-w-xs truncate">{book.title}</td><td className="px-8 py-6">{book.author}</td><td className="px-8 py-6 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => setEditingBook(book)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilSquareIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleAction('delete-row', { sheet: 'Bookstore', id: book.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* EDIT EXAM MODAL */}
            {editingExam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase tracking-tight">Edit Exam Data</h3><button onClick={() => setEditingExam(null)} className="p-2 hover:bg-slate-100 rounded-full"><XMarkIcon className="h-6 w-6" /></button></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Title (Malayalam)</label><input type="text" value={editingExam.title_ml} onChange={e=>setEditingExam({...editingExam, title_ml: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                            <div className="col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Title (English)</label><input type="text" value={editingExam.title_en} onChange={e=>setEditingExam({...editingExam, title_en: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Category</label><input type="text" value={editingExam.category} onChange={e=>setEditingExam({...editingExam, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Level</label><input type="text" value={editingExam.level} onChange={e=>setEditingExam({...editingExam, level: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                        </div>
                        <button onClick={async () => { await handleAction('save-row', { sheet: 'Exams', rowData: editingExam }); setEditingExam(null); }} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 mt-10 uppercase tracking-widest text-xs">Save Changes</button>
                    </div>
                </div>
            )}

            {/* EDIT BOOK MODAL */}
            {editingBook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase tracking-tight">Edit Book Details</h3><button onClick={() => setEditingBook(null)} className="p-2 hover:bg-slate-100 rounded-full"><XMarkIcon className="h-6 w-6" /></button></div>
                        <div className="space-y-4">
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Book Title</label><input type="text" value={editingBook.title} onChange={e=>setEditingBook({...editingBook, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Author</label><input type="text" value={editingBook.author} onChange={e=>setEditingBook({...editingBook, author: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Amazon Affiliate Link</label><input type="text" value={editingBook.amazonLink} onChange={e=>setEditingBook({...editingBook, amazonLink: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Image URL</label><input type="text" value={editingBook.imageUrl} onChange={e=>setEditingBook({...editingBook, imageUrl: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-none font-bold" /></div>
                        </div>
                        <button onClick={async () => { await handleAction('save-row', { sheet: 'Bookstore', rowData: editingBook }); setEditingBook(null); }} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 mt-10 uppercase tracking-widest text-xs">Update Book</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
