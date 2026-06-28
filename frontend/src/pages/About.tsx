import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const About: React.FC = () => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6 text-slate-700 dark:text-slate-300"
    >
      <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer">
        <ArrowLeft size={18} /> Back
      </button>
      
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">About Us</h1>
      
      <div className="space-y-4 bg-white dark:bg-slate-900/40 p-8 rounded-2xl backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p>
          Welcome to the <strong>GPURunner</strong>. Our mission is to demystify the hardware requirements 
          for running Large Language Models (LLMs) locally, and to provide transparent, dynamic cost comparisons for running those 
          models in the cloud.
        </p>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Why We Built This</h2>
        <p>
          The AI landscape is evolving rapidly. Developers, researchers, and hobbyists often struggle to determine if their 
          hardware can handle the latest models, or if it makes more financial sense to use a cloud API provider. 
          We built this tool to bridge that gap, providing a clear, interactive way to estimate VRAM requirements and compare API costs.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Our Technology</h2>
        <p>
          We use real-time data to estimate the optimal quantization and context length configurations for hundreds of open-source models. 
          By cross-referencing your hardware specifications with our dynamic model catalog, we provide actionable recommendations 
          that ensure maximum performance without running out of memory.
        </p>
      </div>
    </motion.div>
  );
};
