-- Extend cloud_models for smart routing
ALTER TABLE cloud_models 
ADD COLUMN IF NOT EXISTS supports_vision BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'standard'; -- 'lightweight', 'standard', 'frontier'

-- Create prompt_analyses table
CREATE TABLE IF NOT EXISTS prompt_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  prompt_text TEXT,
  image_count INT DEFAULT 0,
  image_size TEXT,
  analysis JSONB,
  total_input_tokens INT,
  total_output_tokens INT,
  confidence FLOAT
);

-- RLS for prompt_analyses (allow inserts from public, restricted reads if necessary)
ALTER TABLE prompt_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to prompt_analyses" 
ON prompt_analyses FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow reading for the current session or anyone for demo purposes
CREATE POLICY "Allow public select on prompt_analyses"
ON prompt_analyses FOR SELECT
TO public
USING (true);
