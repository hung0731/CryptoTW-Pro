-- ==========================================
-- CryptoTW Pro - Production Schema v1.2
-- Optimized for Launch: 2024-12-24
-- Fix: Added DROP POLICY IF EXISTS for idempotency
-- Added: vip_applications, push_messages
-- ==========================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. User Management (Core)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id TEXT NOT NULL UNIQUE,
    display_name TEXT,
    picture_url TEXT,
    membership_status TEXT CHECK (membership_status IN ('free', 'pending', 'pro', 'lifetime', 'vip')) DEFAULT 'free',
    notification_preferences JSONB DEFAULT '{"market_signals": true, "airdrops": true, "news": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read users" ON public.users;
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service/Admin update users" ON public.users;
CREATE POLICY "Service/Admin update users" ON public.users FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- 2. Exchange Bindings (UIDs)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.exchange_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exchange_name TEXT NOT NULL CHECK (exchange_name IN ('binance', 'okx', 'bybit', 'bingx', 'pionex', 'lbank')),
    exchange_uid TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exchange_name)
);
ALTER TABLE public.exchange_bindings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_exchange_bindings_uid ON public.exchange_bindings(exchange_uid);

DROP POLICY IF EXISTS "Service/Admin all bindings" ON public.exchange_bindings;
CREATE POLICY "Service/Admin all bindings" ON public.exchange_bindings FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- 3. Market Intelligence (Alerts & States)
-- ==========================================
-- ENUMs
DO $$ BEGIN
    CREATE TYPE leverage_state_type AS ENUM ('normal', 'heated', 'overheated');
    CREATE TYPE whale_state_type AS ENUM ('long', 'neutral', 'hedge', 'exit');
    CREATE TYPE liquidation_pressure_type AS ENUM ('upper', 'lower', 'balanced');
    CREATE TYPE alert_severity_type AS ENUM ('low', 'medium', 'high');
    CREATE TYPE alert_type_enum AS ENUM (
        'price_drop', 'price_pump', 'oi_spike', 'heavy_dump', 'heavy_pump', 
        'liquidation_flip', 'funding_high', 'funding_flip_neg', 'whale_shift', 'whale_divergence'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Market States (Snapshots)
CREATE TABLE IF NOT EXISTS public.market_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    market TEXT NOT NULL DEFAULT 'BTC',
    leverage_state leverage_state_type DEFAULT 'normal',
    whale_state whale_state_type DEFAULT 'neutral',
    liquidation_pressure liquidation_pressure_type DEFAULT 'balanced',
    price NUMERIC,
    funding_rate NUMERIC,
    open_interest NUMERIC,
    long_short_ratio NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.market_states ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_market_states_market_updated ON public.market_states(market, updated_at DESC);

DROP POLICY IF EXISTS "Public read market_states" ON public.market_states;
CREATE POLICY "Public read market_states" ON public.market_states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service write market_states" ON public.market_states;
CREATE POLICY "Service write market_states" ON public.market_states FOR ALL USING (auth.role() = 'service_role');

-- Alert Events (History)
CREATE TABLE IF NOT EXISTS public.alert_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    market TEXT NOT NULL DEFAULT 'BTC',
    alert_type alert_type_enum NOT NULL,
    summary TEXT NOT NULL,
    severity alert_severity_type DEFAULT 'low',
    metrics_snapshot JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_alert_events_detected_at ON public.alert_events(detected_at DESC);

DROP POLICY IF EXISTS "Public read alert_events" ON public.alert_events;
CREATE POLICY "Public read alert_events" ON public.alert_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service write alert_events" ON public.alert_events;
CREATE POLICY "Service write alert_events" ON public.alert_events FOR ALL USING (auth.role() = 'service_role');

-- AI Market Reports
CREATE TABLE IF NOT EXISTS public.market_reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sentiment text not null,
  sentiment_score integer,
  summary text not null,
  key_points jsonb,
  strategy text,
  emoji text,
  metadata jsonb
);
ALTER TABLE public.market_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read market_reports" ON public.market_reports;
CREATE POLICY "Public read market_reports" ON public.market_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service write market_reports" ON public.market_reports;
CREATE POLICY "Service write market_reports" ON public.market_reports FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- 4. Content & Reviews
-- ==========================================
CREATE TABLE IF NOT EXISTS public.market_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  importance TEXT NOT NULL CHECK (importance IN ('S', 'A', 'B', 'C')),
  year INTEGER NOT NULL,
  featured_rank INTEGER DEFAULT 0,
  category TEXT DEFAULT 'Event',
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.market_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published reviews" ON public.market_reviews;
CREATE POLICY "Public read published reviews" ON public.market_reviews FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Service/Admin all reviews" ON public.market_reviews;
CREATE POLICY "Service/Admin all reviews" ON public.market_reviews FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ==========================================
-- 5. System & Logs
-- ==========================================
-- System Config
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read config" ON public.system_config;
CREATE POLICY "Public read config" ON public.system_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service write config" ON public.system_config;
CREATE POLICY "Service write config" ON public.system_config FOR ALL USING (auth.role() = 'service_role');

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL,
    module TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service write logs" ON public.system_logs;
CREATE POLICY "Service write logs" ON public.system_logs FOR ALL USING (auth.role() = 'service_role');

