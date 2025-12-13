-- Migration: Remove Articles/Content Feature
-- Description: Drops the `content` table and cleans up related policies.

-- 1. Drop Policies (Cascade should handle this, but explicit is safer if not cascading)
DROP POLICY IF EXISTS "Allow public read published free content" ON public.content;
DROP POLICY IF EXISTS "Allow read all content" ON public.content;
DROP POLICY IF EXISTS "Allow admin all content" ON public.content;

-- 2. Drop Table
DROP TABLE IF EXISTS public.content;

-- 3. Note: Any storage buckets related to article images should also be cleaned up manually via Supabase Dashboard if they exist.
