import React from 'react';
import { motion } from 'framer-motion';

export const TermsOfService: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6 text-slate-700 dark:text-slate-300"
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Terms of Service</h1>
      
      <div className="space-y-4 bg-white dark:bg-slate-900/40 p-8 rounded-2xl backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          Welcome to the AI Hardware & Cost Optimizer Hub.
        </p>
        <p>
          By accessing this website, we assume you accept these terms and conditions. Do not continue to use the website 
          if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">License</h2>
        <p>
          Unless otherwise stated, we or our licensors own the intellectual property rights for all material on this website. 
          All intellectual property rights are reserved. You may access this from the website for your own personal use subjected 
          to restrictions set in these terms and conditions.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">User Data & Calculations</h2>
        <p>
          The hardware estimations, VRAM calculations, and cloud API cost comparisons provided on this website are for informational 
          purposes only. We strive to provide accurate, real-time data but do not guarantee absolute precision. Cloud provider pricing 
          and LLM memory requirements may fluctuate.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Disclaimer</h2>
        <p>
          To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website 
          and the use of this website. We will not be liable for any loss or damage of any nature arising from your reliance on the 
          estimations provided by our tools.
        </p>
      </div>
    </motion.div>
  );
};
