import React from 'react';

interface IconProps {
    className?: string;
}

export const MegaphoneIcon: React.FC<IconProps> = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.433 9.168-6l1 .5-1 .5c-1.543 3.567-4.057 6-9.168 6H7a4.001 4.001 0 01-1.564 7.683z" />
        </svg>
    );
};
