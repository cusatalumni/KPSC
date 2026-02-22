
import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'transparent' | 'dark';
}

export const LogoIcon: React.FC<LogoProps> = ({ className, variant = 'transparent' }) => {
    // Note: Assuming logo files are named logo-transparent.png and logo-dark.png in the root
    const logoSrc = variant === 'transparent' ? '/logo-transparent.png' : '/logo-dark.png';
    
    return (
        <div className={`${className} flex items-center justify-center overflow-hidden`}>
            <img 
                src={logoSrc} 
                alt="PSC Guidance Kerala Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://raw.githubusercontent.com/cusatalumni/KPSC/main/logo-transparent.png'; // Example fallback or hide
                    target.onerror = null;
                }}
            />
        </div>
    );
};
