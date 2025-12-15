-- Create market_reviews table with Hybrid Strategy
-- Content JSONB + Top Level Index Columns
CREATE TABLE IF NOT EXISTS market_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  
  -- Top Level Filtering & Sorting Columns (Hybrid Strategy)
  importance TEXT NOT NULL CHECK (importance IN ('S', 'A', 'B', 'C')),
  year INTEGER NOT NULL,
  featured_rank INTEGER DEFAULT 0, -- Higher number = Higher priority
  category TEXT DEFAULT 'Event', -- e.g. Exchange, Protocol, Stablecoin
  tags TEXT[] DEFAULT '{}',
  
  -- Content Blob (Flexible S-Class Structure)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE market_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public reviews are viewable by everyone" ON market_reviews
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage reviews" ON market_reviews
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_reviews_updated_at
  BEFORE UPDATE ON market_reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
