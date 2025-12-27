import { IndicatorStory } from "./indicator-stories";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pro.cryptotw.com';
export const SITE_NAME = '加密台灣 Pro';
export const LOGO_URL = `${BASE_URL}/icon.png`;

export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE_URL}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        logo: LOGO_URL,
        sameAs: [
            'https://www.facebook.com/cryptotw',
            'https://twitter.com/cryptotw',
            // Add other social links if available
        ]
    };
}

export function generateIndicatorSchema(story: IndicatorStory) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: story.name,
        description: story.positionRationale,
        brand: {
            '@type': 'Brand',
            name: SITE_NAME
        },
        manufacturer: {
            '@type': 'Organization',
            name: 'Coinglass / CryptoTW'
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TWD',
            availability: 'https://schema.org/InStock'
        },
        additionalProperty: [
            {
                '@type': 'PropertyValue',
                name: 'Current Zone',
                value: story.zone
            },
            {
                '@type': 'PropertyValue',
                name: 'Current Value',
                value: story.currentValue
            },
            {
                '@type': 'PropertyValue',
                name: 'Position Headline',
                value: story.positionHeadline
            }
        ]
    };
}

export function generateArticleSchema(article: { title: string; description: string; publishedAt: string; author?: string; image?: string; slug: string }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.image || LOGO_URL,
        datePublished: article.publishedAt,
        author: {
            '@type': 'Person',
            name: article.author || 'CryptoTW Team'
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/articles/${article.slug}`
        }
    };
}
