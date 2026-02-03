
import React from 'react';

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.75a9 9 0 11-9-9c1.01 0 1.979.204 2.863.57a1.042 1.042 0 01.601 1.332 9.06 9.06 0 00-.57 2.863 10.5 10.5 0 0010.5 10.5c.291 0 .57-.024.843-.07a1.042 1.042 0 011.274 1.274c-.047.273-.07.552-.07.843z" />
  </svg>
);
