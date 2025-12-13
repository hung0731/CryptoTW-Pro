-- Create ENUMs for Market States
CREATE TYPE leverage_state_type AS ENUM ('normal', 'heated', 'overheated');
CREATE TYPE whale_state_type AS ENUM ('long', 'neutral', 'hedge', 'exit');
CREATE TYPE liquidation_pressure_type AS ENUM ('upper', 'lower', 'balanced');
CREATE TYPE alert_severity_type AS ENUM ('low', 'medium', 'high');
CREATE TYPE alert_type_enum AS ENUM (
    'price_drop', 'price_pump', 
    'oi_spike', 
    'heavy_dump', 'heavy_pump', 'liquidation_flip',
    'funding_high', 'funding_flip_neg', 
    'whale_shift', 'whale_divergence'
);

-- 1. Market State Table (Snapshot of current state for change detection)
CREATE TABLE public.market_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    market TEXT NOT NULL DEFAULT 'BTC',
    leverage_state leverage_state_type DEFAULT 'normal',
    whale_state whale_state_type DEFAULT 'neutral',
    liquidation_pressure liquidation_pressure_type DEFAULT 'balanced',
    price NUMERIC, -- Store BTC price to calculate 5m/1h changes
    funding_rate NUMERIC,
    open_interest NUMERIC,
    long_short_ratio NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.market_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read market_states" ON public.market_states FOR SELECT USING (true);
CREATE POLICY "Allow service role update market_states" ON public.market_states FOR ALL USING (auth.role() = 'service_role');


-- 2. Alert Events Table (History of significant events)
CREATE TABLE public.alert_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    market TEXT NOT NULL DEFAULT 'BTC',
    alert_type alert_type_enum NOT NULL,
    summary TEXT NOT NULL,
    severity alert_severity_type DEFAULT 'low',
    metrics_snapshot JSONB DEFAULT '{}'::jsonb, -- Store relevant metrics at the time of alert
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read alert_events" ON public.alert_events FOR SELECT USING (true);
CREATE POLICY "Allow service role insert alert_events" ON public.alert_events FOR ALL USING (auth.role() = 'service_role');


-- 3. User Alert Logs (Tracking sent alerts)
CREATE TABLE public.user_alert_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id), -- If NULL, means broadcast or system log
    alert_event_id UUID REFERENCES public.alert_events(id),
    channel TEXT DEFAULT 'line',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_alert_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users read own logs" ON public.user_alert_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow service role all logs" ON public.user_alert_logs FOR ALL USING (auth.role() = 'service_role');
