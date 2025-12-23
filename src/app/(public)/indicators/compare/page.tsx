import React from 'react';
import { headers } from 'next/headers';
import { INDICATOR_STORIES } from '@/lib/indicator-stories';
import CompareIndicatorsPageClient from '@/components/indicators/CompareIndicatorsPageClient';

export const revalidate = 300; // ISR for 5 minutes

export default async function CompareIndicatorsPage() {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Pre-fetch data for default selected indicators (1M range)
    // Default selection matches client state: 'fear-greed', 'funding-rate', 'long-short-ratio', 'liquidation'
    // Actually prefetching all might be too heavy? Or just the default 4?
    // Let's prefetch the default 4 for instant LCP.
    const defaultSlugs = ['fear-greed', 'funding-rate', 'long-short-ratio', 'liquidation'];
    const storiesToPrefetch = INDICATOR_STORIES.filter(s => defaultSlugs.includes(s.slug));

    const promises = storiesToPrefetch.map(async (story) => {
        const endpoint = story.chart.api.endpoint;
        const params = new URLSearchParams({
            range: '1M',
            ...(story.chart.api.params as Record<string, string>)
        });

        try {
            const res = await fetch(`${baseUrl}${endpoint}?${params.toString()}`, { next: { revalidate: 300 } });
            if (res.ok) {
                const data = await res.json();
                return { id: story.id, data };
            }
        } catch (e) {
            console.error(`Failed to prefetch ${story.id}`, e);
        }
        return { id: story.id, data: null };
    });

    const results = await Promise.all(promises);
    const initialDataMap: Record<string, { history: any[], current: any }> = {};

    results.forEach(r => {
        if (r.data) {
            initialDataMap[r.id] = r.data;
        }
    });

    return (
        <CompareIndicatorsPageClient initialDataMap={initialDataMap} />
    );
}
