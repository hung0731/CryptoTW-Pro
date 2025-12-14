'use client'

import { FlashNewsFeed } from "@/components/news/FlashNewsFeed"
import { Badge } from "@/components/ui/badge"
import { Newspaper } from "lucide-react"

export default function NewsPage() {
    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        幣圈快訊
                    </h1>
                    <p className="text-sm text-neutral-500">
                        即時掌握市場動態、重大新聞與項目進展
                    </p>
                </div>
                <Badge variant="outline" className="ml-auto border-blue-500/30 text-blue-400 bg-blue-500/10">
                    Live
                </Badge>
            </div>

            <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <FlashNewsFeed />
            </div>
        </div>
    )
}
