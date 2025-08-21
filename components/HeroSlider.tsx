import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import type { Page } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface HeroSliderProps {
    onNavigate: (page: Page) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            titleKey: 'heroSlider.slide1.title',
            descriptionKey: 'heroSlider.slide1.description',
            ctaKey: 'heroSlider.slide1.cta',
            ctaTarget: 'quiz_home' as Page,
            bgColor: 'from-indigo-100 to-blue-100'
        },
        {
            titleKey: 'heroSlider.slide2.title',
            descriptionKey: 'heroSlider.slide2.description',
            ctaKey: 'heroSlider.slide2.cta',
            ctaTarget: 'mock_test_home' as Page,
            bgColor: 'from-teal-100 to-green-100'
        },
        {
            titleKey: 'heroSlider.slide3.title',
            descriptionKey: 'heroSlider.slide3.description',
            ctaKey: 'heroSlider.slide3.cta',
            ctaTarget: 'psc_live_updates' as Page,
            bgColor: 'from-slate-100 to-gray-200'
        },
    ];

    const goToNext = useCallback(() => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const goToPrev = () => {
        setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const timer = setTimeout(goToNext, 7000); // Auto-slide every 7 seconds
        return () => clearTimeout(timer);
    }, [currentSlide, goToNext]);

    return (
        <section className="relative h-96 md:h-80 w-full overflow-hidden rounded-2xl shadow-lg">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className={`w-full h-full bg-gradient-to-br ${slide.bgColor} flex items-center justify-center text-center p-6`}>
                         <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold text-slate-800 mb-3 animate-fade-in-up" style={{ animationDelay: `${currentSlide === index ? '0.2s' : '0s'}` }}>
                                {t(slide.titleKey)}
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 animate-fade-in-up" style={{ animationDelay: `${currentSlide === index ? '0.4s' : '0s'}` }}>
                                {t(slide.descriptionKey)}
                            </p>
                            <button
                                onClick={() => onNavigate(slide.ctaTarget)}
                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out text-lg animate-fade-in-up"
                                style={{ animationDelay: `${currentSlide === index ? '0.6s' : '0s'}` }}
                            >
                                {t(slide.ctaKey)}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={goToPrev}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/50 hover:bg-white text-slate-700 p-2 rounded-full shadow-md transition"
                aria-label="Previous Slide"
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
                onClick={goToNext}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/50 hover:bg-white text-slate-700 p-2 rounded-full shadow-md transition"
                aria-label="Next Slide"
            >
                <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-indigo-600 scale-125' : 'bg-white/70 hover:bg-white'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;
