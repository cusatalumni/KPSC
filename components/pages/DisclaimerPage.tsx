
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import { SparklesIcon } from '../icons/SparklesIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';

interface PageProps {
  onBack: () => void;
}

const DisclaimerPage: React.FC<PageProps> = ({ onBack }) => {
  const { t } = useTranslation();

  const goToFeedback = () => {
    window.location.hash = '#feedback';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-fade-in mb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <div className="space-y-10 leading-relaxed text-slate-700 dark:text-slate-300">
        <header className="space-y-4">
            <div className="inline-flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                <SparklesIcon className="h-5 w-5 text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Legal & AI Ethics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
              AI ഡിസ്ക്ലൈമർ
              <span className="block text-2xl text-slate-500 mt-1 font-bold uppercase tracking-tight">AI Content Disclaimer</span>
            </h1>
        </header>

        <section className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border-2 border-amber-100 dark:border-amber-900/30">
            <h2 className="text-xl font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight mb-4 flex items-center gap-3">
                <ShieldCheckIcon className="h-6 w-6" />
                <span>പ്രധാന അറിയിപ്പ് (Important Notice)</span>
            </h2>
            <p className="font-bold text-amber-800 dark:text-amber-200/80 mb-6">
               AI സാങ്കേതികവിദ്യ ഉപയോഗിച്ച് തയ്യാറാക്കിയ ഉള്ളടക്കങ്ങളിൽ ചിലപ്പോൾ പിഴവുകൾ ഉണ്ടാകാൻ സാധ്യതയുണ്ട്. ഞങ്ങൾ ഇവ പരമാവധി പരിശോധിക്കുന്നുണ്ടെങ്കിലും, ദിവസേനയുള്ള ഓട്ടോമേറ്റഡ് അപ്ഡേറ്റുകളിൽ തെറ്റുകൾ വരാവുന്നതാണ്.
            </p>
            <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 italic font-medium leading-relaxed">
                 "AI can make mistakes. While we manually scrutinize content as much as we can, daily updated automated content may still contain errors. Please always verify critical data with official PSC sources."
              </p>
            </div>
        </section>

        <div className="space-y-12 font-medium">
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">ഞങ്ങളുടെ പരിശോധനാ രീതി (Verification Process)</h3>
                <p>
                  ഈ പ്ലാറ്റ്‌ഫോമിലെ സിലബസ്, മാസ്റ്റർക്ലാസ് നോട്ടുകൾ, കറന്റ് അഫയേഴ്സ് എന്നിവ തയ്യാറാക്കുന്നത് അത്യാധുനിക AI മോഡലുകൾ ഉപയോഗിച്ചാണ്. സ്ഥിരമായ ഉള്ളടക്കങ്ങൾ (Core subjects) ഞങ്ങൾ മാനുഷികമായി പരിശോധിച്ചു ഉറപ്പുവരുത്തുന്നു. എന്നാൽ ദിവസേനയുള്ള വാർത്തകൾ, ആനുകാലിക സംഭവങ്ങൾ എന്നിവ AI ഓട്ടോമാറ്റിക്കായി കണ്ടെത്തുന്നതാണ്. ഇവയിൽ അപൂർവ്വമായി പിഴവുകൾ ഉണ്ടാകാം.
                </p>
            </div>

            {/* Error Reporting CTA */}
            <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border-b-[10px] border-indigo-900">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-tight">തെറ്റുകൾ ശ്രദ്ധയിൽപ്പെട്ടോ?</h3>
                        <p className="text-indigo-100 text-base font-bold leading-snug">ചോദ്യങ്ങളിലോ ഉത്തരങ്ങളിലോ പഠനക്കുറിപ്പുകളിലോ പിഴവുകൾ കണ്ടാൽ ദയവായി ഞങ്ങളെ അറിയിക്കുക. നിങ്ങളുടെ സഹായം ഈ പ്ലാറ്റ്‌ഫോമിനെ കൂടുതൽ മികച്ചതാക്കും.</p>
                    </div>
                    <button 
                        onClick={goToFeedback}
                        className="bg-white text-indigo-600 font-black px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 uppercase tracking-widest text-xs shrink-0"
                    >
                        <ChatBubbleLeftRightIcon className="h-6 w-6" />
                        <span>റിപ്പോർട്ട് ചെയ്യാം (Report Now)</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">ഉദ്യോഗാർത്ഥികളുടെ ശ്രദ്ധയ്ക്ക്</h3>
                <ul className="list-inside space-y-4 marker:text-indigo-500">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0"></div>
                      <span>പരീക്ഷാ തീയതികൾ, സിലബസ് മാറ്റങ്ങൾ എന്നിവയ്ക്ക് എപ്പോഴും ഔദ്യോഗിക കേരള PSC വെബ്‌സൈറ്റ് (keralapsc.gov.in) ആധികാരികമായി കണക്കാക്കുക.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0"></div>
                      <span>ഈ ആപ്പിലെ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്കായി മാത്രമുള്ളതാണ്. ഇത് ഔദ്യോഗിക സർക്കാർ അറിയിപ്പായി കണക്കാക്കരുത്.</span>
                    </li>
                </ul>
            </div>
        </div>

        <div className="pt-10 border-t dark:border-slate-800">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">
                Last updated: {new Date().toLocaleDateString()} • Annapoorna Exam App
            </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
