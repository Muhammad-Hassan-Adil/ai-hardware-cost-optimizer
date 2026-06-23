from pydantic import BaseModel
from typing import Literal

class HardwareMatchRequest(BaseModel):
    gpu_vram_gb: float
    gpu_memory_bandwidth_gb_s: float
    system_ram_gb: float = 32.0
    system_ram_bandwidth_gb_s: float = 60.0 # Default DDR5 approx
    
    parameters_billion: float
    bits_per_weight: float
    target_sequence_length: int = 2048

class HardwareMatchResponse(BaseModel):
    status: Literal["VRAM_FIT", "SYSTEM_OFFLOAD", "OUT_OF_MEMORY"]
    m_weights_gb: float
    m_cache_gb: float
    total_required_gb: float
    vram_available_gb: float
    gpu_weight_fraction: float
    estimated_tokens_per_second: float

def calculate_hardware_match(req: HardwareMatchRequest) -> HardwareMatchResponse:
    # 1. Total Weight Footprint (M_weights)
    # Parameters (Billion) * (Bits-per-weight / 8) * 1.15 (System Overhead Allowance)
    m_weights = req.parameters_billion * (req.bits_per_weight / 8.0) * 1.15

    # 2. Context Memory KV-Cache (M_cache)
    # Simplification: Parameters * 0.1 * (target sequence length / 2048)
    m_cache = req.parameters_billion * 0.1 * (req.target_sequence_length / 2048.0)

    total_required = m_weights + m_cache
    vram_avail = max(0.0, req.gpu_vram_gb - 1.5) # OS and UI allocation overhead

    if total_required <= vram_avail:
        status = "VRAM_FIT"
        f_gpu = 1.0
    elif total_required > vram_avail + req.system_ram_gb:
        status = "OUT_OF_MEMORY"
        f_gpu = vram_avail / total_required if total_required > 0 else 0
    else:
        status = "SYSTEM_OFFLOAD"
        f_gpu = vram_avail / total_required if total_required > 0 else 0

    # Ensure f_gpu is clamped between 0 and 1
    f_gpu = max(0.0, min(1.0, f_gpu))
    
    # Weights allocation
    weights_on_gpu = m_weights * f_gpu
    weights_on_ram = m_weights * (1.0 - f_gpu)

    # 4. Estimated Token Speed Calculation
    time_gpu = weights_on_gpu / req.gpu_memory_bandwidth_gb_s if req.gpu_memory_bandwidth_gb_s > 0 else float('inf')
    time_ram = weights_on_ram / req.system_ram_bandwidth_gb_s if req.system_ram_bandwidth_gb_s > 0 else float('inf')
    
    t_per_token = time_gpu + time_ram
    
    if status == "OUT_OF_MEMORY" or t_per_token <= 0:
        tokens_per_second = 0.0
    else:
        tokens_per_second = 1.0 / t_per_token

    return HardwareMatchResponse(
        status=status,
        m_weights_gb=round(m_weights, 2),
        m_cache_gb=round(m_cache, 2),
        total_required_gb=round(total_required, 2),
        vram_available_gb=round(vram_avail, 2),
        gpu_weight_fraction=round(f_gpu, 4),
        estimated_tokens_per_second=round(tokens_per_second, 2)
    )
