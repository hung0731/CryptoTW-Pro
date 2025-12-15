import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Using the service role client if available or default
import { REVIEWS_DATA } from '@/lib/reviews-data';

export async function GET() {
    try {
        const results = [];

        // We typically need admin rights for this, assuming this route is protected or local only
        // For migration, we might need the service role key explicitly if RLS blocks us
        // But since we are backend, we can try using the standard client or createAdminClient if exported

        // Dynamic import to avoid circular dep issues if any, though likely fine
        const { createAdminClient } = await import('@/lib/supabase');
        const adminClient = createAdminClient();

        for (const review of REVIEWS_DATA) {
            const { id, slug, title, year, importance, tags, ...content } = review;

            // Upsert based on slug
            const { data, error } = await adminClient
                .from('market_reviews')
                .upsert({
                    slug,
                    title,
                    year,
                    importance: importance as 'S' | 'A' | 'B' | 'C',
                    tags,
                    content: content as any, // Storing the rest as JSON
                    is_published: true, // Default to published for existing ones
                    updated_at: new Date().toISOString()
                }, { onConflict: 'slug' })
                .select();

            if (error) {
                console.error(`Error migrating ${slug}:`, error);
                results.push({ slug, status: 'error', error: error.message });
            } else {
                results.push({ slug, status: 'success', id: data[0].id });
            }
        }

        return NextResponse.json({
            message: 'Migration completed',
            results
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
