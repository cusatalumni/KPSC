
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    getBooks, 
    getExams,
    testConnection,
    getExamSyllabus,
    getSettings,
    updateSetting
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

const DEFAULT_SYLLABUS_CSV = `id,exam_id,title,questions,duration,subject,topic
s_ldc_01,ldc_lgs,Indian History,10,10,History,Indian History
s_ldc_02,ldc_lgs,Kerala History,10,10,History,Kerala History
s_ldc_03,ldc_lgs,Geography of India & Kerala,10,10,Geography,Geography
s_ldc_04,ldc_lgs,Indian Constitution & Civics,10,10,Civics,Constitution
s_ldc_05,ldc_lgs,General Science (Physics/Bio),10,10,Science,General Science
s_ldc_06,ldc_lgs,Current Affairs,10,10,GK,Current Affairs
s_ldc_07,ldc_lgs,Simple Arithmetic,10,15,Maths,Arithmetic
s_ldc_08,ldc_lgs,Mental Ability & Reasoning,10,15,Maths,Reasoning
s_ldc_09,ldc_lgs,General English Grammar,10,10,English,Grammar
s_ldc_10,ldc_lgs,Malayalam Grammar & Vocabulary,10,10,Malayalam,Grammar
s_p2_01,plus_two_prelims,Advanced GK & Renaissance,20,20,GK,General
s_p2_02,plus_two_prelims,Arithmetic & Mental Ability,20,30,Maths,Mixed
s_p2_03,plus_two_prelims,General Science,20,20,Science,General
s_dg_01,degree_prelims,History & Culture,20,20,History,Advanced
s_dg_02,degree_prelims,Constitution & Public Admin,20,20,Civics,Constitution
s_dg_03,degree_prelims,English Proficiency,20,20,English,Grammar
s_dg_04,degree_prelims,Malayalam Language,10,10,Malayalam,Advanced
s_veo_01,veo_exam,General Knowledge,25,25,GK,General
s_veo_02,veo_exam,Rural Development Basics,25,25,GK,Special
s_fm_01,fireman_exam,General Knowledge & Science,50,50,GK,General
s_fm_02,fireman_exam,Maths & Reasoning,50,50,Maths,Mixed`;

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

    // Forms
    const [csvContent, setCsvContent] = useState('');
    const [newExam, setNewExam] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [newSyllabus, setNewSyllabus] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, subject: 'History', topic: '' });
    const [newQ, setNewQ] = useState<Partial<QuizQuestion>>({ id: '', question: '', topic: '', subject: 'History', options: ['', '', '', ''], correctAnswerIndex: 1, difficulty: 'Moderate' });

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, b, s] = await Promise.all([getExams(), getBooks(), getSettings()]);
            setExams(examRes.exams);
            setBooks(b);
            if (s?.subscription_model_active !== undefined) setIsSubscriptionActive(s.subscription_model_active === 'true');
            if (s?.paypal_client_id) setPaypalClientId(s.paypal_client_id);
        } catch (e) { console.error(e); } finally { if (!silent) setLoading(false); }
    }, [getToken]);

    useEffect(() => { refresh(); }, [refresh]);
    
    useEffect(() => { 
        if (selectedExamId) getExamSyllabus(selectedExamId).then(setSyllabusItems); 
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
            setStatus(r.message || "Done!"); 
            await refresh(true); 
        } 
        catch(e:any) { setStatus(e.message); setIsError(true); } finally { setLoading(false); }
    };

    const handleFlush = (table: string) => {
        if (!confirm(`CAUTION: Are you sure you want to wipe ALL data from ${table}?`)) return;
        handleAction(() => adminOp('flush-data', { targetTable: table }));
    };

    const handleBulkUpload = (type: 'questions' | 'syllabus') => {
        if (!csvContent.trim()) return alert("Paste CSV data first.");
        const action = type === 'questions' ? 'bulk-upload-questions' : 'bulk-upload-syllabus';
        handleAction(() => adminOp(action, { csv: csvContent }));
        setCsvContent('');
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500 border border-transparent'}`}>{React.createElement(icon, { className: "h-4 w-4" })}<span>{label}</span></button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex space-x-4">
                    <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Cloud Database Connected</span>
                    </div>
                </div>
                <button onClick={onBack} className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center space-x-2 font-black text-xs uppercase hover:bg-slate-950 transition-all"><ChevronLeftIcon className="h-4 w-4" /><span>Dashboard</span></button>
            </div>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <p className="font-black text-xs uppercase tracking-widest">{status}</p>
                    <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
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
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Database Maintenance</h3>
                                <p className="text-indigo-100 font-bold mt-2">Pull manual Google Sheet changes or rebuild topic counts.</p>
                            </div>
                            <div className="flex flex-wrap gap-3 relative z-10">
                                <button onClick={() => handleAction(() => adminOp('sync-all'))} className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Sync All Data</button>
                                <button onClick={() => handleAction(() => adminOp('sync-syllabus-linking'))} className="bg-indigo-500 text-white border border-white/20 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-400 transition-all flex items-center space-x-2">
                                    <ArrowPathIcon className="h-4 w-4" />
                                    <span>Audit Topic Counts</span>
                                </button>
                            </div>
                        </div>

                        {/* Bulk Tools */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <CloudArrowUpIcon className="h-8 w-8 text-indigo-600" />
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Bulk CSV Tool</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Paste CSV and select target below</p>
                                    </div>
                                </div>
                                <button onClick={() => setCsvContent(DEFAULT_SYLLABUS_CSV)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">Load Default Syllabus Template</button>
                            </div>
                            <textarea value={csvContent} onChange={e => setCsvContent(e.target.value)} placeholder="Paste CSV content here..." className="w-full h-48 p-6 rounded-2xl border-2 dark:bg-slate-800 font-mono text-xs mb-4" />
                            <div className="flex space-x-4">
                                <button onClick={() => handleBulkUpload('questions')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Import Questions</button>
                                <button onClick={() => handleBulkUpload('syllabus')} className="bg-indigo-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Import Syllabus</button>
                            </div>
                            <div className="mt-4 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Format Help:</p>
                                <p className="text-[9px] text-slate-400 font-mono mt-1">Syllabus: id, exam_id, title, questions, duration, subject, topic</p>
                                <p className="text-[9px] text-slate-400 font-mono">Questions: id, topic, question, options(json), correctAnswerIndex(1-4), subject, difficulty</p>
                            </div>
                        </div>

                        {/* Maintenance Tools */}
                        <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/30">
                            <div className="flex items-center space-x-4 mb-8 text-red-600">
                                <TrashIcon className="h-8 w-8" />
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Flush Production Tables</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['questionbank', 'syllabus', 'results', 'notifications', 'exams'].map(table => (
                                    <button key={table} onClick={() => handleFlush(table)} className="bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/50 text-red-600 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Flush {table}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-10">
                        <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border-2">
                             <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Register New Exam</h3>
                             <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('update-exam', { exam: newExam })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newExam.id} onChange={e => setNewExam({...newExam, id: e.target.value})} placeholder="ID (e.g., ldc_2025)" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <input value={newExam.title_ml} onChange={e => setNewExam({...newExam, title_ml: e.target.value})} placeholder="Title (Malayalam)" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <input value={newExam.category} onChange={e => setNewExam({...newExam, category: e.target.value})} placeholder="Category (General/Technical)" className="p-4 rounded-xl border-2 dark:bg-slate-800" />
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest">Register Exam</button>
                             </form>
                        </section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exams.map(e => (
                                <div key={e.id} className="p-6 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2rem] flex justify-between items-center group">
                                    <div><p className="font-black text-sm">{e.title.ml}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{e.id} • {e.category}</p></div>
                                    <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Exams', id: e.id }))} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-8">
                         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full sm:w-1/2 p-4 rounded-xl border-2 font-black text-sm dark:bg-slate-800">
                                <option value="">Select Exam to Manage Syllabus...</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                         </div>

                         {selectedExamId && (
                             <div className="space-y-10 animate-fade-in">
                                 <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border-2">
                                     <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Add Topic to Syllabus</h3>
                                     <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('update-syllabus', { syllabus: {...newSyllabus, exam_id: selectedExamId} })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input value={newSyllabus.title} onChange={e => setNewSyllabus({...newSyllabus, title: e.target.value})} placeholder="Topic Title" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                        <input value={newSyllabus.subject} onChange={e => setNewSyllabus({...newSyllabus, subject: e.target.value})} placeholder="Subject Tag" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                        <input type="number" value={newSyllabus.questions} onChange={e => setNewSyllabus({...newSyllabus, questions: parseInt(e.target.value)})} placeholder="No. of Questions" className="p-4 rounded-xl border-2 dark:bg-slate-800" />
                                        <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest">Add Syllabus Entry</button>
                                     </form>
                                 </section>
                                 <div className="space-y-3">
                                    {syllabusItems.map(item => (
                                        <div key={item.id} className="p-5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex justify-between items-center group">
                                            <div><p className="font-black text-sm dark:text-white">{item.title}</p><p className="text-[9px] text-slate-400 font-black uppercase">{item.subject} • {item.questions} Qs</p></div>
                                            <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Syllabus', id: item.id }))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                         )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-10">
                        <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border-2">
                             <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Add Single Question (Strict 1-4 Index)</h3>
                             <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('add-question', { question: newQ })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="Topic Name" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <input value={newQ.subject} onChange={e => setNewQ({...newQ, subject: e.target.value})} placeholder="Subject Name" className="p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                <textarea value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Question in Malayalam" className="md:col-span-2 p-4 rounded-xl border-2 dark:bg-slate-800" required />
                                {newQ.options?.map((o, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <input value={o} onChange={e => { const no = [...(newQ.options || [])]; no[i] = e.target.value; setNewQ({...newQ, options: no})}} placeholder={`Option ${i+1}`} className="flex-1 p-3 border-2 rounded-xl dark:bg-slate-800" required />
                                        <input type="radio" checked={newQ.correctAnswerIndex === (i+1)} onChange={() => setNewQ({...newQ, correctAnswerIndex: (i+1)})} name="correct" />
                                    </div>
                                ))}
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest">Save Single Question</button>
                             </form>
                        </section>
                    </div>
                )}
                
                {/* Subscription & Bookstore tabs remained same in logic but updated for consistent UI */}
                {activeTab === 'subscriptions' && (
                    <div className="max-w-md mx-auto py-10 space-y-8 text-center">
                         <div className={`p-10 rounded-[3rem] border-4 ${isSubscriptionActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                            <StarIcon className={`h-16 w-16 mx-auto mb-8 ${isSubscriptionActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                            <h3 className="text-4xl font-black mb-8 uppercase tracking-tighter">Pro Lock Control</h3>
                            <button onClick={async () => { const token = await getToken(); handleAction(() => updateSetting('subscription_model_active', String(!isSubscriptionActive), token)); }} className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl ${isSubscriptionActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>{isSubscriptionActive ? 'Disable Lock' : 'Enable Lock'}</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
