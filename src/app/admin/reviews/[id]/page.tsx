import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { ReviewEditor } from '@/components/admin/ReviewEditor';

export const dynamic = 'force-dynamic';


export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createAdminClient();

    if (id === 'new') {
        return <ReviewEditor isNew={true} />;
    }

    const { data: review, error } = await supabase
        .from('market_reviews')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !review) {
        return notFound();
    }

    return <ReviewEditor review={review} />;
}
