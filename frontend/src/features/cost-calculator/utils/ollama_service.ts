export interface Subtask {
  name: string;
  type: "extraction" | "summarization" | "generation" | 
        "reasoning" | "vision" | "formatting" | "rewriting";
  units: number;
  output_tokens_per_unit: number;
  notes: string;
}

export interface PromptAnalysisResult {
  subtasks: Subtask[];
  total_output_tokens: number;
  reasoning_required: boolean;
  vision_required: boolean;
  confidence: number;
}

export async function analyzePromptWithOllama(prompt: string, imageCount: number): Promise<PromptAnalysisResult> {
  const model = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2:3b';
  
  const systemPrompt = `You are an expert prompt estimator and task decomposer.
Your job is to analyze the user's prompt (which includes ${imageCount} images) and break it down into a list of subtasks as if you were going to complete the task yourself.

You MUST return a raw JSON object with exactly the following structure, and NO markdown formatting or other text:
{
  "subtasks": [
    {
      "name": "string",
      "type": "extraction|summarization|generation|reasoning|vision|formatting|rewriting",
      "units": 1,
      "output_tokens_per_unit": 100,
      "notes": "string"
    }
  ],
  "total_output_tokens": 100,
  "reasoning_required": false,
  "vision_required": false,
  "confidence": 0.95
}

For "type", ONLY use the exact string literals specified.
"units" is the number of times this subtask is performed (e.g., 5 files to summarize = 5 units).
"output_tokens_per_unit" is your best estimate of the tokens generated per unit.
"total_output_tokens" should equal the sum of (units * output_tokens_per_unit) for all subtasks.
If image count is > 0, you must include a "vision" subtask and set vision_required to true.
`;

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt || "Empty prompt" }
        ],
        stream: false,
        format: "json",
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content;
    
    if (!content) {
      throw new Error("No content returned from Ollama");
    }

    const parsed: PromptAnalysisResult = JSON.parse(content);
    
    // Minimal validation
    if (!parsed.subtasks || typeof parsed.total_output_tokens !== 'number') {
      throw new Error("Invalid structure returned from Ollama");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to analyze prompt with Ollama:", error);
    throw error;
  }
}
