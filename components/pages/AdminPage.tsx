
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
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
import { XMarkIcon } from '../icons/XMarkIcon';
import { BellIcon } from '../icons/BellIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
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
    
    const subjectsList = useMemo(() => ['GK', 'Malayalam', 'English', 'Mental Ability', 'General Science', 'Indian History', 'Kerala History', 'Indian Geography', 'Current Affairs', 'Nursing', 'Engineering'], []);
    const examTopics = useMemo(() => exams.map(e => e.title.ml), [exams]);

    const [bulkData, setBulkData] = useState('');
    const [syllabusBulkData, setSyllabusBulkData] = useState('');
    const [newQ, setNewQ] = useState<Partial<QuizQuestion>>({
        question: '', topic: '', subject: 'GK', difficulty: 'Moderate', 
        options: ['', '', '', ''], correctAnswerIndex: 0, explanation: ''
    });

    const refresh = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const token = await getToken();
            try {
                const conn = await testConnection(token);
                if (conn && conn.status) setDbStatus(conn.status);
                if (conn && conn.details) setDbDetails(conn.details);
            } catch (e: any) { console.error("Status check failed"); }
            const examResult = await getExams();
            setExams(examResult.exams);
            setDataSource(examResult.source === 'database' ? 'Database' : 'Static Fallback');
            const [b, settings] = await Promise.all([getBooks(), getSettings(true)]);
            setBooks(b);
            if (settings && settings.subscription_model_active !== undefined) {
                setIsSubscriptionActive(settings.subscription_model_active === 'true');
            }
        } catch (err: any) { 
            setStatus("Portal Error: " + err.message);
            setIsError(true);
        } finally { if (!isSilent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        if (selectedExamId) {
            getExamSyllabus(selectedExamId).then(setSyllabusItems);
        } else { setSyllabusItems([]); }
    }, [selectedExamId]);

    const handleAction = async (fn: () => Promise<any>, shouldRefresh: boolean = true) => {
        setStatus("Deploying request to cloud handlers...");
        setIsError(false);
        setLoading(true);
        
        // Add a safeguard timeout for the UI
        const uiTimeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setStatus("Request is taking longer than expected. Please check your tabs in 1 minute.");
            }
        }, 15000);

        try { 
            const res = await fn(); 
            clearTimeout(uiTimeout);
            setStatus(res.message || "Operation successful!"); 
            if (shouldRefresh) await refresh(true); 
        } catch(e:any) { 
            clearTimeout(uiTimeout);
            let msg = e.message;
            if (msg.includes('row-level security')) {
                msg = "Supabase Access Denied: Go to Database > Policies and disable RLS for this table.";
            }
            setStatus("Execution Error: " + msg); 
            setIsError(true);
        } finally { 
            setLoading(false); 
        }
    };

    const runIndividualScraper = async (action: string) => {
        const token = await getToken();
        await handleAction(async () => {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action })
            });
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        });
    };

    const handleSingleQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        await handleAction(() => addQuestion(newQ, token));
        setNewQ({ question: '', topic: '', subject: 'GK', difficulty: 'Moderate', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' });
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button 
            onClick={() => { setActiveTab(id); setStatus(null); }} 
            className={`flex items-center space-x-3 px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-300 ${activeTab === id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-indigo-500'}`}
        >
            {React.createElement(icon, { className: "h-4.5 w-4.5" })}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* System Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center space-x-5">
                    <div className={`w-4 h-4 rounded-full ${dbStatus.sheets ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cloud Sheets</p>
                        <p className="text-sm font-black uppercase">{dbStatus.sheets ? 'Synchronized' : 'Offline'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center space-x-5">
                    <div className={`w-4 h-4 rounded-full ${dbStatus.supabase ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supabase DB</p>
                        <p className="text-sm font-black uppercase">{dbStatus.supabase ? 'ACTIVE' : 'Unlinked'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center space-x-5">
                    <div className={`w-4 h-4 rounded-full ${dataSource === 'Database' ? 'bg-indigo-600' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}></div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">App Engine</p>
                        <p className="text-sm font-black uppercase">{dataSource}</p>
                    </div>
                </div>
                <button onClick={onBack} className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:bg-indigo-500 transition-all">
                    <span className="font-black text-sm uppercase tracking-widest ml-2">Dashboard</span>
                    <ChevronLeftIcon className="h-6 w-6 transform group-hover:-translate-x-2 transition-transform" />
                </button>
            </div>

            {status && (
                <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl animate-fade-in flex items-center justify-between ${isError ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200' : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-200'}`}>
                    <div className="flex items-center space-x-6">
                        <div className={`w-4 h-4 rounded-full ${isError ? 'bg-red-500' : 'bg-indigo-500'} animate-pulse`}></div>
                        <p className="font-black text-xs uppercase tracking-widest leading-relaxed max-w-[70%]">{status}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => { setLoading(false); setStatus(null); }} className="px-4 py-2 bg-black/10 rounded-lg text-[10px] font-black uppercase">Force Reset</button>
                        <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full transition-all">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 scrollbar-hide pb-2">
                {tabBtn('automation', 'Protocols', RssIcon)}
                {tabBtn('exams', 'Exams Index', AcademicCapIcon)}
                {tabBtn('syllabus', 'Sprints', ClipboardListIcon)}
                {tabBtn('questions', 'Q-Injector', PlusIcon)}
                {tabBtn('bookstore', 'Amazon Store', BookOpenIcon)}
                {tabBtn('subscriptions', 'Access Wall', StarIcon)}
            </div>

            <main className="bg-white dark:bg-slate-950 p-2 md:p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 min-h-[600px]">
                {activeTab === 'automation' && (
                    <div className="space-y-12">
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Granular Sync Protocols</h3>
                                <p className="text-sm font-bold text-slate-500 mt-2">Run tasks one by one to prevent server timeouts.</p>
                            </div>
                            <button onClick={async () => handleAction(async () => clearStudyCache(await getToken()))} className="bg-rose-100 text-rose-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Flush AI Cache</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: BellIcon, color: 'bg-indigo-600', title: 'Notifications', action: 'run-scraper-notifications' },
                                { icon: RssIcon, color: 'bg-indigo-500', title: 'PSC Live Feed', action: 'run-scraper-updates' },
                                { icon: NewspaperIcon, color: 'bg-teal-600', title: 'Current Affairs', action: 'run-scraper-affairs' },
                                { icon: LightBulbIcon, color: 'bg-amber-500', title: 'Daily GK Facts', action: 'run-scraper-gk' },
                                { icon: PlusIcon, color: 'bg-indigo-700', title: 'AI Question Gen', action: 'run-scraper-questions' },
                                { icon: BookOpenIcon, color: 'bg-emerald-600', title: 'Amazon Books', action: 'run-book-scraper' }
                            ].map((card, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center space-x-6 group hover:border-indigo-500 transition-all">
                                    <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                                        <card.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-sm uppercase tracking-widest mb-3">{card.title}</p>
                                        <button 
                                            onClick={() => runIndividualScraper(card.action)} 
                                            disabled={loading} 
                                            className="bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Wait...' : 'Start'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-20 px-4">
                        <section className="bg-slate-50 p-8 md:p-14 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden text-slate-900">
                            <div className="flex items-center space-x-5 mb-12 relative z-10">
                                <div className="bg-indigo-600 p-4 rounded-2xl shadow-2xl shadow-indigo-600/20"><PlusIcon className="h-8 w-8 text-white" /></div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight">Manual Injection</h3>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Direct Database Entry</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSingleQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Exam / Topic</label>
                                    <input list="exam-topics" value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="Pick or type exam name..." className="w-full p-6 rounded-[1.5rem] bg-white border-2 border-slate-200 font-bold outline-none focus:border-indigo-500 transition-all shadow-sm" required />
                                    <datalist id="exam-topics">{examTopics.map((t, idx) => <option key={idx} value={t} />)}</datalist>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Area</label>
                                    <input list="subject-areas" value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="Pick or type subject..." className="w-full p-6 rounded-[1.5rem] bg-white border-2 border-slate-200 font-bold outline-none focus:border-indigo-500 transition-all shadow-sm" required />
                                    <datalist id="subject-areas">{subjectsList.map(s => <option key={s} value={s} />)}</datalist>
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Body (Malayalam)</label>
                                    <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Body of the question..." className="w-full p-8 border-2 border-slate-200 rounded-[2.5rem] bg-white font-bold outline-none focus:border-indigo-500 transition-all shadow-sm h-40" required />
                                </div>
                                {newQ.options?.map((opt, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 flex items-center space-x-6 group shadow-sm">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">{String.fromCharCode(65+i)}</div>
                                        <input value={opt} onChange={e => { const o = [...(newQ.options || [])]; o[i] = e.target.value; setNewQ({...newQ, options: o})}} placeholder={`Enter choice ${i+1}`} className="flex-1 bg-transparent border-none outline-none font-bold text-sm" required />
                                        <input type="radio" name="correct_idx" checked={newQ.correctAnswerIndex === i} onChange={() => setNewQ({...newQ, correctAnswerIndex: i})} className="w-8 h-8 accent-indigo-500 cursor-pointer" />
                                    </div>
                                ))}
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Explanation (Optional)</label>
                                    <textarea value={newQ.explanation} onChange={e => setNewQ({...newQ, explanation: e.target.value})} placeholder="Explain why this answer is correct..." className="w-full p-6 border-2 border-slate-200 rounded-[2rem] bg-white font-bold outline-none focus:border-indigo-500 transition-all shadow-sm text-xs" rows={3} />
                                </div>
                                <button type="submit" disabled={loading} className="md:col-span-2 bg-indigo-600 text-white py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 disabled:opacity-50">Commit to Cloud</button>
                            </form>
                        </section>

                        <section className="pt-20 border-t-2 border-slate-100 dark:border-slate-800">
                             <div className="mb-10">
                                <h3 className="text-xl font-black uppercase tracking-widest mb-2">Bulk Sync Question Bank</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">CSV FORMAT: ID, Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty, Explanation</p>
                             </div>
                             <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Paste CSV lines here..." className="w-full h-80 p-10 border border-slate-200 dark:border-slate-800 rounded-[4rem] font-mono text-[11px] bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all shadow-inner" />
                             <button onClick={async () => handleAction(async () => syncCsvData('QuestionBank', bulkData, await getToken(), true))} disabled={loading} className="w-full mt-10 bg-emerald-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all">Start Batch Deployment</button>
                        </section>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-12 px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Syllabus Sprites</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Topic Mapping & Mock Config</p>
                            </div>
                            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full md:w-auto p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-black text-xs uppercase tracking-widest outline-none shadow-inner cursor-pointer focus:border-indigo-500 transition-all">
                                <option value="">Select Target Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                        </div>

                        <div className="space-y-6">
                            <div className="mb-4">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">CSV FORMAT: ID, ExamID, Title, QCount, Duration, Subject, Topic</p>
                                <textarea value={syllabusBulkData} onChange={e => setSyllabusBulkData(e.target.value)} placeholder="ID, ExamID, Title, 20, 20, Subject, Topic" className="w-full h-64 p-10 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] font-mono text-[11px] bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all shadow-inner" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button onClick={async () => handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), true))} disabled={loading} className="bg-indigo-600 text-white py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">Append to Sprint</button>
                                <button onClick={async () => { if(confirm("Overwrite entire syllabus for this exam?")) handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), false)) }} disabled={loading} className="bg-slate-800 text-white py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">Overwrite Global</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
                            {syllabusItems.map(s => (
                                <div key={s.id} className="p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-indigo-500 transition-all flex items-center justify-between">
                                    <div className="min-w-0 pr-4">
                                        <p className="font-black text-sm truncate uppercase tracking-tighter">{s.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{s.topic} • {s.questions} Qs</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Detach?")) handleAction(async () => deleteBook(s.id, await getToken())) }} disabled={loading} className="text-red-500 p-4 rounded-2xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><TrashIcon className="h-6 w-6" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'exams' && (
                    <div className="space-y-10">
                        <div className="flex justify-between items-center px-4">
                             <h3 className="text-3xl font-black tracking-tighter uppercase">Registry of Exams</h3>
                             <span className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-2 rounded-full border border-indigo-100 dark:border-indigo-800 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">{exams.length} Items</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                            {exams.map(ex => (
                                <div key={ex.id} className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between group hover:border-indigo-500 transition-all shadow-sm">
                                    <div className="flex items-center space-x-6">
                                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">{ex.icon}</div>
                                        <div>
                                            <p className="font-black text-lg leading-tight">{ex.title.ml}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">{ex.id} • {ex.category}</p>
                                        </div>
                                    </div>
                                    <button onClick={async () => { if(confirm("Discard entry?")) handleAction(async () => deleteBook(ex.id, await getToken())) }} disabled={loading} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-4 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><TrashIcon className="h-6 w-6" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-10 px-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-10">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Marketplace Hub</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Amazon Affiliate Channel</p>
                            </div>
                            <button onClick={() => runIndividualScraper('run-book-scraper')} disabled={loading} className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all text-[11px]">Sync Cloud Store</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {books.map(b => (
                                <div key={b.id} className="p-7 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm">
                                    <div className="min-w-0 pr-6">
                                        <p className="font-black text-sm truncate uppercase tracking-tighter leading-none mb-2">{b.title}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{b.author || 'Catalog generic'}</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Remove?")) handleAction(async () => deleteBook(b.id, await getToken())) }} disabled={loading} className="text-red-500 p-4 rounded-2xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><TrashIcon className="h-6 w-6" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-w-xl mx-auto py-32 text-center px-4">
                        <div className={`p-20 rounded-[5rem] border-4 shadow-2xl transition-all duration-1000 ${isSubscriptionActive ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                            <div className={`${isSubscriptionActive ? 'text-indigo-600 drop-shadow-2xl' : 'text-slate-400'} mb-12 scale-[2.5]`}>
                                <StarIcon className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-5xl font-black mb-8 tracking-tighter uppercase">Access Wall</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-16 leading-relaxed font-bold max-w-sm mx-auto uppercase tracking-widest">Disable the paywall to grant PRO features to all authenticated users instantly.</p>
                            <button 
                                onClick={async () => {
                                    const newVal = !isSubscriptionActive;
                                    const token = await getToken();
                                    handleAction(() => updateSetting('subscription_model_active', String(newVal), token));
                                }}
                                disabled={loading}
                                className={`w-full py-8 rounded-[2.5rem] font-black text-xs tracking-[0.4em] uppercase transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50 ${isSubscriptionActive ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-950 text-white'}`}
                            >
                                {isSubscriptionActive ? 'Suspend Paywall' : 'Initiate PRO Layer'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
