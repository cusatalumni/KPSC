import React from 'react';
import { TESTIMONIALS_DATA } from '../constants';
import { QuoteIcon } from './icons/QuoteIcon';

const Testimonials: React.FC = () => {
  return (
    <section className="py-12 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
          വിജയികളുടെ വാക്കുകൾ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((testimonial) => (
            <div key={testimonial.id} className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col items-center text-center">
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-white shadow-md"
              />
              <div className="relative">
                <QuoteIcon className="absolute -top-2 -left-4 w-8 h-8 text-indigo-200" />
                <p className="text-slate-600 italic mb-4 z-10 relative">"{testimonial.quote}"</p>
              </div>
              <div className="mt-auto">
                <h4 className="font-bold text-lg text-slate-900">{testimonial.name}</h4>
                <p className="text-sm text-indigo-600 font-medium">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
