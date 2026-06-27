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

const ANALYZER_SYSTEM_PROMPT = `You are a precise task decomposer for AI prompt cost estimation.

Your job is to analyze the user's prompt and break it down into the MINIMUM number of subtasks that fully describe the work — do not invent subtasks that were not explicitly requested.

Return a raw JSON object with NO markdown, no code fences, no explanation — only the JSON.

STRICT RULES you must follow without exception:
1. Only decompose what was explicitly asked. Do not add steps the user did not request.
2. "output_tokens_per_unit" must be 0 for any subtask whose output is an image, audio, or binary file. Only assign non-zero values to subtasks that produce TEXT output.
3. "units" must reflect the exact count mentioned in the prompt (e.g. "1000 pictures" = 1000 units for that subtask).
4. If image_count > 0, you must include exactly one "vision" subtask representing the act of processing those input images. Its output_tokens_per_unit should only be non-zero if the task explicitly asks for a text response per image (e.g. captions, descriptions, readings).
5. "total_output_tokens" must equal the exact sum of (units * output_tokens_per_unit) across all subtasks. Verify this arithmetic before returning.
6. Set "reasoning_required" to true only if the task involves multi-step logic, code generation, legal/medical reasoning, or complex decision-making.
7. Set "confidence" between 0 and 1 reflecting how unambiguous the prompt is. Vague prompts get lower confidence.

Return this exact JSON structure:
{
  "subtasks": [
    {
      "name": "string",
      "type": "extraction|summarization|generation|reasoning|vision|formatting|rewriting",
      "units": 1,
      "output_tokens_per_unit": 0,
      "notes": "string"
    }
  ],
  "total_output_tokens": 0,
  "reasoning_required": false,
  "vision_required": false,
  "confidence": 0.95
}`;

async function callGroq(promptText: string, imageCount: number): Promise<PromptAnalysisResult> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_GROQ_MODEL ?? "qwen/qwen3-32b",
      messages: [
        { role: "system", content: ANALYZER_SYSTEM_PROMPT + `\n\nimage_count = ${imageCount}` },
        { role: "user", content: promptText }
      ],
      temperature: 0,
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
}

export async function analyzePrompt(promptText: string, imageCount: number): Promise<PromptAnalysisResult> {
  try {
    const analysis = await callGroq(promptText, imageCount);
    
    if (analysis.confidence < 0.8) {
      const retry = await callGroq(promptText, imageCount);
      analysis.total_output_tokens = Math.round(
        (analysis.total_output_tokens + retry.total_output_tokens) / 2
      );
    }
    
    return analysis;
  } catch (error) {
    console.error("Failed to analyze prompt with Groq:", error);
    throw error;
  }
}
