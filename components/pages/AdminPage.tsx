
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { triggerDailyScraper, triggerBookScraper } from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';

interface PageProps {
  onBack: () => void;
}

type ScraperStatus = {
    [key: string]: {
        loading: boolean;
        result: { type: 'success' | 'error'; message: string } | null;
    }
}

const AdminPage: React.FC<PageProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    const [csvData, setCsvData] = useState('');
    const [targetSheet, setTargetSheet] = useState('Notifications');
    const [status, setStatus] = useState<ScraperStatus>({
        daily: { loading: false, result: null },
        books: { loading: false, result: null },
        csv: { loading: false, result: null }
    });

    const handleRunScraper = async (scraperKey: 'daily' | 'books') => {
        setStatus(prev => ({ ...prev, [scraperKey]: { loading: true, result: null }}));
        try {
            const token = await getToken();
            const action = scraperKey === 'daily' ? triggerDailyScraper : triggerBookScraper;
            await action(token);
            setStatus(prev => ({ ...prev, [scraperKey]: { loading: false, result: { type: 'success', message: 'Scraper triggered successfully.' }}}));
        } catch (error: any) {
            setStatus(prev => ({ ...prev, [scraperKey]: { loading: false, result: { type: 'error', message: `Error: ${error.message}` }}}));
        }
    };

    const handleCsvSync = async () => {
        if (!csvData.trim()) return;
        setStatus(prev => ({ ...prev, csv: { loading: true, result: null }}));
        
        try {
            const token = await getToken();
            const response = await fetch('/api/update-from-csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sheet: targetSheet, data: csvData })
            });

            if (!response.ok) throw new Error('Failed to sync CSV data');
            
            setStatus(prev => ({ ...prev, csv: { loading: false, result: { type: 'success', message: `Successfully updated ${targetSheet} from CSV!` }}}));
            setCsvData('');
        } catch (error: any) {
            setStatus(prev => ({ ...prev, csv: { loading: false, result: { type: 'error', message: error.message }}}));
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-20">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{t('backToDashboard')}</span>
            </button>

            <header className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                 <div className="flex items-center space-x-6">
                    <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
                        <ShieldCheckIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Admin Control Panel</h1>
                        <p className="text-lg text-slate-500">Manage portal data and automation.</p>
                    </div>
                </div>
            </header>

            {/* CSV Update Section */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                    <ClipboardListIcon className="h-7 w-7 text-indigo-500" />
                    <h3 className="text-2xl font-bold text-slate-800">Easy CSV News/Data Update</h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Target Data Table</label>
                        <select 
                            value={targetSheet}
                            onChange={(e) => setTargetSheet(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="Notifications">Latest News (Notifications)</option>
                            <option value="QuestionBank">Question Bank</option>
                            <option value="GK">General Knowledge (GK)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Paste CSV Data</label>
                        <p className="text-xs text-slate-500 mb-2">
                            {targetSheet === 'Notifications' 
                              ? 'Format: id, title, categoryNumber, lastDate, link' 
                              : 'Format: id, topic, question, ["opt1","opt2","opt3","opt4"], correctIndex'}
                        </p>
                        <textarea 
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            placeholder="Paste your CSV rows here..."
                            className="w-full h-48 p-4 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={handleCsvSync}
                        disabled={status.csv.loading || !csvData.trim()}
                        className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100 w-full md:w-auto"
                    >
                        {status.csv.loading ? 'Updating Sheets...' : 'Sync CSV to Database'}
                    </button>

                    {status.csv.result && (
                         <div className={`mt-6 p-4 rounded-xl flex items-start space-x-3 text-sm ${
                            status.csv.result.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                            <p className="font-bold">{status.csv.result.message}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Automation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Trigger AI Scraper</h3>
                    <p className="text-slate-600 my-2">Manually start the daily news scraping process.</p>
                    <button
                        onClick={() => handleRunScraper('daily')}
                        disabled={status.daily.loading}
                        className="mt-4 bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-black transition disabled:opacity-50"
                    >
                        {status.daily.loading ? 'Running...' : 'Run Scraper Now'}
                    </button>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">Refresh Bookstore</h3>
                    <p className="text-slate-600 my-2">Scrape Amazon for latest PSC preparation books.</p>
                    <button
                        onClick={() => handleRunScraper('books')}
                        disabled={status.books.loading}
                        className="mt-4 bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-black transition disabled:opacity-50"
                    >
                        {status.books.loading ? 'Running...' : 'Refresh Books'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
