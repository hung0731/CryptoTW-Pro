-- Add metadata column to content table for storing AI analysis results
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.content.metadata IS 'Stores AI-generated metadata like key_takeaways, source_reliability, sentiment, etc.';
