import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, BarChart2, Clock, Battery } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const CloudPricingLanding: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunch = (tool?: string) => {
    navigate(tool ? `/cloud-pricing/${tool}` : '/cloud-pricing/tool');
  };

  const features = [
    {
      title: 'API Cost Calculator',
      desc: 'Compare provider costs across millions of tokens generated.',
      icon: <Calculator className="text-emerald-500" size={24} />,
      active: true,
      action: () => handleLaunch()
    },
    {
      title: 'Compare Models',
      desc: 'Compare cost and capabilities across multiple leading models.',
      icon: <BarChart2 className="text-blue-500" size={24} />,
      active: true,
      action: () => handleLaunch('compare')
    },
    {
      title: 'Batch vs Realtime',
      desc: 'Calculate potential savings from batch processing API endpoints.',
      icon: <Clock className="text-indigo-500" size={24} />,
      active: true,
      action: () => handleLaunch('batch')
    },
    {
      title: 'Budget Calculator',
      desc: 'See how many tokens you can generate on a fixed monthly budget.',
      icon: <Battery className="text-green-500" size={24} />,
      active: true,
      action: () => handleLaunch('budget')
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      <Helmet>
        <title>Cloud AI Pricing — Compare API Costs | GPURunner</title>
        <meta name="description" content="Compare API costs across providers. Stop overpaying for token generation." />
        <link rel="canonical" href="https://gpurunner.com/cloud-pricing" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Cloud AI Pricing",
          "url": "https://gpurunner.com/cloud-pricing",
          "description": "Compare API costs across providers. Stop overpaying for token generation.",
          "applicationCategory": "DeveloperApplication"
        })}</script>
      </Helmet>
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <Calculator className="text-emerald-600 dark:text-emerald-400" size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Cloud Pricing</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Stop overpaying for tokens. Find the cheapest API providers for your favorite models in real-time.
        </p>
        <button 
          onClick={() => handleLaunch()}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all"
        >
          Launch Tool
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={f.active ? f.action : undefined}
            className={`p-6 rounded-2xl border ${f.active ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-lg cursor-pointer' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'} transition-all relative flex flex-col`}
          >
            <div className="mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
