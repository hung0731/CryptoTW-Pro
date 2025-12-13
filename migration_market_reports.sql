-- Create table for AI Market Reports
create table if not exists market_reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sentiment text not null, -- 'Bullish' | 'Bearish' | 'Neutral'
  sentiment_score integer, -- 0-100
  summary text not null,
  key_points jsonb, -- Array of strings
  strategy text,
  emoji text, -- AI selected emoji
  metadata jsonb -- For raw data snapshot if needed
);

-- Enable RLS
alter table market_reports enable row level security;

-- Policy: Everyone can read
create policy "Public can read market reports"
  on market_reports for select
  using (true);

-- Policy: Only service role can insert (handled by API key in Edge Function/Cron)
-- Note: In Supabase, service role bypasses RLS, so normally no insert policy needed for service role.
-- But if we use authenticated admin user:
create policy "Admins can insert market reports"
  on market_reports for insert
  with check (auth.role() = 'service_role' or auth.uid() in (select id from users where role = 'admin'));
