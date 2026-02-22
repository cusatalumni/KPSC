
import React from 'react';

interface IconProps {
    className?: string;
}

export const BeakerIcon: React.FC<IconProps> = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.443 2.216a2 2 0 002.103 1.57l3.962-.792a2 2 0 011.664 0l3.962.792a2 2 0 002.103-1.57l.443-2.216a2 2 0 00-.547-1.806z" />
        </svg>
    );
};
