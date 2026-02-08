
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    triggerDailyScraper, 
    triggerBookScraper, 
    applyAffiliateTags,
    getBooks, 
    deleteBook, 
    getExams,
    updateExam,
    updateSyllabus,
    deleteExam,
    addQuestion,
    syncCsvData,
    testConnection,
    exportStaticExamsToSheet
} from '../../services/pscDataService';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import BookCover from '../BookCover';
import { EXAMS_DATA, EXAM_CONTENT_MAP } from '../../constants';
import type { Book, Exam } from '../../types';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [loading, setLoading] = useState(false);
    const [qMode, setQMode] = useState<'single' | 'bulk'>('single');
    
    const [examForm, setExamForm] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', description_en: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [sylForm, setSylForm] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, subject: '', topic: '' });
    const [qForm, setQForm] = useState({ topic: '', question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: '', difficulty: 'Moderate' as any });

    const refresh = useCallback(async () => {
        try {
            const [e, b] = await Promise.all([getExams(), getBooks()]);
            setExams(e);
            setBooks(b);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const handleAction = async (fn: () => Promise<any>) => {
        setStatus("Processing...");
        setIsError(false);
        setLoading(true);
        try { 
            const res = await fn(); 
            setStatus(res.message || "Action completed!"); 
            refresh(); 
        } catch(e:any) { 
            setStatus(e.message || "Unknown error"); 
            setIsError(true);
        } 
        finally { setLoading(false); }
    };

    const handleRestoreDefaults = async () => {
        if (!confirm("This will overwrite Exams and Syllabus in your sheet with defaults. Continue?")) return;
        const token = await getToken();
        const examsPayload = EXAMS_DATA.map(e => ({
            id: e.id, title_ml: e.title.ml, title_en: e.title.en, 
            description_ml: e.description.ml, description_en: e.description.en,
            category: e.category, level: e.level, icon_type: 'book'
        }));
        const syllabusPayload: any[] = [];
        Object.entries(EXAM_CONTENT_MAP).forEach(([examId, content]) => {
            content.practiceTests.forEach(test => {
                syllabusPayload.push({
                    id: test.id, exam_id: examId, title: test.title,
                    questions: test.questions, duration: test.duration, 
                    subject: test.subject, topic: test.topic
                });
            });
        });
        handleAction(() => exportStaticExamsToSheet(token, examsPayload, syllabusPayload));
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => { setActiveTab(id); setStatus(null); }} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border dark:border-slate-800 hover:bg-slate-50'}`}>
            {React.createElement(icon, { className: "h-4 w-4" })}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Back to Dashboard</span>
                </button>
                <div className="flex gap-2">
                    <button onClick={handleRestoreDefaults} disabled={loading} className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-amber-600 transition">RESTORE DEFAULTS</button>
                    <button onClick={() => handleAction(async () => {
                        const t = await getToken();
                        return testConnection(t);
                    })} disabled={loading} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-emerald-100 transition">TEST CONNECTION</button>
                </div>
            </div>

            <header className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <h1 className="text-3xl font-black">Admin Control Center</h1>
                </div>
            </header>

            {status && (
                <div className={`p-6 rounded-[2rem] border shadow-lg ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-2xl ${isError ? 'bg-red-100' : 'bg-indigo-100'}`}>
                            {isError ? <ShieldCheckIcon className="h-6 w-6 text-red-600" /> : <PlusIcon className="h-6 w-6 text-indigo-600" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black uppercase tracking-widest text-xs mb-1">{isError ? 'Action Failed' : 'System Message'}</h4>
                            <p className="font-bold">{status}</p>
                        </div>
                        <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600">
                           <PlusIcon className="h-5 w-5 rotate-45" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Questions', PlusIcon)}
                {tabBtn('bookstore', 'Bookstore', BookOpenIcon)}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between group hover:border-indigo-400 transition-all">
                            <div>
                                <RssIcon className="h-12 w-12 text-indigo-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">Daily Scraper</h3>
                                <p className="text-slate-500 mb-8 text-sm">Updates news ticker, current affairs (last 14 days), and notifications.</p>
                            </div>
                            <button onClick={async () => {
                                const t = await getToken();
                                handleAction(() => triggerDailyScraper(t));
                            }} disabled={loading} className="w-full btn-vibrant-indigo text-white py-5 rounded-2xl font-black transition">RUN SCRAPER</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between group hover:border-orange-400 transition-all">
                            <div>
                                <ArrowPathIcon className="h-12 w-12 text-orange-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">Book Store Sync</h3>
                                <p className="text-slate-500 mb-8 text-sm">Synchronizes bookstore with latest Amazon titles.</p>
                            </div>
                            <button onClick={async () => {
                                const t = await getToken();
                                handleAction(() => triggerBookScraper(t));
                            }} disabled={loading} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black transition">SYNC BOOKS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Add / Edit Exam</h3>
                            <form onSubmit={async (e) => { 
                                e.preventDefault(); 
                                const t = await getToken();
                                handleAction(()=>updateExam(examForm, t)); 
                            }} className="space-y-4">
                                <input type="text" placeholder="Exam ID" value={examForm.id} onChange={e=>setExamForm({...examForm, id:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                <input type="text" placeholder="Title (Malayalam)" value={examForm.title_ml} onChange={e=>setExamForm({...examForm, title_ml:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black transition">SAVE EXAM</button>
                            </form>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800 flex flex-col">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Existing Exams</h3>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {exams.map(ex => (
                                    <div key={ex.id} className="p-4 border dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 group">
                                        <p className="font-bold dark:text-white">{ex.title.ml}</p>
                                        <button onClick={async () => {
                                            if(!confirm("Delete?")) return;
                                            const t = await getToken();
                                            handleAction(()=>deleteExam(ex.id, t));
                                        }} className="text-red-500 p-2"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'questions' && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Bulk CSV Import</h3>
                        </div>
                        <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx(0-3), Subject, Difficulty" className="w-full h-80 p-6 border dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800 font-mono text-xs dark:text-white mb-6" />
                        <div className="flex gap-4">
                            <button onClick={async () => {
                                const t = await getToken();
                                handleAction(()=>syncCsvData('QuestionBank', bulkData, t, true));
                            }} disabled={loading || !bulkData} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black">APPEND DATA</button>
                            <button onClick={async () => {
                                if(!confirm("Overwrite entire QuestionBank?")) return;
                                const t = await getToken();
                                handleAction(()=>syncCsvData('QuestionBank', bulkData, t, false));
                            }} disabled={loading || !bulkData} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 py-5 rounded-2xl font-black">OVERWRITE DATABASE</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
