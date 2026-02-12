import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    getBooks, 
    getExams,
    testConnection,
    getExamSyllabus,
    getSettings,
    updateSetting,
    clearStudyCache
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
    const [dataSource, setDataSource] = useState<'Database' | 'Static Fallback'>('Static Fallback');

    const [bulkData, setBulkData] = useState('');
    const [sylBulkData, setSylBulkData] = useState('');
    const [bookBulkData, setBookBulkData] = useState('');

    const [newQ, setNewQ] = useState<Partial<QuizQuestion>>({ id: '', question: '', topic: '', subject: 'GK', options: ['', '', '', ''], correctAnswerIndex: 0 });
    const [newExam, setNewExam] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [newSyl, setNewSyl] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, subject: 'GK', topic: 'General' });
    const [newBook, setNewBook] = useState({ id: '', title: '', author: '', imageUrl: '', amazonLink: '' });

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const examRes = await getExams();
            setExams(examRes.exams);
            setDataSource(examRes.source === 'database' ? 'Database' : 'Static Fallback');
            const [b, s] = await Promise.all([getBooks(), getSettings()]);
            setBooks(b);
            if (s?.subscription_model_active !== undefined) setIsSubscriptionActive(s.subscription_model_active === 'true');
            if (s?.paypal_client_id) setPaypalClientId(s.paypal_client_id);
        } catch (e) { console.error(e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if (selectedExamId) getExamSyllabus(selectedExamId).then(setSyllabusItems); else setSyllabusItems([]); }, [selectedExamId]);

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
        setStatus("Deploying request..."); setIsError(false); setLoading(true);
        try { const r = await fn(); setStatus(r.message || "Done!"); await refresh(true); } 
        catch(e:any) { setStatus(e.message); setIsError(true); } finally { setLoading(false); }
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-3 px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500'}`}>{React.createElement(icon, { className: "h-4 w-4" })}<span>{label}</span></button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Sheets', ok: dbStatus.sheets },
                    { label: 'Supabase', ok: dbStatus.supabase },
                    { label: 'Source', ok: dataSource === 'Database' }
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center space-x-5 border border-slate-100 dark:border-slate-800">
                        <div className={`w-4 h-4 rounded-full ${s.ok ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                        <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p><p className="text-sm font-black uppercase">{s.ok ? 'ACTIVE' : 'OFFLINE'}</p></div>
                    </div>
                ))}
                <button onClick={onBack} className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:bg-indigo-700 transition-all">
                    <span className="font-black text-sm uppercase tracking-widest ml-2">Dashboard</span>
                    <ChevronLeftIcon className="h-6 w-6 transform group-hover:-translate-x-2 transition-transform" />
                </button>
            </div>

            {status && (
                <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl flex items-center justify-between ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <p className="font-black text-xs uppercase tracking-widest leading-relaxed">{status}</p>
                    <button onClick={() => { setStatus(null); setLoading(false); }} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-4">{tabBtn('automation', 'Protocols', RssIcon)}{tabBtn('exams', 'Exams', AcademicCapIcon)}{tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}{tabBtn('questions', 'Questions', PlusIcon)}{tabBtn('bookstore', 'Bookstore', BookOpenIcon)}{tabBtn('subscriptions', 'Access', StarIcon)}</div>

            <main className="bg-white dark:bg-slate-950 p-6 md:p-10 rounded-[3.5rem] shadow-2xl border dark:border-slate-800 min-h-[600px]">
                {activeTab === 'automation' && (
                    <div className="space-y-12">
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                            <div><h3 className="text-2xl font-black uppercase tracking-tighter">Maintenance Suite</h3><p className="text-sm font-bold text-slate-500 mt-2">Append fresh data or synchronize cloud layers.</p></div>
                            <div className="flex space-x-4">
                                <button onClick={() => handleAction(() => adminOp('sync-all'))} className="bg-indigo-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700">Master Push: Sheets → DB</button>
                                <button onClick={() => handleAction(() => adminOp('clear-study-cache'))} className="bg-rose-100 text-rose-700 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Flush AI Cache</button>
                            </div>
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
                                    <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}><card.icon className="h-6 w-6 text-white" /></div>
                                    <div className="flex-1"><p className="font-black text-sm uppercase tracking-widest mb-3">{card.title}</p>
                                        <button onClick={() => handleAction(() => adminOp(card.action))} disabled={loading} className="bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white transition-all">Start Protocol</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-16">
                        <section className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800">
                            <h3 className="text-2xl font-black uppercase mb-8">{newQ.id ? 'Edit Question' : 'Register Question'}</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleAction(() => adminOp('add-question', { question: newQ })); setNewQ({ id: '', question: '', topic: '', subject: 'GK', options: ['', '', '', ''], correctAnswerIndex: 0 }); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="Exam/Topic Name..." className="p-4 rounded-xl border-2 dark:bg-slate-800 dark:border-slate-700" required />
                                <input value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="Subject..." className="p-4 rounded-xl border-2 dark:bg-slate-800 dark:border-slate-700" required />
                                <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Malayalam Question..." className="md:col-span-2 p-6 border-2 rounded-[2rem] dark:bg-slate-800 h-32" required />
                                {newQ.options?.map((opt, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 flex items-center space-x-4">
                                        <input value={opt} onChange={e => { const o = [...(newQ.options || [])]; o[i] = e.target.value; setNewQ({...newQ, options: o})}} placeholder={`Choice ${i+1}`} className="flex-1 bg-transparent outline-none font-bold" required />
                                        <input type="radio" name="correct" checked={newQ.correctAnswerIndex === i} onChange={() => setNewQ({...newQ, correctAnswerIndex: i})} className="w-6 h-6 accent-indigo-500" />
                                    </div>
                                ))}
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase shadow-xl">{newQ.id ? 'Save Changes' : 'Inject Question'}</button>
                            </form>
                        </section>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-12">
                        <section className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800">
                            <h3 className="text-2xl font-black uppercase mb-8">{newExam.id ? 'Edit Registry' : 'Register New Exam'}</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleAction(() => adminOp('update-exam', { exam: newExam })); setNewExam({ id: '', title_ml: '', title_en: '', description_ml: '', category: 'General', level: 'Preliminary', icon_type: 'book' }); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input value={newExam.id} onChange={e => setNewExam({...newExam, id: e.target.value})} placeholder="Exam ID (e.g. ldc_2025)" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <input value={newExam.title_ml} onChange={e => setNewExam({...newExam, title_ml: e.target.value})} placeholder="Title (Malayalam)" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase">{newExam.id ? 'Update Entry' : 'Register'}</button>
                            </form>
                        </section>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className={`p-10 md:p-20 rounded-[5rem] border-4 shadow-2xl transition-all duration-1000 text-center ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`${isSubscriptionActive ? 'text-indigo-600' : 'text-slate-400'} mb-12 scale-[1.5]`}><StarIcon className="h-16 w-16 mx-auto" /></div>
                            <h3 className="text-5xl font-black mb-8 uppercase tracking-tighter">Access Wall</h3>
                            <p className="text-sm text-slate-500 mb-16 font-bold uppercase tracking-widest leading-relaxed">Toggle the global subscription requirement.</p>
                            <button onClick={async () => { const newVal = !isSubscriptionActive; const token = await getToken(); handleAction(() => updateSetting('subscription_model_active', String(newVal), token)); }} disabled={loading} className={`w-full py-8 rounded-[2.5rem] font-black text-xs tracking-[0.4em] uppercase shadow-2xl ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-white'}`}>{isSubscriptionActive ? 'Suspend Paywall' : 'Initiate PRO Layer'}</button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                            <h3 className="text-2xl font-black uppercase mb-6 tracking-tight flex items-center">
                                <ShieldCheckIcon className="h-6 w-6 mr-3 text-indigo-600" />
                                Payment Configuration
                            </h3>
                            <p className="text-slate-500 font-medium mb-8">Set your PayPal Client ID for live payments. Use 'sb' for testing.</p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    value={paypalClientId} 
                                    onChange={e => setPaypalClientId(e.target.value)} 
                                    placeholder="Enter PayPal Client ID..." 
                                    className="flex-1 p-5 rounded-2xl border-2 dark:bg-slate-800 font-mono text-sm"
                                />
                                <button 
                                    onClick={async () => {
                                        const token = await getToken();
                                        handleAction(() => updateSetting('paypal_client_id', paypalClientId, token));
                                    }}
                                    className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-700"
                                >
                                    Save Key
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;