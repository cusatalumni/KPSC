
import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { useTranslation } from '../contexts/LanguageContext';

const MOTIVATIONAL_QUOTES = [
    "നിങ്ങളുടെ കഠിനാധ്വാനം ഒരിക്കലും വെറുതെയാകില്ല.",
    "വിജയം എന്നത് വീണ്ടും വീണ്ടും ശ്രമിക്കുന്നതിലൂടെ ലഭിക്കുന്നതാണ്.",
    "നിങ്ങളുടെ സ്വപ്നങ്ങളെ പിന്തുടരുക, അവ പൂവണിയുന്ന കാലം വരും.",
    "ഓരോ ചെറിയ ചുവടുവെപ്പും വലിയ മാറ്റങ്ങൾക്ക് തുടക്കമാണ്.",
    "ക്ഷമയും കഠിനാധ്വാനവുമാണ് വിജയത്തിലേക്കുള്ള താക്കോൽ.",
    "പരാജയങ്ങൾ വിജയത്തിലേക്കുള്ള ചവിട്ടുപടികളാണ്.",
    "നിങ്ങൾ ഇന്ന് ചെയ്യുന്നതാണ് നിങ്ങളുടെ നാളെയെ തീരുമാനിക്കുന്നത്."
];

const LoadingScreen: React.FC = () => {
    const { t } = useTranslation();
    const [quote, setQuote] = useState("");
    const [logoVariant, setLogoVariant] = useState<'transparent' | 'dark'>('transparent');

    useEffect(() => {
        // Pick a random quote on mount
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        setQuote(randomQuote);
        
        // Randomly pick logo variant (transparent or dark) to make it look dynamic as requested
        const variants: Array<'transparent' | 'dark'> = ['transparent', 'dark'];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        setLogoVariant(randomVariant);
    }, []);
    
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden animate-fade-in">
            {/* Background Decorative Element */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px] -z-10"></div>

            <div className="relative mb-12 flex flex-col items-center">
                {/* Logo Container with 3D-like Shadow */}
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(79,70,229,0.15)] dark:shadow-none border border-slate-100 dark:border-slate-800 animate-bounce transition-transform duration-1000">
                    <LogoIcon 
                        className="h-44 w-44 md:h-64 md:w-64" 
                        variant={logoVariant} 
                    />
                </div>
                {/* Glowing Pulse behind logo */}
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse scale-125"></div>
            </div>
            
            <div className="text-center space-y-8 max-w-sm px-6">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                        {t('app.title')}
                    </h1>
                    <div className="h-1.5 w-16 bg-indigo-600 mx-auto rounded-full"></div>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">
                        {t('app.subtitle')}
                    </p>
                </div>

                <div className="py-6 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in-up">
                    <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                        "{quote}"
                    </p>
                </div>
                
                {/* Custom Loading Bar */}
                <div className="relative w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <div className="absolute top-0 left-0 h-full bg-indigo-600 animate-[loading-bar_2s_infinite_ease-in-out]"></div>
                </div>
                
                <div className="pt-4">
                    <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[9px] md:text-[10px]">
                        PREPARING YOUR SUCCESS JOURNEY
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { left: -40%; width: 40%; }
                    50% { left: 40%; width: 60%; }
                    100% { left: 100%; width: 40%; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
