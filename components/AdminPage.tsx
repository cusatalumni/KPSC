
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { getExams, updateExam, deleteExam, updateSyllabus, exportStaticExamsToSheet, testConnection } from '../../services/pscDataService';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { EXAMS_DATA, EXAM_CONTENT_MAP } from '../constants';

const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState('exams');
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [examForm, setExamForm] = useState({ id: '', title_ml: '', title_en: '', description_ml: '', description_en: '', category: 'General', level: 'Preliminary', icon_type: 'book' });
    const [sylForm, setSylForm] = useState({ id: '', exam_id: '', title: '', questions: 20, duration: 20, subject: '', topic: '' });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const data = await getExams();
            setExams(data);
        } catch(e) {
            console.error("Failed to fetch exams:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setLoading(true);
        setStatus("Testing Connection...");
        setErrorMsg(null);
        try {
            const t = await getToken();
            const res = await testConnection(t);
            setStatus(res.message);
        } catch (e: any) {
            setStatus(null);
            setErrorMsg(e.message);
        } finally {
            setLoading(false);
        }
    }

    const handleExport = async () => {
        if (!confirm("This will overwrite your sheet with default structure. Continue?")) return;
        setLoading(true);
        const token = await getToken();
        setStatus("Exporting data to Sheets...");
        setErrorMsg(null);
        try {
            const examsPayload = EXAMS_DATA.map(e => ({
                id: e.id,
                title_ml: e.title.ml,
                title_en: e.title.en,
                description_ml: e.description.ml,
                description_en: e.description.en,
                category: e.category,
                level: e.level,
                icon_type: 'book' 
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
                        subject: test.subject || '',
                        topic: test.topic || ''
                    });
                });
            });

            const res = await exportStaticExamsToSheet(token, examsPayload, syllabusPayload);
            setStatus(res.message);
            fetchExams();
        } catch (e: any) {
            setStatus(null);
            setErrorMsg(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        await updateExam(examForm, token);
        alert('Exam saved!');
        fetchExams();
    };

    const handleSylSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        await updateSyllabus(sylForm, token);
        alert('Syllabus saved!');
    };

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline mb-4">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <header className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <ShieldCheckIcon className="h-12 w-12 text-indigo-400" />
                    <h1 className="text-3xl font-black">Admin Manager</h1>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={handleTestConnection}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg disabled:opacity-50"
                    >
                        Test Connection
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Sync Database Structure'}
                    </button>
                </div>
            </header>

            {status && (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-bold flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span>{status}</span>
                </div>
            )}

            {errorMsg && (
                <div className="p-8 bg-red-50 border-2 border-red-200 text-red-800 rounded-3xl space-y-4">
                    <div className="flex items-center space-x-3 font-black text-xl text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span>Error Detail</span>
                    </div>
                    <p className="font-mono text-sm bg-white/50 p-4 rounded-xl border border-red-100">{errorMsg}</p>
                </div>
            )}

            <div className="flex space-x-4">
                <button onClick={() => setActiveTab('exams')} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-50'}`}>Manage Exams</button>
                <button onClick={() => setActiveTab('syllabus')} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'syllabus' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-50'}`}>Manage Syllabus</button>
            </div>

            {activeTab === 'exams' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                        <h3 className="text-xl font-black mb-6">Add / Edit Exam</h3>
                        <form onSubmit={handleExamSubmit} className="space-y-4">
                            <input type="text" placeholder="Exam ID" value={examForm.id} onChange={e => setExamForm({...examForm, id: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" required />
                            <input type="text" placeholder="Title (Malayalam)" value={examForm.title_ml} onChange={e => setExamForm({...examForm, title_ml: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" required />
                            <input type="text" placeholder="Title (English)" value={examForm.title_en} onChange={e => setExamForm({...examForm, title_en: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" />
                            <textarea placeholder="Description" value={examForm.description_ml} onChange={e => setExamForm({...examForm, description_ml: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" />
                            <select value={examForm.category} onChange={e => setExamForm({...examForm, category: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl">
                                <option value="General">General</option>
                                <option value="Technical">Technical</option>
                                <option value="Special">Special</option>
                            </select>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg">SAVE EXAM</button>
                        </form>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                        <h3 className="text-xl font-black mb-6">Current Exam List</h3>
                        <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {exams.length > 0 ? exams.map(e => (
                                <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition">
                                    <div>
                                        <p className="font-bold text-slate-800">{e.title.ml}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{e.id}</p>
                                    </div>
                                    <button onClick={() => setExamForm({...e, title_ml: e.title.ml, title_en: e.title.en, description_ml: e.description.ml, description_en: e.description.en})} className="text-indigo-600 font-bold hover:underline">Edit</button>
                                </div>
                            )) : <p className="text-slate-400 p-10 text-center">No exams found.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'syllabus' && (
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-black mb-2 text-slate-800">Syllabus Topic Manager</h3>
                    <p className="text-slate-500 mb-8 text-sm">ഇവിടെ നൽകുന്ന Subject, Topic എന്നിവ ക്വസ്റ്റ്യൻ ബാങ്കിലെ കോളങ്ങളുമായി കൃത്യമായി ഒത്തുപോകണം.</p>
                    <form onSubmit={handleSylSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">Select Exam</label>
                            <select value={sylForm.exam_id} onChange={e => setSylForm({...sylForm, exam_id: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" required>
                                <option value="">Select Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title.ml}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Topic ID</label>
                                <input type="text" placeholder="e.g. ldc_gk_1" value={sylForm.id} onChange={e => setSylForm({...sylForm, id: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Display Title</label>
                                <input type="text" placeholder="e.g. History" value={sylForm.title} onChange={e => setSylForm({...sylForm, title: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Questions</label>
                                <input type="number" value={sylForm.questions} onChange={e => setSylForm({...sylForm, questions: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Duration (Mins)</label>
                                <input type="number" value={sylForm.duration} onChange={e => setSylForm({...sylForm, duration: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Subject Filter (ക്വസ്റ്റ്യൻ ബാങ്ക് കോളം F)</label>
                                <input type="text" placeholder="e.g. GK" value={sylForm.subject} onChange={e => setSylForm({...sylForm, subject: e.target.value})} className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Topic Filter (ക്വസ്റ്റ്യൻ ബാങ്ക് കോളം B)</label>
                                <input type="text" placeholder="e.g. History" value={sylForm.topic} onChange={e => setSylForm({...sylForm, topic: e.target.value})} className="w-full p-4 bg-blue-50 border border-blue-100 rounded-xl" />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                           <p><b>Note:</b> Subject നൽകുകയാണെങ്കിൽ ആ വിഷയത്തിലെ എല്ലാ ചോദ്യങ്ങളും വരും. Topic നൽകുകയാണെങ്കിൽ ആ ടോപ്പിക്കിലെ മാത്രം ചോദ്യങ്ങൾ വരും. രണ്ടും നൽകിയാൽ രണ്ടും ശരിയാകുന്ന ചോദ്യങ്ങൾ മാത്രം ഫിൽട്ടർ ചെയ്യും.</p>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition">SAVE SYLLABUS TOPIC</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
