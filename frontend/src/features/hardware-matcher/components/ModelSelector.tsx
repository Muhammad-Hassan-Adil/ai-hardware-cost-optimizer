import React from 'react';
import { HardwareMatchRequest } from '../hooks/useHardwareMatcher';
import { Slider } from '../../../components/common/Slider';
import { Card } from '../../../components/common/Card';

interface ModelSelectorProps {
  request: HardwareMatchRequest;
  updateRequest: (updates: Partial<HardwareMatchRequest>) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ request, updateRequest }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Model Specifications</h3>
      
      <div className="space-y-6">
        <Slider
          label="Parameters"
          min={1} max={200} step={1}
          value={request.parametersBillion}
          onChange={(v) => updateRequest({ parametersBillion: v })}
          suffix=" B"
        />
        
        <Slider
          label="Quantization (Bits per Weight)"
          min={2} max={16} step={0.5}
          value={request.bitsPerWeight}
          onChange={(v) => updateRequest({ bitsPerWeight: v })}
          suffix=" bits"
        />
        
        <div className="pt-4 border-t border-slate-100">
          <Slider
            label="Context Length (Tokens)"
            min={1024} max={128000} step={1024}
            value={request.targetSequenceLength || 4096}
            onChange={(v) => updateRequest({ targetSequenceLength: v })}
            suffix=""
          />
        </div>
      </div>
    </Card>
  );
};
