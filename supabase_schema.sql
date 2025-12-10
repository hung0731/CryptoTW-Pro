-- Create Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id TEXT NOT NULL UNIQUE,
    display_name TEXT,
    picture_url TEXT,
    membership_status TEXT CHECK (membership_status IN ('free', 'pending', 'pro')) DEFAULT 'free',
    notification_preferences JSONB DEFAULT '{"market_signals": true, "airdrops": true, "news": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create Exchanges Table (Bindings)
CREATE TABLE public.exchange_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exchange_name TEXT NOT NULL CHECK (exchange_name IN ('binance', 'okx', 'bybit', 'bingx', 'pionex')),
    exchange_uid TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exchange_name) -- User can only bind one UID per exchange (simplification)
);

-- Enable RLS for Exchanges
ALTER TABLE public.exchange_bindings ENABLE ROW LEVEL SECURITY;

-- Create Content Table
CREATE TABLE public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT,
    type TEXT CHECK (type IN ('news', 'alpha', 'weekly')),
    access_level TEXT CHECK (access_level IN ('free', 'pro')) DEFAULT 'free',
    is_published BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES auth.users(id), -- Optional: if using Supabase Auth for Admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create Activities Table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for now - strictly server-side or public read)

-- Users: Public read (or restricted to self via LINE ID logic later)
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow update own user" ON public.users FOR UPDATE USING (true); -- Needs auth logic implementation
CREATE POLICY "Allow insert public" ON public.users FOR INSERT WITH CHECK (true);

-- Bindings: 
CREATE POLICY "Allow read own bindings" ON public.exchange_bindings FOR SELECT USING (true);
CREATE POLICY "Allow insert own bindings" ON public.exchange_bindings FOR INSERT WITH CHECK (true);

-- Content:
CREATE POLICY "Allow public read published free content" ON public.content 
FOR SELECT USING (is_published = true AND access_level = 'free');

-- Pro content requires logic, for now enable read for all to simplify dev, will restrict later
CREATE POLICY "Allow read all content" ON public.content FOR SELECT USING (is_published = true);

-- Activities:
CREATE POLICY "Allow public read activities" ON public.activities FOR SELECT USING (is_active = true);

-- Analytics Events Table
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exchange_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'click', 'view'
    activity_id UUID REFERENCES activities(id),
    user_id UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Analytics: Admin can see all, Anon can insert (for tracking)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for everyone" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for admins" ON analytics_events
    FOR SELECT USING (
        (SELECT membership_status FROM users WHERE id = auth.uid()) = 'admin' OR 
        auth.role() = 'service_role'
    );

-- Exchanges Table (Dynamic Referral Links)
CREATE TABLE exchanges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE, -- 'binance', 'okx'
    name TEXT NOT NULL,
    referral_link TEXT NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System Announcements Table
CREATE TABLE system_announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    level TEXT DEFAULT 'info', -- 'info', 'warning', 'alert'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Admin Ops
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- Public Read, Admin Write
CREATE POLICY "Allow public read exchanges" ON exchanges FOR SELECT USING (true);
CREATE POLICY "Allow admin all exchanges" ON exchanges FOR ALL USING (
    (SELECT membership_status FROM users WHERE id = auth.uid()) = 'admin' OR auth.role() = 'service_role'
);

CREATE POLICY "Allow public read announcements" ON system_announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all announcements" ON system_announcements FOR ALL USING (
    (SELECT membership_status FROM users WHERE id = auth.uid()) = 'admin' OR auth.role() = 'service_role'
);

-- Seed Initial Exchanges
INSERT INTO exchanges (slug, name, referral_link, sort_order) VALUES
('binance', 'Binance', 'https://accounts.binance.com/register?ref=YOUR_REF', 10),
('okx', 'OKX', 'https://www.okx.com/join/YOUR_REF', 20),
('bybit', 'Bybit', 'https://www.bybit.com/register?affiliate_id=YOUR_REF', 30),
('bingx', 'BingX', 'https://bingx.com/invite/YOUR_REF', 40),
('pionex', 'Pionex', 'https://www.pionex.com/signUp?r=YOUR_REF', 50);

