
import React, { useEffect } from 'react';

const AdsenseWidget: React.FC = () => {
    useEffect(() => {
        try {
            // The `adsbygoogle` object is loaded from the script in index.html
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
            console.error("Adsense error: ", e);
        }
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[200px] w-full group transition-all hover:border-indigo-100 dark:hover:border-indigo-900">
            <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] mb-3 block">Advertisement</span>
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', minHeight: '150px' }}
                    data-ad-client="ca-pub-0776870820469795"
                    data-ad-slot="7322087591"
                    data-ad-format="rectangle, horizontal"
                    data-full-width-responsive="true"></ins>
            </div>
        </div>
    );
};

export default AdsenseWidget;
