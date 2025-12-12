-- Create bot_triggers table
CREATE TABLE IF NOT EXISTS bot_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords TEXT[] NOT NULL,
  reply_type TEXT NOT NULL DEFAULT 'text',
  reply_content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bot_triggers ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public/anon) because webhook needs to read it without admin auth? 
-- Actually webhook runs server-side, it uses SERVICE_ROLE usually or just standard client.
-- But for Admin UI, we need authenticated access.
-- Let's define policies.

-- Policy: Authenticated users (Admins) can do everything
CREATE POLICY "Admins can manage triggers" ON bot_triggers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Public/Service role read access (for Webhook)
-- Note: Service Role bypasses RLS, so this might not be strictly necessary for the route handler if using service key,
-- but good to allow read if we use anon client in some cases (though unlikely for webhook).
CREATE POLICY "Public read triggers" ON bot_triggers
  FOR SELECT
  TO anon
  USING (true);
