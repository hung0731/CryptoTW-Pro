
import { IndicatorStoryPage } from '@/components/IndicatorStoryPage';
import { getIndicatorStory, INDICATOR_STORIES } from '@/lib/indicator-stories';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { generateIndicatorSchema } from '@/lib/seo-utils';

interface Props {
    params: { slug: string }
}

// 1. Static Generation for SEO & Performance
export async function generateStaticParams() {
    return INDICATOR_STORIES.map((story) => ({
        slug: story.slug,
    }))
}

// 2. Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const story = getIndicatorStory(params.slug);

    if (!story) {
        return {
            title: '指標未找到 - CryptoTW Pro'
        }
    }

    return {
        title: `${story.name} 指標分析與即時圖表 | CryptoTW Pro`,
        description: `${story.positionHeadline}。${story.positionRationale} CryptoTW 為您提供詳細的 ${story.name} 數據分析與歷史回測。`,
        keywords: [story.name, '比特幣指標', '加密貨幣分析', 'CryptoTW'],
        alternates: {
            canonical: `/indicators/${params.slug}`,
        },
        openGraph: {
            title: `${story.name} - CryptoTW 市場儀表板`,
            description: story.positionHeadline,
            images: [{
                url: `/api/og?title=${encodeURIComponent(story.name)}&subtitle=${encodeURIComponent(story.positionHeadline)}&value=${encodeURIComponent(story.zone + ' (' + story.currentValue + ')')}&type=indicator`,
                width: 1200,
                height: 630,
            }],
        }
    }
}

// 3. Server Component
export default function IndicatorPage({ params }: Props) {
    const story = getIndicatorStory(params.slug);

    if (!story) {
        notFound();
    }

    const jsonLd = generateIndicatorSchema(story);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <IndicatorStoryPage story={story} />
        </>
    );
}
