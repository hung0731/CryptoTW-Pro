import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default async function ReviewsAdminPage() {
    const supabase = createAdminClient();

    // Fetch reviews with sorting
    const { data: reviews, error } = await supabase
        .from('market_reviews')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="p-6 text-red-500">
                Failed to load reviews: {error.message}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Market Reviews CMS</h1>
                    <p className="text-neutral-400 text-sm">Manage deep-dive market analysis content</p>
                </div>
                <Link href="/admin/reviews/new">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                        <Plus className="w-4 h-4" />
                        New Review
                    </Button>
                </Link>
            </div>

            <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="bg-neutral-900 border-b border-white/5 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Title / Slug</th>
                            <th className="px-6 py-4">Importance</th>
                            <th className="px-6 py-4">Year</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {reviews?.map((review) => (
                            <tr key={review.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white mb-0.5">{review.title}</div>
                                    <div className="font-mono text-xs text-neutral-500">{review.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={
                                        review.importance === 'S' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                            review.importance === 'A' ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                                                review.importance === 'B' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                                                    'border-blue-500/50 text-blue-400 bg-blue-500/10'
                                    }>
                                        {review.importance} Class
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 font-mono">
                                    {review.year}
                                </td>
                                <td className="px-6 py-4">
                                    {review.is_published ? (
                                        <Badge className="bg-green-500/20 text-green-400 border-0 hover:bg-green-500/30">Published</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 hover:bg-neutral-700">Draft</Badge>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/reviews/${review.slug}`} target="_blank">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-white">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/reviews/${review.id}`}>
                                            <Button size="sm" variant="outline" className="h-8 gap-2 border-white/10 bg-black hover:bg-white/5 text-neutral-300">
                                                <Edit className="w-3.5 h-3.5" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reviews?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                    No reviews found. Click "New Review" to create one or run the migration script.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
