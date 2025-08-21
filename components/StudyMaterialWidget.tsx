import React from 'react';
import { STUDY_MATERIALS_DATA } from '../constants';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

const StudyMaterialWidget: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
                <DocumentTextIcon className="h-7 w-7 text-indigo-500" />
                <h4 className="text-xl font-bold text-slate-800">പഠന സാമഗ്രികൾ</h4>
            </div>
            <div className="space-y-2">
                {STUDY_MATERIALS_DATA.map((material) => (
                    <a
                        key={material.id}
                        href={material.link !== '#' ? `/go?url=${encodeURIComponent(material.link)}` : '#'}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium text-slate-700">{material.title}</span>
                    </a>
                ))}
            </div>
             <button className="mt-4 w-full text-center bg-teal-50 text-teal-700 font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition duration-200">
                എല്ലാം കാണുക
            </button>
        </div>
    );
};

export default StudyMaterialWidget;