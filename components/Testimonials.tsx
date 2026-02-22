
import React, { useMemo } from 'react';
import { TESTIMONIALS_DATA } from '../constants';
import { QuoteIcon } from './icons/QuoteIcon';

const Testimonials: React.FC = () => {
  // Shuffle testimonials on component load
  const shuffledTestimonials = useMemo(() => {
    return [...TESTIMONIALS_DATA].sort(() => 0.5 - Math.random());
  }, []);

  return (
    <section className="py-12 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
          വിജയികളുടെ വാക്കുകൾ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {shuffledTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center group hover:border-indigo-400 transition-all hover:shadow-xl">
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-white shadow-md group-hover:scale-110 transition-transform"
              />
              <div className="relative">
                <QuoteIcon className="absolute -top-2 -left-4 w-8 h-8 text-indigo-100" />
                <p className="text-slate-600 italic mb-4 z-10 relative line-clamp-4">"{testimonial.quote}"</p>
              </div>
              <div className="mt-auto">
                <h4 className="font-black text-lg text-slate-900 leading-tight">{testimonial.name}</h4>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
