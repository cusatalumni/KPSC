import React from 'react';

const AiBadge: React.FC = () => {
    return (
        <span className="ml-2 bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
           നിർമ്മിതബുദ്ധിയാൽ ശാക്തീകരിക്കപ്പെട്ടതു !  AI POWERED
        </span>
    );
};

export default AiBadge;