-- Line/Bot Events (New)
CREATE TABLE IF NOT EXISTS public.line_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.line_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service all line_events" ON public.line_events;
CREATE POLICY "Service all line_events" ON public.line_events FOR ALL USING (auth.role() = 'service_role');

-- Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);

DROP POLICY IF EXISTS "Anon insert analytics" ON public.analytics_events;
CREATE POLICY "Anon insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Bot Triggers (Admin)
CREATE TABLE IF NOT EXISTS public.bot_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords TEXT[] NOT NULL,
  reply_type TEXT NOT NULL DEFAULT 'text',
  reply_content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.bot_triggers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service all triggers" ON public.bot_triggers;
CREATE POLICY "Service all triggers" ON public.bot_triggers FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public read triggers" ON public.bot_triggers;
CREATE POLICY "Public read triggers" ON public.bot_triggers FOR SELECT TO anon USING (true);


-- ==========================================
-- 6. Marketing & VIP (New)
-- ==========================================

-- VIP Applications
CREATE TABLE IF NOT EXISTS public.vip_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    contact_method TEXT NOT NULL,
    contact_handle TEXT NOT NULL,
    asset_tier TEXT NOT NULL,
    trading_volume_monthly TEXT,
    preferred_exchange TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.vip_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert vip" ON public.vip_applications;
CREATE POLICY "Allow public insert vip" ON public.vip_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin all vip" ON public.vip_applications;
CREATE POLICY "Allow admin all vip" ON public.vip_applications FOR ALL USING (auth.role() = 'service_role');

-- Push Messages History
CREATE TABLE IF NOT EXISTS public.push_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_content TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    recipient_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.push_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read push_messages" ON public.push_messages;
CREATE POLICY "Allow public read push_messages" ON public.push_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin all push_messages" ON public.push_messages;
CREATE POLICY "Allow admin all push_messages" ON public.push_messages FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- 7. Deep Articles (CMS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 核心欄位
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    
    -- 分類與標籤
    category TEXT DEFAULT 'analysis',
    tags TEXT[] DEFAULT '{}',
    
    -- 來源 (Source Attribution)
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_author TEXT,
    source_published_at TIMESTAMPTZ,
    
    -- 管理欄位
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    reading_time_minutes INTEGER DEFAULT 5,
    view_count INTEGER DEFAULT 0,
    
    -- 時間戳記
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);

DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Service/Admin all articles" ON public.articles;
CREATE POLICY "Service/Admin all articles" ON public.articles FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- 8. Web3 Events (活動)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 核心
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    event_type TEXT DEFAULT 'meetup',  -- 'conference'|'meetup'|'workshop'|'hackathon'|'online'
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- 時間
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    timezone TEXT DEFAULT 'Asia/Taipei',
    
    -- 地點 + 地圖
    location_type TEXT DEFAULT 'physical',  -- 'physical'|'online'|'hybrid'
    venue_name TEXT,
    address TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    online_url TEXT,
    
    -- 報名 (外部導流)
    registration_url TEXT,
    registration_deadline TIMESTAMPTZ,
    is_free BOOLEAN DEFAULT TRUE,
    price_info TEXT,
    
    -- 主辦方
    organizer_name TEXT NOT NULL,
    organizer_logo_url TEXT,
    organizer_url TEXT,
    co_organizers JSONB DEFAULT '[]',
    
    -- 關聯 (Side Events)
    parent_event_id UUID REFERENCES public.events(id),
    
    -- 標籤
    tags TEXT[] DEFAULT '{}',
    
    -- 議程時間軸
    schedule JSONB DEFAULT '[]',
    
    -- 管理
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_parent ON public.events(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(is_published, start_date DESC);

DROP POLICY IF EXISTS "Public read published events" ON public.events;
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Service/Admin all events" ON public.events;
CREATE POLICY "Service/Admin all events" ON public.events FOR ALL USING (auth.role() = 'service_role');

-- 活動收藏表
CREATE TABLE IF NOT EXISTS public.event_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    notify_before_hours INTEGER DEFAULT 24,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);
ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.event_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_event ON public.event_bookmarks(event_id);

-- Rewards (Welfare Center) Table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('exchange_promo', 'raffle', 'airdrop', 'learn_earn', 'referral', 'other')),
    
    -- Source
    source TEXT NOT NULL CHECK (source IN ('cryptotw', 'exchange', 'project', 'other')),
    source_name TEXT NOT NULL, -- "MAX", "Binance", "CryptoTW"
    source_logo_url TEXT,
    
    -- Timing
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_ongoing BOOLEAN DEFAULT FALSE, -- If true, end_date can be ignored (long-term promo)
    
    -- Reward Details
    reward_value TEXT, -- "$100 USDT", "20% Off"
    requirements TEXT, -- "Trade volume > $1000"
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    
    -- Action
    action_url TEXT NOT NULL,
    action_label TEXT DEFAULT '立即參加',
    
    -- Status & Stats
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    claim_count INTEGER DEFAULT 0, -- Number of clicks on action_url
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on published rewards"
    ON public.rewards FOR SELECT
    USING (is_published = true);

CREATE POLICY "Allow admin all access on rewards"
    ON public.rewards FOR ALL
    USING (public.is_admin(auth.uid()));

-- Add index
CREATE INDEX idx_rewards_type ON public.rewards(reward_type);
CREATE INDEX idx_rewards_is_published ON public.rewards(is_published);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.event_bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.event_bookmarks FOR ALL USING (auth.role() = 'service_role');
