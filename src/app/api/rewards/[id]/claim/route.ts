import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

// POST /api/rewards/[id]/claim - Track claim click
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Updated to Promise for Next.js 15
) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        // Increment claim_count
        const { error } = await supabase.rpc('increment_reward_claim_count', {
            reward_id: id
        });

        // Fallback if RPC doesn't exist yet (simpler update)
        if (error) {
            const { error: updateError } = await supabase.from('rewards').update({
                // This is not atomic without RPC, but acceptable for simple counter
                // Ideally use RPC: create function increment_reward_claim_count(reward_id uuid) ...
            }).eq('id', id);

            // We will just read and update for now if RPC missing, or ignore error for MVP
            // Let's rely on client side optimistic or just direct increment if possible?
            // Supabase doesn't support 'claim_count + 1' in simple JS client update without RPC.
            // Let's implement a simple fetch-update for now to avoid migration complexity of RPC

            const { data: current } = await supabase.from('rewards').select('claim_count').eq('id', id).single();
            if (current) {
                await supabase.from('rewards').update({ claim_count: (current.claim_count || 0) + 1 }).eq('id', id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error in POST /api/rewards/[id]/claim', error, { feature: 'rewards' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
