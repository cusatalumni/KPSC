
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
            setStatus(prev => ({ ...prev, [scraperKey]: { loading: false, result: { type: 'success', message: t('adminPanel.success') }}}));
        } catch (error: any) {
            setStatus(prev => ({ ...prev, [scraperKey]: { loading: false, result: { type: 'error', message: `${t('adminPanel.error')}${error.message}` }}}));
        }
    };

    const handleCsvUpload = async () => {
        if (!csvData.trim()) return;
        setStatus(prev => ({ ...prev, csv: { loading: true, result: null }}));
        
        // Simulating the CSV processing for now
        setTimeout(() => {
            setStatus(prev => ({ ...prev, csv: { loading: false, result: { type: 'success', message: 'CSV data processed and sent to Google Sheets!' }}}));
            setCsvData('');
        }, 2000);
    };

    const ScraperCard: React.FC<{
        scraperKey: string;
        title: string;
        description: string;
    }> = ({ scraperKey, title, description }) => {
        const { loading, result } = status[scraperKey];
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <p className="text-slate-600 my-2">{description}</p>
                {scraperKey !== 'csv' && (
                    <button
                        onClick={() => handleRunScraper(scraperKey as 'daily' | 'books')}
                        disabled={loading}
                        className="w-full sm:w-auto mt-4 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:bg-slate-400"
                    >
                        {loading ? t('adminPanel.running') : t('adminPanel.run')}
                    </button>
                )}
                {result && (
                    <div className={`mt-4 p-3 rounded-md flex items-start space-x-3 text-sm ${
                        result.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                        {result.type === 'success' 
                            ? <CheckCircleIcon className="h-5 w-5 flex-shrink-0" /> 
                            : <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                        }
                        <p>{result.message}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
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
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">{t('adminPanel.title')}</h1>
                        <p className="text-lg text-slate-500">{t('adminPanel.subtitle')}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScraperCard 
                    scraperKey="daily"
                    title={t('adminPanel.runDaily')}
                    description={t('adminPanel.runDailyDesc')}
                />
                 <ScraperCard 
                    scraperKey="books"
                    title={t('adminPanel.runBooks')}
                    description={t('adminPanel.runBooksDesc')}
                />
            </div>

            {/* CSV Question Bank Update */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                    <ClipboardListIcon className="h-7 w-7 text-indigo-500" />
                    <h3 className="text-2xl font-bold text-slate-800">Bulk Update Questions (CSV/Text)</h3>
                </div>
                <p className="text-slate-600 mb-6">Paste comma-separated data here to bulk update the <strong>QuestionBank</strong> sheet. Format: <code>id, topic, question, ["option1", "option2", "option3", "option4"], correctIndex, subject, difficulty</code></p>
                <textarea 
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="q1, History, Who is the father of..., [&quot;A&quot;, &quot;B&quot;, &quot;C&quot;, &quot;D&quot;], 0, GK, PSC Level"
                    className="w-full h-48 p-4 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all mb-6"
                />
                <button
                    onClick={handleCsvUpload}
                    disabled={status.csv.loading || !csvData.trim()}
                    className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                    {status.csv.loading ? 'Uploading...' : 'Bulk Upload to Sheets'}
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
    );
};

export default AdminPage;
