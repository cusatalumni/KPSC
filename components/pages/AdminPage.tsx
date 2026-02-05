
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
    updateBook, 
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
import type { Book, QuizQuestion, Exam } from '../../types';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [bulkData, setBulkData] = useState('');
    const [loading, setLoading] = useState(false);
    const [qMode, setQMode] = useState<'single' | 'bulk'>('single');
    
    // Forms
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

    const handleAction = async (fn: () => Promise<any>, msg: string) => {
        setStatus("Processing...");
        setLoading(true);
        try { 
            const res = await fn(); 
            setStatus(msg); 
            refresh(); 
        } catch(e:any) { 
            setStatus("Error: " + (e.message || "Unknown error")); 
        } 
        finally { setLoading(false); }
        setTimeout(() => setStatus(null), 5000);
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

        handleAction(() => exportStaticExamsToSheet(token, examsPayload, syllabusPayload), "Defaults Restored Successfully!");
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border dark:border-slate-800 hover:bg-slate-50'}`}>
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
                    }, "Google Sheets Connection Verified!")} disabled={loading} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-emerald-100 transition">TEST CONNECTION</button>
                </div>
            </div>

            <header className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <h1 className="text-3xl font-black">Admin Control Center</h1>
                </div>
                {status && <div className="bg-indigo-500/20 px-6 py-3 rounded-2xl font-bold text-indigo-200 animate-pulse border border-indigo-400/30 max-w-md truncate">{status}</div>}
            </header>

            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Questions', PlusIcon)}
                {tabBtn('bookstore', 'Bookstore', BookOpenIcon)}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between">
                            <div>
                                <RssIcon className="h-16 w-16 mx-auto text-indigo-500 mb-6" />
                                <h3 className="text-2xl font-black mb-4 dark:text-white">Daily Content Scraper</h3>
                                <p className="text-slate-500 mb-6 text-sm">Updates news ticker, current affairs, and notifications from official sources using AI.</p>
                            </div>
                            <button onClick={async () => {
                                const t = await getToken();
                                handleAction(() => triggerDailyScraper(t), "Daily Task Done!");
                            }} disabled={loading} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black hover:scale-[1.02] transition disabled:opacity-50">RUN SCRAPER</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between">
                            <div>
                                <ArrowPathIcon className="h-16 w-16 mx-auto text-orange-500 mb-6" />
                                <h3 className="text-2xl font-black mb-4 dark:text-white">Book Store Sync</h3>
                                <p className="text-slate-500 mb-6 text-sm">Synchronizes bookstore inventory with the latest Amazon PSC titles.</p>
                            </div>
                            <button onClick={async () => {
                                const t = await getToken();
                                handleAction(() => triggerBookScraper(t), "Books Synced!");
                            }} disabled={loading} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black hover:scale-[1.02] transition disabled:opacity-50">SYNC BOOKS</button>
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
                                handleAction(()=>updateExam(examForm, t), "Exam information saved!"); 
                            }} className="space-y-4">
                                <input type="text" placeholder="Exam ID (e.g. ldc_2025)" value={examForm.id} onChange={e=>setExamForm({...examForm, id:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required />
                                <input type="text" placeholder="Title (Malayalam)" value={examForm.title_ml} onChange={e=>setExamForm({...examForm, title_ml:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required />
                                <input type="text" placeholder="Title (English)" value={examForm.title_en} onChange={e=>setExamForm({...examForm, title_en:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                                <textarea placeholder="Description (Malayalam)" value={examForm.description_ml} onChange={e=>setExamForm({...examForm, description_ml:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white h-24 outline-none focus:ring-2 ring-indigo-500" />
                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-indigo-700 transition disabled:opacity-50">SAVE EXAM</button>
                            </form>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800 flex flex-col">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Existing Exams</h3>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {exams.map(ex => (
                                    <div key={ex.id} className="p-4 border dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 group">
                                        <div>
                                            <p className="font-bold dark:text-white">{ex.title.ml}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{ex.id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setExamForm({
                                                id: ex.id, 
                                                title_ml: ex.title.ml, 
                                                title_en: ex.title.en, 
                                                description_ml: ex.description.ml, 
                                                description_en: ex.description.en,
                                                category: ex.category,
                                                level: ex.level,
                                                icon_type: 'book'
                                            })} className="text-indigo-500 font-bold text-xs px-3 py-1 rounded-lg hover:bg-indigo-50 transition">EDIT</button>
                                            <button onClick={async () => {
                                                if(!confirm("Delete this exam?")) return;
                                                const t = await getToken();
                                                handleAction(()=>deleteExam(ex.id, t), "Exam deleted!");
                                            }} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-black mb-2 dark:text-white flex items-center gap-3">
                            <ClipboardListIcon className="h-7 w-7 text-indigo-500" />
                            Syllabus Topic Manager
                        </h3>
                        <p className="text-slate-500 text-xs mb-8">Match Subject & Topic to Question Bank columns F & B.</p>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const t = await getToken();
                            handleAction(() => updateSyllabus(sylForm, t), "Syllabus updated!");
                        }} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2">Target Exam</label>
                                <select value={sylForm.exam_id} onChange={e => setSylForm({...sylForm, exam_id: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required>
                                    <option value="">-- Choose Exam --</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Topic ID (e.g. ldc_gk_01)" value={sylForm.id} onChange={e => setSylForm({...sylForm, id: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required />
                                <input type="text" placeholder="Display Title" value={sylForm.title} onChange={e => setSylForm({...sylForm, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Question Count" value={sylForm.questions} onChange={e => setSylForm({...sylForm, questions: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                                <input type="number" placeholder="Duration (Mins)" value={sylForm.duration} onChange={e => setSylForm({...sylForm, duration: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-indigo-500 mb-1">Subject (Col F)</label>
                                    <input type="text" placeholder="e.g. Reasoning" value={sylForm.subject} onChange={e => setSylForm({...sylForm, subject: e.target.value})} className="w-full p-4 bg-indigo-50/50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-teal-500 mb-1">Topic (Col B)</label>
                                    <input type="text" placeholder="e.g. Mental Ability" value={sylForm.topic} onChange={e => setSylForm({...sylForm, topic: e.target.value})} className="w-full p-4 bg-teal-50/50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 ring-indigo-500" required />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition disabled:opacity-50 uppercase tracking-widest">SAVE TOPIC</button>
                        </form>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black dark:text-white">Store Management</h3>
                                <p className="text-slate-500 text-sm">Manage Amazon affiliate products.</p>
                            </div>
                            <button 
                                onClick={async () => {
                                    const t = await getToken();
                                    handleAction(() => applyAffiliateTags(t), "All links updated with affiliate tags!");
                                }}
                                disabled={loading}
                                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 disabled:opacity-50"
                            >
                                <ArrowPathIcon className="h-5 w-5" />
                                SYNC AFFILIATE TAGS
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                             <h3 className="text-xl font-black mb-6 dark:text-white">Inventory</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                                {books.map(book => (
                                    <div key={book.id} className="relative group text-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border dark:border-slate-700">
                                        <BookCover title={book.title} author={book.author} imageUrl={book.imageUrl} className="h-32 w-24 mx-auto mb-2 shadow-lg rounded-lg" />
                                        <p className="text-[9px] font-black dark:text-white truncate uppercase mb-1">{book.title}</p>
                                        <button onClick={async () => {
                                            if(!confirm("Delete this book?")) return;
                                            const t = await getToken();
                                            handleAction(()=>deleteBook(book.id, t), "Book removed!");
                                        }} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><TrashIcon className="h-3 w-3" /></button>
                                    </div>
                                ))}
                             </div>
                             {books.length === 0 && <p className="text-center py-12 text-slate-400 font-medium">No books found. Use Automation tab to sync from Amazon.</p>}
                        </div>
                    </div>
                )}
                
                {activeTab === 'questions' && (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-2">
                                <button onClick={() => setQMode('single')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${qMode === 'single' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}>SINGLE QUESTION</button>
                                <button onClick={() => setQMode('bulk')} className={`px-8 py-2.5 rounded-xl font-black text-sm transition-all ${qMode === 'bulk' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}>BULK IMPORT</button>
                            </div>
                        </div>

                        {qMode === 'single' ? (
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800 max-w-2xl mx-auto">
                                <h3 className="text-2xl font-black mb-8 dark:text-white flex items-center gap-3">
                                    <PlusIcon className="h-7 w-7 text-emerald-500" />
                                    Add New Question
                                </h3>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const t = await getToken();
                                    handleAction(() => addQuestion(qForm, t), "Question added to bank!");
                                    setQForm({ topic: '', question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: '', difficulty: 'Moderate' });
                                }} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject (Col F)</label>
                                            <input type="text" placeholder="e.g. GK" value={qForm.subject} onChange={e=>setQForm({...qForm, subject: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Topic (Col B)</label>
                                            <input type="text" placeholder="e.g. History" value={qForm.topic} onChange={e=>setQForm({...qForm, topic: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question Text</label>
                                        <textarea placeholder="Type question here..." value={qForm.question} onChange={e=>setQForm({...qForm, question: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white h-24" required />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-slate-400 uppercase">Options & Correct Answer</label>
                                        {qForm.options.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <input type="radio" name="correct" checked={qForm.correctAnswerIndex === idx} onChange={() => setQForm({...qForm, correctAnswerIndex: idx})} className="w-5 h-5 text-indigo-600" />
                                                <input type="text" placeholder={`Option ${String.fromCharCode(65+idx)}`} value={opt} onChange={e => {
                                                    const newOpts = [...qForm.options];
                                                    newOpts[idx] = e.target.value;
                                                    setQForm({...qForm, options: newOpts});
                                                }} className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition uppercase tracking-widest disabled:opacity-50">ADD TO QUESTION BANK</button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black dark:text-white">Bulk Question Import</h3>
                                    <div className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-xl font-bold border border-indigo-100 dark:border-indigo-800">
                                        FORMAT: Topic (Col B), Question, Opt A|Opt B|Opt C|Opt D, CorrectIndex(0-3), Subject (Col F), Difficulty
                                    </div>
                                </div>
                                <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="History, What is the capital of India?, New Delhi|Mumbai|Kolkata|Chennai, 0, GK, Easy" className="w-full h-80 p-6 border dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800 font-mono text-xs dark:text-white mb-6 focus:ring-4 ring-indigo-500/10 outline-none" />
                                <div className="flex gap-4">
                                    <button onClick={async () => {
                                        const t = await getToken();
                                        handleAction(()=>syncCsvData('QuestionBank', bulkData, t, true), "Questions appended successfully!");
                                    }} disabled={loading || !bulkData} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 disabled:opacity-50">APPEND DATA</button>
                                    <button onClick={async () => {
                                        if(!confirm("This will WIPE all existing questions in the sheet. Are you sure?")) return;
                                        const t = await getToken();
                                        handleAction(()=>syncCsvData('QuestionBank', bulkData, t, false), "Database replaced successfully!");
                                    }} disabled={loading || !bulkData} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-5 rounded-2xl font-black hover:bg-red-500 hover:text-white transition disabled:opacity-50">OVERWRITE DATABASE</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
