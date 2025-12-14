'use client'

import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'

export default function NewsPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader />

            <div className="p-4 space-y-5">

                {/* Section: News Feed (with built-in AI Context) */}
                <section>
                    <FlashNewsFeed />
                </section>

            </div>

            <BottomNav />
        </main>
    )
}
