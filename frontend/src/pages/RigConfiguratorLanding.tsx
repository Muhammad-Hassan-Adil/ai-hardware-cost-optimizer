import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Server, Wrench, Zap, Link } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const RigConfiguratorLanding: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunch = (tool?: string) => {
    navigate(tool ? `/rig-configurator/${tool}` : '/rig-configurator/tool');
  };

  const features = [
    {
      title: 'Build Your Rig',
      desc: 'Mix and match GPUs in a visual builder to see your total VRAM pool and cost.',
      icon: <Wrench className="text-purple-500" size={24} />,
      active: true,
      action: () => handleLaunch()
    },
    {
      title: 'Power & Cost',
      desc: 'Estimate wattage requirements and electricity costs for 24/7 inference.',
      icon: <Zap className="text-yellow-500" size={24} />,
      active: true,
      action: () => handleLaunch('power')
    },
    {
      title: 'Share Config',
      desc: 'Generate a unique link to share your planned rig with others for feedback.',
      icon: <Link className="text-blue-500" size={24} />,
      active: true,
      action: () => handleLaunch('share')
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      <Helmet>
        <title>Rig Configurator — Build Your AI Workstation | GPURunner</title>
        <meta name="description" content="Plan your multi-GPU setup. Optimize for PCIe lanes, power delivery, and total cost of ownership." />
        <link rel="canonical" href="https://gpurunner.com/rig-configurator" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Rig Configurator",
          "url": "https://gpurunner.com/rig-configurator",
          "description": "Plan your multi-GPU setup. Optimize for PCIe lanes, power delivery, and total cost of ownership.",
          "applicationCategory": "DeveloperApplication"
        })}</script>
      </Helmet>
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <Server className="text-purple-600 dark:text-purple-400" size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Rig Configurator</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Plan your multi-GPU setup. Optimize for PCIe lanes, power delivery, and total cost of ownership.
        </p>
        <button 
          onClick={() => handleLaunch()}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all"
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
            transition={{ delay: i * 0.1 }}
            onClick={f.active ? f.action : undefined}
            className={`p-6 rounded-2xl border ${f.active ? 'bg-white dark:bg-surface-800 border-slate-200 dark:border-surface-700 hover:border-purple-500 hover:shadow-lg cursor-pointer' : 'bg-slate-50 dark:bg-surface-900 border-slate-100 dark:border-surface-800 opacity-60'} transition-all relative`}
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
