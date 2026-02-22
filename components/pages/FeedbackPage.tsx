
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { submitFeedback } from '../../services/pscDataService';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

const OPTION_CLASSES = "w-full p-4 text-left rounded-2xl border-2 font-bold transition-all duration-200 active:scale-[0.98]";
const OPTION_SELECTED = "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md";
const OPTION_IDLE = "border-slate-100 bg-white text-slate-600 hover:border-indigo-200";

interface FeedbackPageProps {
  onBack: () => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ onBack }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    needs: '',
    easeInfo: '',
    transact: '',
    appeal: '',
    understand: '',
    recommend: 0,
    improvement: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const choices = ["Extremely well", "Very well", "Somewhat", "Not so well", "Not at all"];
  const easeChoices = ["Extremely easy", "Very easy", "Somewhat easy", "Not so easy", "Not at all easy"];
  const appealChoices = ["Extremely appealing", "Very appealing", "Somewhat appealing", "Not so appealing", "Not at all appealing"];

  const handleSelect = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleReset = () => {
    setFormData({
      needs: '',
      easeInfo: '',
      transact: '',
      appeal: '',
      understand: '',
      recommend: 0,
      improvement: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.needs || !formData.easeInfo || !formData.transact || !formData.appeal || !formData.understand || formData.recommend === 0) {
      alert("Please fill all mandatory fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitFeedback({ ...formData, userId: user?.id });
      setSubmitted(true);
    } catch (err) {
      alert("Error submitting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="h-14 w-14" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Thank You!</h1>
        <p className="text-slate-500 font-bold text-lg max-w-md mx-auto mb-8">
          We appreciate your feedback. It helps us make Kerala PSC Guru the best platform for all candidates.
        </p>
        <button onClick={onBack} className="bg-indigo-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const QuestionGroup = ({ title, field, options }: { title: string, field: string, options: string[] }) => (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
      <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
        <span className="text-indigo-600 mr-2">Mandatory*</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(opt => (
          <button 
            key={opt}
            type="button"
            onClick={() => handleSelect(field, opt)}
            className={`${OPTION_CLASSES} ${formData[field as keyof typeof formData] === opt ? OPTION_SELECTED : OPTION_IDLE}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black mb-8 hover:underline group">
        <ChevronLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      <header className="mb-12 text-center space-y-4">
        <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
          User <span className="text-indigo-600">Feedback</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          We thank you for using our website. We earnestly seek your feedback to help us make this portal a one stop platform of your choice.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <QuestionGroup title="1. How well the website meets your need" field="needs" options={choices} />
        <QuestionGroup title="2. How easy was it to find information" field="easeInfo" options={easeChoices} />
        <QuestionGroup title="3. How easy was it to transact on the site" field="transact" options={easeChoices} />
        <QuestionGroup title="4. How visually appealing is the site" field="appeal" options={appealChoices} />
        <QuestionGroup title="5. How easy it is to understand information" field="understand" options={easeChoices} />

        {/* 6. Rating Scale */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl text-white space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black leading-tight">6. How likely are you to recommend this portal to others?</h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Mandatory*</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelect('recommend', num)}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl font-black text-lg transition-all flex items-center justify-center border-2 ${
                  formData.recommend === num 
                  ? 'bg-white text-indigo-700 border-white scale-110 shadow-xl' 
                  : 'bg-indigo-500/20 text-indigo-100 border-indigo-400/30 hover:bg-white/10'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80 pt-2">
            <span>Not at all likely</span>
            <span>Extremely Likely</span>
          </div>
        </div>

        {/* 7. Text Feedback */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">7. What can we do to improve your experience?</h3>
          <div className="relative">
            <textarea 
              value={formData.improvement}
              onChange={(e) => handleSelect('improvement', e.target.value.slice(0, 255))}
              placeholder="Enter your feedback here..."
              className="w-full h-40 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 dark:bg-slate-800"
            />
            <div className="absolute bottom-4 right-6 text-[10px] font-black text-slate-400 uppercase">
              {formData.improvement.length}/255
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-grow bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 text-lg uppercase tracking-widest"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
          <button 
            type="button" 
            onClick={handleReset}
            className="sm:w-1/4 bg-slate-100 text-slate-500 font-black py-5 rounded-3xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
          >
            Reset
          </button>
          <button 
            type="button" 
            onClick={onBack}
            className="sm:w-1/4 bg-white text-indigo-600 border-2 border-indigo-50 font-black py-5 rounded-3xl hover:bg-indigo-50 transition-all uppercase tracking-widest text-xs"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackPage;
