
import React from 'react';

interface IconProps {
    className?: string;
}

export const DocumentChartBarIcon: React.FC<IconProps> = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4M16 16l-4-4m0 0l-4 4m4-4V4" />
        </svg>
    );
};