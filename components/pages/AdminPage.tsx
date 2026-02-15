
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
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { StarIcon } from '../icons/StarIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { BellIcon } from '../icons/BellIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { BeakerIcon } from '../icons/BeakerIcon';
import type { Book, Exam, PracticeTest, QuizQuestion } from '../../types';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore' | 'subscriptions';

const DEFAULT_SYLLABUS_CSV = `id,exam_id,title,questions,duration,subject,topic
s_ldc_01,ldc_lgs,Indian History,10,10,History,Indian History
s_ldc_02,ldc_lgs,Kerala History,10,10,History,Kerala History
s_ldc_03,ldc_lgs,Geography,10,10,Geography,Geography
s_ldc_04,ldc_lgs,Constitution,10,10,Civics,Constitution
s_p2_01,plus_two_prelims,General Science,20,20,Science,General
s_p2_02,plus_two_prelims,Arithmetic,20,30,Maths,Mixed
s_dg_01,degree_prelims,Advanced History,20,20,History,Advanced
s_dg_02,degree_prelims,Civil Law Basics,20,20,Civics,Law
s_veo_01,veo_exam,Rural Development,25,25,GK,Special
s_veo_02,veo_exam,Social Welfare,25,25,GK,Social
s_fm_01,fireman_exam,Fire Safety GK,50,50,GK,Special
s_fm_02,fireman_exam,Mental Ability,50,50,Maths,Mixed
s_lp_01,lp_up_assistant,Psychology,20,20,Psychology,Educational
s_lp_02,lp_up_assistant,Pedagogy,20,20,Psychology,Teaching
s_sn_01,staff_nurse,Nursing Science,50,60,Technical,Nursing
s_ks_01,kseb_sub_eng,Electrical Eng,50,60,Technical,Electrical`;

