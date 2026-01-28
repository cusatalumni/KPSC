
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { triggerDailyScraper, triggerBookScraper, syncCsvData } from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface PageProps { onBack: () => void; }

const AdminPage: React.FC<PageProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    
    // Bulk Sync State
    const [csvData, setCsvData] = useState('');
    const [targetSheet, setTargetSheet] = useState('CurrentAffairs');
    const [isAppendMode, setIsAppendMode] = useState(true);
    
    // Quick Entry State (Current Affairs)
    const [quickAffair, setQuickAffair] = useState({ title: '', source: '', date: new Date().toISOString().split('T')[0] });
    
    const [status, setStatus] = useState<any>({ loading: false, result: null });

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
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleQuickAddAffair = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAffair.title || !quickAffair.source) return;
        
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const csvLine = `aff_${Date.now()}, ${quickAffair.title}, ${quickAffair.source}, ${quickAffair.date}`;
            const res = await syncCsvData('CurrentAffairs', csvLine, token, true);
            setStatus({ loading: false, result: { type: 'success', message: 'Current Affair added successfully!' }});
            setQuickAffair({ title: '', source: '', date: new Date().toISOString().split('T')[0] });
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleCsvSync = async () => {
        if (!csvData.trim()) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const res = await syncCsvData(targetSheet, csvData, token, isAppendMode);
            setStatus({ 
                loading: false, 
                result: { type: 'success', message: res.message || `Successfully updated ${targetSheet}!` }
            });
            setCsvData('');
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const getCsvExample = () => {
        if (targetSheet === 'Notifications') return 'ID, Title, Cat No, Last Date, URL';
        if (targetSheet === 'QuestionBank') return 'ID, Topic, Question, Options, CorrectIdx';
        if (targetSheet === 'CurrentAffairs') return 'ID, Title, Source, Date';
        if (targetSheet === 'GK') return 'ID, Fact, Category';
        return '';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in px-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between shadow-2xl gap-4">
                <div className="flex items-center space-x-6">
                    <div className="bg-indigo-500 p-4 rounded-2xl">
                        <ShieldCheckIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Portal Command Center</h1>
                        <p className="text-indigo-300 font-medium opacity-80">Separate controls for news, exams, and current affairs.</p>
                    </div>
                </div>
                <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-center">
                    Authorized Administrator
                </div>
            </div>

            {status.result && (
                <div className={`p-6 rounded-3xl flex items-start space-x-4 animate-fade-in border-2 ${
                    status.result.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {status.result.type === 'success' ? <CheckCircleIcon className="h-6 w-6 mt-1 flex-shrink-0" /> : <XCircleIcon className="h-6 w-6 mt-1 flex-shrink-0" />}
                    <div>
                        <p className="font-black text-lg">{status.result.type === 'success' ? 'Task Complete' : 'Operation Failed'}</p>
                        <p className="font-medium opacity-90">{status.result.message}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Quick Entry & Scrapers */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Quick Affair Entry */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <PlusIcon className="h-6 w-6 text-indigo-500" />
                            <h3 className="text-xl font-bold text-slate-800">Quick Affair Entry</h3>
                        </div>
                        <form onSubmit={handleQuickAddAffair} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Title (Malayalam)</label>
                                <input 
                                    type="text" 
                                    value={quickAffair.title}
                                    onChange={e => setQuickAffair({...quickAffair, title: e.target.value})}
                                    placeholder="e.g. കേരള ബജറ്റ് 2025"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Source</label>
                                    <input 
                                        type="text" 
                                        value={quickAffair.source}
                                        onChange={e => setQuickAffair({...quickAffair, source: e.target.value})}
                                        placeholder="Mathrubhumi"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Date</label>
                                    <input 
                                        type="date" 
                                        value={quickAffair.date}
                                        onChange={e => setQuickAffair({...quickAffair, date: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={status.loading || !quickAffair.title}
                                className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                ADD INDIVIDUAL NEWS
                            </button>
                        </form>
                    </div>

                    {/* Automation Control */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-6 flex items-center uppercase tracking-wider text-xs">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            AI Scraper Control
                        </h4>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleRunScraper('daily')}
                                disabled={status.loading}
                                className="w-full p-4 bg-white text-slate-700 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left border border-slate-200 group disabled:opacity-50 shadow-sm"
                            >
                                <p className="text-sm">Run General Scraper</p>
                                <span className="text-[10px] text-slate-400">Syncs news & notifications automatically</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bulk CSV Sync */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div className="flex items-center space-x-3">
                                <MegaphoneIcon className="h-7 w-7 text-indigo-500" />
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Bulk Category Sync</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Update one category at a time</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => setIsAppendMode(false)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!isAppendMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    REPLACE
                                </button>
                                <button 
                                    onClick={() => setIsAppendMode(true)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${isAppendMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    APPEND
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Select Target Category</label>
                                    <select 
                                        value={targetSheet}
                                        onChange={(e) => setTargetSheet(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
                                    >
                                        <option value="CurrentAffairs">Current Affairs (ആനുകാലികം)</option>
                                        <option value="QuestionBank">Question Bank (ചോദ്യങ്ങൾ)</option>
                                        <option value="Notifications">Notifications (PSC അറിയിപ്പുകൾ)</option>
                                        <option value="GK">GK Facts (പൊതുവിജ്ഞാനം)</option>
                                    </select>
                                </div>
                                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 relative z-10">CSV Column Order</p>
                                    <code className="text-xs text-indigo-100 font-mono relative z-10 leading-relaxed break-all font-bold">
                                        {getCsvExample()}
                                    </code>
                                    <ClipboardListIcon className="absolute -bottom-4 -right-4 h-20 w-20 text-white/5 rotate-12" />
                                </div>
                            </div>

                            <div className="relative">
                                <textarea 
                                    value={csvData}
                                    onChange={(e) => setCsvData(e.target.value)}
                                    placeholder={`Paste CSV data for ${targetSheet} here...`}
                                    className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none shadow-inner"
                                />
                                {csvData === '' && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-center">
                                        <p className="font-bold">Paste multiple rows here</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <button
                                    onClick={handleCsvSync}
                                    disabled={status.loading || !csvData.trim()}
                                    className={`w-full text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50 shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] ${
                                        isAppendMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'
                                    }`}
                                >
                                    {status.loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ClipboardListIcon className="h-6 w-6" />}
                                    <span>{isAppendMode ? `APPEND TO ${targetSheet.toUpperCase()}` : `WIPE & REPLACE ${targetSheet.toUpperCase()}`}</span>
                                </button>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                    {isAppendMode 
                                        ? "Existing data is safe. New items will be added at the end." 
                                        : `CAUTION: All existing ${targetSheet} data will be permanently deleted.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                        <div className="flex items-center space-x-3 mb-4">
                            <LightBulbIcon className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-lg font-bold text-indigo-900">Safety Tip</h3>
                        </div>
                        <p className="text-indigo-800/80 font-medium text-sm leading-relaxed">
                            Updating <strong>Current Affairs</strong> will never affect your <strong>Question Bank</strong>. 
                            The portal targets specific "sheets" for each category. For maximum safety, always use <strong>APPEND MODE</strong> when adding a few items, and only use <strong>REPLACE</strong> if you want to start fresh with a completely new list.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
