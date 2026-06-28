import React from 'react';
import { GPUSelector } from './GPUSelector';
import { ModelSelector } from './ModelSelector';
import { VRAMBarGraph } from './VRAMBarGraph';
import { PerformanceEstimator } from './PerformanceEstimator';
import { useHardwareMatcher } from '../hooks/useHardwareMatcher';

export const HardwareAnalyzerTool: React.FC = () => {
  const { request: hwRequest, updateRequest: updateHwRequest, result: hwResult } = useHardwareMatcher();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <GPUSelector request={hwRequest} updateRequest={updateHwRequest} />
        <ModelSelector request={hwRequest} updateRequest={updateHwRequest} />
      </div>
      <div className="space-y-6">
        <VRAMBarGraph result={hwResult} />
        <PerformanceEstimator result={hwResult} />
      </div>
    </div>
  );
};
