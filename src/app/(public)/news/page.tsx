'use client'

import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { FullNewsFeed } from '@/components/news/FullNewsFeed'

export default function NewsPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader />

            <div className="p-4 space-y-5">

                {/* Section: Full News Feed */}
                <section>
                    <FullNewsFeed />
                </section>

            </div>

            <BottomNav />
        </main>
    )
}
