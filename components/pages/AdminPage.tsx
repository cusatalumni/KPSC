
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

    const sortedAuditReport = useMemo(() => {
        return [...auditReport].sort((a, b) => a.count - b.count);
    }, [auditReport]);

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
                            <span className="text-[10px] font-black uppercase tracking-tighter">Sheets: <span className={dbStatus.sheets ? 'text-emerald-500' : 'text-red-500'}>{dbStatus.sheets ? 'READY' : 'OFF'}</span></span>
                         </div>
                         <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>
                         <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${dbStatus.supabase ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">DB: <span className={dbStatus.supabase ? 'text-emerald-500' : 'text-red-500'}>{dbStatus.supabase ? 'READY' : 'OFF'}</span></span>
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
                {activeTab === 'questions' && (
                    <div className="space-y-12">
                        <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
                             <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-1000 -mr-20 -mt-20"><SparklesIcon className="h-96 w-96" /></div>
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-indigo-500 rounded-lg"><SparklesIcon className="h-6 w-6" /></div>
                                        <span className="font-black tracking-widest text-xs uppercase text-indigo-400">Micro-Topic Intelligence</span>
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">Syllabus Gap Audit</h3>
                                    <p className="text-slate-400 font-bold mt-3 text-sm leading-relaxed">
                                        Audit existing questions against the 177 syllabus items. Identify and fill empty spots using Targeted AI. 
                                        Identifies duplicates by checking <span className="text-indigo-400">Subject + Topic</span> combinations.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={runAudit} className="bg-white/10 text-white border border-white/20 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-white/20 transition-all flex items-center justify-center space-x-3">
                                        <ClipboardListIcon className="h-5 w-5" />
                                        <span>Show Audit Table</span>
                                    </button>
                                </div>
                             </div>
                        </div>

                        {auditReport.length > 0 && (
                            <div className="animate-fade-in space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black uppercase tracking-tight px-2 flex items-center space-x-3">
                                        <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />
                                        <span>Granular Audit Report (Sorted by Status)</span>
                                    </h3>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest sticky top-0 z-20">
                                            <tr>
                                                <th className="px-10 py-6">Syllabus Subject & Topic</th>
                                                <th className="px-6 py-6 text-center">Questions</th>
                                                <th className="px-10 py-6 text-right">Coverage Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {sortedAuditReport.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center space-x-4">
                                                           <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-400">{item.exam_id}</div>
                                                           <div>
                                                              <p className="font-black text-sm dark:text-white leading-tight">{item.subject} • {item.topic}</p>
                                                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.title}</p>
                                                           </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-center font-black text-xl text-slate-800 dark:text-slate-100">{item.count}</td>
                                                    <td className="px-10 py-6 text-right">
                                                        {item.count === 0 ? (
                                                            <span className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Critical Gap</span>
                                                        ) : item.count < 5 ? (
                                                            <span className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Low Coverage</span>
                                                        ) : (
                                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Healthy</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Other sections omitted for brevity */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
