import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { ArrowRight, Cpu, Server, Calculator, CheckCircle2 } from 'lucide-react';
import { calculateHardwareMatch } from '../features/hardware-matcher/utils/memoryMath';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { Helmet } from 'react-helmet-async';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTab } = useAppStore();

  const handleNavigate = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Mini Demo 1: Hardware Analyzer Slider
  const [modelSize, setModelSize] = useState<number>(7); // 7B params
  const [quantization, setQuantization] = useState<number>(4); // 4-bit
  const [contextLength] = useState<number>(4096);
  
  const hwMatchResult = calculateHardwareMatch({
    gpuVramGb: 24, // Assuming a 24GB GPU for the demo
    gpuMemoryBandwidthGbps: 1008, // Example RTX 4090 bandwidth
    parametersBillion: modelSize,
    bitsPerWeight: quantization,
    targetSequenceLength: contextLength
  });

  // Mini Demo 2: Cloud Pricing Data
  const { data: cloudModels } = useQuery({
    queryKey: ['demo-cloud-models'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cloud_models').select('*').limit(3);
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="flex flex-col gap-24 pb-24">
      <Helmet>
        <title>GPURunner | AI Hardware & Cost Optimizer</title>
        <meta name="description" content="The ultimate toolkit for AI engineers. Calculate VRAM requirements, build local rigs, and compare cloud API pricing." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white dark:from-surface-900 dark:to-surface-800 -z-10" />
        <div className="absolute top-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Stop Guessing.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-400">
                Start Optimizing.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The ultimate toolkit for AI engineers. Calculate precise VRAM requirements, build cost-effective local rigs, and compare cloud API pricing in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => handleNavigate('matcher', '/?tab=matcher')}
                className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 group"
              >
                Analyze Hardware
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => handleNavigate('cloud', '/?tab=cloud')}
                className="px-8 py-4 bg-white dark:bg-surface-800 text-slate-800 dark:text-white border border-slate-200 dark:border-surface-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-xl font-semibold transition-all shadow-sm"
              >
                Compare Cloud Costs
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Three Tools, One Workflow</h2>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to deploy LLMs cost-effectively.</p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Tool Card 1 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-surface-800 p-8 rounded-2xl border border-slate-200 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={() => handleNavigate('matcher', '/?tab=matcher')}>
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="text-brand-600 dark:text-brand-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Hardware Analyzer</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Calculate exact VRAM requirements based on model parameters, quantization, and context length.</p>
            
            {/* Interactive Demo */}
            <div className="bg-slate-50 dark:bg-surface-900 p-4 rounded-xl border border-slate-100 dark:border-surface-700 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Model Size ({modelSize}B)</span>
                </div>
                <input type="range" min="1" max="70" value={modelSize} onChange={e => setModelSize(Number(e.target.value))} className="w-full accent-brand-500" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Quantization ({quantization}-bit)</span>
              </div>
              <input type="range" min="2" max="16" value={quantization} onChange={e => setQuantization(Number(e.target.value))} className="w-full accent-brand-500" />
              <div className="flex justify-between items-center bg-white dark:bg-surface-800 p-2 rounded-lg text-sm border border-slate-200 dark:border-surface-700 mt-2">
                <span className="font-medium dark:text-white">Required VRAM:</span>
                <span className={`font-bold ${hwMatchResult.status === 'VRAM_FIT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {hwMatchResult.totalRequiredGb.toFixed(1)} GB
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tool Card 2 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-surface-800 p-8 rounded-2xl border border-slate-200 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={() => handleNavigate('builder', '/?tab=builder')}>
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Server className="text-purple-600 dark:text-purple-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Rig Configurator</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Mix and match GPUs, plan PCIe lanes, and optimize for multi-GPU inference workloads.</p>
            
            {/* Mockup Demo */}
            <div className="bg-slate-50 dark:bg-surface-900 p-4 rounded-xl border border-slate-100 dark:border-surface-700 space-y-2">
              <div className="flex justify-between items-center bg-white dark:bg-surface-800 p-2 rounded-lg text-xs border border-slate-200 dark:border-surface-700">
                <span className="font-medium dark:text-white">RTX 4090 (24GB)</span>
                <span className="text-slate-500">$1,599</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-surface-800 p-2 rounded-lg text-xs border border-slate-200 dark:border-surface-700">
                <span className="font-medium dark:text-white">RTX 3090 (24GB)</span>
                <span className="text-slate-500">$850</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-surface-700 flex justify-between font-bold text-sm dark:text-white">
                <span>Total Pool:</span>
                <span>48 GB</span>
              </div>
            </div>
          </motion.div>

          {/* Tool Card 3 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-surface-800 p-8 rounded-2xl border border-slate-200 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={() => handleNavigate('cloud', '/?tab=cloud')}>
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calculator className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Cloud Pricing</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Compare API costs across providers. Stop overpaying for token generation.</p>
            
            {/* Live Data Demo */}
            <div className="bg-slate-50 dark:bg-surface-900 p-4 rounded-xl border border-slate-100 dark:border-surface-700 space-y-2">
              {cloudModels ? cloudModels.map((model: any) => (
                <div key={model.id} className="flex justify-between items-center bg-white dark:bg-surface-800 p-2 rounded-lg text-xs border border-slate-200 dark:border-surface-700">
                  <span className="font-medium dark:text-white truncate pr-2">{model.provider_name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${model.price_per_1m_output}/1M</span>
                </div>
              )) : (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-slate-200 dark:bg-surface-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-surface-700 rounded"></div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 dark:bg-black py-20 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-brand-400 mb-2">150+</div>
              <div className="text-slate-400">GPUs Tracked</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-purple-400 mb-2">30+</div>
              <div className="text-slate-400">Cloud APIs</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-emerald-400 mb-2">Real-time</div>
              <div className="text-slate-400">Pricing Updates</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-blue-400 mb-2">Open</div>
              <div className="text-slate-400">Source Tools</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-brand-600 to-blue-700 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Ready to optimize your AI infrastructure?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => handleNavigate('matcher', '/?tab=matcher')}
              className="px-8 py-3 bg-white text-brand-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2"
            >
              <CheckCircle2 size={18} />
              Start Sizing Models
            </button>
            <button 
              onClick={() => handleNavigate('cloud', '/?tab=cloud')}
              className="px-8 py-3 bg-brand-700/50 hover:bg-brand-800/50 text-white border border-brand-400/30 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2"
            >
              Compare API Prices
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
