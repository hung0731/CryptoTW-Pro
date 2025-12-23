-- Migration: Add content and end_date to activities table
-- Date: 2025-12-11
-- Author: CryptoTW AI

-- Add 'content' column for Markdown details
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Add 'end_date' column for countdown timer
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Update ExchangeName type to include new audience types if not already present
-- Note: 'vip', 'pro', 'prime' might already be handled as text in some DB setups, 
-- but if ExchangeName is a strict ENUM type, we need to alter it. 
-- Uncomment below if you encounter "invalid input value for enum" errors:

-- ALTER TYPE "ExchangeName" ADD VALUE IF NOT EXISTS 'vip';
-- ALTER TYPE "ExchangeName" ADD VALUE IF NOT EXISTS 'pro';
-- ALTER TYPE "ExchangeName" ADD VALUE IF NOT EXISTS 'prime';

-- (Safe check) Ensure permissions are granted to authenticated users (usually default, but good to ensure)
GRANT ALL ON activities TO authenticated;
GRANT ALL ON activities TO service_role;
