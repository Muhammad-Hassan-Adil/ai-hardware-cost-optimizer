import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { useHardwareMatcher } from '../hooks/useHardwareMatcher';
import { Copy, Check, Upload } from 'lucide-react';

export const ShareConfig: React.FC = () => {
  const { hardwareItems } = useHardwareMatcher();
  const [copied, setCopied] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  const generateShareUrl = () => {
    const config = {
      version: 1,
      items: hardwareItems.map(item => ({
        type: item.type,
        name: item.name,
        vramGb: item.vramGb,
        bandwidthGbps: item.bandwidthGbps,
        systemRamGb: item.systemRamGb,
      }))
    };
    
    const encoded = btoa(JSON.stringify(config));
    const url = new URL(window.location.href);
    url.pathname = '/rig-configurator/share';
    url.search = '';
    url.searchParams.set('cfg', encoded);
    
    return url.toString();
  };

  const shareUrl = generateShareUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importUrl) return;
    try {
      const url = new URL(importUrl);
      const cfg = url.searchParams.get('cfg');
      if (cfg) {
        window.location.href = importUrl;
      } else {
        alert('Invalid share link: Missing configuration data.');
      }
    } catch {
      alert('Invalid URL format.');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Share Configuration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Your Rig Configuration</h4>
            
            <ul className="space-y-2 mb-6">
              {hardwareItems.map(item => (
                <li key={item.id} className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                  {item.type === 'gpu' 
                    ? ` (${item.vramGb}GB, ${item.bandwidthGbps} GB/s)`
                    : ` (${item.systemRamGb}GB, ${item.bandwidthGbps} GB/s)`
                  }
                </li>
              ))}
              {hardwareItems.length === 0 && (
                <li className="text-sm text-slate-500 italic">No hardware added yet.</li>
              )}
            </ul>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Share Link'}
            </button>
            
            <div className="mt-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <p className="text-xs text-slate-500 truncate font-mono select-all">
                {shareUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Import a Config</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Paste a share link below to load someone else's rig configuration.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://gpurunner.com/rig-configurator/share?cfg=..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Upload size={16} /> Load
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
