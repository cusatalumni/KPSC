import React from 'react';

interface IconProps {
    className?: string;
}

export const LogoIcon: React.FC<IconProps> = ({ className }) => {
    return (
        <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" strokeWidth="3">
                {/* Concentric rings */}
                <circle cx="50" cy="50" r="48" stroke="#042f2e" strokeOpacity="0.8" />
                <circle cx="50" cy="50" r="42" stroke="#042f2e" strokeOpacity="0.9" />
                <circle cx="50" cy="50" r="36" stroke="#059669" strokeOpacity="0.7" />
            </g>
            
            {/* Central swirl - using two paths */}
            <path 
                d="M 68 32 A 30 30 0 0 0 32 68 C 50 75, 75 50, 68 32 Z"
                fill="#16a34a"
            />
            <path 
                d="M 32 68 A 30 30 0 0 1 68 32 C 50 25, 25 50, 32 68 Z"
                fill="#86efac"
            />
             {/* Small leaf highlight */}
            <path 
                d="M 35, 65 C 40,55 55,50 60,55 C 62,60 55,65 48,68 Z" 
                fill="#ffffff" 
                fillOpacity="0.9"
            />
        </svg>
    );
};
