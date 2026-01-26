
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

interface PageProps { onBack: () => void; }

const AdminPage: React.FC<PageProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    const [csvData, setCsvData] = useState('');
    const [targetSheet, setTargetSheet] = useState('Notifications');
    const [status, setStatus] = useState<any>({ loading: false, result: null });

    const handleRunScraper = async (type: 'daily' | 'books') => {
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            const action = type === 'daily' ? triggerDailyScraper : triggerBookScraper;
            await action(token);
            setStatus({ loading: false, result: { type: 'success', message: 'Task triggered successfully!' }});
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    const handleCsvSync = async () => {
        if (!csvData.trim()) return;
        setStatus({ loading: true, result: null });
        try {
            const token = await getToken();
            await syncCsvData(targetSheet, csvData, token);
            setStatus({ loading: false, result: { type: 'success', message: `Successfully updated ${targetSheet}!` }});
            setCsvData('');
        } catch (error: any) {
            setStatus({ loading: false, result: { type: 'error', message: error.message }});
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Return to Dashboard</span>
            </button>

            <div className="bg-slate-900 p-8 rounded-3xl text-white flex items-center justify-between shadow-2xl">
                <div className="flex items-center space-x-6">
                    <div className="bg-indigo-500 p-4 rounded-2xl">
                        <ShieldCheckIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Portal Command Center</h1>
                        <p className="text-indigo-300 font-medium opacity-80">Oversee latest news, question banks, and portal automation.</p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Live: Connected</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <MegaphoneIcon className="h-7 w-7 text-indigo-500" />
                        <h3 className="text-2xl font-bold text-slate-800">CSV Bulk Update Tool</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Target Table</label>
                                <select 
                                    value={targetSheet}
                                    onChange={(e) => setTargetSheet(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                >
                                    <option value="Notifications">Latest News (Notifications)</option>
                                    <option value="QuestionBank">Full Question Bank</option>
                                    <option value="GK">Static GK Facts</option>
                                </select>
                            </div>
                             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Expected Format</p>
                                <code className="text-[10px] text-indigo-900 break-all leading-relaxed font-mono">
                                    {targetSheet === 'Notifications' 
                                      ? 'id, title, catNo, lastDate, link' 
                                      : 'id, topic, question, ["A","B","C","D"], correctIdx'}
                                </code>
                            </div>
                        </div>

                        <textarea 
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            placeholder="Paste CSV rows here (exclude headers)..."
                            className="w-full h-72 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none shadow-inner"
                        />

                        <button
                            onClick={handleCsvSync}
                            disabled={status.loading || !csvData.trim()}
                            className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 active:scale-[0.98]"
                        >
                            {status.loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ClipboardListIcon className="h-6 w-6" />}
                            <span>SYNC DATA TO SHEETS</span>
                        </button>

                        {status.result && (
                             <div className={`p-5 rounded-2xl flex items-center space-x-4 animate-fade-in border ${
                                status.result.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {status.result.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <XCircleIcon className="h-6 w-6" />}
                                <p className="font-bold">{status.result.message}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h4 className="font-black text-slate-800 mb-6 flex items-center uppercase tracking-wider text-sm">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            Automation Hub
                        </h4>
                        <div className="space-y-4">
                            <button 
                                onClick={() => handleRunScraper('daily')}
                                className="w-full p-5 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left border border-slate-200 group"
                            >
                                <p className="text-base">Refresh All Portal Data</p>
                                <span className="text-[10px] text-slate-400 group-hover:text-indigo-400">Updates Notifications, Updates & GK</span>
                            </button>
                            <button 
                                onClick={() => handleRunScraper('books')}
                                className="w-full p-5 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left border border-slate-200 group"
                            >
                                <p className="text-base">Sync Bookstore Items</p>
                                <span className="text-[10px] text-slate-400 group-hover:text-indigo-400">Scrapes Amazon Affiliate products</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                        <h4 className="font-black mb-3 relative z-10 text-xl">Quick Tip</h4>
                        <p className="text-sm text-indigo-100 relative z-10 font-medium leading-relaxed">
                            Manual CSV updates immediately overwrite spreadsheet data. Use this for breaking news or historical corrections.
                        </p>
                        <MegaphoneIcon className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
