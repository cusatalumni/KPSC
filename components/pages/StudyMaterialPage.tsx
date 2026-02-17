
import React, { useState, useEffect } from 'react';
import { getStudyMaterial } from '../../services/pscDataService';
import { STUDY_SUBJECTS } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import AdsenseWidget from '../AdsenseWidget';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';

interface PageProps {
  topic: string;
  onBack: () => void;
}

const StudyMaterialPage: React.FC<PageProps> = ({ topic, onBack }) => {
    const { t } = useTranslation();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState(topic);

    // If initial topic is just 'General Study', we show the subject grid first
    const showGrid = activeTopic === 'General Study';

    useEffect(() => {
        if (showGrid) return;

        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getStudyMaterial(activeTopic);
                setContent(data.notes);
            } catch (err) {
                setError(t('error.fetchData'));
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [activeTopic, showGrid, t]);

    const handleSubjectClick = (subjectTitle: string) => {
        setActiveTopic(subjectTitle);
    };

    // Simple markdown to HTML renderer
    const renderMarkdown = (text: string) => {
        let html = text
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-slate-800 dark:text-white mt-8 mb-4 border-l-4 border-indigo-600 pl-4">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-black text-slate-900 dark:text-slate-100 mt-12 mb-8 border-b-2 dark:border-slate-800 pb-4 tracking-tight">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-indigo-700 dark:text-indigo-400">$1</strong>')
            .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
            
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc space-y-3 my-6 font-bold text-slate-700 dark:text-slate-300">$1</ul>');

        return html.split('\n').join('<br />');
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-4 pb-24">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
                <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                <span>{showGrid ? t('backToDashboard') : 'വിഷയങ്ങളിലേക്ക് മടങ്ങുക'}</span>
            </button>

            {showGrid ? (
                <div className="space-y-16">
                    <header className="text-center max-w-3xl mx-auto space-y-6">
                        <div className="inline-flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-900/30 px-6 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                             <SparklesIcon className="h-5 w-5 text-indigo-600" />
                             <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Smart Learning Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">പഠന കേന്ദ്രം</h1>
                        <p className="text-xl text-slate-500 font-medium">PSC സിലബസ് പ്രകാരമുള്ള പ്രധാന വിഷയങ്ങൾ ഇവിടെ തിരഞ്ഞെടുക്കാം. AI തയ്യാറാക്കിയ കൃത്യമായ നോട്ട്സ് ലഭ്യമാണ്.</p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {STUDY_SUBJECTS.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => handleSubjectClick(sub.subject)}
                                className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 hover:border-indigo-500 transition-all text-left flex flex-col justify-between h-64 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-indigo-900/10 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 relative z-10 shadow-inner">
                                    {sub.icon}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 leading-tight">{sub.title}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.subject} Masterclass</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    <AdsenseWidget />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-3">
                        <article className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                            
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-40">
                                    <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                                    <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">AI is preparing your masterclass...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20">
                                    <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 text-red-600 font-bold">{error}</div>
                                </div>
                            ) : (
                                <div 
                                    className="prose prose-slate dark:prose-invert max-w-none text-xl leading-[1.8] text-slate-700 dark:text-slate-300 relative z-10"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                >
                                </div>
                            )}
                        </article>
                        <div className="mt-12">
                            <AdsenseWidget />
                        </div>
                    </div>

                    <aside className="space-y-8">
                        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                             <h4 className="text-xl font-black mb-4 tracking-tight">Master this topic!</h4>
                             <p className="text-indigo-100 text-sm font-bold leading-relaxed mb-6">The notes on the left are generated using advanced AI based on official PSC syllabus patterns.</p>
                             <button 
                                onClick={() => setActiveTopic('General Study')}
                                className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                             >
                                Browse Other Subjects
                             </button>
                        </div>
                        <div className="sticky top-28">
                             <AdsenseWidget />
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default StudyMaterialPage;
