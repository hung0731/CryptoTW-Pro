import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function POST(request: Request) {
    const admin = await verifyAdmin();
    if (!admin) return unauthorizedResponse();

    const supabase = createAdminClient();
    try {
        const body = await request.json();

        // Remove undefined/null params that trigger errors if any
        // Supabase usually handles them, but good to be clean

        const { id, ...payload } = body; // Don't send ID on create unless specified

        const { data, error } = await supabase
            .from('market_reviews')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
