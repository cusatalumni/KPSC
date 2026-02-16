
import React, { useEffect } from 'react';

const AdsenseWidget: React.FC = () => {
    useEffect(() => {
        try {
            // The `adsbygoogle` object is loaded from the script in index.html
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
            // Silence error in dev mode if blocked
        }
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[320px] transition-all hover:shadow-2xl group">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Advertisement</span>
                <div className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"></div>
            </div>
            
            <div className="flex-grow flex items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-client="ca-pub-0776870820469795"
                    data-ad-slot="7322087591"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 opacity-50"></div>
            </div>
        </div>
    );
};

export default AdsenseWidget;
