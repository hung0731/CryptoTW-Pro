'use client';

import { useParams, notFound } from 'next/navigation';
import IndicatorStoryPage from '@/components/IndicatorStoryPage';
import { getIndicatorStory } from '@/lib/indicator-stories';

// 簡化版：所有即時數據獲取都在 IndicatorStoryPage 內部處理
export default function IndicatorPage() {
    const params = useParams();
    const slug = params.slug as string;

    const story = getIndicatorStory(slug);

    if (!story) {
        notFound();
    }

    return <IndicatorStoryPage story={story} />;
}
