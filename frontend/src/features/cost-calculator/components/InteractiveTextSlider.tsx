import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { estimateTokens } from '../utils/tokenEstimator';

interface InteractiveTextSliderProps {
  promptTokens: number;
  setPromptTokens: (v: number) => void;
  completionTokens: number;
  setCompletionTokens: (v: number) => void;
}

export const InteractiveTextSlider: React.FC<InteractiveTextSliderProps> = ({
  promptTokens, setPromptTokens, completionTokens, setCompletionTokens
}) => {
  const [text, setText] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const estimated = estimateTokens(newText);
    if (estimated > 0) {
      setPromptTokens(estimated);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Token Estimation</h3>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Paste your prompt to estimate tokens:</label>
        <textarea
          rows={4}
          value={text}
          onChange={handleTextChange}
          className="block p-2.5 w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paste some text here..."
        ></textarea>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-6">
        <Slider
          label="Input Tokens (Prompt)"
          min={1} max={128000} step={100}
          value={promptTokens}
          onChange={setPromptTokens}
        />
        
        <Slider
          label="Output Tokens (Completion)"
          min={1} max={32000} step={100}
          value={completionTokens}
          onChange={setCompletionTokens}
        />
      </div>
    </Card>
  );
};
