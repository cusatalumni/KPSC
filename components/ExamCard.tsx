
import React from 'react';
import type { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
  onNavigate: (exam: Exam) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1.5 transform transition-all duration-300 flex flex-col justify-between border border-slate-100 bg-gradient-to-br from-white to-slate-50">
      <div>
        <div className="flex items-start space-x-4">
          <div className="bg-slate-100 p-3 rounded-full border border-slate-200">
              {exam.icon}
          </div>
          <div>
              <h4 className="text-xl font-bold text-slate-800">{exam.title.ml}</h4>
              <p className="text-sm text-slate-500 -mt-1">{exam.title.en}</p>
              <p className="text-slate-600 mt-2 text-base">{exam.description.ml}</p>
          </div>
        </div>
      </div>
       <button 
        onClick={() => onNavigate(exam)}
        className="mt-6 w-full text-center bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-sm hover:shadow-md"
       >
          തുടങ്ങുക
        </button>
    </div>
  );
};

export default ExamCard;