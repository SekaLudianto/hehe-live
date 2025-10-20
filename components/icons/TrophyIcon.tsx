import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v-4m-4 4h-2a2 2 0 01-2-2V10a2 2 0 012-2h2v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v4" />
    </svg>
  );
};
