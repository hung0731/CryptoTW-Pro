'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 返回頂部按鈕
 * - 滾動超過 400px 時顯示
 * - 平滑滾動到頂部
 * - 固定在右下角，避開底部導航
 */
export function BackToTop() {
    const [show, setShow] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

            setShow(scrollTop > 400)
            setProgress(scrollPercent)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    if (!show) return null

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-24 right-4 z-50",
                "w-12 h-12 rounded-full",
                // Glassmorphism base
                "bg-black/50 backdrop-blur-md border border-white/10",
                // Hover state - subtle lighten or very subtle purple tint
                "hover:bg-neutral-800 hover:border-purple-500/30",
                "text-white shadow-2xl",
                "transition-all duration-300",
                "flex items-center justify-center",
                "active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
            )}
            aria-label="返回頂部"
            title={`返回頂部 (${Math.round(progress)}%)`}
        >
            {/* 圓形進度環 */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                {/* Background Track */}
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                    fill="none"
                />
                {/* Progress Indicator - Purple */}
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                />
            </svg>

            <ArrowUp className="w-5 h-5 relative z-10" />
        </button>
    )
}
