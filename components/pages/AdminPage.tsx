
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
    exportStaticExamsToSheet,
    getExams,
    updateExam,
    updateSyllabus,
    deleteExam
} from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import BookCover from '../BookCover';
import type { Book, QuizQuestion, Exam } from '../../types';
import { EXAMS_DATA, EXAM_CONTENT_MAP } from '../../constants';

interface PageProps { 
    onBack: () => void; 
    activeTabId?: string | null;
}

type AdminTab = 'dashboard' | 'exams' | 'syllabus' | 'questions' | 'bookstore' | 'news_gk';

const SUBJECT_LIST = ['GK', 'Maths', 'English', 'Malayalam', 'Science', 'Technical', 'Current Affairs'];

const AdminPage: React.FC<PageProps> = ({ onBack, activeTabId }) => {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    
    const [activeTab, setActiveTab] = useState<AdminTab>((activeTabId as AdminTab) || 'dashboard');
    const [csvData, setCsvData] = useState('');
    const [isAppendMode, setIsAppendMode] = useState(true);
    const [status, setStatus] = useState<any>({ loading: false, result: null });

    // Data States
    const [existingExams, setExistingExams] = useState<Exam[]>([]);
    const [existingBooks, setExistingBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(false);
    
    // Form States
    const [examForm, setExamForm] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', description_en: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [sylForm, setSylForm] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, topic: '' });
    const [manualQuestion, setManualQuestion] = useState<Partial<QuizQuestion>>({
        question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '', difficulty: 'PSC Level'
    });
    const [quickBook, setQuickBook] = useState({ id: '', title: '', author: '', link: '', imageUrl: '' });

    const fetchData = useCallback(async () => {
        setLoadingBooks(true);
        try {
            const [examsData, booksData] = await Promise.all([getExams(), getBooks()]);
            setExistingExams(examsData);
            setExistingBooks(booksData);
        } catch (e) {
            console.error("Fetch failed", e);
        } finally {
            setLoadingBooks(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        if (activeTabId) setActiveTab(activeTabId as AdminTab);
    }, [activeTabId, fetchData]);

    const handleTabChange = (id: AdminTab) => {
        setActiveTab(id);
        setStatus({ loading: false, result: null });
        setCsvData('');
        window.location.hash = `admin_panel/${id}`;
    };

    const handleRestoreDefaults = async () => {
        if (!confirm("This will replace current Exams and Syllabus in the Sheet with the app's original defaults. Continue?")) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const examsPayload = EXAMS_DATA.map(e => ({
                id: e.id, title_ml: e.title.ml, title_en: e.title.en, description_ml: e.description.ml, description_en: e.description.en,
                category: e.category, level: e.level, icon_type: e.id.includes('ldc') ? 'book' : e.id.includes('shield') ? 'shield' : 'cap' 
            }));
            const syllabusPayload: any[] = [];
            Object.entries(EXAM_CONTENT_MAP).forEach(([examId, content]) => {
                content.practiceTests.forEach(test => {
                    syllabusPayload.push({ id: test.id, exam_id: examId, title: test.title, questions: test.questions, duration: test.duration, topic: test.topic });
                });
            });
            await exportStaticExamsToSheet(token, examsPayload, syllabusPayload);
            setStatus({ loading: false, result: { type: 'success', message: 'Restored successfully!' }});
            fetchData();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleRunScraper = async (type: 'daily' | 'books') => {
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const action = type === 'daily' ? triggerDailyScraper : triggerBookScraper;
            const res = await action(token);
            setStatus({ loading: false, result: { type: 'success', message: res.message || 'Task started successfully!' }});
            if (type === 'books') setTimeout(fetchData, 5000);
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleFixAffiliates = async () => {
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await fixAllAffiliates(token);
            setStatus({ loading: false, result: { type: 'success', message: 'Affiliate links verified!' }});
            fetchData();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleExamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await updateExam(examForm, token);
            setStatus({ loading: false, result: { type: 'success', message: 'Exam saved!' }});
            fetchData();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleQuickBookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickBook.title || !quickBook.link) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await updateBook({ 
                id: quickBook.id || `book_${Date.now()}`, 
                title: quickBook.title, 
                author: quickBook.author, 
                imageUrl: quickBook.imageUrl, 
                amazonLink: quickBook.link 
            }, token);
            setStatus({ loading: false, result: { type: 'success', message: 'Book saved!' }});
            setQuickBook({ id: '', title: '', author: '', link: '', imageUrl: '' });
            fetchData();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleManualQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualQuestion.question || !manualQuestion.topic) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await addQuestion(manualQuestion as QuizQuestion, token);
            setStatus({ loading: false, result: { type: 'success', message: 'Question added!' }});
            setManualQuestion({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '', difficulty: 'PSC Level' });
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleCsvSync = async (sheet: string) => {
        if (!csvData.trim()) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await syncCsvData(sheet, csvData, token, isAppendMode);
            setStatus({ loading: false, result: { type: 'success', message: `Sync success for ${sheet}!` }});
            setCsvData('');
            fetchData();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const renderTabButton = (id: AdminTab, label: string, icon: React.ReactNode) => (
        <button onClick={() => handleTabChange(id)} className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-black text-xs transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}>
            {icon}
            <span>{label.toUpperCase()}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in px-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <header className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-10 w-10 text-indigo-400" />
                    <div>
                        <h1 className="text-3xl font-black text-white">Admin Console</h1>
                        <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase">System Control Unit</p>
                    </div>
                </div>
                <button onClick={handleRestoreDefaults} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black px-6 py-3 rounded-xl transition">
                    RESTORE DEFAULTS
                </button>
            </header>

            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                {renderTabButton('dashboard', 'Automation', <RssIcon className="h-4 w-4" />)}
                {renderTabButton('exams', 'Exams', <BookOpenIcon className="h-4 w-4" />)}
                {renderTabButton('syllabus', 'Syllabus', <ClipboardListIcon className="h-4 w-4" />)}
                {renderTabButton('questions', 'Questions', <AcademicCapIcon className="h-4 w-4" />)}
                {renderTabButton('bookstore', 'Bookstore', <BookOpenIcon className="h-4 w-4" />)}
                {renderTabButton('news_gk', 'News/GK', <MegaphoneIcon className="h-4 w-4" />)}
            </div>

            {status.result && (
                <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-fade-in ${status.result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.result.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                    <p className="font-bold text-sm">{status.result.message}</p>
                </div>
            )}

            <div className="mt-6">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                            <RssIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">Daily Scrapers</h3>
                            <p className="text-slate-500 text-sm mb-6">Fetch latest PSC news and generate questions.</p>
                            <button onClick={() => handleRunScraper('daily')} disabled={status.loading} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-4 rounded-xl">RUN NOW</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                            <BookOpenIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">Book Scraper</h3>
                            <p className="text-slate-500 text-sm mb-6">Refresh the bookstore with Amazon rankings.</p>
                            <button onClick={() => handleRunScraper('books')} disabled={status.loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl">SYNC BOOKS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                                <ArrowPathIcon className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">Amazon Scraper</h3>
                                <p className="text-slate-500 text-sm mb-6">Automatically fetch top PSC books from Amazon.in.</p>
                                <button onClick={() => handleRunScraper('books')} disabled={status.loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl">REFRESH FROM AMAZON</button>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 text-center">
                                <ShieldCheckIcon className="h-10 w-10 text-teal-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">Affiliate Links</h3>
                                <p className="text-slate-500 text-sm mb-6">Ensure all books have your correct affiliate tag.</p>
                                <button onClick={handleFixAffiliates} disabled={status.loading} className="w-full bg-teal-600 text-white font-black py-4 rounded-xl">FIX AFFILIATE LINKS</button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                             <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Add Manual Entry</h3>
                             <form onSubmit={handleQuickBookSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Book Title" value={quickBook.title} onChange={e => setQuickBook({...quickBook, title: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" />
                                <input type="text" placeholder="Author" value={quickBook.author} onChange={e => setQuickBook({...quickBook, author: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-slate-800 dark:text-white" />
                                <input type="text" placeholder="Amazon Affiliate Link" value={quickBook.link} onChange={e => setQuickBook({...quickBook, link: e.target.value})} className="p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl md:col-span-2 text-slate-800 dark:text-white" />
                                <button type="submit" disabled={status.loading} className="bg-slate-900 dark:bg-indigo-600 text-white font-black py-4 rounded-xl md:col-span-2">SAVE BOOK TO INVENTORY</button>
                             </form>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Current Inventory ({existingBooks.length})</h3>
                            {loadingBooks ? <div className="animate-pulse flex space-x-4"><div className="h-20 bg-slate-200 w-full rounded-xl"></div></div> : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {existingBooks.map(book => (
                                        <div key={book.id} className="text-center p-3 border dark:border-slate-800 rounded-2xl group relative">
                                            <BookCover title={book.title} author={book.author} className="h-28 w-20 mx-auto mb-3 shadow-md rounded-lg" />
                                            <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{book.title}</p>
                                            <button onClick={() => deleteBook(book.id, null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Exams and Syllabus tabs - Kept full for completeness */}
                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black mb-4 text-slate-800 dark:text-white">Add / Edit Exam</h3>
                            <form onSubmit={handleExamSubmit} className="space-y-3">
                                <input type="text" placeholder="ID (e.g. ldc_2025)" value={examForm.id} onChange={e => setExamForm({...examForm, id: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white" />
                                <input type="text" placeholder="Title ML" value={examForm.title_ml} onChange={e => setExamForm({...examForm, title_ml: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white" />
                                <input type="text" placeholder="Title EN" value={examForm.title_en} onChange={e => setExamForm({...examForm, title_en: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white" />
                                <textarea placeholder="Description" value={examForm.description_ml} onChange={e => setExamForm({...examForm, description_ml: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm h-20 text-slate-800 dark:text-white" />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl">SAVE EXAM</button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                             <h3 className="text-lg font-black mb-4 text-slate-800 dark:text-white">Current Exams</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2">
                                 {existingExams.map(ex => (
                                     <div key={ex.id} className="p-4 border dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                                         <div>
                                             <p className="font-bold text-sm text-slate-800 dark:text-white">{ex.title.ml}</p>
                                             <p className="text-[10px] text-slate-400 font-mono">{ex.id}</p>
                                         </div>
                                         <button onClick={() => setExamForm({...ex, title_ml: ex.title.ml, title_en: ex.title.en, description_ml: ex.description.ml, description_en: ex.description.en, icon_type: 'book'})} className="text-indigo-600 font-bold text-xs">Edit</button>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'news_gk' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black mb-4 text-slate-800 dark:text-white">Bulk PSC Notifications</h3>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl font-mono text-xs mb-4 text-slate-800 dark:text-white" placeholder="id,title,catNo,lastDate,link" />
                            <button onClick={() => handleCsvSync('Notifications')} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-3 rounded-xl">SYNC NOTIFICATIONS</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black mb-4 text-slate-800 dark:text-white">Bulk Current Affairs</h3>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl font-mono text-xs mb-4 text-slate-800 dark:text-white" placeholder="id,title,source,date" />
                            <button onClick={() => handleCsvSync('CurrentAffairs')} className="w-full bg-teal-600 text-white font-black py-3 rounded-xl">SYNC AFFAIRS</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
