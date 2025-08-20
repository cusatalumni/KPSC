
import React from 'react';
import { StarIcon } from './icons/StarIcon';

const ProBadge: React.FC = () => {
    return (
        <span className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <StarIcon className="h-3 w-3 text-indigo-500" />
            <span>PRO</span>
        </span>
    );
};

export default ProBadge;
