import os

def replace_in_file(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. SEOWrapper.tsx
path = "frontend/src/components/seo/SEOWrapper.tsx"
replace_in_file(path, "import { api } from '../../services/api';\n", "")
replace_in_file(path, "import { PSEOPage } from '../../types/database.types';", "")

# 2. PricingTable.tsx
path = "frontend/src/features/cost-calculator/components/PricingTable.tsx"
replace_in_file(path, "import { CloudModel }", "import type { CloudModel }")

# 3. ProviderFilter.tsx
path = "frontend/src/features/cost-calculator/components/ProviderFilter.tsx"
replace_in_file(path, "const formatted = data.map(p => ({ label: p.name, value: p.slug }));", "const formatted = data.map((p: any) => ({ label: p.name, value: p.slug }));")

# 4. useCostCalculator.ts
path = "frontend/src/features/cost-calculator/hooks/useCostCalculator.ts"
replace_in_file(path, "import { useState, useEffect } from 'react';", "import { useState } from 'react';")
replace_in_file(path, "import { api } from '../../../services/api';\n", "")
replace_in_file(path, "import { CloudModel }", "import type { CloudModel }")

# 5. GPUSelector.tsx
path = "frontend/src/features/hardware-matcher/components/GPUSelector.tsx"
replace_in_file(path, "import { HardwareMatchRequest } from '../hooks/useHardwareMatcher';", "import type { HardwareMatchRequest } from '../utils/memoryMath';")

# 6. ModelSelector.tsx
path = "frontend/src/features/hardware-matcher/components/ModelSelector.tsx"
replace_in_file(path, "import { HardwareMatchRequest } from '../hooks/useHardwareMatcher';", "import type { HardwareMatchRequest } from '../utils/memoryMath';")

# 7. PerformanceEstimator.tsx
path = "frontend/src/features/hardware-matcher/components/PerformanceEstimator.tsx"
replace_in_file(path, "import { HardwareMatchResult } from '../utils/memoryMath';", "import type { HardwareMatchResult } from '../utils/memoryMath';")

# 8. VRAMBarGraph.tsx
path = "frontend/src/features/hardware-matcher/components/VRAMBarGraph.tsx"
replace_in_file(path, "import { HardwareMatchResult } from '../utils/memoryMath';", "import type { HardwareMatchResult } from '../utils/memoryMath';")

# 9. useHardwareMatcher.ts
path = "frontend/src/features/hardware-matcher/hooks/useHardwareMatcher.ts"
replace_in_file(path, "import { HardwareMatchRequest, HardwareMatchResult, calculateHardwareMatch }", "import type { HardwareMatchRequest, HardwareMatchResult } from '../utils/memoryMath';\nimport { calculateHardwareMatch }")

# 10. api.ts
path = "frontend/src/services/api.ts"
replace_in_file(path, "import { GPU, LocalModel, HardwareMatchRequest, HardwareMatchResponse, CloudModel }", "import type { GPU, LocalModel, HardwareMatchRequest, HardwareMatchResponse }")

print("Fixed TS errors")
