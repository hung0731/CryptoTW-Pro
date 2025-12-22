-- Create Line Events Table for System Logs
CREATE TABLE public.line_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Optional: User ID if associated with a user action
    type TEXT NOT NULL, -- e.g., 'command', 'error', 'system'
    message TEXT NOT NULL, -- Log message or description
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.line_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public insert line_events" ON public.line_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role all line_events" ON public.line_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow admin select line_events" ON public.line_events FOR SELECT USING (auth.role() = 'service_role');