const DEFAULT_BOOKS_CSV = `id,title,author,imageUrl,amazonLink
b1,Kerala PSC LDC Rank File,Lakshya Publications,,https://amazon.in
b2,PSC Bulletin Question Bank,Talent Academy,,https://amazon.in
b3,Indian Constitution,M Laxmikanth,,https://amazon.in
b4,Kerala History,E Sreedhara Menon,,https://amazon.in`;

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [dbStatus, setDbStatus] = useState<{sheets: boolean, supabase: boolean}>({sheets: false, supabase: false});
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);

    const [csvContent, setCsvContent] = useState('');
    const [newExam, setNewExam] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [syllabusItems, setSyllabusItems] = useState<PracticeTest[]>([]);

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, s] = await Promise.all([getExams(), getSettings()]);
            setExams(examRes.exams);
            if (s?.subscription_model_active !== undefined) setIsSubscriptionActive(s.subscription_model_active === 'true');
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
        setStatus("Processing..."); setIsError(false);
        try { const r = await fn(); setStatus(r.message || "Done!"); await refresh(true); } 
        catch(e:any) { setStatus(e.message); setIsError(true); }
    };

    const handleBulkUpload = (type: 'questions' | 'syllabus' | 'bookstore') => {
        if (!csvContent.trim()) return alert("Paste CSV data first.");
        const actionMap = { 'questions': 'bulk-upload-questions', 'syllabus': 'bulk-upload-syllabus', 'bookstore': 'bulk-upload-bookstore' };
        handleAction(() => adminOp(actionMap[type], { csv: csvContent }));
        setCsvContent('');
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 border border-transparent hover:border-indigo-500'}`}>{React.createElement(icon, { className: "h-4 w-4" })}<span>{label}</span></button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Connection Status Panel */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex space-x-4">
                    <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-6">
                         <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${dbStatus.sheets ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">Google Sheets: <span className={dbStatus.sheets ? 'text-emerald-500' : 'text-red-500'}>{dbStatus.sheets ? 'OPERATIONAL' : 'OFFLINE'}</span></span>
                         </div>
                         <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>
                         <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">Cloud DB: <span className={dbStatus.supabase ? 'text-emerald-500' : 'text-red-500'}>{dbStatus.supabase ? 'OPERATIONAL' : 'OFFLINE'}</span></span>
                         </div>
                    </div>
                </div>
                <button onClick={onBack} className="bg-slate-800 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center space-x-2 font-black text-xs uppercase hover:bg-slate-950 transition-all"><ChevronLeftIcon className="h-4 w-4" /><span>Dashboard</span></button>
            </div>

            {status && (
                <div className={`p-6 rounded-[2rem] border-2 shadow-xl flex items-center justify-between animate-fade-in ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className="flex items-center space-x-3">
                        {isError ? <XMarkIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                        <p className="font-black text-xs uppercase tracking-widest">{status}</p>
                    </div>
                    <button onClick={() => setStatus(null)} className="p-2 hover:bg-black/5 rounded-full"><XMarkIcon className="h-5 w-5" /></button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {tabBtn('automation', 'Cloud Sync', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Q-Bank', PlusIcon)}
            </div>

            <main className="bg-white dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border dark:border-slate-800 min-h-[600px]">
                {activeTab === 'automation' && (
                    <div className="space-y-12">
                         <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 -mr-20 -mt-20"><ArrowPathIcon className="h-64 w-64" /></div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter">System Reconstruction</h3>
                                <p className="text-indigo-100 font-bold mt-2">Pull all manual changes from Google Sheets into Cloud Production.</p>
                            </div>
                            <button onClick={() => handleAction(() => adminOp('sync-all'))} className="relative z-10 bg-white text-indigo-600 px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Rebuild Cloud Layer</button>
                        </div>

                        {/* AI Automation Triggers */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
                                <BeakerIcon className="h-6 w-6 text-indigo-500" />
                                <h3 className="text-xl font-black uppercase tracking-tight">AI Automation Triggers</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { id: 'run-scraper-notifications', label: 'Job Notifications', icon: BellIcon, color: 'bg-emerald-500' },
                                    { id: 'run-scraper-updates', label: 'PSC Live Updates', icon: RssIcon, color: 'bg-indigo-500' },
                                    { id: 'run-scraper-affairs', label: 'Current Affairs', icon: NewspaperIcon, color: 'bg-teal-500' },
                                    { id: 'run-scraper-gk', label: 'GK Fact Scraper', icon: LightBulbIcon, color: 'bg-amber-500' },
                                    { id: 'run-scraper-questions', label: 'AI Q-Generator', icon: PlusIcon, color: 'bg-slate-800' },
                                    { id: 'run-book-scraper', label: 'Book Scraper', icon: BookOpenIcon, color: 'bg-rose-500' },
                                ].map((tool) => (
                                    <button 
                                        key={tool.id} 
                                        onClick={() => handleAction(() => adminOp(tool.id))}
                                        className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 p-6 rounded-3xl flex items-center space-x-4 hover:border-indigo-400 transition-all shadow-sm hover:shadow-xl group text-left"
                                    >
                                        <div className={`p-4 rounded-2xl ${tool.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <tool.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm dark:text-white">{tool.label}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Start Scraper</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bulk Import System */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div className="flex items-center space-x-4">
                                    <CloudArrowUpIcon className="h-8 w-8 text-indigo-600" />
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Bulk Import System</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CSV Tool for fast database setup</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setCsvContent(DEFAULT_SYLLABUS_CSV)} className="bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-indigo-50 transition-all">Load Full Syllabus Template</button>
                                    <button onClick={() => setCsvContent(DEFAULT_BOOKS_CSV)} className="bg-white border-2 border-emerald-100 text-emerald-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-50 transition-all">Load Books Template</button>
                                </div>
                            </div>
                            <textarea value={csvContent} onChange={e => setCsvContent(e.target.value)} placeholder="Paste CSV content here..." className="w-full h-48 p-6 rounded-3xl border-2 dark:bg-slate-800 font-mono text-[11px] mb-6 focus:border-indigo-500 outline-none" />
                            <div className="flex flex-wrap gap-4">
                                <button onClick={() => handleBulkUpload('syllabus')} className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-700">Import Syllabus</button>
                                <button onClick={() => handleBulkUpload('bookstore')} className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700">Import Books</button>
                                <button onClick={() => handleBulkUpload('questions')} className="bg-slate-800 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-slate-900">Import Q-Bank</button>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/30">
                            <div className="flex items-center space-x-4 mb-8 text-red-600">
                                <TrashIcon className="h-8 w-8" />
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Emergency Reset (Production Only)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['questionbank', 'syllabus', 'results', 'bookstore'].map(table => (
                                    <button key={table} onClick={() => { if(confirm(`Flush ${table}?`)) handleAction(() => adminOp('flush-data', { targetTable: table }))}} className="bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/50 text-red-600 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Wipe {table}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="space-y-10">
                        <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800">
                             <h3 className="text-xl font-black uppercase mb-8 tracking-tight">Register New Exam Profile</h3>
                             <form onSubmit={e => { e.preventDefault(); handleAction(() => adminOp('update-exam', { exam: newExam })); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={newExam.id} onChange={e => setNewExam({...newExam, id: e.target.value})} placeholder="Unique ID (e.g., veo_exam)" className="p-4 rounded-2xl border-2 dark:bg-slate-800 font-bold" required />
                                <input value={newExam.title_ml} onChange={e => setNewExam({...newExam, title_ml: e.target.value})} placeholder="Title (മലയാളം)" className="p-4 rounded-2xl border-2 dark:bg-slate-800 font-bold" required />
                                <input value={newExam.category} onChange={e => setNewExam({...newExam, category: e.target.value})} placeholder="Category (General/Technical)" className="p-4 rounded-2xl border-2 dark:bg-slate-800 font-bold" />
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Activate Exam Profile</button>
                             </form>
                        </section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exams.map(e => (
                                <div key={e.id} className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] flex justify-between items-center">
                                    <div><p className="font-black text-sm">{e.title.ml}</p><p className="text-[10px] text-slate-400 font-black uppercase">{e.id} • {e.category}</p></div>
                                    <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Exams', id: e.id }))} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="space-y-8">
                         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10">
                            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full sm:w-1/2 p-5 rounded-2xl border-2 font-black text-sm dark:bg-slate-800 bg-white">
                                <option value="">Select Exam Profile to View Syllabus...</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                         </div>

                         {selectedExamId && (
                             <div className="space-y-6 animate-fade-in">
                                {syllabusItems.map(item => (
                                    <div key={item.id} className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] flex justify-between items-center group">
                                        <div>
                                            <p className="font-black text-base dark:text-white leading-tight">{item.title}</p>
                                            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">{item.subject} • {item.questions} Questions • {item.duration} Mins</p>
                                        </div>
                                        <button onClick={() => handleAction(() => adminOp('delete-row', { sheet: 'Syllabus', id: item.id }))} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                ))}
                                {syllabusItems.length === 0 && <p className="text-center py-20 text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50 rounded-[3rem] border-2 border-dashed">Syllabus is empty for this exam.</p>}
                             </div>
                         )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
