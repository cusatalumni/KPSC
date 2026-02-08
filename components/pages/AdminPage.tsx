
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { 
    triggerDailyScraper, 
    triggerBookScraper, 
    getBooks, 
    deleteBook, 
    getExams,
    updateExam,
    updateSyllabus,
    deleteExam,
    syncCsvData,
    testConnection,
    exportStaticExamsToSheet,
    addQuestion,
    getExamSyllabus,
    getSettings,
    updateSetting,
    applyAffiliateTags,
    clearStudyCache
} from '../../services/pscDataService';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { StarIcon } from '../icons/StarIcon';
import { EXAMS_DATA, EXAM_CONTENT_MAP } from '../../constants';
import type { Book, Exam, PracticeTest } from '../../types';
import { subscriptionService } from '../../services/subscriptionService';
import { useTranslation } from '../../contexts/LanguageContext';

type AdminTab = 'automation' | 'exams' | 'syllabus' | 'questions' | 'bookstore' | 'subscriptions';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const { user: currentUser } = useUser();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<AdminTab>('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [syllabusBulkData, setSyllabusBulkData] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
    const isUpdating = useRef(false);

    const refresh = useCallback(async (isSilent = false) => {
        if (isUpdating.current) return;
        try {
            if (!isSilent) setLoading(true);
            const [e, b, settings] = await Promise.all([getExams(), getBooks(), getSettings(true)]);
            setExams(e);
            setBooks(b);
            if (settings && settings.subscription_model_active !== undefined) {
                setIsSubscriptionActive(settings.subscription_model_active === 'true');
            }
        } catch (err) { 
            console.error(err); 
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const handleAction = async (fn: () => Promise<any>, shouldRefresh: boolean = true) => {
        setStatus("Processing Task...");
        setIsError(false);
        setLoading(true);
        try { 
            const res = await fn(); 
            setStatus(res.message || "Action completed!"); 
            if (shouldRefresh) {
                setTimeout(() => refresh(true), 2000); 
            }
        } catch(e:any) { 
            setStatus(e.message || "Action failed."); 
            setIsError(true);
        } finally { 
            setLoading(false); 
        }
    };

    const toggleSubscriptionModel = async () => {
        const newVal = !isSubscriptionActive;
        const token = await getToken();
        setIsSubscriptionActive(newVal);
        isUpdating.current = true;
        try {
            await updateSetting('subscription_model_active', String(newVal), token);
            setStatus(`Subscription Model now ${newVal ? 'ENABLED' : 'DISABLED'}`);
        } catch (e: any) {
            setIsSubscriptionActive(!newVal);
            setStatus("Toggle Failed: " + e.message);
            setIsError(true);
        } finally {
            isUpdating.current = false;
        }
    };

    const handleClearStudyCache = async () => {
        if (!confirm("Are you sure?")) return;
        const token = await getToken();
        handleAction(() => clearStudyCache(token));
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
                <button onClick={() => handleAction(async () => testConnection(await getToken()))} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-xs">TEST CONNECTION</button>
            </div>

            <header className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <h1 className="text-3xl font-black">Admin Control Center</h1>
                </div>
            </header>

            {status && (
                <div className={`p-6 rounded-3xl border shadow-lg ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <p className="font-bold text-sm">{status}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                {tabBtn('automation', 'Automation', RssIcon)}
                {tabBtn('exams', 'Exams', AcademicCapIcon)}
                {tabBtn('syllabus', 'Syllabus', ClipboardListIcon)}
                {tabBtn('questions', 'Questions', PlusIcon)}
                {tabBtn('bookstore', 'Bookstore', BookOpenIcon)}
                {tabBtn('subscriptions', 'Subscriptions', StarIcon)}
            </div>

            <main className="min-h-[400px]">
                {activeTab === 'automation' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-2 border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className={`p-5 rounded-2xl ${isSubscriptionActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                                    <StarIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Subscription Model</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Currently: {isSubscriptionActive ? 'ENABLED' : 'DISABLED (Free Mode)'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleSubscriptionModel} 
                                disabled={loading}
                                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${isSubscriptionActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${isSubscriptionActive ? 'translate-x-11' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-center border group">
                                <RssIcon className="h-12 w-12 text-indigo-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black mb-4 dark:text-white uppercase">Daily Scraper</h3>
                                <button onClick={async () => handleAction(async () => triggerDailyScraper(await getToken()))} disabled={loading} className="w-full btn-vibrant-indigo text-white py-5 rounded-2xl font-black">RUN SCRAPER</button>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-center border group">
                                <ArrowPathIcon className="h-12 w-12 text-red-600 mx-auto mb-6" />
                                <h3 className="text-2xl font-black mb-4 dark:text-white uppercase">Hard Refresh</h3>
                                <button onClick={handleClearStudyCache} disabled={loading} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black">CLEAR AI CACHE</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800">
                        <div className="flex items-center space-x-3 mb-6">
                            <ClipboardListIcon className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Syllabus Bulk Import</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mb-4 bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                            Format: ID, ExamID, Title, Questions, Duration, Subject, Topic <br/>
                            Example: syl_ldc_rivers, ldc_lgs, Rivers of Kerala, 20, 20, Geography, Rivers
                        </p>
                        <textarea 
                            value={syllabusBulkData} 
                            onChange={e => setSyllabusBulkData(e.target.value)} 
                            placeholder="Enter Syllabus CSV data here..." 
                            className="w-full h-80 p-6 border dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800 font-mono text-xs mb-6 focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={async () => handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), true))} 
                                disabled={loading || !syllabusBulkData} 
                                className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
                            >
                                APPEND SYLLABUS
                            </button>
                            <button 
                                onClick={async () => { if(confirm("This will clear existing syllabus for the specified rows. Continue?")) handleAction(async () => syncCsvData('Syllabus', syllabusBulkData, await getToken(), false)) }} 
                                disabled={loading || !syllabusBulkData} 
                                className="flex-1 bg-slate-200 text-slate-600 py-5 rounded-2xl font-black active:scale-95 transition-all"
                            >
                                OVERWRITE
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800">
                        <div className="flex items-center space-x-3 mb-6">
                            <PlusIcon className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Question Bank Bulk Import</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mb-4 bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                            Format: ID, Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty
                        </p>
                        <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty" className="w-full h-80 p-6 border dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800 font-mono text-xs mb-6 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <div className="flex gap-4">
                            <button onClick={async () => handleAction(async () => syncCsvData('QuestionBank', bulkData, await getToken(), true))} disabled={loading || !bulkData} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black">APPEND DATA</button>
                            <button onClick={async () => {if(confirm("Overwrite all?")) handleAction(async () => syncCsvData('QuestionBank', bulkData, await getToken(), false))}} disabled={loading || !bulkData} className="flex-1 bg-slate-200 text-slate-600 py-5 rounded-2xl font-black">OVERWRITE</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
