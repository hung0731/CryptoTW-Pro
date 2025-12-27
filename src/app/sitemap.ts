import { MetadataRoute } from 'next'
import { INDICATOR_STORIES } from '@/lib/indicator-stories'
// import { getAllArticles } from '@/lib/articles' // Assuming this exists or will exist
// import { getAllNews } from '@/lib/news' // Assuming this exists or will exist

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pro.cryptotw.com'

    // 1. Static Routes
    const routes = [
        '', // Home
        '/calendar',
        '/converter',
        '/indicators',
        '/articles',
        '/news',
        '/reviews',
        '/super-chart',
        '/learn',
        '/join',
        '/chart-catalog',
        '/disclosure',
        '/organizers',
        '/rewards',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Indicators
    const indicatorRoutes = INDICATOR_STORIES.map((story) => ({
        url: `${baseUrl}/indicators/${story.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const, // Indicators update frequently
        priority: 0.9,
    }))

    // TODO: Add Articles and News when their fetching logic is confirmed
    // const articleRoutes = ...

    return [...routes, ...indicatorRoutes]
}
