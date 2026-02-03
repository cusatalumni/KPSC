
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    triggerDailyScraper, 
    triggerBookScraper, 
    fixAllAffiliates, 
    syncCsvData, 
    getBooks, 
    deleteBook, 
    updateBook, 
    addQuestion, 
    getExams,
    updateExam,
    updateSyllabus,
    deleteExam,
    getExamSyllabus
} from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { PlusIcon } from '../icons/PlusIcon';
import BookCover from '../BookCover';
import type { Book, QuizQuestion, Exam, PracticeTest } from '../../types';

interface PageProps { 
    onBack: () => void; 
}

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore';

const AdminPage: React.FC<PageProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [status, setStatus] = useState<{ loading: boolean; message: string | null; type: 'success' | 'error' | null }>({
        loading: false, message: null, type: null
    });

    // Data lists
    const [exams, setExams] = useState<Exam[]>([]);
    const [syllabus, setSyllabus] = useState<PracticeTest[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    
    // Forms
    const [examForm, setExamForm] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', description_en: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [sylForm, setSylForm] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, topic: '' });
    const [questionForm, setQuestionForm] = useState<Partial<QuizQuestion>>({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '', difficulty: 'PSC Level' });
    const [bookForm, setBookForm] = useState({ id: '', title: '', author: '', link: '', imageUrl: '' });

    const refreshData = useCallback(async () => {
        try {
            const [examList, bookList] = await Promise.all([getExams(), getBooks()]);
            setExams(examList);
            setBooks(bookList);
        } catch (e) {
            console.error("Data refresh failed", e);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        if (sylForm.exam_id) {
            getExamSyllabus(sylForm.exam_id).then(setSyllabus);
        }
    }, [sylForm.exam_id]);

    const showStatus = (message: string, type: 'success' | 'error') => {
        setStatus({ loading: false, message, type });
        setTimeout(() => setStatus({ loading: false, message: null, type: null }), 5000);
    };

    const handleAction = async (fn: () => Promise<any>, successMsg: string) => {
        setStatus({ loading: true, message: 'Processing...', type: null });
        try {
            await fn();
            showStatus(successMsg, 'success');
            refreshData();
        } catch (e: any) {
            showStatus(e.message || 'Operation failed', 'error');
        }
    };

    const handleExamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        handleAction(() => updateExam(examForm, token), "Exam saved successfully!");
    };

    const handleSyllabusSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        handleAction(() => updateSyllabus(sylForm, token), "Syllabus topic saved!");
    };

    const handleBookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        handleAction(() => updateBook({ ...bookForm, amazonLink: bookForm.link }, token), "Book added to library!");
        setBookForm({ id: '', title: '', author: '', link: '', imageUrl: '' });
    };

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        handleAction(() => addQuestion(questionForm, token), "Question added to Bank!");
        setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '', difficulty: 'PSC Level' });
    };

    const handleDeleteExam = async (id: string) => {
        if (!confirm("Are you sure you want to delete this exam?")) return;
        const token = await getToken();
        handleAction(() => deleteExam(id, token), "Exam deleted!");
    };

    const handleDeleteBook = async (id: string) => {
        if (!confirm("Delete this book?")) return;
        const token = await getToken();
        handleAction(() => deleteBook(id, token), "Book removed!");
    };

    const runScraper = async (type: 'daily' | 'books') => {
        const token = await getToken();
        const fn = type === 'daily' ? () => triggerDailyScraper(token) : () => triggerBookScraper(token);
        handleAction(fn, `${type === 'daily' ? 'News & Questions' : 'Books'} updated from source!`);
    };

    const renderTabBtn = (id: AdminTab, label: string, icon: any) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
        >
            {React.createElement(icon, { className: "h-4 w-4" })}
            <span>{label.toUpperCase()}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <header className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <div>
                        <h1 className="text-3xl font-black">Admin Manager</h1>
                        <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase">Content & Automation Control</p>
                    </div>
                </div>
                {status.message && (
                    <div className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-3 animate-bounce ${status.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {status.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                        <span>{status.message}</span>
                    </div>
                )}
            </header>

            <div className="flex flex-wrap gap-3">
                {renderTabBtn('automation', 'Automation', RssIcon)}
                {renderTabBtn('exams', 'Manage Exams', AcademicCapIcon)}
                {renderTabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {renderTabBtn('questions', 'Question Bank', PlusIcon)}
                {renderTabBtn('bookstore', 'Bookstore', BookOpenIcon)}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                            <RssIcon className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Daily Scraper</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Refreshes News, Notifications, GK Facts and generates new Daily Questions using AI.</p>
                            <button onClick={() => runScraper('daily')} disabled={status.loading} className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">RUN ALL SCRAPERS</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                            <BookOpenIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Book Refresh</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Scans Amazon.in for the latest PSC Rank files and updates the official Bookstore tab.</p>
                            <button onClick={() => runScraper('books')} disabled={status.loading} className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-xl hover:scale-[1.02] transition-transform">SYNC BOOKSTORE</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Add/Edit Exam</h3>
                            <form onSubmit={handleExamSubmit} className="space-y-4">
                                <input type="text" placeholder="ID (ldc_2025)" value={examForm.id} onChange={e => setExamForm({...examForm, id: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <input type="text" placeholder="Title (Malayalam)" value={examForm.title_ml} onChange={e => setExamForm({...examForm, title_ml: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <input type="text" placeholder="Title (English)" value={examForm.title_en} onChange={e => setExamForm({...examForm, title_en: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <textarea placeholder="Description" value={examForm.description_ml} onChange={e => setExamForm({...examForm, description_ml: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl h-32 text-slate-800 dark:text-white" />
                                <select value={examForm.category} onChange={e => setExamForm({...examForm, category: e.target.value as any})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white">
                                    <option value="General">General</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Special">Special</option>
                                </select>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg">SAVE EXAM</button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                             <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Existing Exams</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] overflow-y-auto pr-2">
                                {exams.map(ex => (
                                    <div key={ex.id} className="p-4 border dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-300 transition-colors group">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{ex.title.ml}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{ex.id}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => setExamForm({...ex, title_ml: ex.title.ml, title_en: ex.title.en, description_ml: ex.description.ml, description_en: ex.description.en, icon_type: 'book'})} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><ArrowPathIcon className="h-4 w-4" /></button>
                                            <button onClick={() => handleDeleteExam(ex.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Add Syllabus Topic</h3>
                            <form onSubmit={handleSyllabusSubmit} className="space-y-4">
                                <select value={sylForm.exam_id} onChange={e => setSylForm({...sylForm, exam_id: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required>
                                    <option value="">Select Target Exam</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                                </select>
                                <input type="text" placeholder="Topic ID (e.g. ldc_gk_1)" value={sylForm.id} onChange={e => setSylForm({...sylForm, id: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <input type="text" placeholder="Display Title (e.g. Mental Ability)" value={sylForm.title} onChange={e => setSylForm({...sylForm, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Questions" value={sylForm.questions} onChange={e => setSylForm({...sylForm, questions: parseInt(e.target.value)})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" />
                                    <input type="number" placeholder="Duration (min)" value={sylForm.duration} onChange={e => setSylForm({...sylForm, duration: parseInt(e.target.value)})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" />
                                </div>
                                <input type="text" placeholder="Sheet Filter Topic (e.g. Topic:Mental Ability)" value={sylForm.topic} onChange={e => setSylForm({...sylForm, topic: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <button type="submit" className="w-full bg-teal-600 text-white font-black py-4 rounded-xl shadow-lg">ADD TOPIC</button>
                            </form>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                             <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Current Syllabus ({syllabus.length})</h3>
                             <div className="space-y-3 h-[500px] overflow-y-auto pr-2">
                                {syllabus.length === 0 ? <p className="text-slate-400">Select an exam to see its syllabus.</p> : syllabus.map(s => (
                                    <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{s.title}</p>
                                            <p className="text-xs text-slate-400 font-mono">{s.topic}</p>
                                        </div>
                                        {/* Fix: Ensured 'topic' is always a string by providing a fallback to empty string, as PracticeTest.topic is optional. */}
                                        <button onClick={() => setSylForm({ ...s, exam_id: sylForm.exam_id, topic: s.topic || '' })} className="text-indigo-600 font-bold text-sm">Edit</button>
                                    </div>
                                ))}
                             </div>
                        </div>
                     </div>
                )}

                {activeTab === 'questions' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 max-w-3xl mx-auto">
                        <h3 className="text-2xl font-black mb-8 text-slate-800 dark:text-white">Manual Question Entry</h3>
                        <form onSubmit={handleQuestionSubmit} className="space-y-6">
                            <textarea placeholder="Write the question here..." value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-lg text-slate-800 dark:text-white" required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {questionForm.options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center space-x-3">
                                        <input type="radio" name="correct" checked={questionForm.correctAnswerIndex === idx} onChange={() => setQuestionForm({...questionForm, correctAnswerIndex: idx})} />
                                        <input type="text" placeholder={`Option ${idx+1}`} value={opt} onChange={e => {
                                            const newOpts = [...(questionForm.options || [])];
                                            newOpts[idx] = e.target.value;
                                            setQuestionForm({...questionForm, options: newOpts});
                                        }} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Topic (e.g. History)" value={questionForm.topic} onChange={e => setQuestionForm({...questionForm, topic: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <select value={questionForm.subject} onChange={e => setQuestionForm({...questionForm, subject: e.target.value as any})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white">
                                    <option value="GK">General Knowledge</option>
                                    <option value="Maths">Maths</option>
                                    <option value="Malayalam">Malayalam</option>
                                    <option value="English">English</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl">ADD TO DATABASE</button>
                        </form>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                                <ArrowPathIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">Amazon Sync</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">Fetch and update trending PSC books from Amazon.in.</p>
                                <button onClick={() => runScraper('books')} disabled={status.loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl">REFRESH FROM AMAZON</button>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                                <ShieldCheckIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">Affiliate Logic</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">Verify and fix all amazon links to use your affiliate tag.</p>
                                <button onClick={() => handleAction(async () => { const t = await getToken(); return fixAllAffiliates(t); }, "Affiliate tags updated!")} disabled={status.loading} className="w-full bg-teal-600 text-white font-black py-4 rounded-xl">FIX AFFILIATE LINKS</button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                             <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Add Manual Entry</h3>
                             <form onSubmit={handleBookSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" required />
                                <input type="text" placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" />
                                <input type="text" placeholder="Amazon Link" value={bookForm.link} onChange={e => setBookForm({...bookForm, link: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl md:col-span-2 text-slate-800 dark:text-white" required />
                                <button type="submit" className="bg-slate-900 dark:bg-indigo-600 text-white font-black py-4 rounded-xl md:col-span-2">SAVE BOOK</button>
                             </form>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Inventory Management ({books.length})</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                                {books.map(book => (
                                    <div key={book.id} className="text-center p-3 border dark:border-slate-800 rounded-2xl group relative hover:border-red-300 transition-colors">
                                        <BookCover title={book.title} author={book.author} imageUrl={book.imageUrl} className="h-28 w-20 mx-auto mb-3 shadow-md rounded-lg" />
                                        <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{book.title}</p>
                                        <button onClick={() => handleDeleteBook(book.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><TrashIcon className="h-3 w-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
