
import React from 'react';
import type { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
  onNavigate: (exam: Exam) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onNavigate }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border border-gray-100">
      <div>
        <div className="flex items-start space-x-4">
          <div className="bg-gray-100 p-3 rounded-full">
              {exam.icon}
          </div>
          <div>
              <h4 className="text-xl font-bold text-gray-800">{exam.title}</h4>
              <p className="text-gray-600 mt-1">{exam.description}</p>
          </div>
        </div>
      </div>
       <button 
        onClick={() => onNavigate(exam)}
        className="mt-4 w-full text-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
       >
          തുടങ്ങുക
        </button>
    </div>
  );
};

export default ExamCard;
