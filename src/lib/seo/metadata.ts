import { Metadata } from 'next';
import { UI_LABELS } from '@/config/naming';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pro.cryptotw.com';

interface SEOProps {
    title: string;
    description?: string;
    path: string;
    ogImage?: string;
    keywords?: string[];
}

/**
 * 極簡 SEO Metadata 產生器
 */
export function constructMetadata({
    title,
    description = '專為台灣投資人打造的 Web3 研究助理。',
    path,
    ogImage = '/icon.png',
    keywords = ['比特幣', '加密貨幣', '指標', 'CryptoTW']
}: SEOProps): Metadata {
    const fullTitle = `${title} | ${UI_LABELS.BRAND_NAME}`;

    return {
        title: fullTitle,
        description,
        keywords: keywords.join(', '),
        alternates: {
            canonical: `${BASE_URL}${path}`,
        },
        openGraph: {
            title: fullTitle,
            description,
            url: `${BASE_URL}${path}`,
            siteName: UI_LABELS.BRAND_NAME,
            images: [
                {
                    url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
            locale: 'zh_TW',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`],
        },
        icons: {
            icon: '/icon.png',
            shortcut: '/icon.png',
            apple: '/icon.png',
        },
    };
}
