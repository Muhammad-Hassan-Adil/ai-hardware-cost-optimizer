import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-6xl mx-auto py-8 px-6 mt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} AI Hardware & Cost Optimizer Hub. All rights reserved.
        </div>
        <nav className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            About
          </Link>
          <Link to="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
};
