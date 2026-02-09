
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    triggerDailyScraper, 
    triggerBookScraper, 
    getBooks, 
    deleteBook, 
    getExams,
    syncCsvData,
    testConnection,
    addQuestion,
    getExamSyllabus,
    getSettings,
    updateSetting,
    clearStudyCache
} from '../../services/pscDataService';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { StarIcon } from '../icons/StarIcon';
// Added missing import for XMarkIcon
import { XMarkIcon } from '../icons/XMarkIcon';
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
    const [dbDetails, setDbDetails] = useState<{sheets: string | null, supabase: string | null}>({sheets: null, supabase: null});
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
    const [dataSource, setDataSource] = useState<'Database' | 'Static Fallback'>('Static Fallback');
    
    const [bulkData, setBulkData] = useState('');
    const [syllabusBulkData, setSyllabusBulkData] = useState('');
    const [newQ, setNewQ] = useState<Partial<QuizQuestion>>({
        question: '', topic: '', subject: 'GK', difficulty: 'Moderate', 
        options: ['', '', '', ''], correctAnswerIndex: 0
    });

    const refresh = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const token = await getToken();
            
            // 1. Check Connections
            try {
                const conn = await testConnection(token);
                if (conn && conn.status) setDbStatus(conn.status);
                if (conn && conn.details) setDbDetails(conn.details);
            } catch (e: any) {
                console.error("Test Connection failed:", e.message);
                if (e.message.includes('Clerk') || e.message.includes('Unauthorized')) {
                   setStatus("Security Error: " + e.message);
                   setIsError(true);
                }
            }

            // 2. Load Exams with real source tracking
            const examResult = await getExams();
            setExams(examResult.exams);
            setDataSource(examResult.source === 'database' ? 'Database' : 'Static Fallback');

            // 3. Load other essentials
            const [b, settings] = await Promise.all([
                getBooks(),
                getSettings(true)
            ]);
            setBooks(b);
            if (settings && settings.subscription_model_active !== undefined) {
                setIsSubscriptionActive(settings.subscription_model_active === 'true');
            }
        } catch (err: any) { 
            console.error("Admin Refresh Failed:", err); 
            setStatus("Admin Portal Error: " + err.message);
            setIsError(true);
        } finally { if (!isSilent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        if (selectedExamId) {
            getExamSyllabus(selectedExamId).then(setSyllabusItems);
        } else {
            setSyllabusItems([]);
        }
    }, [selectedExamId]);

    const handleAction = async (fn: () => Promise<any>, shouldRefresh: boolean = true) => {
        setStatus("Processing Task... Please do not close the window.");
        setIsError(false);
        setLoading(true);
        try { 
            const res = await fn(); 
            const msg = res.message || "Operation successful!";
            const details = res.result ? ` (${res.result.success?.length || 0} tasks OK)` : "";
            setStatus(msg + details); 
            if (shouldRefresh) await refresh(true); 
        } catch(e:any) { 
            console.error("Admin Action Failed:", e);
            setStatus("Action Failed: " + e.message); 
            setIsError(true);
        } finally { setLoading(false); }
    };

    const handleSingleQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        await handleAction(() => addQuestion(newQ, token));
        setNewQ({ question: '', topic: '', subject: 'GK', difficulty: 'Moderate', options: ['', '', '', ''], correctAnswerIndex: 0 });
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button 
            onClick={() => { setActiveTab(id); setStatus(null); }} 
            className={`flex items-center space-x-3 px-7 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === id ? 'bg-indigo-600 text-white shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500'}`}
        >
            {React.createElement(icon, { className: "h-4.5 w-4.5" })}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4 animate-fade-in">
            {/* Context Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl gap-6">
                <button onClick={onBack} className="flex items-center space-x-3 text-indigo-600 font-black hover:bg-indigo-50 px-6 py-2.5 rounded-xl transition-all">
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Dashboard</span>
                </button>
                
                <div className="flex flex-wrap items-center justify-center gap-8">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 cursor-help" title={dbDetails.sheets || 'Database Status'}>
                            <div className={`w-3 h-3 rounded-full ${dbStatus.sheets ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${dbStatus.sheets ? 'text-emerald-600' : 'text-slate-400'}`}>Google Sheets</span>
                        </div>
                        <div className="flex items-center space-x-2 cursor-help" title={dbDetails.supabase || 'Supabase Status'}>
                            <div className={`w-3 h-3 rounded-full ${dbStatus.supabase ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-300 dark:bg-slate-700 shadow-[0_0_10px_rgba(0,0,0,0.1)]'}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${dbStatus.supabase ? 'text-indigo-600' : 'text-slate-400'}`}>Supabase DB</span>
                        </div>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Current Data Scope</p>
                             <p className={`text-[10px] font-black uppercase ${dataSource === 'Database' ? 'text-indigo-600' : 'text-amber-500'}`}>{dataSource}</p>
                        </div>
                        <button onClick={() => refresh()} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-90" title="Re-check Connections">
                            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <header className="bg-slate-950 p-12 rounded-[4rem] text-white shadow-2xl border-b-[10px] border-indigo-600 flex justify-between items-center relative overflow-hidden ring-1 ring-white/10">
                <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><ShieldCheckIcon className="h-64 w-64" /></div>
                <div className="flex items-center space-x-8 relative z-10">
                    <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-600/30 ring-4 ring-indigo-500/20"><ShieldCheckIcon className="h-12 w-12 text-white" /></div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Console</h1>
                        <p className="text-indigo-400 text-[11px] font-black tracking-[0.4em] uppercase opacity-80">Infrastructure Management</p>
                    </div>
                </div>
            </header>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-2xl animate-fade-in flex items-center space-x-6 ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className={`w-3 h-3 rounded-full ${isError ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]'} animate-pulse`}></div>
                    <div className="flex-1">
                        <p className="font-black text-xs uppercase tracking-[0.1em]">{status}</p>
                    </div>
                    <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Managed Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Course Architecture', ClipboardListIcon)}
                {tabBtn('questions', 'Central Q-Bank', PlusIcon)}
                {tabBtn('bookstore', 'Amazon Store', BookOpenIcon)}
                {tabBtn('subscriptions', 'Access Logic', StarIcon)}
            </div>

            <main className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 min-h-[700px] ring-1 ring-slate-100 dark:ring-slate-800">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            { icon: RssIcon, color: 'bg-indigo-600', title: 'Global Sync', desc: 'Auto-update Notifications, GK & News from PSC', action: () => triggerDailyScraper },
                            { icon: BookOpenIcon, color: 'bg-emerald-600', title: 'Amazon Refresh', desc: 'Pull latest rank files into the Bookstore', action: () => triggerBookScraper },
                            { icon: ArrowPathIcon, color: 'bg-rose-600', title: 'Purge AI Cache', desc: 'Delete cached AI notes to force regeneration', action: () => clearStudyCache }
                        ].map((card, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-950 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 text-center hover:border-indigo-500 hover:shadow-2xl transition-all duration-500 group flex flex-col items-center">
                                <div className={`${card.color} w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    <card.icon className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="font-black text-base uppercase tracking-[0.2em] mb-3 dark:text-white">{card.title}</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase mb-10 leading-relaxed max-w-[200px]">{card.desc}</p>
                                <button onClick={async () => handleAction(async () => card.action()(await getToken()))} disabled={loading} className={`${card.color} w-full text-white py-5 rounded-[1.5rem] font-black text-xs tracking-[0.3em] shadow-xl active:scale-95 transition-all uppercase mt-auto`}>Deploy Task</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-10">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-8">
                             <h3 className="text-3xl font-black tracking-tighter">Live Exams Hub</h3>
                             <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-2.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                                 <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{exams.length} Items</span>
                             </div>
                        </div>
                        {dataSource === 'Static Fallback' && (
                            <div className="p-6 bg-amber-50 border-l-8 border-amber-400 rounded-2xl mb-8">
                                <p className="text-amber-800 font-bold text-sm">⚠️ Note: Database connection is inactive. Showing static application constants instead. Management features will not work until database is connected.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map(ex => (
                                <div key={ex.id} className="flex items-center justify-between p-7 border-2 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 group hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 shadow-sm hover:shadow-xl">
                                    <div className="flex items-center space-x-5">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] shadow-lg border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">{ex.icon}</div>
                                        <div className="min-w-0">
                                            <p className="font-black text-base text-slate-900 dark:text-white leading-tight truncate">{ex.title.ml}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1.5 opacity-60">{ex.id}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => { if(confirm("Permanently remove this exam from the registry?")) handleAction(async () => deleteBook(ex.id, await getToken())) }} 
                                        disabled={dataSource === 'Static Fallback'}
                                        className="text-red-500 hover:bg-red-50 p-3.5 rounded-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-75 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {exams.length === 0 && !loading && (
                            <div className="text-center py-32 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <AcademicCapIcon className="h-20 w-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">No active exams found</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-16">
                        <section className="bg-slate-950 p-12 rounded-[3.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-10 text-white rotate-45"><PlusIcon className="h-64 w-64" /></div>
                            <div className="flex items-center space-x-5 mb-12 relative z-10">
                                <div className="bg-indigo-600 p-4 rounded-2xl"><PlusIcon className="h-7 w-7 text-white" /></div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Manual Question Entry</h3>
                            </div>
                            <form onSubmit={handleSingleQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Target Exam / Topic</label>
                                    <input value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="e.g. LDC, History, Science" className="w-full p-6 border-2 border-white/10 rounded-2xl text-sm font-black bg-white/5 text-white placeholder-white/20 focus:border-indigo-500 focus:ring-4 ring-indigo-500/10 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Subject Area</label>
                                    <input value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="e.g. GK, Mental Ability" className="w-full p-6 border-2 border-white/10 rounded-2xl text-sm font-black bg-white/5 text-white placeholder-white/20 focus:border-indigo-500 focus:ring-4 ring-indigo-500/10 outline-none transition-all" required />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Question Body (Malayalam preferred)</label>
                                    <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Enter the full question text here..." className="w-full p-7 border-2 border-white/10 rounded-[2.5rem] text-sm font-black bg-white/5 text-white placeholder-white/20 focus:border-indigo-500 focus:ring-4 ring-indigo-500/10 outline-none transition-all" rows={5} required />
                                </div>
                                {newQ.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-5 bg-white/5 p-5 rounded-[2rem] border-2 border-white/5 hover:border-indigo-500/50 transition-all group">
                                        <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-indigo-600/20">{String.fromCharCode(65+i)}</div>
                                        <input value={opt} onChange={e => { const o = [...(newQ.options || [])]; o[i] = e.target.value; setNewQ({...newQ, options: o})}} placeholder={`Answer Option ${i+1}`} className="flex-1 text-sm font-bold bg-transparent text-white outline-none placeholder-white/10" required />
                                        <div className="flex items-center justify-center w-10 h-10">
                                            <input type="radio" name="correct" checked={newQ.correctAnswerIndex === i} onChange={() => setNewQ({...newQ, correctAnswerIndex: i})} className="w-7 h-7 accent-indigo-500 cursor-pointer" />
                                        </div>
                                    </div>
                                ))}
                                <button type="submit" disabled={loading || dataSource === 'Static Fallback'} className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white py-7 rounded-[2rem] font-black shadow-2xl tracking-[0.4em] text-xs uppercase transition-all active:scale-95 flex items-center justify-center space-x-4 disabled:opacity-50">
                                    <span>Commit to Database</span>
                                </button>
                            </form>
                        </section>
                        
                        <section className="pt-16 border-t-4 border-slate-50 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.4em]">Batch Upload Console</h3>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">CSV Format Required</div>
                            </div>
                            <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Format: ID, Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty" className="w-full h-72 p-10 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] font-mono text-[12px] bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                            <button onClick={async () => handleAction(async () => syncCsvData('QuestionBank', bulkData, await getToken(), true))} disabled={dataSource === 'Static Fallback'} className="w-full mt-8 bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xs shadow-[0_20px_50px_rgba(16,185,129,0.3)] tracking-[0.3em] hover:bg-emerald-500 transition-all uppercase active:scale-95 disabled:opacity-50">Initiate Bulk Append</button>
                        </section>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-10">
                        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-8">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tighter">Inventory Control</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Amazon Affiliate Marketplace</p>
                            </div>
                            <button onClick={async () => handleAction(async () => triggerBookScraper(await getToken()))} disabled={dataSource === 'Static Fallback'} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl uppercase tracking-widest hover:scale-105 active:scale-90 transition-all text-[11px] disabled:opacity-50">Sync Amazon Marketplace</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {books.map(b => (
                                <div key={b.id} className="flex items-center p-7 border-2 rounded-[3rem] bg-white dark:bg-slate-950 group hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 relative">
                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className="font-black text-sm truncate text-slate-900 dark:text-white">{b.title}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1.5 opacity-60 italic">{b.author || 'Unknown Author'}</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Are you sure you want to remove this book?")) handleAction(async () => deleteBook(b.id, await getToken())) }} disabled={dataSource === 'Static Fallback'} className="text-red-500 p-3 rounded-2xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed"><TrashIcon className="h-6 w-6" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-xl mx-auto py-24 text-center space-y-12">
                        <div className={`p-16 rounded-[5rem] border-4 transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 shadow-none'}`}>
                            <div className={`${isSubscriptionActive ? 'text-indigo-600 drop-shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-400'} mb-12 transform scale-[2]`}>
                                <StarIcon className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-5xl font-black mb-6 tracking-tighter text-slate-900">Access Policy</h3>
                            <p className="text-sm text-slate-500 mb-14 leading-relaxed font-bold max-w-sm mx-auto opacity-80">Define the core monetization strategy. Switching to 'Free' ignores all subscription checks and grants Pro features to all authenticated users instantly.</p>
                            <button 
                                onClick={async () => {
                                    const newVal = !isSubscriptionActive;
                                    const token = await getToken();
                                    handleAction(() => updateSetting('subscription_model_active', String(newVal), token));
                                }}
                                disabled={dataSource === 'Static Fallback'}
                                className={`w-full py-7 rounded-[2.5rem] font-black text-xs tracking-[0.4em] uppercase transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50 ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-white'}`}
                            >
                                {isSubscriptionActive ? 'Deactivate Paywall' : 'Enable Paywall System'}
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'syllabus' && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-10">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tighter">Course Architecture</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Syllabus & Topic Mapping</p>
                            </div>
                            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full md:w-auto p-6 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-xs font-black bg-slate-50 dark:bg-slate-950 outline-none uppercase tracking-widest shadow-inner cursor-pointer hover:border-indigo-500 transition-all">
                                <option value="">Select Target Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                        </div>
                        <div className="space-y-8">
                            <textarea value={syllabusBulkData} onChange={e => setSyllabusBulkData(e.target.value)} placeholder="Format: ID, ExamID, Title, QCount, Duration, Subject, Topic" className="w-full h-72 p-10 border-2 border-slate-100 dark:border-slate-800 rounded-[4rem] font-mono text-[12px] bg-slate-50 dark:bg-slate-950 outline-none focus:border-indigo-500 transition-all shadow-inner" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button onClick={async () => handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), true))} disabled={dataSource === 'Static Fallback'} className="bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 transition-all disabled:opacity-50">Append to Map</button>
                                <button onClick={async () => { if(confirm("Are you absolutely sure?")) handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), false)) }} disabled={dataSource === 'Static Fallback'} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-300 transition-all disabled:opacity-50">Replace Global Map</button>
                            </div>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {syllabusItems.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-6 bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] shadow-sm group hover:border-indigo-500 transition-all">
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{s.title}</span>
                                        <span className="text-[10px] text-indigo-500 font-bold mt-1.5 uppercase tracking-tighter opacity-80">{s.topic} • {s.questions} Qs</span>
                                    </div>
                                    <button onClick={async () => { if(confirm("Remove mapping?")) handleAction(async () => deleteBook(s.id, await getToken())) }} disabled={dataSource === 'Static Fallback'} className="text-red-500 p-3 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-2xl active:scale-75 disabled:cursor-not-allowed"><TrashIcon className="h-6 w-6" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
