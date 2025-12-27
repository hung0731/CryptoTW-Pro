import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import IndicatorsPageClient from '@/components/indicators/IndicatorsPageClient';
import { IndicatorsListService } from '@/lib/services/indicators-list';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { BASE_URL, SITE_NAME } from '@/lib/seo-utils';

export const metadata: Metadata = {
    title: '市場指標',
    description: '提供比特幣恐懼貪婪指數、資金費率、合約持倉量、ETF 資金流向等即時市場數據，協助投資人判斷市場趨勢。',
    keywords: ['比特幣指標', 'Fear and Greed', '資金費率', 'Funding Rate', 'Open Interest', 'Crypto Data'],
    alternates: {
        canonical: '/indicators',
    }
}

export default async function IndicatorsPage() {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Server-side Fetching for SEO & Performance
    const viewModel = await IndicatorsListService.getPageViewModel(baseUrl);

    // Schema.org CollectionPage
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '市場指標總覽 - CryptoTW Pro',
        description: 'CryptoTW Pro 提供的完整加密貨幣市場指標庫。',
        url: `${BASE_URL}/indicators`,
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: viewModel.marketMetrics.map((metric, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${BASE_URL}/indicators/${metric.slug}`,
                name: metric.name
            }))
        }
    };

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageHeader
                title="市場指標"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />
            <IndicatorsPageClient viewModel={viewModel} />
        </main>
    );
}
