export interface HardwareMatchRequest {
  gpuVramGb: number;
  gpuMemoryBandwidthGbps: number;
  systemRamGb?: number;
  systemRamBandwidthGbps?: number;
  parametersBillion: number;
  bitsPerWeight: number;
  targetSequenceLength?: number;
}

export interface HardwareMatchResult {
  status: "VRAM_FIT" | "SYSTEM_OFFLOAD" | "OUT_OF_MEMORY";
  mWeightsGb: number;
  mCacheGb: number;
  totalRequiredGb: number;
  vramAvailableGb: number;
  gpuWeightFraction: number;
  estimatedTokensPerSecond: number;
}

export function calculateHardwareMatch(req: HardwareMatchRequest): HardwareMatchResult {
  const sysRam = req.systemRamGb ?? 32.0;
  const sysBandwidth = req.systemRamBandwidthGbps ?? 60.0;
  const seqLength = req.targetSequenceLength ?? 2048;

  const mWeights = req.parametersBillion * (req.bitsPerWeight / 8.0) * 1.15;

  const mCache = req.parametersBillion * 0.1 * (seqLength / 2048.0);

  const totalRequired = mWeights + mCache;
  const vramAvail = Math.max(0.0, req.gpuVramGb - 1.5); // OS overhead

  let status: "VRAM_FIT" | "SYSTEM_OFFLOAD" | "OUT_OF_MEMORY";
  let fGpu = 0.0;

  if (totalRequired <= vramAvail) {
    status = "VRAM_FIT";
    fGpu = 1.0;
  } else if (totalRequired > vramAvail + sysRam) {
    status = "OUT_OF_MEMORY";
    fGpu = totalRequired > 0 ? vramAvail / totalRequired : 0.0;
  } else {
    status = "SYSTEM_OFFLOAD";
    fGpu = totalRequired > 0 ? vramAvail / totalRequired : 0.0;
  }

  fGpu = Math.max(0.0, Math.min(1.0, fGpu));

  const weightsOnGpu = mWeights * fGpu;
  const weightsOnRam = mWeights * (1.0 - fGpu);

  const timeGpu = req.gpuMemoryBandwidthGbps > 0 ? weightsOnGpu / req.gpuMemoryBandwidthGbps : Infinity;
  const timeRam = sysBandwidth > 0 ? weightsOnRam / sysBandwidth : Infinity;

  const tPerToken = timeGpu + timeRam;

  let tokensPerSecond = 0.0;
  if (status !== "OUT_OF_MEMORY" && tPerToken > 0 && tPerToken !== Infinity) {
    tokensPerSecond = 1.0 / tPerToken;
  }

  return {
    status,
    mWeightsGb: parseFloat(mWeights.toFixed(2)),
    mCacheGb: parseFloat(mCache.toFixed(2)),
    totalRequiredGb: parseFloat(totalRequired.toFixed(2)),
    vramAvailableGb: parseFloat(vramAvail.toFixed(2)),
    gpuWeightFraction: parseFloat(fGpu.toFixed(4)),
    estimatedTokensPerSecond: parseFloat(tokensPerSecond.toFixed(2))
  };
}
