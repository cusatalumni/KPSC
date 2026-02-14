
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
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
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

    // Form States
    const [newQ, setNewQ] = useState<Partial<QuizQuestion>>({ id: '', question: '', topic: '', subject: 'History', options: ['', '', '', ''], correctAnswerIndex: 0, difficulty: 'Moderate' });
    const [newExam, setNewExam] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [newSyllabus, setNewSyllabus] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, subject: 'History', topic: 'Kerala History' });
    const [newBook, setNewBook] = useState({ id: '', title: '', author: '', imageUrl: '', amazonLink: '' });
    
    // Bulk Upload State
    const [csvContent, setCsvContent] = useState('');

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            
            const [examRes, b, s] = await Promise.all([
                getExams(),
                getBooks(),
                getSettings()
            ]);
            
            setExams(examRes.exams);
            setDataSource(examRes.source === 'database' ? 'Database' : 'Static Fallback');
            setBooks(b);
            
            if (s?.subscription_model_active !== undefined) setIsSubscriptionActive(s.subscription_model_active === 'true');
            if (s?.paypal_client_id) setPaypalClientId(s.paypal_client_id);
        } catch (e) { console.error(e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);
    
    useEffect(() => { 
        if (selectedExamId) {
            getExamSyllabus(selectedExamId).then(setSyllabusItems); 
        } else {
            setSyllabusItems([]);
        }
    }, [selectedExamId]);

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
        setStatus("Processing request..."); setIsError(false); setLoading(true);
        try { 
            const r = await fn(); 
            setStatus(r.message || "Action completed successfully!"); 
            await refresh(true); 
        } 
        catch(e:any) { setStatus(e.message); setIsError(true); } finally { setLoading(false); }
    };

    const handleBulkUpload = () => {
        if (!csvContent.trim()) return alert("Paste CSV content first!");
        handleAction(() => adminOp('bulk-upload-questions', { csv: csvContent }));
        setCsvContent('');
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500 border border-transparent'}`}>{React.createElement(icon, { className: "h-4 w-4" })}<span>{label}</span></button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Connection Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Sheets Connection', ok: dbStatus.sheets },
                    { label: 'Database Sync', ok: dbStatus.supabase },
                    { label: 'Data Integrity', ok: dataSource === 'Database' }
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] shadow-lg flex items-center space-x-4 border border-slate-100 dark:border-slate-800">
                        <div className={`w-3 h-3 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p><p className="text-xs font-black uppercase">{s.ok ? 'OPERATIONAL' : 'ERROR/OFFLINE'}</p></div>
                    </div>
                ))}
                <button onClick={onBack} className="bg-slate-800 text-white p-5 rounded-[1.5rem] shadow-lg flex items-center justify-between group hover:bg-slate-900">
                    <span className="font-black text-xs uppercase tracking-widest">Exit Panel</span>
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
            </div>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <p className="font-black text-xs uppercase tracking-widest">{status}</p>
                    <button onClick={() => setStatus(null)} className="p-2"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Questions', PlusIcon)}
                {tabBtn('bookstore', 'Books', BookOpenIcon)}
                {tabBtn('subscriptions', 'Access', StarIcon)}
            </div>

            <main className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border dark:border-slate-800 min-h-[600px]">
                {activeTab === 'automation' && (
                    <div className="space-y-12">
                         <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 -mr-20 -mt-20"><ArrowPathIcon className="h-64 w-64" /></div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Database Sync Master</h3>
                                <p className="text-indigo-100 font-bold mt-2">Force sync all data from Google Sheets to high-performance Cloud Database.</p>
                            </div>
                            <div className="flex flex-wrap gap-3 relative z-10">
                                <button onClick={() => handleAction(() => adminOp('sync-all'))} className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Start Cloud Sync</button>
                                <button onClick={() => handleAction(() => adminOp('sync-syllabus-linking'))} className="bg-indigo-500 text-white border border-white/20 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-400 transition-all flex items-center space-x-2">
                                    <ArrowPathIcon className="h-4 w-4" />
                                    <span>Audit & Link QB</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: BellIcon, color: 'bg-indigo-600', title: 'Job Notifications', desc: 'Fetch latest from official PSC site', action: 'run-scraper-notifications' },
                                { icon: RssIcon, color: 'bg-indigo-500', title: 'Live Updates Feed', desc: 'Sync results, rank lists & news', action: 'run-scraper-updates' },
                                { icon: NewspaperIcon, color: 'bg-teal-600', title: 'Current Affairs', desc: 'Fetch weekly news highlights', action: 'run-scraper-affairs' },
                                { icon: LightBulbIcon, color: 'bg-amber-500', title: 'GK Fact Scraper', desc: 'Inject new random facts into GK bank', action: 'run-scraper-gk' },
                                { icon: PlusIcon, color: 'bg-rose-600', title: 'AI Question Builder', desc: 'Let AI generate 10 unique MCQs', action: 'run-scraper-questions' },
                                { icon: BookOpenIcon, color: 'bg-emerald-600', title: 'Bookstore Scraper', desc: 'Sync Amazon PSC books', action: 'run-book-scraper' }
                            ].map((card, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col">
                                    <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}><card.icon className="h-6 w-6 text-white" /></div>
                                    <h4 className="font-black text-sm uppercase mb-1">{card.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mb-6">{card.desc}</p>
                                    <button onClick={() => handleAction(() => adminOp(card.action))} className="mt-auto w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Execute Now</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-12">
                        {/* Bulk Upload Section */}
                        <section className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border-2 border-dashed border-indigo-200">
                             <div className="flex items-center space-x-4 mb-6">
                                <CloudArrowUpIcon className="h-8 w-8 text-indigo-600" />
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Bulk CSV Question Upload</h3>
                                    <p className="text-xs font-bold text-slate-500">Paste your CSV content below. Format: id, topic, question, options(JSON), correctAnswerIndex, subject, difficulty</p>
                                </div>
                            </div>
                            <textarea 
                                value={csvContent}
                                onChange={e => setCsvContent(e.target.value)}
                                placeholder="Paste CSV data here..."
                                className="w-full h-48 p-6 rounded-2xl border-2 border-slate-200 dark:bg-slate-800 font-mono text-xs mb-4"
                            />
                            <button 
                                onClick={handleBulkUpload}
                                className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700"
                            >
                                Process Bulk Import
                            </button>
                        </section>

                        {/* Individual Add */}
                        <section className="bg-slate-50 dark:bg-slate-900/30 p-10 rounded-[3rem] border border-slate-200">
                             <h3 className="text-xl font-black uppercase mb-6">Manual Registration</h3>
                             <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('add-question', { question: newQ })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="Topic (English)" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <input value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="Subject (History/Science...)" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Question in Malayalam" className="md:col-span-2 p-5 border-2 rounded-2xl dark:bg-slate-800" required />
                                {newQ.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <input value={opt} onChange={e => { const o = [...(newQ.options || [])]; o[i] = e.target.value; setNewQ({...newQ, options: o})}} placeholder={`Option ${i+1}`} className="flex-1 p-3 border-2 rounded-xl dark:bg-slate-800" required />
                                        <input type="radio" checked={newQ.correctAnswerIndex === i} onChange={() => setNewQ({...newQ, correctAnswerIndex: i})} name="correct" />
                                    </div>
                                ))}
                                <button type="submit" className="md:col-span-2 bg-slate-800 text-white py-4 rounded-xl font-black uppercase">Add Single Question</button>
                             </form>
                        </section>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-8">
                        <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-100">
                            <h3 className="text-xl font-black uppercase mb-6">Exam Registry</h3>
                            <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('update-exam', { exam: newExam })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newExam.id} onChange={e => setNewExam({...newExam, id: e.target.value})} placeholder="Exam ID (e.g., ldc_2025)" className="p-4 rounded-xl border-2" required />
                                <input value={newExam.title_ml} onChange={e => setNewExam({...newExam, title_ml: e.target.value})} placeholder="Title (Malayalam)" className="p-4 rounded-xl border-2" required />
                                <input value={newExam.category} onChange={e => setNewExam({...newExam, category: e.target.value})} placeholder="Category (General/Technical)" className="p-4 rounded-xl border-2" />
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase">Register/Update Exam</button>
                            </form>
                        </section>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exams.map(e => (
                                <div key={e.id} className="p-5 bg-white border rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-sm">{e.title.ml}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{e.id}</p>
                                    </div>
                                    <button onClick={() => { setNewExam({ id: e.id, title_ml: e.title.ml, title_en: e.title.en, description_ml: e.description.ml, category: e.category, level: e.level, icon_type: 'book' }); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilSquareIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-8">
                        <select 
                            value={selectedExamId} 
                            onChange={e => setSelectedExamId(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 font-black text-sm"
                        >
                            <option value="">Select Exam to view Syllabus...</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                        </select>

                        {selectedExamId && (
                            <>
                                <section className="bg-slate-50 p-8 rounded-[2rem] border-2">
                                    <h3 className="text-xl font-black uppercase mb-6">Add Syllabus Entry</h3>
                                    <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('update-syllabus', { syllabus: {...newSyllabus, exam_id: selectedExamId} })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input value={newSyllabus.title} onChange={e => setNewSyllabus({...newSyllabus, title: e.target.value})} placeholder="Topic Title (Malayalam/English)" className="p-4 rounded-xl border-2" required />
                                        <input value={newSyllabus.subject} onChange={e => setNewSyllabus({...newSyllabus, subject: e.target.value})} placeholder="Subject Tag (History/Science)" className="p-4 rounded-xl border-2" required />
                                        <input type="number" value={newSyllabus.questions} onChange={e => setNewSyllabus({...newSyllabus, questions: parseInt(e.target.value)})} placeholder="Qns" className="p-4 rounded-xl border-2" />
                                        <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase">Save Syllabus Entry</button>
                                    </form>
                                </section>
                                
                                <div className="space-y-3">
                                    {syllabusItems.map(item => (
                                        <div key={item.id} className="p-5 bg-white border rounded-2xl flex justify-between items-center group">
                                            <div>
                                                <p className="font-black text-sm">{item.title}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase">{item.subject} | {item.topic}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                 <button onClick={() => setNewSyllabus({ id: item.id, exam_id: item.examId || selectedExamId, title: item.title, questions: item.questions, duration: item.duration, subject: item.subject, topic: item.topic })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilSquareIcon className="h-5 w-5" /></button>
                                                 <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Syllabus', id: item.id }))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8">
                         <section className="bg-slate-50 p-8 rounded-[2rem] border-2">
                            <h3 className="text-xl font-black uppercase mb-6">Add New Book</h3>
                            <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('update-book', { book: newBook })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} placeholder="Book Title" className="p-4 rounded-xl border-2" required />
                                <input value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} placeholder="Author" className="p-4 rounded-xl border-2" required />
                                <input value={newBook.amazonLink} onChange={e => setNewBook({...newBook, amazonLink: e.target.value})} placeholder="Amazon Affiliate Link" className="md:col-span-2 p-4 rounded-xl border-2" required />
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase">Add Book to Store</button>
                            </form>
                        </section>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map(b => (
                                <div key={b.id} className="p-5 bg-white border rounded-2xl flex items-center space-x-4">
                                    <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {b.imageUrl ? <img src={b.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-300">N/A</div>}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-black text-sm truncate">{b.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{b.author}</p>
                                    </div>
                                    <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Bookstore', id: b.id }))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="max-w-2xl mx-auto py-10 space-y-12">
                         <div className={`p-10 rounded-[4rem] border-4 shadow-2xl transition-all duration-1000 text-center ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`${isSubscriptionActive ? 'text-indigo-600' : 'text-slate-400'} mb-12 scale-[1.5]`}><StarIcon className="h-16 w-16 mx-auto" /></div>
                            <h3 className="text-5xl font-black mb-8 uppercase tracking-tighter">Pro Access Wall</h3>
                            <button onClick={async () => { const token = await getToken(); handleAction(() => updateSetting('subscription_model_active', String(!isSubscriptionActive), token)); }} className={`w-full py-8 rounded-[2.5rem] font-black text-xs tracking-[0.4em] uppercase shadow-2xl ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-white'}`}>{isSubscriptionActive ? 'DISABLE PRO LOCK' : 'ACTIVATE PRO LOCK'}</button>
                        </div>
                        
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-black uppercase mb-6 tracking-tight flex items-center">
                                <ShieldCheckIcon className="h-6 w-6 mr-3 text-indigo-600" />
                                Payment Configuration
                            </h3>
                            <input 
                                value={paypalClientId} 
                                onChange={e => setPaypalClientId(e.target.value)} 
                                placeholder="Enter PayPal Client ID..." 
                                className="w-full p-5 rounded-2xl border-2 font-mono text-sm mb-4"
                            />
                            <button 
                                onClick={async () => {
                                    const token = await getToken();
                                    handleAction(() => updateSetting('paypal_client_id', paypalClientId, token));
                                }}
                                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-700"
                            >
                                Update Key
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
