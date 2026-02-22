
import React from 'react';

interface IconProps {
    className?: string;
}

export const TrophyIcon: React.FC<IconProps> = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.05-4.326 9.75 9.75 0 0115.9 0 9.753 9.753 0 01-1.05 4.326zM5.25 9.75a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm0 0A2.25 2.25 0 003 12v3.75a.75.75 0 001.5 0V12a2.25 2.25 0 00-1.5-2.25zm13.5 0a2.25 2.25 0 00-1.5 2.25v3.75a.75.75 0 001.5 0V12a2.25 2.25 0 00-1.5-2.25z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25V18.75m-3.75-9.75a3 3 0 116 0 3 3 0 01-6 0z" />
        </svg>
    );
};
