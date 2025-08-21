import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { triggerDailyScraper, triggerBookScraper } from '../../services/pscDataService';
import { useTranslation } from '../../contexts/LanguageContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

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
    const [status, setStatus] = useState<ScraperStatus>({
        daily: { loading: false, result: null },
        books: { loading: false, result: null }
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

    const ScraperCard: React.FC<{
        scraperKey: 'daily' | 'books';
        title: string;
        description: string;
    }> = ({ scraperKey, title, description }) => {
        const { loading, result } = status[scraperKey];
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <p className="text-slate-600 my-2">{description}</p>
                <button
                    onClick={() => handleRunScraper(scraperKey)}
                    disabled={loading}
                    className="w-full sm:w-auto mt-4 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:bg-slate-400"
                >
                    {loading ? t('adminPanel.running') : t('adminPanel.run')}
                </button>
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
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>{t('backToDashboard')}</span>
            </button>

            <header className="mb-8 border-b pb-4">
                 <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-10 w-10 text-indigo-500" />
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">{t('adminPanel.title')}</h1>
                        <p className="text-lg text-slate-500">{t('adminPanel.subtitle')}</p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
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
        </div>
    );
};

export default AdminPage;