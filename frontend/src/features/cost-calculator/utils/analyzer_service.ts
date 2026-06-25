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

export async function analyzePrompt(prompt: string, imageCount: number): Promise<PromptAnalysisResult> {
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
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_GROQ_MODEL ?? "qwen/qwen3-32b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq responded with status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    if (!content) {
      throw new Error("No content returned from Groq");
    }

    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
      
    const parsed: PromptAnalysisResult = JSON.parse(cleaned);
    
    // Minimal validation
    if (!parsed.subtasks || typeof parsed.total_output_tokens !== 'number') {
      throw new Error("Invalid structure returned from Groq");
    }

    return parsed;
  } catch (error) {
    console.error("Failed to analyze prompt with Groq:", error);
    throw error;
  }
}
