import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/rewards - List all rewards for admin
export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('rewards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch rewards (admin)', error, { feature: 'admin-rewards' });
            return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
        }

        return NextResponse.json({ rewards: data || [] });
    } catch (error) {
        logger.error('Error in GET /api/admin/rewards', error, { feature: 'admin-rewards' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/rewards - Create new reward
export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const json = await request.json();

        // Basic validation
        if (!json.title || !json.slug || !json.action_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('rewards')
            .insert({
                title: json.title,
                slug: json.slug,
                description: json.description,
                reward_type: json.reward_type,
                source: json.source,
                source_name: json.source_name,
                source_logo_url: json.source_logo_url,
                start_date: json.start_date || new Date().toISOString(),
                end_date: json.end_date,
                is_ongoing: json.is_ongoing || false,
                reward_value: json.reward_value,
                requirements: json.requirements,
                difficulty: json.difficulty,
                action_url: json.action_url,
                action_label: json.action_label || '立即參加',
                is_featured: json.is_featured || false,
                is_published: json.is_published || false,
            })
            .select()
            .single();

        if (error) {
            logger.error('Failed to create reward', error, { feature: 'admin-rewards' });
            return NextResponse.json({ error: 'Failed to create reward: ' + error.message }, { status: 500 });
        }

        return NextResponse.json({ reward: data });
    } catch (error) {
        logger.error('Error in POST /api/admin/rewards', error, { feature: 'admin-rewards' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
