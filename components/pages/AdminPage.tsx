
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
    const [syllabusList, setSyllabusList] = useState<PracticeTest[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
    const isUpdatingSetting = useRef(false);
    
    // Single Question Form State
    const [qForm, setQForm] = useState({
        topic: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        subject: '',
        difficulty: 'Moderate'
    });

    const refresh = useCallback(async (isSilent = false) => {
        if (isUpdatingSetting.current) return;
        
        try {
            if (!isSilent) setLoading(true);
            const [e, b, settings] = await Promise.all([getExams(), getBooks(), getSettings(true)]);
            setExams(e);
            setBooks(b);
            if (settings && settings.subscription_model_active !== undefined) {
                setIsSubscriptionActive(settings.subscription_model_active === 'true');
            }
            
            const allSyllabus: PracticeTest[] = [];
            for (const ex of e.slice(0, 5)) { // Limit initial syllabus load for quota safety
                const s = await getExamSyllabus(ex.id);
                allSyllabus.push(...s);
            }
            setSyllabusList(allSyllabus);
        } catch (err) { 
            console.error(err); 
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const handleAction = async (fn: () => Promise<any>, shouldRefresh: boolean = true) => {
        setStatus("Processing Task... Please wait.");
        setIsError(false);
        setLoading(true);
        
        try { 
            const res = await fn(); 
            setStatus(res.message || "Action completed!"); 
            if (res.result?.errors?.length > 0) {
                setStatus(prev => prev + " (Note: " + res.result.errors.join(', ') + ")");
            }
            if (shouldRefresh) {
                // Short delay before refresh to allow Sheets consistency
                setTimeout(() => refresh(true), 1500); 
            }
        } catch(e:any) { 
            setStatus(e.message || "Action failed."); 
            setIsError(true);
        } 
        finally { 
            setLoading(false); 
        }
    };

    const toggleSubscriptionModel = async () => {
        const newVal = !isSubscriptionActive;
        const token = await getToken();
        
        setIsSubscriptionActive(newVal); // Optimistic UI update
        isUpdatingSetting.current = true;
        
        try {
            await updateSetting('subscription_model_active', String(newVal), token);
            setStatus(`Subscription Model ${newVal ? 'Enabled' : 'Disabled'}`);
        } catch (e: any) {
            setIsSubscriptionActive(!newVal); // Revert on actual error
            setStatus("Failed to update setting: " + e.message);
            setIsError(true);
        } finally {
            isUpdatingSetting.current = false;
        }
    };

    const handleClearStudyCache = async () => {
        if (!confirm("Are you sure? This will delete all cached AI study materials.")) return;
        const token = await getToken();
        handleAction(() => clearStudyCache(token));
    };

    const handleAddSingleQuestion = async () => {
        if (!qForm.question || !qForm.topic || qForm.options.some(o => !o)) {
            alert("Please fill all fields for the question.");
            return;
        }
        const token = await getToken();
        handleAction(() => addQuestion(qForm, token));
        setQForm({
            topic: '',
            question: '',
            options: ['', '', '', ''],
            correctAnswerIndex: 0,
            subject: '',
            difficulty: 'Moderate'
        });
    };

    const handleDeleteBook = async (id: string) => {
        if (!confirm("Delete this book?")) return;
        const token = await getToken();
        handleAction(() => deleteBook(id, token));
    };

    const handleRestoreDefaults = async () => {
        if (!confirm("Restore Exams and Syllabus defaults?")) return;
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
                    <button onClick={handleRestoreDefaults} disabled={loading} className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-amber-600 transition disabled:opacity-50">RESTORE DEFAULTS</button>
                    <button onClick={() => handleAction(async () => {
                        const t = await getToken();
                        return testConnection(t);
                    })} disabled={loading} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-emerald-100 transition disabled:opacity-50">TEST CONNECTION</button>
                </div>
            </div>

            <header className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-6 border-b-4 border-indigo-500">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <h1 className="text-3xl font-black">Admin Control Center</h1>
                </div>
                {loading && <div className="flex items-center space-x-2 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-black uppercase tracking-widest">Processing...</span>
                </div>}
            </header>

            {status && (
                <div className={`p-6 rounded-[2rem] border shadow-lg ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-2xl ${isError ? 'bg-red-100' : 'bg-indigo-100'}`}>
                            {isError ? <ShieldCheckIcon className="h-6 w-6 text-red-600" /> : <PlusIcon className="h-6 w-6 text-indigo-600" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black uppercase tracking-widest text-[10px] mb-1">{isError ? 'System Notice' : 'Processing Status'}</h4>
                            <p className="font-bold text-sm">{status}</p>
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
                {tabBtn('subscriptions', 'Subscriptions', StarIcon)}
            </div>

            <main className="min-h-[400px]">
                {activeTab === 'automation' && (
                    <div className="space-y-8">
                        {/* Master Subscription Switch */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-2 border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className={`p-5 rounded-2xl ${isSubscriptionActive ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                                    <StarIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Subscription Model</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status: {isSubscriptionActive ? 'Active (Pay to Unlock)' : 'Disabled (All Free)'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleSubscriptionModel} 
                                disabled={loading}
                                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isSubscriptionActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${isSubscriptionActive ? 'translate-x-11' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between group hover:border-indigo-400 transition-all">
                                <div>
                                    <RssIcon className="h-12 w-12 text-indigo-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">Daily Scraper</h3>
                                    <p className="text-slate-500 mb-8 text-sm leading-relaxed">Updates news, current affairs, and generates 15 new questions.</p>
                                </div>
                                <button onClick={async () => {
                                    const t = await getToken();
                                    handleAction(() => triggerDailyScraper(t));
                                }} disabled={loading} className="w-full btn-vibrant-indigo text-white py-5 rounded-2xl font-black transition disabled:opacity-50 active:scale-95 shadow-lg">RUN DAILY SCRAPER</button>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between group hover:border-orange-400 transition-all">
                                <div>
                                    <ArrowPathIcon className="h-12 w-12 text-orange-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">Book Store Sync</h3>
                                    <p className="text-slate-500 mb-8 text-sm leading-relaxed">Synchronizes bookstore with latest Amazon titles using AI search.</p>
                                </div>
                                <button onClick={async () => {
                                    const t = await getToken();
                                    handleAction(() => triggerBookScraper(t));
                                }} disabled={loading} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black transition disabled:opacity-50 active:scale-95 shadow-lg">SYNC BOOKS</button>
                            </div>
                            {/* Hard Refresh / Cache Clear Button */}
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-center border dark:border-slate-800 flex flex-col justify-between group hover:border-red-400 transition-all">
                                <div>
                                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl w-fit mx-auto mb-6">
                                        <ArrowPathIcon className="h-12 w-12 text-red-600" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">Hard Refresh</h3>
                                    <p className="text-slate-500 mb-8 text-sm leading-relaxed">Wipes the entire AI Study Materials cache. Forces Gemini to re-generate content.</p>
                                </div>
                                <button onClick={handleClearStudyCache} disabled={loading} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black transition disabled:opacity-50 active:scale-95 shadow-lg uppercase tracking-widest">Clear AI Cache</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-8">
                        {/* Single Question Input Form */}
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800">
                             <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-6">Add Single Question</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                 <div>
                                     <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Topic</label>
                                     <input type="text" value={qForm.topic} onChange={e => setQForm({...qForm, topic: e.target.value})} className="w-full p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Kerala History" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                                     <input type="text" value={qForm.subject} onChange={e => setQForm({...qForm, subject: e.target.value})} className="w-full p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. GK" />
                                 </div>
                                 <div className="md:col-span-2">
                                     <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Question Text</label>
                                     <input type="text" value={qForm.question} onChange={e => setQForm({...qForm, question: e.target.value})} className="w-full p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter question in Malayalam or English" />
                                 </div>
                                 {qForm.options.map((opt, idx) => (
                                     <div key={idx}>
                                         <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Option {idx + 1} {qForm.correctAnswerIndex === idx && <span className="text-green-500">(Correct)</span>}</label>
                                         <div className="flex space-x-2">
                                             <input type="text" value={opt} onChange={e => {
                                                 const newOpts = [...qForm.options];
                                                 newOpts[idx] = e.target.value;
                                                 setQForm({...qForm, options: newOpts});
                                             }} className="flex-1 p-4 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" placeholder={`Option ${idx + 1}`} />
                                             <button onClick={() => setQForm({...qForm, correctAnswerIndex: idx})} className={`px-4 rounded-xl border-2 font-black transition-all ${qForm.correctAnswerIndex === idx ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-slate-400 hover:border-green-200'}`}>✓</button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             <button onClick={handleAddSingleQuestion} disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black hover:bg-indigo-700 shadow-lg transition-all active:scale-95 disabled:opacity-50">ADD TO DATABASE</button>
                        </div>

                        {/* Bulk Import */}
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-xl border dark:border-slate-800">
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-6">Bulk CSV Import</h3>
                            <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Topic, Question, Opt1|Opt2|Opt3|Opt4, CorrectIdx, Subject, Difficulty" className="w-full h-80 p-6 border dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800 font-mono text-xs dark:text-white mb-6 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <div className="flex gap-4">
                                <button onClick={async () => {
                                    const t = await getToken();
                                    handleAction(()=>syncCsvData('QuestionBank', bulkData, t, true));
                                }} disabled={loading || !bulkData} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-700 transition disabled:opacity-50">APPEND DATA</button>
                                <button onClick={async () => {
                                    if(!confirm("Overwrite entire QuestionBank?")) return;
                                    const t = await getToken();
                                    handleAction(()=>syncCsvData('QuestionBank', bulkData, t, false));
                                }} disabled={loading || !bulkData} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-2xl font-black hover:bg-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50">OVERWRITE DATABASE</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-800">
                        <div className="flex items-center space-x-4 mb-8">
                             <div className="bg-amber-100 p-4 rounded-2xl">
                                 <StarIcon className="h-8 w-8 text-amber-600" />
                             </div>
                             <div>
                                 <h3 className="text-2xl font-black text-slate-800 dark:text-white">Active Subscriptions</h3>
                                 <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Revenue and User Management</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Current User Plan</p>
                                <p className="text-2xl font-black text-indigo-600">{subscriptionService.getSubscriptionStatus(currentUser?.id || '') === 'pro' ? 'PRO PLAN 👑' : 'FREE PLAN'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Pricing Model</p>
                                <p className="text-2xl font-black text-slate-700 dark:text-slate-200">Active - ₹499/yr</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">System Status</p>
                                <p className="text-2xl font-black text-emerald-600">Operational</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Subscriber</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-800">
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4 font-bold dark:text-white">{currentUser?.fullName || 'Current Admin'}</td>
                                        <td className="p-4 text-xs font-mono">{currentUser?.primaryEmailAddress?.emailAddress}</td>
                                        <td className="p-4">
                                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black">
                                                {subscriptionService.getSubscriptionStatus(currentUser?.id || '') === 'pro' ? 'PRO' : 'FREE'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-indigo-600 font-black text-[10px] uppercase hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-8 text-xs text-slate-400 font-medium italic">Note: Live subscriber data is currently synchronized with Clerk Public Metadata.</p>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-800 overflow-hidden">
                         <h3 className="text-xl font-black dark:text-white uppercase mb-6">Manage Exams</h3>
                         <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                 <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                     <tr>
                                         <th className="p-4">ID</th>
                                         <th className="p-4">Title (ML)</th>
                                         <th className="p-4">Category</th>
                                         <th className="p-4">Level</th>
                                         <th className="p-4">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y dark:divide-slate-800">
                                     {exams.map(e => (
                                         <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                             <td className="p-4 font-mono text-xs">{e.id}</td>
                                             <td className="p-4 font-bold dark:text-white">{e.title.ml}</td>
                                             <td className="p-4"><span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">{e.category}</span></td>
                                             <td className="p-4 text-xs font-bold text-slate-500">{e.level}</td>
                                             <td className="p-4">
                                                 <button onClick={async () => {
                                                     if (!confirm("Delete this exam?")) return;
                                                     const t = await getToken();
                                                     handleAction(() => deleteExam(e.id, t));
                                                 }} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="h-5 w-5" /></button>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-800 overflow-hidden">
                         <h3 className="text-xl font-black dark:text-white uppercase mb-6">Exam Syllabus Items</h3>
                         <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                 <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                     <tr>
                                         <th className="p-4">Exam ID</th>
                                         <th className="p-4">Title</th>
                                         <th className="p-4">Subject</th>
                                         <th className="p-4">Qs</th>
                                         <th className="p-4">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y dark:divide-slate-800">
                                     {syllabusList.map((s, idx) => (
                                         <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                             <td className="p-4 font-mono text-xs text-indigo-600">{s.id}</td>
                                             <td className="p-4 font-bold dark:text-white">{s.title}</td>
                                             <td className="p-4 font-medium text-slate-500 text-xs">{s.subject}</td>
                                             <td className="p-4 font-black text-xs">{s.questions}</td>
                                             <td className="p-4">
                                                 <button className="text-slate-300 cursor-not-allowed p-2"><TrashIcon className="h-5 w-5" /></button>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-800 overflow-hidden">
                         <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
                             <div>
                                 <h3 className="text-xl font-black dark:text-white uppercase mb-1">Manage Bookstore</h3>
                                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Add Affiliate tags to all Amazon links in the database.</p>
                             </div>
                             <button 
                                onClick={async () => {
                                    const t = await getToken();
                                    handleAction(() => applyAffiliateTags(t));
                                }}
                                disabled={loading}
                                className="bg-amber-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest flex items-center space-x-2"
                             >
                                 <ArrowPathIcon className="h-4 w-4" />
                                 <span>Sync Affiliate Links</span>
                             </button>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                             {books.map(b => (
                                 <div key={b.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between group">
                                     <div className="flex items-start justify-between mb-4">
                                         <div className="flex-1">
                                             <h4 className="font-black text-slate-800 dark:text-white leading-tight mb-1">{b.title}</h4>
                                             <p className="text-[10px] font-bold text-slate-400">{b.author}</p>
                                         </div>
                                         <button onClick={() => handleDeleteBook(b.id)} className="text-red-400 hover:text-red-600 p-2"><TrashIcon className="h-5 w-5" /></button>
                                     </div>
                                     <div className="mt-auto flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400 border-t dark:border-slate-700 pt-4">
                                         <span className="truncate max-w-[150px]">ID: {b.id}</span>
                                         <a href={b.amazonLink} target="_blank" className="text-indigo-500 hover:underline font-black">Open Link</a>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
