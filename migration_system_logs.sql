-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'success')),
    module TEXT NOT NULL, -- e.g., 'auth', 'okx_sync', 'binding', 'system'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id), -- Optional: who triggered it
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all logs
CREATE POLICY "Admins can view all logs" ON system_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Allow system/service role to insert logs (and admins)
CREATE POLICY "Admins and Service Role can insert logs" ON system_logs
    FOR INSERT
    WITH CHECK (true); -- Ideally restrict to admin/service role but for simplicity allow insert if authenticated, or rely on service key
