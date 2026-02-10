
import React, { useState, useEffect } from 'react';
import { getCurrentAffairs } from '../../services/pscDataService';
import type { CurrentAffairsItem } from '../../types';
import { NewspaperIcon } from './NewspaperIcon';

interface CurrentAffairsWidgetProps {
  onNavigate: () => void;
}

const CurrentAffairsWidget: React.FC<CurrentAffairsWidgetProps> = ({ onNavigate }) => {
  const [previewNews, setPreviewNews] = useState<CurrentAffairsItem | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
        try {
            const data = await getCurrentAffairs();
            if (data.length > 0) {
                setPreviewNews(data[0]);
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchPreview();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hover:border-teal-200 transition-all">
      <div className="flex items-center space-x-3 mb-4">
        <NewspaperIcon className="h-7 w-7 text-teal-500" />
        <h4 className="text-xl font-black text-slate-800 dark:text-white">ആനുകാലികം</h4>
      </div>

      {previewNews ? (
          <div className="mb-4 animate-fade-in">
              <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight line-clamp-2">{previewNews.title}</h5>
              <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{previewNews.source}</span>
                  <span className="text-[9px] font-bold text-slate-400">{previewNews.date}</span>
              </div>
          </div>
      ) : (
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm font-medium leading-relaxed">ഏറ്റവും പുതിയ വാർത്തകളും സംഭവങ്ങളും ദിവസവും അപ്ഡേറ്റ് ചെയ്യുന്നു.</p>
      )}

      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-black px-4 py-3 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition duration-200 shadow-sm"
      >
        വിശദമായി വായിക്കാം
      </button>
    </div>
  );
};

export default CurrentAffairsWidget;
