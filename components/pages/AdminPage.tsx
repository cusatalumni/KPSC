
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
            const [e, b, settings, conn] = await Promise.all([
                getExams(), 
                getBooks(), 
                getSettings(true),
                testConnection(token)
            ]);
            setExams(e);
            setBooks(b);
            if (conn && conn.status) setDbStatus(conn.status);
            if (settings && settings.subscription_model_active !== undefined) {
                setIsSubscriptionActive(settings.subscription_model_active === 'true');
            }
        } catch (err) { 
            console.error("Admin Refresh Failed:", err); 
            setStatus("Data Load Error: Check DB Connections");
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
        setStatus("Processing...");
        setIsError(false);
        setLoading(true);
        try { 
            const res = await fn(); 
            setStatus(res.message || "Action completed!"); 
            if (shouldRefresh) await refresh(true); 
        } catch(e:any) { 
            setStatus(e.message || "Action failed."); 
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
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 border dark:border-slate-800 hover:bg-slate-50'}`}
        >
            {React.createElement(icon, { className: "h-4 w-4" })}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-3 text-[9px] font-black uppercase">
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${dbStatus.sheets ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <span className={dbStatus.sheets ? 'text-emerald-500' : 'text-slate-400'}>Sheets</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${dbStatus.supabase ? 'bg-indigo-500' : 'bg-slate-500'}`}></div>
                            <span className={dbStatus.supabase ? 'text-indigo-500' : 'text-slate-400'}>Supabase</span>
                        </div>
                    </div>
                    <button onClick={() => refresh()} className="p-2 text-slate-400 hover:text-indigo-600">
                        <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <header className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl border-b-4 border-indigo-500 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <ShieldCheckIcon className="h-10 w-10 text-indigo-400" />
                    <h1 className="text-2xl font-black uppercase tracking-tight">Admin Center</h1>
                </div>
            </header>

            {status && (
                <div className={`p-4 rounded-2xl border shadow-md animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <p className="font-bold text-xs">{status}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Questions', PlusIcon)}
                {tabBtn('bookstore', 'Bookstore', BookOpenIcon)}
                {tabBtn('subscriptions', 'Premium', StarIcon)}
            </div>

            <main className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 min-h-[500px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 space-y-4 text-center">
                            <RssIcon className="h-10 w-10 text-indigo-600 mx-auto" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Daily Refresh</h3>
                            <button onClick={async () => handleAction(async () => triggerDailyScraper(await getToken()))} disabled={loading} className="w-full btn-vibrant-indigo text-white py-4 rounded-xl font-black text-[10px]">RUN SCRAPER</button>
                        </div>
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 space-y-4 text-center">
                            <BookOpenIcon className="h-10 w-10 text-emerald-600 mx-auto" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Book Sync</h3>
                            <button onClick={async () => handleAction(async () => triggerBookScraper(await getToken()))} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-[10px]">SYNC AMAZON</button>
                        </div>
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 space-y-4 text-center">
                            <ArrowPathIcon className="h-10 w-10 text-red-600 mx-auto" />
                            <h3 className="font-black uppercase text-xs tracking-widest">AI Reset</h3>
                            <button onClick={async () => handleAction(async () => clearStudyCache(await getToken()))} disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-[10px]">CLEAR CACHE</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black">Registered Exams</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exams.map(ex => (
                                <div key={ex.id} className="flex items-center justify-between p-5 border rounded-3xl bg-slate-50 dark:bg-slate-800/30">
                                    <div>
                                        <p className="font-black text-sm">{ex.title.ml}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{ex.id}</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Delete?")) handleAction(async () => deleteBook(ex.id, await getToken())) }} className="text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-10">
                        <section className="bg-slate-50 dark:bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black mb-6">Add New Question</h3>
                            <form onSubmit={handleSingleQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="Topic (LDC, History etc)" className="p-4 border rounded-2xl text-sm font-bold bg-white" required />
                                <input value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="Subject (GK, Math etc)" className="p-4 border rounded-2xl text-sm font-bold bg-white" required />
                                <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Question in Malayalam" className="p-4 border rounded-2xl text-sm font-bold md:col-span-2 bg-white" rows={3} required />
                                {newQ.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-3 bg-white p-3 border rounded-2xl">
                                        <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-xs font-black">{i+1}</span>
                                        <input value={opt} onChange={e => { const o = [...(newQ.options || [])]; o[i] = e.target.value; setNewQ({...newQ, options: o})}} placeholder={`Option ${i+1}`} className="flex-1 text-sm font-bold outline-none" required />
                                        <input type="radio" name="correct" checked={newQ.correctAnswerIndex === i} onChange={() => setNewQ({...newQ, correctAnswerIndex: i})} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                                    </div>
                                ))}
                                <button type="submit" disabled={loading} className="md:col-span-2 btn-vibrant-indigo text-white py-5 rounded-2xl font-black shadow-xl tracking-widest text-xs">SAVE TO DATABASE</button>
                            </form>
                        </section>
                        <section className="pt-8 border-t dark:border-slate-800">
                            <h3 className="text-lg font-black mb-4 uppercase text-slate-400 text-[10px] tracking-widest">Bulk Import Questions</h3>
                            <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="ID, Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty" className="w-full h-48 p-6 border dark:border-slate-700 rounded-[2rem] font-mono text-xs bg-slate-50" />
                            <button onClick={async () => handleAction(async () => syncCsvData('QuestionBank', bulkData, await getToken(), true))} className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-xl font-black text-xs shadow-lg">APPEND CSV DATA</button>
                        </section>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Books in Store</h3>
                            <button onClick={async () => handleAction(async () => triggerBookScraper(await getToken()))} className="text-[10px] bg-emerald-600 text-white px-5 py-2 rounded-xl font-black shadow-md uppercase tracking-widest">Refresh from Amazon</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {books.map(b => (
                                <div key={b.id} className="flex items-center p-5 border rounded-3xl bg-slate-50 dark:bg-slate-800/30 group hover:border-emerald-400 transition-colors">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="font-black text-xs truncate text-slate-800 dark:text-white">{b.title}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{b.author}</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Delete?")) handleAction(async () => deleteBook(b.id, await getToken())) }} className="text-red-500 opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50 transition-all"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-w-md mx-auto py-16 text-center space-y-8">
                        <div className={`p-12 rounded-[4rem] border-4 transition-all shadow-2xl ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                            <StarIcon className={`h-24 w-24 mx-auto mb-8 ${isSubscriptionActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <h3 className="text-3xl font-black mb-4 tracking-tight">App Paywall</h3>
                            <p className="text-sm text-slate-500 mb-10 leading-relaxed">Toggle between Free Mode (everyone is Pro) and Subscription Mode (Clerk based).</p>
                            <button 
                                onClick={async () => {
                                    const newVal = !isSubscriptionActive;
                                    const token = await getToken();
                                    handleAction(() => updateSetting('subscription_model_active', String(newVal), token));
                                }}
                                className={`w-full py-5 rounded-3xl font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'}`}
                            >
                                {isSubscriptionActive ? 'Switch to FREE MODE' : 'Enable Paywall'}
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'syllabus' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">Syllabus Mapping</h3>
                            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="p-3 border rounded-2xl text-xs font-black bg-slate-50 outline-none uppercase tracking-widest shadow-sm">
                                <option value="">Select Target Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                        </div>
                        <textarea value={syllabusBulkData} onChange={e => setSyllabusBulkData(e.target.value)} placeholder="ID, ExamID, Title, QCount, Duration, Subject, Topic" className="w-full h-48 p-6 border dark:border-slate-700 rounded-[2.5rem] font-mono text-xs bg-slate-50" />
                        <div className="flex gap-4">
                            <button onClick={async () => handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), true))} className="flex-1 btn-vibrant-indigo text-white py-4 rounded-xl font-black text-xs">APPEND CSV</button>
                            <button onClick={async () => { if(confirm("Replace all?")) handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), false)) }} className="flex-1 bg-slate-200 text-slate-600 py-4 rounded-xl font-black text-xs">REPLACE ALL</button>
                        </div>
                        <div className="grid gap-3 mt-8">
                            {syllabusItems.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border rounded-2xl shadow-sm text-[10px] font-bold">
                                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-tight">{s.title} • {s.topic} ({s.questions} Qs)</span>
                                    <button onClick={async () => { if(confirm("Delete item?")) handleAction(async () => deleteBook(s.id, await getToken())) }} className="text-red-400 p-2"><TrashIcon className="h-4 w-4" /></button>
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
