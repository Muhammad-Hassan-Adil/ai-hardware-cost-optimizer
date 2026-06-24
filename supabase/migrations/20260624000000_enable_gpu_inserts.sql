-- Explicitly allow the backend to insert new GPUs
CREATE POLICY "Allow service role to insert gpus" 
ON public.gpus 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Also allow updates in case the backend needs to update existing fetched GPUs
CREATE POLICY "Allow service role to update gpus" 
ON public.gpus 
FOR UPDATE 
TO service_role 
USING (true);
