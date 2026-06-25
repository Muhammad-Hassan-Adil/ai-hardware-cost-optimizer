import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { analyzePromptWithOllama, type PromptAnalysisResult } from '../utils/ollama_service';
import type { ImageResolution } from '../utils/tokenizer_service';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PromptDecomposerProps {
  prompt: string;
  setPrompt: (p: string) => void;
  imageCount: number;
  setImageCount: (c: number) => void;
  imageResolution: ImageResolution;
  setImageResolution: (res: ImageResolution) => void;
  analysis: PromptAnalysisResult | null;
  setAnalysis: (res: PromptAnalysisResult | null) => void;
}

export const PromptDecomposer: React.FC<PromptDecomposerProps> = ({
  prompt, setPrompt, imageCount, setImageCount, imageResolution, setImageResolution, analysis, setAnalysis
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setOllamaError(null);
    try {
      const result = await analyzePromptWithOllama(prompt, imageCount);
      setAnalysis(result);
    } catch (err: any) {
      setOllamaError("Local model offline — output token estimates unavailable. Input costs are still exact.");
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Prompt Analysis</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Task Prompt
            </label>
            <textarea
              className="w-full h-32 p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your task in detail — include file counts, expected output format, and any constraints…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image Count
              </label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={imageCount}
                onChange={(e) => setImageCount(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image Resolution
              </label>
              <select
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={imageResolution}
                onChange={(e) => setImageResolution(e.target.value as ImageResolution)}
                disabled={imageCount === 0}
              >
                <option value="low">Low (512x512)</option>
                <option value="medium">Medium (1024x1024)</option>
                <option value="high">High (2048x2048)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !prompt.trim()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
          >
            {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : null}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
          </button>
        </div>

        {ollamaError && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{ollamaError}</p>
          </div>
        )}

        {analysis && !ollamaError && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">Decomposition Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-2">Subtask</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Units</th>
                    <th className="px-4 py-2 text-right">Est. Output Tokens</th>
                    <th className="px-4 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.subtasks.map((task, i) => (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{task.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                          {task.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{task.units}</td>
                      <td className="px-4 py-3 text-right">
                        {(task.units * task.output_tokens_per_unit).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs">{task.notes}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-900/50 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right text-slate-900 dark:text-white">Total Output Tokens</td>
                    <td className="px-4 py-3 text-right text-slate-900 dark:text-white">{analysis.total_output_tokens.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
