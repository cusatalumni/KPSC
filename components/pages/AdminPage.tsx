
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const [dbStatus, setDbStatus] = useState<{sheets: boolean, supabase: boolean} | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
    
    // Form States
    const [bulkData, setBulkData] = useState('');
    const [syllabusBulkData, setSyllabusBulkData] = useState('');
    const [newQ, setNewQ] = useState<Partial<QuizQuestion>>({
        question: '', topic: '', subject: 'GK', difficulty: 'Moderate', 
        options: ['', '', '', ''], correctAnswerIndex: 0
    });

    const refresh = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [e, b, settings, conn] = await Promise.all([
                getExams(), 
                getBooks(), 
                getSettings(true),
                testConnection(await getToken())
            ]);
            setExams(e);
            setBooks(b);
            setDbStatus(conn.status);
            if (settings && settings.subscription_model_active !== undefined) {
                setIsSubscriptionActive(settings.subscription_model_active === 'true');
            }
        } catch (err) { console.error(err); } 
        finally { if (!isSilent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        if (selectedExamId) {
            getExamSyllabus(selectedExamId).then(setSyllabusItems);
        }
    }, [selectedExamId]);

    const handleAction = async (fn: () => Promise<any>, shouldRefresh: boolean = true) => {
        setStatus("Processing Task...");
        setIsError(false);
        setLoading(true);
        try { 
            const res = await fn(); 
            setStatus(res.message || "Action completed!"); 
            if (shouldRefresh) setTimeout(() => refresh(true), 2000); 
        } catch(e:any) { 
            setStatus(e.message || "Action failed."); 
            setIsError(true);
        } finally { setLoading(false); }
    };

    const toggleSubscriptionModel = async () => {
        const newVal = !isSubscriptionActive;
        const token = await getToken();
        setIsSubscriptionActive(newVal);
        try {
            await updateSetting('subscription_model_active', String(newVal), token);
            setStatus(`Subscription Model: ${newVal ? 'ENABLED' : 'DISABLED'}`);
        } catch (e: any) {
            setIsSubscriptionActive(!newVal);
            setStatus("Toggle Failed: " + e.message);
            setIsError(true);
        }
    };

    const handleSingleQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        handleAction(() => addQuestion(newQ, token));
        setNewQ({ question: '', topic: '', subject: 'GK', difficulty: 'Moderate', options: ['', '', '', ''], correctAnswerIndex: 0 });
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => { setActiveTab(id); setStatus(null); }} className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 border dark:border-slate-800 hover:bg-slate-50'}`}>
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
                    {dbStatus && (
                        <div className="flex space-x-2 text-[9px] font-black uppercase">
                            <span className={dbStatus.sheets ? 'text-emerald-500' : 'text-red-500'}>Sheets: {dbStatus.sheets ? 'ON' : 'OFF'}</span>
                            <span className={dbStatus.supabase ? 'text-indigo-500' : 'text-slate-400'}>Supabase: {dbStatus.supabase ? 'ON' : 'OFF'}</span>
                        </div>
                    )}
                    <button onClick={() => refresh()} className="p-2 text-slate-400 hover:text-indigo-600"><ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
            </div>

            <header className="bg-slate-900 p-8 rounded-[2rem] text-white flex items-center justify-between shadow-xl border-b-4 border-indigo-500">
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

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
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
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                            <RssIcon className="h-8 w-8 text-indigo-600" />
                            <h3 className="font-black uppercase text-xs">Daily Content</h3>
                            <p className="text-[10px] text-slate-500">Updates Notifications, Current Affairs, and generates new AI questions.</p>
                            <button onClick={async () => handleAction(async () => triggerDailyScraper(await getToken()))} disabled={loading} className="w-full btn-vibrant-indigo text-white py-3 rounded-xl font-black text-[10px]">RUN SCRAPER</button>
                        </div>
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                            <BookOpenIcon className="h-8 w-8 text-emerald-600" />
                            <h3 className="font-black uppercase text-xs">Amazon Bookstore</h3>
                            <p className="text-[10px] text-slate-500">Syncs latest PSC books from Amazon with affiliate tags.</p>
                            <button onClick={async () => handleAction(async () => triggerBookScraper(await getToken()))} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px]">SYNC BOOKS</button>
                        </div>
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                            <ArrowPathIcon className="h-8 w-8 text-red-600" />
                            <h3 className="font-black uppercase text-xs">Clear AI Cache</h3>
                            <p className="text-[10px] text-slate-500">Force regeneration of AI study notes for all topics.</p>
                            <button onClick={async () => handleAction(async () => clearStudyCache(await getToken()))} disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-xl font-black text-[10px]">CLEAR CACHE</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black">Manage Exams</h3>
                        <div className="grid gap-4">
                            {exams.map(ex => (
                                <div key={ex.id} className="flex items-center justify-between p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                                    <div>
                                        <p className="font-black text-sm">{ex.title.ml}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">{ex.category} • {ex.level}</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Delete?")) handleAction(async () => deleteBook(ex.id, await getToken())) }} className="text-red-500 p-2"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">Syllabus Import</h3>
                            <select 
                                value={selectedExamId} 
                                onChange={e => setSelectedExamId(e.target.value)}
                                className="p-2 border rounded-xl text-xs font-bold outline-none"
                            >
                                <option value="">Select Exam to view Syllabus</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                        </div>
                        <textarea 
                            value={syllabusBulkData} 
                            onChange={e => setSyllabusBulkData(e.target.value)} 
                            placeholder="ID, ExamID, Title, Questions, Duration, Subject, Topic" 
                            className="w-full h-40 p-4 border dark:border-slate-700 rounded-2xl font-mono text-xs bg-slate-50 dark:bg-slate-800"
                        />
                        <div className="flex gap-4">
                            <button onClick={async () => handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), true))} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs">APPEND CSV</button>
                            <button onClick={async () => { if(confirm("Overwrite?")) handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), false)) }} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-black text-xs">OVERWRITE ALL</button>
                        </div>
                        {selectedExamId && (
                            <div className="mt-8 space-y-2">
                                <p className="font-black text-xs uppercase text-slate-400">Current Items for {selectedExamId}:</p>
                                {syllabusItems.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-[10px] font-bold">
                                        <span>{s.title} ({s.topic})</span>
                                        <button onClick={async () => { if(confirm("Delete?")) handleAction(async () => deleteBook(s.id, await getToken())) }} className="text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-10">
                        <section className="space-y-4">
                            <h3 className="text-lg font-black">Add Single Question</h3>
                            <form onSubmit={handleSingleQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="Topic (e.g. Rivers)" className="p-3 border rounded-xl text-sm font-bold" required />
                                <input value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="Subject (e.g. Geography)" className="p-3 border rounded-xl text-sm font-bold" required />
                                <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Question in Malayalam" className="p-3 border rounded-xl text-sm font-bold md:col-span-2" required />
                                {newQ.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <input value={opt} onChange={e => { const o = [...(newQ.options || [])]; o[i] = e.target.value; setNewQ({...newQ, options: o})}} placeholder={`Option ${i+1}`} className="flex-1 p-3 border rounded-xl text-sm font-bold" required />
                                        <input type="radio" name="correct" checked={newQ.correctAnswerIndex === i} onChange={() => setNewQ({...newQ, correctAnswerIndex: i})} />
                                    </div>
                                ))}
                                <button type="submit" disabled={loading} className="md:col-span-2 btn-vibrant-indigo text-white py-4 rounded-xl font-black">SAVE QUESTION</button>
                            </form>
                        </section>

                        <section className="space-y-4 border-t pt-8">
                            <h3 className="text-lg font-black">Bulk Question Import (CSV)</h3>
                            <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="ID, Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty" className="w-full h-40 p-4 border dark:border-slate-700 rounded-2xl font-mono text-xs bg-slate-50" />
                            <button onClick={async () => handleAction(async () => syncCsvData('QuestionBank', bulkData, await getToken(), true))} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs">IMPORT CSV DATA</button>
                        </section>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black">Manage Bookstore</h3>
                            <button onClick={async () => handleAction(async () => triggerBookScraper(await getToken()))} className="text-xs bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black border border-emerald-100">SYNC FROM AMAZON</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {books.map(b => (
                                <div key={b.id} className="flex items-center p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-xs truncate">{b.title}</p>
                                        <p className="text-[10px] text-slate-400">{b.author}</p>
                                    </div>
                                    <button onClick={async () => { if(confirm("Delete?")) handleAction(async () => deleteBook(b.id, await getToken())) }} className="text-red-500 p-2"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-w-md mx-auto py-10 space-y-6 text-center">
                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                            <StarIcon className={`h-16 w-16 mx-auto mb-6 ${isSubscriptionActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <h3 className="text-2xl font-black mb-2">Master Switch</h3>
                            <p className="text-sm text-slate-500 mb-8">When disabled, all premium features are FREE for everyone.</p>
                            <button 
                                onClick={toggleSubscriptionModel}
                                className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'}`}
                            >
                                {isSubscriptionActive ? 'Disable Paywall' : 'Enable Paywall'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
