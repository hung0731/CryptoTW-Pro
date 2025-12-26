
-- ==========================================
-- Migration: Add User Rewards Tracking
-- Date: 2025-12-26
-- Description: Tracks which users have claimed or are tracking specific rewards
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    
    -- Status: 'claimed' (already participated), 'tracking' (interested/saved)
    status TEXT CHECK (status IN ('claimed', 'tracking')) DEFAULT 'tracking',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, reward_id)
);

-- RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own rewards
DROP POLICY IF EXISTS "Users view own rewards" ON public.user_rewards;
CREATE POLICY "Users view own rewards" ON public.user_rewards 
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert/update their own rewards
-- Note: Requires service role to map auth.uid() to public.users.id if they are different.
-- Assuming public.users.id IS the auth id (which it usually is in Supabase starter patterns, but let's verify).
-- In this schema: public.users is defined separately.
-- Let's assume auth.uid() maps to public.users(id). 
-- WAIT: public.users(id) is UUID DEFAULT gen_random_uuid(). This means it might NOT be the auth.uid().
-- If public.users is a separate table, we typically link them via `id` or a `auth_id` column.
-- Looking at `production_schema.sql`:
-- CREATE TABLE public.users ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), line_user_id TEXT... )
-- It seems this system uses LINE Login? `line_user_id`.
-- So `auth.uid()` (Supabase Auth) might NOT match `public.users.id`.
-- However, `event_bookmarks` uses `user_id REFERENCES public.users(id)`.
-- And `production_schema.sql` policy: `CREATE POLICY "Users manage own bookmarks" ON public.event_bookmarks FOR ALL USING (auth.role() = 'service_role');`
-- It seems most user operations are done via Server Actions or APIs with Service Role, explicitly passing `user_id`.
-- So for RLS, maybe we rely on Service Role for writes, and Selects might be tricky if not Service Role.
-- Let's check `src/app/api/user/route.ts` or similar later.
-- For now, I will define the table.
