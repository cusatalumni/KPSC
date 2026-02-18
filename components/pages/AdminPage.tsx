
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
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import type { Exam, PracticeTest, Book } from '../../types';

type AdminTab = 'automation' | 'qbank' | 'exams' | 'syllabus' | 'books' | 'users' | 'settings';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [dbStatus, setDbStatus] = useState({sheets: false, supabase: false});
    const [status, setStatus] = useState<string | null>(null);
    const [auditInfo, setAuditInfo] = useState<{ nextId?: number, message?: string } | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [syllabusItems, setSyllabusItems] = useState<PracticeTest[]>([]);
    const [auditReport, setAuditReport] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});

    const [sq, setSq] = useState({ topic: '', question: '', options: ['', '', '', ''], correct: 1, subject: '' });

    const totalGaps = useMemo(() => auditReport.filter(r => r.count === 0).length, [auditReport]);

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
        if (activeTab === 'qbank' && auditReport.length === 0) {
            // Auto-fetch report if empty when entering qbank tab
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
        if (action === 'run-batch-qa' || action === 'reset-qa-audit' || action === 'run-language-repair') setAuditInfo(null);
        
        try {
            const r = await adminOp(action, payload);
            setStatus(r.message || "Action completed successfully.");
            
            if (action === 'run-batch-qa' && r.nextId !== undefined) {
                setAuditInfo({ nextId: r.nextId, message: r.message });
            }

            if (['delete-row', 'rebuild-db', 'run-daily-sync', 'run-targeted-gap-fill', 'run-all-gaps', 'run-book-scraper', 'run-book-audit', 'update-setting', 'run-language-repair'].includes(action)) {
                await refreshData(true);
            }
            
            if (action === 'run-targeted-gap-fill' || action === 'run-all-gaps') {
                setAuditReport(await adminOp('get-audit-report'));
            }
        } catch(e:any) { setStatus(e.message); setIsError(true); }
    };

    const handleToggleSetting = async (key: string, currentVal: any) => {
        const newVal = (String(currentVal) === 'true') ? 'false' : 'true';
        await handleAction('update-setting', { setting: { key, value: newVal } });
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
                    { id: 'users', label: 'Users', icon: ShieldCheckIcon },
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
                        <ToolCard title="Flashcard Generator" icon={TagIcon} action="run-flashcard-generator" color="bg-orange-600" desc="AI generates study cards from existing GK and Question Bank data." />
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 shadow-xl overflow-hidden relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Syllabus Gap Audit</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Identify empty mapped topics</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={async () => { setLoading(true); try { setAuditReport(await adminOp('get-audit-report')); } finally { setLoading(false); } }} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-slate-700 hover:scale-110 transition-all text-indigo-600">
                                            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* TOTAL GAPS HERO STAT */}
                                <div className={`mb-8 p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all duration-700 ${totalGaps > 0 ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'}`}>
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-4 rounded-2xl ${totalGaps > 0 ? 'bg-red-600' : 'bg-emerald-600'} text-white shadow-lg`}>
                                            {totalGaps > 0 ? <ExclamationTriangleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${totalGaps > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>Content Coverage</p>
                                            <p className={`text-2xl font-black ${totalGaps > 0 ? 'text-red-900 dark:text-red-100' : 'text-emerald-900 dark:text-emerald-100'}`}>
                                                {totalGaps === 0 ? 'Fully Mapped' : `${totalGaps} Empty Topics`}
                                            </p>
                                        </div>
                                    </div>
                                    {totalGaps > 0 && (
                                        <button onClick={() => handleAction('run-all-gaps')} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-xl hover:scale-105 transition-all">Fill All</button>
                                    )}
                                </div>

                                {auditReport.length > 0 ? (
                                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {auditReport.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="font-bold text-xs truncate">{r.topic}</p>
                                                    <p className={`text-[9px] font-black uppercase mt-1 ${r.count === 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                                        {r.count === 0 ? 'Empty Mapping: Questions Needed' : `${r.count} Questions Available`}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleAction('run-targeted-gap-fill', { topic: r.topic })}
                                                    className={`px-4 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${r.count === 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                                >
                                                    {r.count === 0 ? 'Fill Now' : 'Add More'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-400 text-xs font-bold text-center py-10">Run report to identify empty mapped topics from your Syllabus table.</p>}
                            </div>
                            
                            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><SparklesIcon className="h-32 w-32" /></div>
                                <h3 className="text-xl font-black uppercase mb-4 tracking-tight">QA Quality Audit</h3>
                                <p className="text-indigo-100 text-xs font-bold mb-4 leading-relaxed">AI realigns questions to provided syllabus mappings and fixes answers automatically.</p>
                                
                                {auditInfo?.nextId && (
                                    <div className="mb-6 bg-white/10 p-4 rounded-2xl border border-white/20 animate-fade-in">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Audit Cursor</p>
                                        <p className="text-sm font-black text-emerald-300">Resuming from ID: {auditInfo.nextId}</p>
                                    </div>
                                )}

                                <div className="flex flex-col space-y-3 relative z-10">
                                    <button onClick={() => handleAction('run-batch-qa')} className="bg-white text-indigo-600 font-black py-4 rounded-xl text-[10px] uppercase shadow-xl hover:scale-105 transition-all w-full">Start Sequential Audit</button>
                                    <button onClick={() => { if(confirm("Are you sure?")) handleAction('reset-qa-audit'); }} className="bg-indigo-800/50 text-white border border-indigo-400/30 font-black py-4 rounded-xl text-[10px] uppercase shadow-xl hover:bg-indigo-700 transition-all w-full">Reset Progress</button>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl border-b-[10px] border-rose-600">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><LanguageIcon className="h-32 w-32" /></div>
                                <h3 className="text-xl font-black uppercase mb-4 tracking-tight">Language Repair</h3>
                                <p className="text-slate-400 text-xs font-bold mb-6 leading-relaxed">Forces technical subjects (Engineering, IT, English) back into English format to ensure professional accuracy.</p>
                                <button 
                                    onClick={() => handleAction('run-language-repair')} 
                                    className="bg-rose-600 text-white font-black py-5 rounded-xl text-[10px] uppercase shadow-xl hover:scale-105 transition-all w-full flex items-center justify-center space-x-2"
                                >
                                    <ArrowPathIcon className="h-4 w-4" />
                                    <span>Restore Technical Terms</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800 flex items-start space-x-4 mb-6">
                            <LightBulbIcon className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-black uppercase text-indigo-700 dark:text-indigo-400 text-sm">Exam-to-Topic Mapping</h4>
                                <p className="text-xs font-medium text-indigo-800/60 dark:text-indigo-200/50 leading-relaxed">
                                    The table below shows which **Subjects** and **Topics** are mapped to each **Exam**. The AI Scraper uses this exact list to generate new questions. To add a new exam area, add a row to the 'Syllabus' tab in Google Sheets.
                                </p>
                            </div>
                        </div>

                        <select value={selectedExamId} onChange={e=>setSelectedExamId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs font-black border-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                            <option value="">Select Exam to view Mappings</option>
                            {exams.map(e=><option key={e.id} value={e.id}>{e.title.ml} ({e.title.en})</option>)}
                        </select>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500">
                                    <tr>
                                        <th className="px-8 py-5">Subject Mapping</th>
                                        <th className="px-8 py-5">Specific Topic</th>
                                        <th className="px-8 py-5 text-center">Questions</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {syllabusItems.length > 0 ? syllabusItems.map(s => (
                                        <tr key={s.id} className="text-sm font-bold group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-8 py-6">
                                                <span className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-[9px] uppercase font-black text-slate-600 dark:text-slate-300">
                                                    {s.subject}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-slate-800 dark:text-slate-100">{s.topic}</td>
                                            <td className="px-8 py-6 text-center text-slate-400 font-mono">{s.questions} Qs</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => handleAction('delete-row', { sheet: 'Syllabus', id: s.id })} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">Select an exam to view its mapped subject-topic combinations.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'exams' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between"><h3 className="text-2xl font-black uppercase tracking-tight">Active Exams</h3><button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center space-x-2"><PlusIcon className="h-4 w-4" /><span>Add Exam</span></button></div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">Exam</th><th className="px-8 py-5">Category</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{exams.map(ex => (<tr key={ex.id} className="text-sm font-bold"><td className="px-8 py-6">{ex.title.ml}<span className="block text-[10px] opacity-40 uppercase">{ex.id}</span></td><td className="px-8 py-6"><span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[9px] uppercase font-black">{ex.category}</span></td><td className="px-8 py-6 text-right"><button onClick={() => handleAction('delete-row', { sheet: 'Exams', id: ex.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Manage Bookstore</h3>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => handleAction('run-book-audit')} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center space-x-2 hover:bg-amber-600 transition-all"><WrenchScrewdriverIcon className="h-4 w-4" /><span>Auto-Repair</span></button>
                                <button onClick={() => handleAction('run-book-scraper')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg flex items-center space-x-2 hover:bg-indigo-700 transition-all"><SparklesIcon className="h-4 w-4" /><span>Scrape New</span></button>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500"><tr><th className="px-8 py-5">Book Title</th><th className="px-8 py-5 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{books.map(book => (<tr key={book.id} className="text-sm font-bold"><td className="px-8 py-6">{book.title}</td><td className="px-8 py-6 text-right"><button onClick={() => handleAction('delete-row', { sheet: 'Bookstore', id: book.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// Internal icon component for the audit hero stat
const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export default AdminPage;
