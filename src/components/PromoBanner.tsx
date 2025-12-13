'use client'

import Link from 'next/link'
import { ExternalLink, Gift, Sparkles } from 'lucide-react'

interface PromoBannerProps {
    affiliateLink?: string
}

export function PromoBanner({ affiliateLink = 'https://www.okx.com/join/CRYPTOTW' }: PromoBannerProps) {
    return (
        <Link
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 to-neutral-800 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group">
                {/* Subtle accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />

                <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                        {/* OKX Logo placeholder */}
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">OK</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-white">註冊 OKX 交易所</span>
                                <Gift className="w-3.5 h-3.5 text-orange-400" />
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                專屬連結最高領取 <span className="text-orange-400 font-medium">$100 USDT</span> 盲盒
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 group-hover:text-white transition-colors">
                        <span className="hidden sm:inline">立即註冊</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </Link>
    )
}

// Alternative: Minimal style banner
export function PromoMinimal({ affiliateLink = 'https://www.okx.com/join/CRYPTOTW' }: PromoBannerProps) {
    return (
        <Link
            href={affiliateLink}
            target="_blank"
            className="block bg-neutral-900/50 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-neutral-300">
                        透過專屬連結註冊 OKX，享 <span className="text-orange-400">20% 手續費減免</span>
                    </span>
                </div>
                <ExternalLink className="w-3 h-3 text-neutral-600" />
            </div>
        </Link>
    )
}
