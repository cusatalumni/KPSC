
import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from '../contexts/LanguageContext';
import { ClockIcon } from './icons/ClockIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

interface TestConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: { questions: number; duration: number; negativeMarking: number }) => void;
  title: string;
}

const TestConfigModal: React.FC<TestConfigModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const { t } = useTranslation();
  const [qCount, setQCount] = useState(100);
  const [negMark, setNegMark] = useState(0.33);

  // Auto-calculate duration based on count (roughly 0.75 min per question)
  const duration = Math.ceil(qCount * 0.75);

  const handleStart = () => {
    onConfirm({ questions: qCount, duration, negativeMarking: negMark });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleStart}
      title={title}
      confirmText="പരീക്ഷ ആരംഭിക്കുക (Start Exam)"
      cancelText="പിന്നീട് (Later)"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">ചോദ്യങ്ങളുടെ എണ്ണം (Number of Questions)</label>
          <div className="grid grid-cols-3 gap-3">
            {[30, 50, 100].map(val => (
              <button
                key={val}
                onClick={() => setQCount(val)}
                className={`py-2 rounded-lg border-2 font-bold transition-all ${
                  qCount === val ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">നെഗറ്റീവ് മാർക്കിംഗ് (Negative Marking)</label>
          <div className="grid grid-cols-2 gap-3">
            {[0.33, 0.25].map(val => (
              <button
                key={val}
                onClick={() => setNegMark(val)}
                className={`py-2 rounded-lg border-2 font-bold transition-all ${
                  negMark === val ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-600">
            <ClockIcon className="h-5 w-5" />
            <span className="font-bold">{duration} mins</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <ClipboardListIcon className="h-5 w-5" />
            <span className="font-bold">{qCount} Questions</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TestConfigModal;
