import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pro.cryptotw.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/auth/', '/login', '/profile'], // Disallow private/admin routes
        },
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
