import { HomePageClient } from './HomePageClient'

// Server Component - Optimized for fast initial load
// Data fetching moved to client-side to prevent blocking
export default async function HomePage() {
    return <HomePageClient />
}
