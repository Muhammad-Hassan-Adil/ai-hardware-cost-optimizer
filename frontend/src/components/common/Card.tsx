import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  overflowHidden?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', overflowHidden = true }) => {
  return (
    <div className={`bg-white dark:bg-slate-900/80 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-300 ${overflowHidden ? 'overflow-hidden' : ''} ${className}`}>
      {children}
    </div>
  );
};
