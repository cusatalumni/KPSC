
import React, { useState, useEffect } from 'react';
import { getGk } from '../services/pscDataService';
import type { GkItem } from '../types';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface GkWidgetProps {
  onNavigate: () => void;
}

const GkWidget: React.FC<GkWidgetProps> = ({ onNavigate }) => {
  const [previewGk, setPreviewGk] = useState<GkItem | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
        try {
            const data = await getGk();
            if (data.length > 0) {
                setPreviewGk(data[Math.floor(Math.random() * data.length)]);
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchPreview();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-yellow-200 transition-all">
      <div className="flex items-center space-x-3 mb-4">
        <LightBulbIcon className="h-7 w-7 text-yellow-500" />
        <h4 className="text-xl font-black text-slate-800">പൊതുവിജ്ഞാനം</h4>
      </div>
      
      {previewGk ? (
          <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 mb-4 animate-fade-in">
              <p className="text-slate-700 text-sm font-bold line-clamp-3 leading-relaxed">"{previewGk.fact}"</p>
              <span className="text-[10px] font-black text-yellow-600 uppercase mt-2 inline-block">{previewGk.category}</span>
          </div>
      ) : (
          <p className="text-slate-600 mb-4 text-sm font-medium leading-relaxed">പരീക്ഷകൾക്ക് ആവശ്യമായ പ്രധാനപ്പെട്ട പൊതുവിജ്ഞാന ശേഖരം.</p>
      )}

      <button 
        onClick={onNavigate} 
        className="w-full text-center bg-yellow-50 text-yellow-700 font-black px-4 py-3 rounded-xl hover:bg-yellow-100 transition duration-200 shadow-sm"
      >
        കൂടുതൽ പഠിക്കാം
      </button>
    </div>
  );
};

export default GkWidget;
