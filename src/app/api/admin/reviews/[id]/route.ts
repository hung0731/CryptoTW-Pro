import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin();
    if (!admin) return unauthorizedResponse();

    const { id } = await params;
    const supabase = createAdminClient();
    try {
        const body = await request.json();
        const { id: _, created_at, ...payload } = body; // Exclude immutable fields

        const { data, error } = await supabase
            .from('market_reviews')
            .update({
                ...payload,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin();
    if (!admin) return unauthorizedResponse();

    const { id } = await params;
    const supabase = createAdminClient();
    try {
        const { error } = await supabase
            .from('market_reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
