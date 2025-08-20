
import React from 'react';
import { StarIcon } from './icons/StarIcon';

const ProBadge: React.FC = () => {
    return (
        <span className="flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <StarIcon className="h-3 w-3 text-amber-500" />
            <span>PRO</span>
        </span>
    );
};

export default ProBadge;
