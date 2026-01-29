
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { triggerDailyScraper, triggerBookScraper, fixAllAffiliates, syncCsvData, getBooks, deleteBook, updateBook, addQuestion } from '../../services/pscDataService';
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
    
    // Manual Question State
    const [manualQuestion, setManualQuestion] = useState<Partial<QuizQuestion>>({
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        subject: 'GK',
        topic: '',
        difficulty: 'PSC Level'
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
        if (activeTabId === 'bookstore' || activeTab === 'bookstore') {
            fetchCurrentBooks();
        }
    }, [activeTabId, activeTab, fetchCurrentBooks]);

    const handleTabChange = (id: AdminTab) => {
        setActiveTab(id);
        setStatus({ loading: false, result: null });
        setCsvData('');
        window.location.hash = `admin_panel/${id}`;
    };

    const handleRunScraper = async (type: 'daily' | 'books') => {
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const action = type === 'daily' ? triggerDailyScraper : triggerBookScraper;
            const res = await action(token);
            setStatus({ 
                loading: false, 
                result: { type: 'success', message: res.message || 'Task started successfully!' }
            });
            if (type === 'books') setTimeout(fetchCurrentBooks, 5000);
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    // Added handleFixAffiliates function to resolve the "Cannot find name 'handleFixAffiliates'" error.
    const handleFixAffiliates = async () => {
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const res = await fixAllAffiliates(token);
            setStatus({ 
                loading: false, 
                result: { type: 'success', message: res.message || 'Affiliate links updated successfully!' }
            });
            fetchCurrentBooks();
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
            setStatus({ loading: false, result: { type: 'success', message: 'Question added to the bank successfully!' }});
            // Reset question form
            setManualQuestion({
                question: '',
                options: ['', '', '', ''],
                correctAnswerIndex: 0,
                subject: 'GK',
                topic: '',
                difficulty: 'PSC Level'
            });
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
            const bookId = quickBook.id || `book_${Date.now()}`;
            
            await updateBook({
                id: bookId,
                title: quickBook.title,
                author: quickBook.author,
                imageUrl: quickBook.imageUrl,
                amazonLink: quickBook.link
            }, token);
            
            setStatus({ loading: false, result: { type: 'success', message: quickBook.id ? 'Book updated!' : 'Book added!' }});
            setQuickBook({ id: '', title: '', author: '', link: '', imageUrl: '' });
            fetchCurrentBooks();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleDeleteBook = async (id: string) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await deleteBook(id, token);
            setStatus({ loading: false, result: { type: 'success', message: 'Book deleted successfully!' }});
            fetchCurrentBooks();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleEditClick = (book: Book) => {
        setQuickBook({
            id: book.id,
            title: book.title,
            author: book.author,
            link: book.amazonLink,
            imageUrl: book.imageUrl
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCsvSync = async (sheet: string) => {
        if (!csvData.trim()) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await syncCsvData(sheet, csvData, token, isAppendMode);
            setStatus({ loading: false, result: { type: 'success', message: `Successfully updated ${sheet}!` }});
            setCsvData('');
            if (sheet === 'Bookstore') fetchCurrentBooks();
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const renderTabButton = (id: AdminTab, label: string, icon: React.ReactNode) => (
        <button
            onClick={() => handleTabChange(id)}
            className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black transition-all ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-y-1' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
        >
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
                        <p className="text-indigo-300 font-bold opacity-80 uppercase tracking-widest text-[10px] mt-1">Data & Content Management System</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-wrap gap-4 mb-8">
                {renderTabButton('dashboard', 'Automation', <RssIcon className="h-5 w-5" />)}
                {renderTabButton('bookstore', 'Bookstore Manager', <BookOpenIcon className="h-5 w-5" />)}
                {renderTabButton('news_gk', 'News & GK', <MegaphoneIcon className="h-5 w-5" />)}
                {renderTabButton('questions', 'Question Bank', <AcademicCapIcon className="h-5 w-5" />)}
            </div>

            {status.result && (
                <div className={`p-6 rounded-3xl flex items-start space-x-4 animate-fade-in border-2 ${
                    status.result.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {status.result.type === 'success' ? <CheckCircleIcon className="h-6 w-6 mt-1 flex-shrink-0" /> : <XCircleIcon className="h-6 w-6 mt-1 flex-shrink-0" />}
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
                            <div className="bg-indigo-50 p-6 rounded-full mb-6 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-500">
                                <RssIcon className="h-12 w-12 text-indigo-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Daily Data Sync</h3>
                            <p className="text-slate-500 font-medium mb-8">Triggers scrapers for Notifications, Live Updates, and Current Affairs.</p>
                            <button onClick={() => handleRunScraper('daily')} disabled={status.loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50">
                                RUN DAILY SCRAPER
                            </button>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:border-orange-500 transition-all">
                            <div className="bg-orange-50 p-6 rounded-full mb-6 group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-500">
                                <BookOpenIcon className="h-12 w-12 text-orange-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Amazon Book Scraper</h3>
                            <p className="text-slate-500 font-medium mb-8">Searches Amazon for latest Kerala PSC rank files and updates the bookstore.</p>
                            <button onClick={() => handleRunScraper('books')} disabled={status.loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl disabled:opacity-50">
                                SYNC AMAZON BOOKS
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4">
                                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="p-3 bg-orange-100 rounded-xl">
                                            <PlusIcon className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800">{quickBook.id ? 'Edit Book' : 'Add New Book'}</h3>
                                    </div>
                                    <form onSubmit={handleQuickAddBook} className="space-y-5">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Title</label>
                                            <input type="text" value={quickBook.title} onChange={e => setQuickBook({...quickBook, title: e.target.value})} placeholder="LDC Rank File 2025" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-orange-500/10 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Author</label>
                                            <input type="text" value={quickBook.author} onChange={e => setQuickBook({...quickBook, author: e.target.value})} placeholder="Lakshya Publications" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-orange-500/10 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Image URL (Optional)</label>
                                            <input type="text" value={quickBook.imageUrl} onChange={e => setQuickBook({...quickBook, imageUrl: e.target.value})} placeholder="Paste image URL or leave empty" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-orange-500/10 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Amazon Link</label>
                                            <input type="url" value={quickBook.link} onChange={e => setQuickBook({...quickBook, link: e.target.value})} placeholder="Paste amazon.in URL" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-orange-500/10 outline-none" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" disabled={status.loading || !quickBook.title} className="flex-grow bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition shadow-xl shadow-orange-100 disabled:opacity-50">
                                                {quickBook.id ? 'UPDATE BOOK' : 'ADD BOOK TO STORE'}
                                            </button>
                                            {quickBook.id && (
                                                <button type="button" onClick={() => setQuickBook({id:'',title:'',author:'',link:'',imageUrl:''})} className="bg-slate-200 text-slate-600 px-6 rounded-2xl font-black">
                                                    CANCEL
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="lg:col-span-8">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-slate-800">Bulk Bookstore Sync</h3>
                                        <div className="bg-slate-100 p-1.5 rounded-2xl flex border border-slate-200">
                                            <button onClick={() => setIsAppendMode(true)} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${isAppendMode ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>APPEND</button>
                                            <button onClick={() => setIsAppendMode(false)} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${!isAppendMode ? 'bg-red-600 text-white' : 'text-slate-500'}`}>REPLACE</button>
                                        </div>
                                    </div>
                                    <textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder="ID, Title, Author, ImageUrl, AmazonLink" className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none shadow-inner mb-6" />
                                    <button onClick={() => handleCsvSync('Bookstore')} disabled={status.loading || !csvData.trim()} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50">
                                        UPLOAD BOOK LIST
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Existing Books Editable Table */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h3 className="text-3xl font-black text-slate-800">Manage Existing Books</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button 
                                        onClick={handleFixAffiliates}
                                        disabled={status.loading}
                                        className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 font-black px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition shadow-sm disabled:opacity-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        <span>FIX AFFILIATE LINKS</span>
                                    </button>
                                    <button onClick={fetchCurrentBooks} className="bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition">Refresh List</button>
                                </div>
                            </div>

                            {loadingBooks ? (
                                <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading bookstore data...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Details</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {existingBooks.map(book => {
                                                const hasRealImage = book.imageUrl && book.imageUrl.startsWith('http');
                                                return (
                                                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-4">
                                                                <div className={`h-14 w-11 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-slate-200`}>
                                                                    <BookCover 
                                                                        title={book.title} 
                                                                        author={book.author} 
                                                                        imageUrl={book.imageUrl} 
                                                                        className="w-full h-full" 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 leading-tight line-clamp-1">{book.title}</p>
                                                                    <p className="text-[10px] font-mono text-slate-400 mt-1">{book.id}</p>
                                                                    {!hasRealImage && <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">Using Dynamic Cover</span>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-medium text-slate-600">{book.author}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button 
                                                                    onClick={() => handleEditClick(book)}
                                                                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                    title="Edit"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteBook(book.id)}
                                                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                    title="Delete"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {existingBooks.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                                        No books found. Sync from Amazon or add manually.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'news_gk' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Notifications Sync</h3>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder="ID, Title, Cat No, Last Date, URL" className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm mb-6" />
                            <button onClick={() => handleCsvSync('Notifications')} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl">SYNC NOTIFICATIONS</button>
                         </div>
                         <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Current Affairs Sync</h3>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder="ID, Title, Source, Date" className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm mb-6" />
                            <button onClick={() => handleCsvSync('CurrentAffairs')} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl">SYNC AFFAIRS</button>
                         </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-8">
                        {/* Manual Form */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <PlusIcon className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Manual Question Entry</h3>
                            </div>
                            <form onSubmit={handleManualQuestionSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subject</label>
                                        <select 
                                            value={manualQuestion.subject} 
                                            onChange={e => setManualQuestion({...manualQuestion, subject: e.target.value as any})}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                        >
                                            {SUBJECT_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Topic (Ex: Kerala Renaissance, Mental Ability)</label>
                                        <input 
                                            type="text" 
                                            value={manualQuestion.topic} 
                                            onChange={e => setManualQuestion({...manualQuestion, topic: e.target.value})}
                                            placeholder="Specific Exam or Topic name" 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Question</label>
                                    <textarea 
                                        value={manualQuestion.question} 
                                        onChange={e => setManualQuestion({...manualQuestion, question: e.target.value})}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none h-24" 
                                        placeholder="Enter the question here..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {manualQuestion.options?.map((opt, idx) => (
                                        <div key={idx} className="flex items-center space-x-3">
                                            <input 
                                                type="radio" 
                                                name="correctIdx" 
                                                checked={manualQuestion.correctAnswerIndex === idx}
                                                onChange={() => setManualQuestion({...manualQuestion, correctAnswerIndex: idx})}
                                                className="w-5 h-5 text-indigo-600"
                                            />
                                            <input 
                                                type="text" 
                                                value={opt} 
                                                onChange={e => {
                                                    const newOpts = [...(manualQuestion.options || [])];
                                                    newOpts[idx] = e.target.value;
                                                    setManualQuestion({...manualQuestion, options: newOpts});
                                                }}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`} 
                                                className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Difficulty</label>
                                    <select 
                                        value={manualQuestion.difficulty} 
                                        onChange={e => setManualQuestion({...manualQuestion, difficulty: e.target.value as any})}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                    >
                                        {DIFFICULTY_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
                                    ADD QUESTION TO BANK
                                </button>
                            </form>
                        </div>

                        {/* Bulk Sync */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-3xl font-black text-slate-800">Bulk Sync (CSV)</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 font-bold uppercase tracking-widest">Format: ID, Topic, Question, ["Opt1","Opt2","Opt3","Opt4"], CorrectIdx, Subject, Difficulty</p>
                            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder="ID, Topic, Question, ['Opt1','Opt2','Opt3','Opt4'], CorrectIdx, Subject, Difficulty" className="w-full h-80 p-8 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm mb-8" />
                            <button onClick={() => handleCsvSync('QuestionBank')} disabled={status.loading || !csvData.trim()} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center space-x-3">
                                <ClipboardListIcon className="h-6 w-6" />
                                <span>APPEND CSV TO QUESTION BANK</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
