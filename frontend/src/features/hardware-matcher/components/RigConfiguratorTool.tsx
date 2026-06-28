import React from 'react';
import { HardwareBuilder } from './HardwareBuilder';
import { VRAMBarGraph } from './VRAMBarGraph';
import { AutoRecommender } from './AutoRecommender';
import { useHardwareMatcher } from '../hooks/useHardwareMatcher';

export const RigConfiguratorTool: React.FC = () => {
  const { request: hwRequest, result: hwResult, hardwareItems, addHardwareItem, updateHardwareItem, removeHardwareItem } = useHardwareMatcher();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <HardwareBuilder 
          hardwareItems={hardwareItems}
          addHardwareItem={addHardwareItem}
          updateHardwareItem={updateHardwareItem}
          removeHardwareItem={removeHardwareItem}
          totalVram={hwRequest.gpuVramGb}
        />
      </div>
      <div className="space-y-6">
        <VRAMBarGraph result={hwResult} />
        <AutoRecommender baseHardware={hwRequest} />
      </div>
    </div>
  );
};
