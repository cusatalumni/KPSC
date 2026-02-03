
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
    exportStaticExamsToSheet 
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
import BookCover from '../BookCover';
import type { Book, QuizQuestion } from '../../types';
import { EXAMS_DATA, EXAM_CONTENT_MAP } from '../../constants';

interface PageProps { 
    onBack: () => void; 
    activeTabId?: string | null;
}

type AdminTab = 'dashboard' | 'bookstore' | 'news_gk' | 'questions';

const SUBJECT_LIST = ['GK', 'Maths', 'English', 'Malayalam', 'Science', 'Technical', 'Current Affairs'];
const DIFFICULTY_LIST = ['Easy', 'Moderate', 'PSC Level'];

const AdminPage: React.FC<PageProps> = ({ onBack, activeTabId }) => {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    
    const [activeTab, setActiveTab] = useState<AdminTab>((activeTabId as AdminTab) || 'dashboard');
    const [csvData, setCsvData] = useState('');
    const [isAppendMode, setIsAppendMode] = useState(true);
    
    const [manualQuestion, setManualQuestion] = useState<Partial<QuizQuestion>>({
        question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '', difficulty: 'PSC Level'
    });

    const [quickBook, setQuickBook] = useState({ id: '', title: '', author: '', link: '', imageUrl: '' });
    const [existingBooks, setExistingBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [status, setStatus] = useState<any>({ loading: false, result: null });

    const fetchCurrentBooks = useCallback(async () => {
        setLoadingBooks(true);
        try {
            const data = await getBooks();
            setExistingBooks(data);
        } catch (e) {
            console.error("Failed to load books:", e);
        } finally {
            setLoadingBooks(false);
        }
    }, []);

    useEffect(() => {
        if (activeTabId) setActiveTab(activeTabId as AdminTab);
        if (activeTab === 'bookstore') {
            fetchCurrentBooks();
        }
    }, [activeTabId, activeTab, fetchCurrentBooks]);

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
                id: e.id,
                title_ml: e.title.ml,
                title_en: e.title.en,
                description_ml: e.description.ml,
                description_en: e.description.en,
                category: e.category,
                level: e.level,
                icon_type: e.id.includes('ldc') ? 'book' : e.id.includes('shield') ? 'shield' : 'cap' 
            }));

            const syllabusPayload: any[] = [];
            Object.entries(EXAM_CONTENT_MAP).forEach(([examId, content]) => {
                content.practiceTests.forEach(test => {
                    syllabusPayload.push({
                        id: test.id,
                        exam_id: examId,
                        title: test.title,
                        questions: test.questions,
                        duration: test.duration,
                        topic: test.topic
                    });
                });
            });

            await exportStaticExamsToSheet(token, examsPayload, syllabusPayload);
            setStatus({ loading: false, result: { type: 'success', message: 'Original exams and syllabus restored to sheet!' }});
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
            if (type === 'books') setTimeout(fetchCurrentBooks, 5000);
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

    const handleQuickAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickBook.title || !quickBook.link) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await updateBook({ id: quickBook.id || `book_${Date.now()}`, title: quickBook.title, author: quickBook.author, imageUrl: quickBook.imageUrl, amazonLink: quickBook.link }, token);
            setStatus({ loading: false, result: { type: 'success', message: 'Book saved!' }});
            setQuickBook({ id: '', title: '', author: '', link: '', imageUrl: '' });
            fetchCurrentBooks();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleDeleteBook = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await deleteBook(id, token);
            setStatus({ loading: false, result: { type: 'success', message: 'Deleted!' }});
            fetchCurrentBooks();
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
            setStatus({ loading: false, result: { type: 'success', message: `CSV Sync success for ${sheet}!` }});
            setCsvData('');
            if (sheet === 'Bookstore') fetchCurrentBooks();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const renderTabButton = (id: AdminTab, label: string, icon: React.ReactNode) => (
        <button onClick={() => handleTabChange(id)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in px-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <header className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-2xl gap-6 border-4 border-indigo-500/20">
                <div className="flex items-center space-x-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-3xl shadow-lg rotate-3">
                        <ShieldCheckIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Admin Console</h1>
                        <p className="text-indigo-300 font-bold opacity-80 uppercase tracking-widest text-[10px] mt-1">Data Control Center</p>
                    </div>
                </div>
                <button onClick={handleRestoreDefaults} className="bg-indigo-600 text-white font-black px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg">
                    RESTORE DEFAULT EXAMS
                </button>
            </header>

            <div className="flex flex-wrap gap-4 mb-8">
                {renderTabButton('dashboard', 'Automation', <RssIcon className="h-5 w-5" />)}
                {renderTabButton('bookstore', 'Bookstore', <BookOpenIcon className="h-5 w-5" />)}
                {renderTabButton('news_gk', 'News & GK', <MegaphoneIcon className="h-5 w-5" />)}
                {renderTabButton('questions', 'Quiz Bank', <AcademicCapIcon className="h-5 w-5" />)}
            </div>

            {status.result && (
                <div className={`p-6 rounded-3xl flex items-start space-x-4 animate-fade-in border-2 ${status.result.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {status.result.type === 'success' ? <CheckCircleIcon className="h-6 w-6 mt-1" /> : <XCircleIcon className="h-6 w-6 mt-1" />}
                    <div>
                        <p className="font-black text-lg">{status.result.type === 'success' ? 'Success' : 'Error'}</p>
                        <p className="font-medium opacity-90">{status.result.message}</p>
                    </div>
                </div>
            )}

            <div className="animate-fade-in">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-500 transition-all">
                            <div className="bg-indigo-50 p-6 rounded-full mb-6 group-hover:bg-indigo-600 group-hover:scale-110 transition-all">
                                <RssIcon className="h-12 w-12 text-indigo-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Daily Data Sync</h3>
                            <p className="text-slate-500 font-medium mb-8">Triggers scrapers for Notifications and Updates.</p>
                            <button onClick={() => handleRunScraper('daily')} disabled={status.loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl">RUN DAILY SCRAPER</button>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:border-orange-500 transition-all">
                            <div className="bg-orange-50 p-6 rounded-full mb-6 group-hover:bg-orange-600 group-hover:scale-110 transition-all">
                                <BookOpenIcon className="h-12 w-12 text-orange-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Amazon Book Scraper</h3>
                            <p className="text-slate-500 font-medium mb-8">Updates the bookstore with latest PSC rank files.</p>
                            <button onClick={() => handleRunScraper('books')} disabled={status.loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl">SYNC AMAZON BOOKS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                            <h3 className="text-xl font-black mb-6 flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Quick Add Book</h3>
                            <form onSubmit={handleQuickAddBook} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <input type="text" placeholder="Title" value={quickBook.title} onChange={e => setQuickBook({...quickBook, title: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                <input type="text" placeholder="Author" value={quickBook.author} onChange={e => setQuickBook({...quickBook, author: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                <input type="text" placeholder="Amazon Link" value={quickBook.link} onChange={e => setQuickBook({...quickBook, link: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                <button type="submit" disabled={status.loading} className="lg:col-span-3 bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg">SAVE BOOK</button>
                            </form>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                             <h3 className="text-xl font-black mb-6">Current Inventory ({existingBooks.length})</h3>
                             {loadingBooks ? <p className="animate-pulse">Loading books...</p> : (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                     {existingBooks.map(book => (
                                         <div key={book.id} className="p-4 border rounded-2xl flex flex-col items-center text-center">
                                             <BookCover title={book.title} author={book.author} imageUrl={book.imageUrl} className="w-20 h-28 mb-3 shadow-md rounded-lg" />
                                             <h4 className="font-bold text-sm line-clamp-1">{book.title}</h4>
                                             <button onClick={() => handleDeleteBook(book.id)} className="mt-3 text-red-500 font-bold text-xs hover:underline">Delete</button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                )}

                {activeTab === 'news_gk' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                            <h3 className="text-xl font-black mb-4">Bulk Upload Notifications</h3>
                            <p className="text-sm text-slate-500 mb-4">Format: id,title,catNo,lastDate,link</p>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs mb-4" placeholder="n1,Exam Title,207/2025,25-12-2025,#" />
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 text-sm font-bold">
                                    <input type="checkbox" checked={isAppendMode} onChange={e => setIsAppendMode(e.target.checked)} />
                                    <span>Append Mode</span>
                                </label>
                                <button onClick={() => handleCsvSync('Notifications')} className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl">SYNC NOTIFICATIONS</button>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                            <h3 className="text-xl font-black mb-4">Bulk Upload Current Affairs</h3>
                            <p className="text-sm text-slate-500 mb-4">Format: id,title,source,date</p>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs mb-4" placeholder="ca1,New Kerala Budget,Manorama,2025-01-01" />
                            <button onClick={() => handleCsvSync('CurrentAffairs')} className="w-full bg-teal-600 text-white font-black px-6 py-3 rounded-xl">SYNC CURRENT AFFAIRS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                             <h3 className="text-xl font-black mb-6">Manual Question Entry</h3>
                             <form onSubmit={handleManualQuestionSubmit} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <input type="text" placeholder="Topic (e.g. Subject:GK or Topic:Maths)" value={manualQuestion.topic} onChange={e => setManualQuestion({...manualQuestion, topic: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                     <select value={manualQuestion.subject} onChange={e => setManualQuestion({...manualQuestion, subject: e.target.value as any})} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                         {SUBJECT_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                 </div>
                                 <textarea placeholder="The Question Text" value={manualQuestion.question} onChange={e => setManualQuestion({...manualQuestion, question: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-24" />
                                 <div className="grid grid-cols-2 gap-4">
                                     {manualQuestion.options?.map((opt, i) => (
                                         <input key={i} type="text" placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e => {
                                             const newOpts = [...(manualQuestion.options || [])];
                                             newOpts[i] = e.target.value;
                                             setManualQuestion({...manualQuestion, options: newOpts});
                                         }} className="p-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                     ))}
                                 </div>
                                 <div className="flex items-center space-x-4">
                                     <span className="font-bold">Correct Index:</span>
                                     {[0,1,2,3].map(i => (
                                         <button key={i} type="button" onClick={() => setManualQuestion({...manualQuestion, correctAnswerIndex: i})} className={`w-10 h-10 rounded-full font-bold ${manualQuestion.correctAnswerIndex === i ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>{i}</button>
                                     ))}
                                 </div>
                                 <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl">ADD TO QUESTION BANK</button>
                             </form>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                             <h3 className="text-xl font-black mb-4">Bulk Question Import (CSV)</h3>
                             <p className="text-sm text-slate-500 mb-4">Format: id,topic,question,JSON_options,correctIndex,subject,difficulty</p>
                             <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs mb-4" placeholder={`q1,Subject:GK,Question Text,"[""A"",""B"",""C"",""D""]",0,GK,PSC Level`} />
                             <button onClick={() => handleCsvSync('QuestionBank')} className="w-full bg-slate-900 text-white font-black px-6 py-3 rounded-xl">SYNC QUESTION BANK</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
