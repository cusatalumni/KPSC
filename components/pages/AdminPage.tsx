
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
    unclassifiedCount: number;
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
    
    // Modals
    const [editingExam, setEditingExam] = useState<any | null>(null);
    const [editingBook, setEditingBook] = useState<any | null>(null);

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
            
            // Refresh audit report if in qbank tab
            if (activeTab === 'qbank') {
                const report = await adminOp('get-audit-report');
                setAuditReport(report);
            }
        } catch (e) { console.error("Admin refresh error:", e); } finally { if (!silent) setLoading(false); }
    }, [getToken, activeTab]);

    useEffect(() => { refreshData(); }, [refreshData]);

    useEffect(() => { 
        if (activeTab === 'syllabus' && selectedExamId) {
            getExamSyllabus(selectedExamId).then(items => setSyllabusItems(items));
        }
        if (activeTab === 'qbank') {
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
            
            if (['delete-row', 'rebuild-db', 'run-daily-sync', 'run-book-scraper', 'update-setting', 'save-row', 'run-batch-qa', 'run-language-repair', 'run-explanation-repair', 'run-all-gaps'].includes(action)) {
                await refreshData(true);
            }
        } catch(e:any) { setStatus(e.message); setIsError(true); }
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
                    { id: 'qbank', label: 'QA Audit', icon: ShieldCheckIcon },
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
                        <ToolCard title="Language Repair" icon={LanguageIcon} action="run-language-repair" color="bg-cyan-600" desc="Fixes questions that were accidentally translated to Malayalam instead of English." />
                        <ToolCard title="AI Explanations" icon={SparklesIcon} action="run-explanation-repair" color="bg-emerald-600" desc="AI generation of missing explanations for questions in the database." />
                        <ToolCard title="Book Store Sync" icon={BookOpenIcon} action="run-book-scraper" color="bg-slate-800" desc="Updates bookstore with top Amazon PSC guides." />
                        <ToolCard title="GK Fact Scraper" icon={LightBulbIcon} action="run-gk-scraper" color="bg-amber-500" desc="Generates unique study facts for the daily widget." />
                    </div>
                )}

                {activeTab === 'qbank' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-[2.5rem] border-2 border-orange-100 dark:border-orange-800 shadow-xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-2">Unclassified Items</h4>
                                    <p className="text-5xl font-black text-orange-700 dark:text-orange-300">{auditReport?.unclassifiedCount || 0}</p>
                                    <p className="text-xs font-bold text-orange-500 mt-2">Questions labeled as 'Other' or 'Manual Check'</p>
                                </div>
                                <button onClick={() => handleAction('run-batch-qa')} className="mt-6 w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-orange-700 transition-all text-[10px] uppercase tracking-widest">Fix All Subjects</button>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-800 shadow-xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-2">Syllabus Gaps</h4>
                                    <p className="text-5xl font-black text-indigo-700 dark:text-indigo-300">{totalGaps}</p>
                                    <p className="text-xs font-bold text-indigo-500 mt-2">Micro-topics with zero questions</p>
                                </div>
                                <button onClick={() => handleAction('run-all-gaps')} className="mt-6 w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all text-[10px] uppercase tracking-widest">Auto-Fill Gaps</button>
                            </div>
                            
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-800 shadow-xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2">Total Topics</h4>
                                    <p className="text-5xl font-black text-emerald-700 dark:text-emerald-300">{auditReport?.syllabusReport.length || 0}</p>
                                    <p className="text-xs font-bold text-emerald-500 mt-2">Verified micro-topics in syllabus</p>
                                </div>
                                <button onClick={() => refreshData()} className="mt-6 w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all text-[10px] uppercase tracking-widest">Refresh Report</button>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">
                                    <tr><th className="px-8 py-5">Syllabus Topic</th><th className="px-8 py-5">Question Count</th><th className="px-8 py-5 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {auditReport?.syllabusReport.map(report => (
                                        <tr key={report.id} className="text-sm font-bold">
                                            <td className="px-8 py-6">{report.topic}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${report.count === 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {report.count} Questions
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => handleAction('run-targeted-gap-fill', { topic: report.topic })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                    <SparklesIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Micro-Topic Manager</h3>
                            <select 
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-none font-bold text-sm shadow-inner min-w-[250px]"
                            >
                                <option value="">Select an Exam</option>
                                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title.ml}</option>)}
                            </select>
                        </div>

                        {selectedExamId ? (
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">
                                        <tr><th className="px-8 py-5">Topic Name</th><th className="px-8 py-5">Subject</th><th className="px-8 py-5 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {syllabusItems.map(item => (
                                            <tr key={item.id} className="text-sm font-bold">
                                                <td className="px-8 py-6">{item.topic}</td>
                                                <td className="px-8 py-6"><span className="text-[10px] text-slate-400">{item.subject}</span></td>
                                                <td className="px-8 py-6 text-right">
                                                    <button onClick={() => handleAction('delete-row', { sheet: 'Syllabus', id: item.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <PlusIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">Select an exam above to manage its syllabus items.</p>
                            </div>
                        )}
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
