
import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../types';
import { getDailyQuestion } from '../services/geminiService';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

const QuizWidget: React.FC = () => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsAnswered(false);
    setSelectedAnswer(null);
    try {
      const dailyQuestion = await getDailyQuestion();
      setQuestion(dailyQuestion);
    } catch (err) {
      setError('ചോദ്യം ലഭിക്കുന്നതിൽ പിഴവ് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-gray-100 hover:bg-blue-100 text-gray-700';
    }
    if (index === question?.correctAnswerIndex) {
      return 'bg-green-200 text-green-800 border-green-400';
    }
    if (index === selectedAnswer) {
      return 'bg-red-200 text-red-800 border-red-400';
    }
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
       <div className="flex items-center space-x-3 mb-4">
            <LightBulbIcon className="h-7 w-7 text-yellow-400" />
            <h4 className="text-xl font-bold text-gray-800">ദിവസേനയുള്ള ക്വിസ്</h4>
        </div>

      {loading && <div className="text-center text-gray-500">ചോദ്യം ലോഡ് ചെയ്യുന്നു...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {question && !loading && !error && (
        <div className="space-y-4">
          <p className="font-semibold text-lg text-gray-700">{question.question}</p>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${getButtonClass(index)}`}
              >
                <span>{option}</span>
                {isAnswered && index === question.correctAnswerIndex && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                {isAnswered && index === selectedAnswer && index !== question.correctAnswerIndex && <XCircleIcon className="h-5 w-5 text-red-600" />}
              </button>
            ))}
          </div>
          {isAnswered && (
             <button
              onClick={fetchQuestion}
              className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
            >
              അടുത്ത ചോദ്യം
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizWidget;