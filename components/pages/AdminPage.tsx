
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    getExams,
    testConnection,
    getExamSyllabus,
    getSettings,
    getSubscriptions
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
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import type { Exam, PracticeTest } from '../../types';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'access';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [dbStatus, setDbStatus] = useState<{sheets: boolean, supabase: boolean}>({sheets: false, supabase: false});
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);

    const [csvContent, setCsvContent] = useState('');
    const [newExam, setNewExam] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [syllabusItems, setSyllabusItems] = useState<PracticeTest[]>([]);
    const [auditReport, setAuditReport] = useState<any[]>([]);

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const token = await getToken();
        try {
            const conn = await testConnection(token);
            if (conn && conn.status) setDbStatus(conn.status);
            const [examRes, subs] = await Promise.all([getExams(), getSubscriptions()]);
            setExams(examRes.exams);
            setSubscriptions(subs || []);
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

    const runAudit = async () => {
        setLoading(true);
        try {
            const data = await adminOp('get-audit-report');
            setAuditReport(data);
            setStatus("Audit Complete");
        } catch (e: any) { setStatus(e.message); setIsError(true); }
        finally { setLoading(false); }
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
                {tabBtn('access', 'Access Hub', ShieldCheckIcon)}
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
                                    { id: 'run-book-scraper', label: 'Book (ASIN) Scraper', icon: BookOpenIcon, color: 'bg-rose-500' },
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
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-12">
                        {/* Smart Gap Filler Component */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                             <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-1000 -mr-20 -mt-20"><SparklesIcon className="h-96 w-96" /></div>
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg"><SparklesIcon className="h-6 w-6" /></div>
                                        <span className="font-black tracking-widest text-xs uppercase">Intelligent Gap Management</span>
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">Targeted Question Filler</h3>
                                    <p className="text-indigo-100 font-bold mt-3 text-sm leading-relaxed">
                                        This tool audits your existing <span className="text-amber-400">1800+ questions</span> and identifies which micro-topics from the 177 syllabus items are missing. 
                                        It then uses AI to generate questions ONLY for those empty spots.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => handleAction(() => adminOp('run-gap-filler'))}
                                        className="bg-amber-400 text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3"
                                    >
                                        <span>Fill Syllabus Gaps</span>
                                        <ArrowPathIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={runAudit}
                                        className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-white/20 transition-all flex items-center space-x-3"
                                    >
                                        <span>View Audit Report</span>
                                        <ClipboardListIcon className="h-5 w-5" />
                                    </button>
                                </div>
                             </div>
                        </div>

                        {auditReport.length > 0 && (
                            <div className="animate-fade-in space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight px-2 flex items-center space-x-3">
                                    <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />
                                    <span>Intelligent Audit Report</span>
                                </h3>
                                <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl max-h-[500px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest sticky top-0 z-10">
                                            <tr>
                                                <th className="px-8 py-5">Topic Title</th>
                                                <th className="px-8 py-5">Exam ID</th>
                                                <th className="px-8 py-5 text-center">Questions in Bank</th>
                                                <th className="px-8 py-5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {auditReport.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-sm">{item.title}</td>
                                                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400">{item.exam_id}</td>
                                                    <td className="px-8 py-5 text-center font-black text-lg">{item.count}</td>
                                                    <td className="px-8 py-5">
                                                        {item.count === 0 ? (
                                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Critical Gap</span>
                                                        ) : item.count < 5 ? (
                                                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Low Coverage</span>
                                                        ) : (
                                                            <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Good</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                             <div className="flex items-center space-x-4 mb-8">
                                <CloudArrowUpIcon className="h-8 w-8 text-indigo-600" />
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Bulk Import (CSV)</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manually append questions to the bank</p>
                                </div>
                            </div>
                            <textarea value={csvContent} onChange={e => setCsvContent(e.target.value)} placeholder="Paste CSV content here..." className="w-full h-48 p-6 rounded-3xl border-2 dark:bg-slate-800 font-mono text-[11px] mb-6 focus:border-indigo-500 outline-none" />
                            <button onClick={() => handleBulkUpload('questions')} className="bg-slate-800 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-slate-900">Start Manual Import</button>
                        </div>
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="space-y-8">
                         <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Active Subscriptions</h3>
                            <button onClick={() => refresh()} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-all"><ArrowPathIcon className="h-5 w-5" /></button>
                         </div>
                         <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">User ID</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Plan</th>
                                        <th className="px-8 py-5">Expires On</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subscriptions.length > 0 ? subscriptions.map(sub => (
                                        <tr key={sub.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-8 py-6 font-mono text-xs text-slate-400">{sub.user_id}</td>
                                            <td className="px-8 py-6"><span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${sub.status === 'pro' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{sub.status}</span></td>
                                            <td className="px-8 py-6 text-sm font-bold">{sub.plan_type}</td>
                                            <td className="px-8 py-6 text-sm font-medium text-slate-500">{new Date(sub.expiry_date).toLocaleDateString()}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => { if(confirm('Cancel this subscription?')) handleAction(() => adminOp('delete-row', { sheet: 'Subscriptions', id: sub.user_id }))}} className="text-red-500 hover:scale-110 transition-transform"><TrashIcon className="h-5 w-5" /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest">No Active Subscriptions Found</td></tr>
                                    )}
                                </tbody>
                            </table>
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
                    <div className="space-y-12">
                         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full sm:w-1/2 p-5 rounded-2xl border-2 font-black text-sm dark:bg-slate-800 bg-white">
                                <option value="">Select Exam Profile to View Syllabus...</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                         </div>

                         {/* Syllabus Bulk Upload UI */}
                         <div className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border-2 border-dashed border-indigo-100 dark:border-indigo-800">
                             <div className="flex items-center space-x-4 mb-6">
                                <CloudArrowUpIcon className="h-8 w-8 text-indigo-600" />
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Bulk Import Syllabus (CSV)</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add micro-topics in bulk. Header format: id,exam_id,title,questions,duration,subject,topic</p>
                                </div>
                            </div>
                            <textarea 
                                value={csvContent} 
                                onChange={e => setCsvContent(e.target.value)} 
                                placeholder="1,ldc_lgs,General Knowledge,50,75,General Knowledge,History..." 
                                className="w-full h-40 p-6 rounded-3xl border-2 dark:bg-slate-800 font-mono text-[11px] mb-6 focus:border-indigo-500 outline-none" 
                            />
                            <button 
                                onClick={() => handleBulkUpload('syllabus')} 
                                className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-700"
                            >
                                Start Syllabus Import
                            </button>
                        </div>

                         {selectedExamId && (
                             <div className="space-y-6 animate-fade-in">
                                <h4 className="text-lg font-black uppercase tracking-widest text-slate-400 px-2">Current Micro-Topics for {selectedExamId}</h4>
                                {syllabusItems.map(item => (
                                    <div key={item.id} className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] flex justify-between items-center group">
                                        <div>
                                            <p className="font-black text-base dark:text-white leading-tight">{item.title}</p>
                                            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">{item.subject} • {item.questions} Questions • {item.duration} Mins</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 italic">Topic: {item.topic}</p>
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
