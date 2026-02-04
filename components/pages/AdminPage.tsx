
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
    getExamSyllabus
} from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { RssIcon } from '../icons/RssIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { PlusIcon } from '../icons/PlusIcon';
import type { Book, QuizQuestion, Exam, PracticeTest } from '../../types';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState('automation');
    const [exams, setExams] = useState<Exam[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    
    const [examForm, setExamForm] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', description_en: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [sylForm, setSylForm] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, topic: '' });
    const [qForm, setQForm] = useState<Partial<QuizQuestion>>({ question: '', options: ['', '', '', ''], correctAnswerIndex: 0, subject: 'GK', topic: '' });

    const refresh = useCallback(async () => {
        const [e, b] = await Promise.all([getExams(), getBooks()]);
        setExams(e);
        setBooks(b);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const handleAction = async (fn: () => Promise<any>, msg: string) => {
        setStatus("Processing...");
        try { await fn(); setStatus(msg); refresh(); } catch(e:any) { setStatus("Error: " + e.message); }
        setTimeout(() => setStatus(null), 3000);
    };

    const runScraper = async (type: 'daily' | 'books') => {
        const token = await getToken();
        handleAction(() => type === 'daily' ? triggerDailyScraper(token) : triggerBookScraper(token), "Scraper finished!");
    };

    const delExam = async (id: string) => {
        if(!confirm("Delete exam?")) return;
        const token = await getToken();
        handleAction(() => deleteExam(id, token), "Exam deleted!");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline mb-4"><ChevronLeftIcon className="h-5 w-5" /><span>Back to Dashboard</span></button>
            <header className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-4">
                <div className="flex items-center space-x-4"><ShieldCheckIcon className="h-10 w-10 text-indigo-400" /><h1 className="text-3xl font-black">Admin Panel</h1></div>
                {status && <div className="bg-indigo-500/20 px-6 py-2 rounded-xl font-bold animate-pulse">{status}</div>}
            </header>

            <div className="flex flex-wrap gap-2">
                {['automation', 'exams', 'syllabus', 'questions', 'bookstore'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border'}`}>{t}</button>
                ))}
            </div>

            <main className="min-h-[400px]">
                {activeTab === 'automation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border">
                            <RssIcon className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
                            <h3 className="text-xl font-black mb-4">Daily Scrapers</h3>
                            <button onClick={() => runScraper('daily')} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black">RUN NOW</button>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border">
                            <BookOpenIcon className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                            <h3 className="text-xl font-black mb-4">Amazon Bookstore</h3>
                            <button onClick={() => runScraper('books')} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black">REFRESH BOOKS</button>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg border">
                            <h3 className="font-black mb-4">Add Exam</h3>
                            <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateExam(examForm, t), "Saved!"); }} className="space-y-3">
                                <input type="text" placeholder="ID" value={examForm.id} onChange={e=>setExamForm({...examForm, id:e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                                <input type="text" placeholder="Title ML" value={examForm.title_ml} onChange={e=>setExamForm({...examForm, title_ml:e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black">SAVE</button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border">
                            <h3 className="font-black mb-4">Current Exams</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {exams.map(ex => (
                                    <div key={ex.id} className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50">
                                        <span className="font-bold text-sm">{ex.title.ml}</span>
                                        <button onClick={() => delExam(ex.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="bg-white p-8 rounded-3xl shadow-lg border max-w-2xl mx-auto">
                         <h3 className="font-black mb-6">Manage Syllabus</h3>
                         <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>updateSyllabus(sylForm, t), "Syllabus updated!"); }} className="space-y-4">
                             <select value={sylForm.exam_id} onChange={e=>setSylForm({...sylForm, exam_id:e.target.value})} className="w-full p-4 border rounded-xl bg-slate-50">
                                 <option value="">Select Exam</option>
                                 {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title.ml}</option>)}
                             </select>
                             <input type="text" placeholder="Topic ID" value={sylForm.id} onChange={e=>setSylForm({...sylForm, id:e.target.value})} className="w-full p-4 border rounded-xl" />
                             <input type="text" placeholder="Title" value={sylForm.title} onChange={e=>setSylForm({...sylForm, title:e.target.value})} className="w-full p-4 border rounded-xl" />
                             <input type="text" placeholder="Filter Key (e.g. Topic:History)" value={sylForm.topic} onChange={e=>setSylForm({...sylForm, topic:e.target.value})} className="w-full p-4 border rounded-xl" />
                             <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-xl font-black">ADD TOPIC</button>
                         </form>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="bg-white p-8 rounded-3xl shadow-lg border max-w-2xl mx-auto">
                        <h3 className="font-black mb-6">Question Entry</h3>
                        <form onSubmit={async (e) => { e.preventDefault(); const t = await getToken(); handleAction(()=>addQuestion(qForm, t), "Question added!"); setQForm({question:'', options:['','','',''], correctAnswerIndex:0, subject:'GK', topic:''}); }} className="space-y-4">
                            <textarea placeholder="Question" value={qForm.question} onChange={e=>setQForm({...qForm, question:e.target.value})} className="w-full p-4 border rounded-xl" />
                            {qForm.options?.map((o,i) => (
                                <input key={i} type="text" placeholder={`Option ${i+1}`} value={o} onChange={e=>{const o2=[...(qForm.options||[])]; o2[i]=e.target.value; setQForm({...qForm, options:o2})}} className="w-full p-3 border rounded-xl" />
                            ))}
                            <input type="text" placeholder="Topic" value={qForm.topic} onChange={e=>setQForm({...qForm, topic:e.target.value})} className="w-full p-4 border rounded-xl" />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">ADD TO BANK</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
