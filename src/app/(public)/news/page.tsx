'use client'

import { PageHeader } from '@/components/PageHeader'
import { FullNewsFeed } from '@/components/news/FullNewsFeed'
import { SPACING } from '@/lib/design-tokens'

export default function NewsPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader title="快訊中心" showLogo={false} backHref="/" backLabel="返回" />

            <div className={`p-4 ${SPACING.cardGap}`}>

                {/* Section: Full News Feed */}
                <section>
                    <FullNewsFeed />
                </section>

            </div>

        </main>
    )
}
