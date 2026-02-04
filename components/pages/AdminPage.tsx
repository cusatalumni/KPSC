
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    triggerDailyScraper, 
    triggerBookScraper, 
    fixAllAffiliates, 
    getBooks, 
    deleteBook, 
    updateBook, 
    addQuestion, 
    getExams,
    updateExam,
    updateSyllabus,
    deleteExam,
    getExamSyllabus,
    syncCsvData
} from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import BookCover from '../BookCover';
import type { Book, QuizQuestion, Exam, PracticeTest } from '../../types';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [bulkData, setBulkData] = useState('');
    
    // Forms
    const [examForm, setExamForm] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', description_en: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [sylForm, setSylForm] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, topic: '' });
    const [qForm, setQForm] = useState<Partial<QuizQuestion>>({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '' });
    const [bookForm, setBookForm] = useState({ id: '', title: '', author: '', link: '', imageUrl: '' });

    const refresh = useCallback(async () => {
        try {
            const [e, b] = await Promise.all([getExams(), getBooks()]);
            setExams(e);
            setBooks(b);
        } catch (err) {
            console.error("Refresh failed:", err);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const handleAction = async (fn: () => Promise<any>, msg: string) => {
        setStatus("Processing...");
        try { 
            await fn(); 
            setStatus(msg); 
            refresh(); 
        } catch(e:any) { 
            setStatus("Error: " + e.message); 
        }
        setTimeout(() => setStatus(null), 5000);
    };

    const runScraper = async (type: 'daily' | 'books') => {
        const token = await getToken();
        handleAction(() => type === 'daily' ? triggerDailyScraper(token) : triggerBookScraper(token), "Scraper started successfully!");
    };

    const handleBulkSubmit = async () => {
        if (!bulkData.trim()) return;
        const token = await getToken();
        handleAction(() => syncCsvData('QuestionBank', bulkData, token, true), "Bulk questions uploaded!");
        setBulkData('');
    };

    const tabBtn = (id: AdminTab, label: string, icon: any) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border dark:border-slate-800'
            }`}
        >
            {React.createElement(icon, { className: "h-4 w-4" })}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline mb-4">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <header className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <div>
                        <h1 className="text-3xl font-black">Admin Control Panel</h1>
                        <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase opacity-70">System Management Unit</p>
                    </div>
                </div>
                {status && (
                    <div className="bg-indigo-500/20 border border-indigo-400/30 px-6 py-3 rounded-2xl font-bold animate-pulse text-indigo-200">
                        {status}
                    </div>
                )}
            </header>

            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Question Bank', PlusIcon)}
                {tabBtn('bookstore', 'Bookstore', BookOpenIcon)}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800 transition-transform hover:scale-[1.02]">
                            <RssIcon className="h-16 w-16 mx-auto text-indigo-500 mb-6" />
                            <h3 className="text-2xl font-black mb-4 dark:text-white">Daily Content Refresh</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Updates Notifications, Live News, and generates new AI questions.</p>
                            <button onClick={() => runScraper('daily')} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg">RUN SYSTEM SCRAPER</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800 transition-transform hover:scale-[1.02]">
                            <ArrowPathIcon className="h-16 w-16 mx-auto text-orange-500 mb-6" />
                            <h3 className="text-2xl font-black mb-4 dark:text-white">Amazon Bookstore Sync</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Scans Amazon.in for the newest PSC Rank Files and Practice Books.</p>
                            <button onClick={() => runScraper('books')} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-lg">SYNC AMAZON BOOKS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Add New Exam</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateExam(examForm, t), "Exam saved!"); }} className="space-y-4">
                                <input type="text" placeholder="Exam ID (e.g. ldc_2025)" value={examForm.id} onChange={e=>setExamForm({...examForm, id:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                <input type="text" placeholder="Title Malayalam" value={examForm.title_ml} onChange={e=>setExamForm({...examForm, title_ml:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl dark:text-white" required />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-md">SAVE EXAM</button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Current Database</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                {exams.map(ex => (
                                    <div key={ex.id} className="p-5 border dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 group">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{ex.title.ml}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{ex.id}</p>
                                        </div>
                                        <button onClick={() => handleAction(() => { const t = getToken(); return deleteExam(ex.id, t as any); }, "Exam deleted!")} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Single Entry</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>addQuestion(qForm, t), "Question added!"); setQForm({question:'', options:['','','',''], correctAnswerIndex:0, subject:'GK', topic:''}); }} className="space-y-4">
                                <textarea placeholder="Write question here..." value={qForm.question} onChange={e=>setQForm({...qForm, question:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                {qForm.options?.map((o,i) => (
                                    <input key={i} type="text" placeholder={`Option ${i+1}`} value={o} onChange={e=>{const o2=[...(qForm.options||[])]; o2[i]=e.target.value; setQForm({...qForm, options:o2})}} className="w-full p-3 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                ))}
                                <input type="text" placeholder="Topic Tag (e.g. History)" value={qForm.topic} onChange={e=>setQForm({...qForm, topic:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">ADD TO BANK</button>
                            </form>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-2 dark:text-white">Bulk CSV Import</h3>
                            <p className="text-xs text-slate-400 mb-6">Format: Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIndex(0-3), Subject, Difficulty</p>
                            <textarea 
                                value={bulkData} 
                                onChange={e => setBulkData(e.target.value)} 
                                placeholder="Topic, Question, A|B|C|D, 0, GK, Easy..."
                                className="w-full h-80 p-4 border dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-sm dark:text-white mb-4"
                            />
                            <button onClick={handleBulkSubmit} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black">START BULK IMPORT</button>
                        </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                                <h3 className="text-xl font-black mb-6 dark:text-white">Manual Book Entry</h3>
                                <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateBook(bookForm, t), "Book saved!"); setBookForm({id:'', title:'', author:'', link:'', imageUrl:''}); }} className="space-y-4">
                                    <input type="text" placeholder="Title" value={bookForm.title} onChange={e=>setBookForm({...bookForm, title:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                    <input type="text" placeholder="Amazon Link" value={bookForm.link} onChange={e=>setBookForm({...bookForm, link:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">ADD BOOK</button>
                                </form>
                             </div>
                             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800 text-center">
                                <ShieldCheckIcon className="h-12 w-12 mx-auto text-teal-500 mb-4" />
                                <h3 className="text-xl font-black mb-2 dark:text-white">Affiliate Integrity</h3>
                                <p className="text-slate-500 mb-6">Automatically ensures all links use your affiliate tag: <span className="font-mono text-xs">malayalambooks-21</span></p>
                                <button onClick={() => handleAction(async () => { const t = await getToken(); return fixAllAffiliates(t); }, "Links fixed!")} className="w-full bg-teal-600 text-white py-4 rounded-xl font-black">VERIFY AFFILIATES</button>
                             </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-2xl font-black mb-8 dark:text-white">Inventory Manager</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8">
                                {books.map(book => (
                                    <div key={book.id} className="text-center group relative animate-fade-in-up">
                                        <BookCover title={book.title} author={book.author} imageUrl={book.imageUrl} className="h-36 w-28 mx-auto mb-4 shadow-xl rounded-xl" />
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tighter">{book.title}</p>
                                        <button onClick={() => handleAction(() => { const t = getToken(); return deleteBook(book.id, t as any); }, "Book removed!")} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 hover:scale-100">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border dark:border-slate-800 max-w-2xl mx-auto">
                         <h3 className="text-2xl font-black mb-8 dark:text-white text-center">Exam Syllabus Logic</h3>
                         <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateSyllabus(sylForm, t), "Syllabus updated!"); }} className="space-y-5">
                             <select value={sylForm.exam_id} onChange={e=>setSylForm({...sylForm, exam_id:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold">
                                 <option value="">Select Target Exam</option>
                                 {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title.ml}</option>)}
                             </select>
                             <input type="text" placeholder="Topic ID (e.g. ldc_gk_1)" value={sylForm.id} onChange={e=>setSylForm({...sylForm, id:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" required />
                             <input type="text" placeholder="Display Title (e.g. Geography)" value={sylForm.title} onChange={e=>setSylForm({...sylForm, title:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" required />
                             <input type="text" placeholder="Question Bank Filter (e.g. History)" value={sylForm.topic} onChange={e=>setSylForm({...sylForm, topic:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white" required />
                             <button type="submit" className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black shadow-lg">UPDATE SYLLABUS</button>
                         </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
