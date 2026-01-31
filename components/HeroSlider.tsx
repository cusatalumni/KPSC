
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
            imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop'
        },
        {
            titleKey: 'heroSlider.slide2.title',
            descriptionKey: 'heroSlider.slide2.description',
            ctaKey: 'heroSlider.slide2.cta',
            ctaTarget: 'mock_test_home' as Page,
            imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop'
        },
        {
            titleKey: 'heroSlider.slide3.title',
            descriptionKey: 'heroSlider.slide3.description',
            ctaKey: 'heroSlider.slide3.cta',
            ctaTarget: 'psc_live_updates' as Page,
            imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop'
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
        <section className="relative h-[400px] md:h-80 w-full overflow-hidden rounded-[2.5rem] shadow-2xl premium-shadow">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    style={{ backgroundImage: `url(${slide.imageUrl})` }}
                >
                    {/* Rich Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent"></div>
                    
                    <div className="relative w-full h-full flex items-center justify-start text-left p-12">
                         <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight animate-fade-in-up" style={{ animationDelay: `${currentSlide === index ? '0.2s' : '0s'}` }}>
                                {t(slide.titleKey)}
                            </h2>
                            <p className="text-lg text-slate-200 mb-8 font-medium opacity-90 animate-fade-in-up" style={{ animationDelay: `${currentSlide === index ? '0.4s' : '0s'}` }}>
                                {t(slide.descriptionKey)}
                            </p>
                            <button
                                onClick={() => onNavigate(slide.ctaTarget)}
                                className="bg-white text-slate-900 font-black px-10 py-4 rounded-2xl shadow-xl hover:bg-indigo-600 hover:text-white transform transition-all duration-300 text-lg animate-fade-in-up"
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
                className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 p-3 rounded-2xl shadow-md transition-all z-20"
                aria-label="Previous Slide"
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
                onClick={goToNext}
                className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 p-3 rounded-2xl shadow-md transition-all z-20"
                aria-label="Next Slide"
            >
                <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 left-12 flex space-x-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 transition-all duration-300 rounded-full ${currentSlide === index ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;
