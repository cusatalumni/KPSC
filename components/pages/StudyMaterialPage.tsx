import React, { useState, useEffect } from 'react';
import { getStudyMaterial } from '../../services/pscDataService';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';

interface PageProps {
  topic: string;
  onBack: () => void;
}

const StudyMaterialPage: React.FC<PageProps> = ({ topic, onBack }) => {
    const { t } = useTranslation();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStudyMaterial(topic);
                setContent(data.notes);
            } catch (err) {
                setError(t('error.fetchData'));
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [topic, t]);

    // Simple markdown to HTML renderer
    const renderMarkdown = (text: string) => {
        let html = text
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-slate-800 mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-2 my-4">$1</ul>');

        return html.replace(/\n/g, '<br />');
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
                <ChevronLeftIcon className="h-5 w-5" />
                <span>{t('test.backToPrevious')}</span>
            </button>

            <header className="mb-6 border-b pb-4">
                <h1 className="text-4xl font-bold text-slate-800">{topic}</h1>
                <p className="text-lg text-slate-500 mt-1">{t('studyMaterial.subtitle')}</p>
            </header>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-slate-600">{t('studyMaterial.loading')}</p>
                </div>
            )}

            {error && (
                 <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">{error}</div>
            )}

            {!loading && !error && (
                <article 
                    className="prose prose-slate max-w-none text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                >
                </article>
            )}
             <div className="mt-8">
                <AdsenseWidget />
            </div>
        </div>
    );
};

export default StudyMaterialPage;