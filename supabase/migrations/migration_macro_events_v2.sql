-- 1. Create macro_event_types table
CREATE TABLE IF NOT EXISTS macro_event_types (
    key TEXT PRIMARY KEY,           -- 'cpi', 'nfp', 'fomc', 'unrate', 'ppi'
    name TEXT NOT NULL,             -- '消費者物價指數'
    short_name TEXT,                -- 'CPI'
    unit TEXT DEFAULT '%',          -- '%', 'K', etc.
    icon TEXT,                      -- 'TrendingUp'
    color TEXT,                     -- '#FF6B6B'
    description TEXT,
    release_pattern TEXT,           -- 'Monthly, 2nd week'
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'     -- For future extensions
);

-- 2. Create macro_events table
CREATE TABLE IF NOT EXISTS macro_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL REFERENCES macro_event_types(key),
    occurs_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    forecast NUMERIC,               -- Original forecast (if available)
    previous_actual NUMERIC,        -- Auto-calculated previous actual
    actual NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_type, occurs_at)
);

CREATE INDEX IF NOT EXISTS idx_macro_events_type ON macro_events(event_type);
CREATE INDEX IF NOT EXISTS idx_macro_events_occurs_at ON macro_events(occurs_at DESC);

-- 3. Create function and trigger for auto-calculating previous_actual
CREATE OR REPLACE FUNCTION set_previous_actual()
RETURNS TRIGGER AS $$
BEGIN
    SELECT actual INTO NEW.previous_actual
    FROM macro_events
    WHERE event_type = NEW.event_type
      AND occurs_at < NEW.occurs_at
      AND actual IS NOT NULL
    ORDER BY occurs_at DESC
    LIMIT 1;
    return NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_previous_actual ON macro_events;
CREATE TRIGGER trigger_set_previous_actual
BEFORE INSERT OR UPDATE ON macro_events
FOR EACH ROW EXECUTE FUNCTION set_previous_actual();

-- 4. Create macro_price_reactions table
CREATE TABLE IF NOT EXISTS macro_price_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES macro_events(id) ON DELETE CASCADE,
    -- Stats
    d0d1_return NUMERIC,
    max_drawdown NUMERIC,
    max_upside NUMERIC,
    price_range NUMERIC,
    direction TEXT CHECK (direction IN ('up', 'down', 'chop')),
    -- Price Data
    price_data JSONB,               -- [{date, open, high, low, close}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_event_id ON macro_price_reactions(event_id);

-- 5. Seed initial event types
INSERT INTO macro_event_types (key, name, short_name, unit, sort_order) VALUES
('cpi', '消費者物價指數', 'CPI', '%', 1),
('nfp', '非農就業指數', 'NFP', 'K', 2),
('fomc', 'FOMC 利率決議', 'FOMC', '%', 3),
('unrate', '失業率', 'UNRATE', '%', 4),
('ppi', '生產者物價指數', 'PPI', '%', 5)
ON CONFLICT (key) DO NOTHING;
