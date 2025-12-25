import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/rewards - List public rewards
export async function GET(request: Request) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type');
        const featured = searchParams.get('featured') === 'true';

        let query = supabase
            .from('rewards')
            .select('*')
            .eq('is_published', true)
            .order('is_featured', { ascending: false }) // Featured first
            .order('created_at', { ascending: false }); // Then newest

        if (type && type !== 'all') {
            query = query.eq('reward_type', type);
        }

        if (featured) {
            query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to fetch rewards', error, { feature: 'rewards' });
            return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
        }

        return NextResponse.json({ rewards: data || [] });
    } catch (error) {
        logger.error('Error in GET /api/rewards', error, { feature: 'rewards' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
