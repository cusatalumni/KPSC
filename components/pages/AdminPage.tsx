
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
    syncCsvData,
    testConnection
} from '../../services/pscDataService';
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
    const [loading, setLoading] = useState(false);
    
    // Forms
    const [examForm, setExamForm] = useState({ 
        id: '', 
        title_ml: '', 
        title_en: '', 
        description_ml: '', 
        description_en: '', 
        category: 'General', 
        level: 'Preliminary', 
        icon_type: 'book' 
    });
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
        setLoading(true);
        try { 
            await fn(); 
            setStatus(msg); 
            refresh(); 
        } catch(e:any) { 
            setStatus("Error: " + e.message); 
        } finally {
            setLoading(false);
        }
        setTimeout(() => setStatus(null), 8000);
    };

    const runScraper = async (type: 'daily' | 'books') => {
        const token = await getToken();
        handleAction(() => type === 'daily' ? triggerDailyScraper(token) : triggerBookScraper(token), "Scraper finished!");
    };

    const handleBulkSubmit = async () => {
        if (!bulkData.trim()) return;
        const token = await getToken();
        handleAction(() => syncCsvData('QuestionBank', bulkData, token, true), "Bulk entry successful!");
        setBulkData('');
    };

    const handleEditExam = (exam: any) => {
        setExamForm({
            id: exam.id,
            title_ml: exam.title.ml,
            title_en: exam.title.en,
            description_ml: exam.description.ml,
            description_en: exam.description.en,
            category: exam.category,
            level: exam.level,
            icon_type: 'book'
        });
        setActiveTab('exams');
    };

    const handleTestConn = async () => {
        const token = await getToken();
        handleAction(() => testConnection(token), "Connection is OK!");
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
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                </button>
                <button onClick={handleTestConn} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md">
                    TEST CONNECTION
                </button>
            </div>

            <header className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <div>
                        <h1 className="text-3xl font-black">Admin Panel</h1>
                        <p className="text-indigo-300 text-[10px] font-bold tracking-widest uppercase">System Management Unit</p>
                    </div>
                </div>
                {status && (
                    <div className="bg-indigo-500/20 border border-indigo-400/30 px-6 py-3 rounded-2xl font-bold text-indigo-200">
                        {status}
                    </div>
                )}
            </header>

            <div className="flex flex-wrap gap-3">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Questions', PlusIcon)}
                {tabBtn('bookstore', 'Bookstore', BookOpenIcon)}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800">
                            <RssIcon className="h-16 w-16 mx-auto text-indigo-500 mb-6" />
                            <h3 className="text-2xl font-black mb-4 dark:text-white">Daily Refresh</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Updates Notifications, News, and generates AI questions.</p>
                            <button onClick={() => runScraper('daily')} disabled={loading} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black">RUN SYSTEM SCRAPER</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl text-center border dark:border-slate-800">
                            <ArrowPathIcon className="h-16 w-16 mx-auto text-orange-500 mb-6" />
                            <h3 className="text-2xl font-black mb-4 dark:text-white">Amazon Sync</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Scans Amazon.in for the newest PSC Rank Files.</p>
                            <button onClick={() => runScraper('books')} disabled={loading} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black">SYNC AMAZON BOOKS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Add / Edit Exam</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateExam(examForm, t), "Exam saved!"); }} className="space-y-4">
                                <input type="text" placeholder="Exam ID (e.g. ldc_2025)" value={examForm.id} onChange={e=>setExamForm({...examForm, id:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Title (ML)" value={examForm.title_ml} onChange={e=>setExamForm({...examForm, title_ml:e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" required />
                                    <input type="text" placeholder="Title (EN)" value={examForm.title_en} onChange={e=>setExamForm({...examForm, title_en:e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white" />
                                </div>
                                <textarea placeholder="Description (ML)" value={examForm.description_ml} onChange={e=>setExamForm({...examForm, description_ml:e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white h-24" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={examForm.category} onChange={e=>setExamForm({...examForm, category:e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white">
                                        <option value="General">General</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Special">Special</option>
                                    </select>
                                    <select value={examForm.level} onChange={e=>setExamForm({...examForm, level:e.target.value as any})} className="p-4 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:text-white">
                                        <option value="Preliminary">Preliminary</option>
                                        <option value="Main">Main</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">SAVE EXAM</button>
                            </form>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Current Database</h3>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {exams.map(ex => (
                                    <div key={ex.id} className="p-4 border dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                                        <div>
                                            <p className="font-bold dark:text-white">{ex.title.ml}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{ex.id}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEditExam(ex)} className="text-indigo-500 font-bold text-xs px-3 py-1 bg-white border rounded-lg">EDIT</button>
                                            <button onClick={async () => { if(confirm("Delete?")) { const t = await getToken(); handleAction(()=>deleteExam(ex.id, t), "Exam deleted!"); } }} className="text-red-500 p-2"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Add New Book</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateBook(bookForm, t), "Book saved!"); setBookForm({id:'', title:'', author:'', link:'', imageUrl:''}); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Title" value={bookForm.title} onChange={e=>setBookForm({...bookForm, title:e.target.value})} className="p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                <input type="text" placeholder="Author" value={bookForm.author} onChange={e=>setBookForm({...bookForm, author:e.target.value})} className="p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" />
                                <input type="text" placeholder="Amazon Link" value={bookForm.link} onChange={e=>setBookForm({...bookForm, link:e.target.value})} className="w-full p-4 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white md:col-span-2" required />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black md:col-span-2">ADD BOOK</button>
                            </form>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border dark:border-slate-800">
                            {books.map(book => (
                                <div key={book.id} className="relative group text-center">
                                    <BookCover title={book.title} author={book.author} imageUrl={book.imageUrl} className="h-32 w-24 mx-auto mb-2 shadow-lg rounded-lg" />
                                    <p className="text-[9px] font-black dark:text-white truncate uppercase">{book.title}</p>
                                    <button 
                                        onClick={async () => { if(confirm("Delete?")) { const t = await getToken(); handleAction(()=>deleteBook(book.id, t), "Book deleted!"); } }} 
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 dark:text-white">Single Entry</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>addQuestion(qForm, t), "Question added!"); setQForm({question:'', options:['','','',''], correctAnswerIndex:0, subject:'GK', topic:''}); }} className="space-y-4">
                                <textarea placeholder="Question" value={qForm.question} onChange={e=>setQForm({...qForm, question:e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                {qForm.options?.map((o,i) => (
                                    <input key={i} type="text" placeholder={`Option ${i+1}`} value={o} onChange={e=>{const o2=[...(qForm.options||[])]; o2[i]=e.target.value; setQForm({...qForm, options:o2})}} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                ))}
                                <input type="text" placeholder="Topic Tag (History, Math, etc)" value={qForm.topic} onChange={e=>setQForm({...qForm, topic:e.target.value})} className="w-full p-4 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white" required />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">ADD TO BANK</button>
                            </form>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black mb-2 dark:text-white">Bulk CSV Import</h3>
                            <p className="text-[10px] text-slate-400 mb-6 font-mono">Format: Topic, Question, A|B|C|D, CorrectIdx(0-3), Subject, Difficulty</p>
                            <textarea 
                                value={bulkData} 
                                onChange={e => setBulkData(e.target.value)} 
                                placeholder="Topic, Question, A|B|C|D, 0, GK, Easy"
                                className="w-full h-80 p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-xs dark:text-white mb-4"
                            />
                            <button onClick={handleBulkSubmit} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black">START BULK IMPORT</button>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border dark:border-slate-800 max-w-2xl mx-auto">
                         <h3 className="text-2xl font-black mb-8 dark:text-white text-center">Manage Syllabus</h3>
                         <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateSyllabus(sylForm, t), "Syllabus updated!"); }} className="space-y-5">
                             <select value={sylForm.exam_id} onChange={e=>setSylForm({...sylForm, exam_id:e.target.value})} className="w-full p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold">
                                 <option value="">Select Exam</option>
                                 {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title.ml}</option>)}
                             </select>
                             <input type="text" placeholder="Topic ID" value={sylForm.id} onChange={e=>setSylForm({...sylForm, id:e.target.value})} className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:text-white" required />
                             <input type="text" placeholder="Title" value={sylForm.title} onChange={e=>setSylForm({...sylForm, title:e.target.value})} className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:text-white" required />
                             <input type="text" placeholder="Question Bank Filter (e.g. History)" value={sylForm.topic} onChange={e=>setSylForm({...sylForm, topic:e.target.value})} className="w-full p-4 border rounded-xl dark:bg-slate-800 dark:text-white" required />
                             <button type="submit" className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black">UPDATE SYLLABUS</button>
                         </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
