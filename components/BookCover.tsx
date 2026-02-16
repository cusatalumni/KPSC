
import React from 'react';

interface BookCoverProps {
  title: string;
  author: string;
  imageUrl?: string;
  className?: string;
}

const getHashOfString = (str: string) => {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const StyleA: React.FC<{ title: string; author: string; color: { bg: string; pattern: string; text: string; } }> = ({ title, author, color }) => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 box-border overflow-hidden" style={{ backgroundColor: color.bg, color: color.text }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundColor: color.pattern, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
             <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
                <defs>
                    <pattern id="psc-pattern-a" patternUnits="userSpaceOnUse" width="20" height="20">
                        <circle cx="10" cy="10" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#psc-pattern-a)" />
            </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest opacity-80 mb-2 font-black">PSC Rank File</span>
            <h4 className="font-black text-lg leading-tight mb-2 drop-shadow-sm line-clamp-4">{title}</h4>
            <div className="h-0.5 w-10 bg-white/30 my-2"></div>
            <p className="text-[10px] font-bold opacity-90">{author}</p>
        </div>
    </div>
);

const StyleB: React.FC<{ title: string; author: string; color: { bg: string; shape: string; text: string; } }> = ({ title, author, color }) => (
    <div className="relative w-full h-full flex flex-col justify-end text-left p-6 box-border overflow-hidden" style={{ backgroundColor: color.bg, color: color.text }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-50 mix-blend-multiply" style={{ backgroundColor: color.shape }}></div>
        <div className="relative z-10">
            <h4 className="font-black text-xl leading-none mb-2 line-clamp-4 drop-shadow-sm">{title}</h4>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-current opacity-50"></div>
                <span className="text-[10px] uppercase font-black tracking-tighter opacity-80">{author}</span>
            </div>
        </div>
    </div>
);

const BookCover: React.FC<BookCoverProps> = ({ title, author, imageUrl, className }) => {
  // Validate imageUrl: Must be a string, start with http, and not be a common placeholder
  const isValidUrl = (url: any): boolean => {
      if (typeof url !== 'string') return false;
      const cleanUrl = url.trim().toUpperCase();
      if (cleanUrl.length < 12) return false;
      if (!cleanUrl.startsWith('HTTP')) return false;
      if (cleanUrl.includes('NO IMG')) return false;
      if (cleanUrl.includes('EMPTY')) return false;
      if (cleanUrl.includes('UNDEFINED')) return false;
      if (cleanUrl.includes('NULL')) return false;
      return true;
  };

  if (isValidUrl(imageUrl)) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
            referrerPolicy="no-referrer"
            onError={(e) => {
                // If the image fails to load, trigger the procedural fallback by clearing the src
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                    target.parentElement.classList.add('broken-image-fallback');
                }
            }}
        />
      </div>
    );
  }

  // Procedural Logic for missing or invalid images
  const hash = getHashOfString(title);
  const styleIndex = Math.abs(hash) % 2;
  const colorIndex = Math.floor(Math.abs(hash) / 2) % 5;

  const colorsA = [
    { bg: '#4338ca', pattern: '#3730a3', text: '#ffffff' }, // Indigo
    { bg: '#0f766e', pattern: '#115e59', text: '#ffffff' }, // Teal
    { bg: '#334155', pattern: '#1e293b', text: '#ffffff' }, // Slate
    { bg: '#1e40af', pattern: '#1e3a8a', text: '#ffffff' }, // Blue
    { bg: '#b91c1c', pattern: '#991b1b', text: '#ffffff' }, // Red
  ];
  
  const colorsB = [
    { bg: '#dbeafe', shape: '#93c5fd', text: '#1e3a8a' }, // Blue
    { bg: '#d1fae5', shape: '#6ee7b7', text: '#064e3b' }, // Emerald
    { bg: '#ffe4e6', shape: '#fda4af', text: '#881337' }, // Rose
    { bg: '#ede9fe', shape: '#c4b5fd', text: '#4c1d95' }, // Violet
    { bg: '#fef3c7', shape: '#fcd34d', text: '#92400e' }, // Amber
  ];

  return (
    <div className={`shadow-md overflow-hidden ${className}`}>
      {styleIndex === 0 ? (
        <StyleA title={title} author={author} color={colorsA[colorIndex]} />
      ) : (
        <StyleB title={title} author={author} color={colorsB[colorIndex]} />
      )}
    </div>
  );
};

export default BookCover;
