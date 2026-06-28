import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, Search, Zap, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const HardwareAnalyzerLanding: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunch = (tool?: string) => {
    navigate(tool ? `/hardware-analyzer/${tool}` : '/hardware-analyzer/tool');
  };

  const features = [
    {
      title: 'Analyze Compatibility',
      desc: 'Check if your local setup has enough VRAM for that new LLaMA model.',
      icon: <Search className="text-brand-500" size={24} />,
      active: true,
      action: () => handleLaunch()
    },
    {
      title: 'Find Bottlenecks',
      desc: 'Analyze memory bandwidth vs compute constraints for your workflow.',
      icon: <Zap className="text-orange-500" size={24} />,
      active: true,
      action: () => handleLaunch('bottleneck')
    },
    {
      title: 'Upgrade Path Planner',
      desc: 'See the most cost-effective hardware upgrade for your specific needs.',
      icon: <TrendingUp className="text-emerald-500" size={24} />,
      active: true,
      action: () => handleLaunch('upgrade')
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      <Helmet>
        <title>Hardware Analyzer — Check GPU Compatibility for LLMs | GPURunner</title>
        <meta name="description" content="Check if your GPU can run any LLM. Calculate exact VRAM requirements based on model parameters, quantization level, and context length." />
        <link rel="canonical" href="https://gpurunner.com/hardware-analyzer" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "GPU Hardware Analyzer",
          "url": "https://gpurunner.com/hardware-analyzer",
          "description": "Check if your GPU can run any LLM. Calculate VRAM requirements based on model size, quantization, and context length.",
          "applicationCategory": "DeveloperApplication"
        })}</script>
      </Helmet>
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <Cpu className="text-brand-600 dark:text-brand-400" size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Hardware Analyzer</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Take the guesswork out of local AI deployments. Know exactly what hardware you need before you buy.
        </p>
        <button 
          onClick={() => handleLaunch()}
          className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/25 transition-all"
        >
          Launch Tool
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={f.active ? f.action : undefined}
            className={`p-6 rounded-2xl border ${f.active ? 'bg-white dark:bg-surface-800 border-slate-200 dark:border-surface-700 hover:border-brand-500 hover:shadow-lg cursor-pointer' : 'bg-slate-50 dark:bg-surface-900 border-slate-100 dark:border-surface-800 opacity-60'} transition-all relative`}
          >
            <div className="mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
