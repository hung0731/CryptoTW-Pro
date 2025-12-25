'use client'

import { useState, useEffect } from 'react'

/**
 * 閱讀進度指示器
 * - 顯示在頁面最頂端
 * - 根據滾動位置動態更新
 * - 適用於長文章頁面
 */
export function ReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            setProgress(Math.min(100, Math.max(0, scrollPercent)))
        }

        updateProgress()
        window.addEventListener('scroll', updateProgress, { passive: true })
        return () => window.removeEventListener('scroll', updateProgress)
    }, [])

    return (
        <>
            {/* 主進度條 */}
            <div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 z-50 transition-all duration-150 origin-left"
                style={{
                    transform: `scaleX(${progress / 100})`,
                    opacity: progress > 0 ? 1 : 0
                }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`閱讀進度 ${Math.round(progress)}%`}
            />

            {/* 發光效果 */}
            <div
                className="fixed top-0 left-0 h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 blur-sm z-50 transition-all duration-150 pointer-events-none"
                style={{
                    left: `${progress}%`,
                    opacity: progress > 0 && progress < 100 ? 0.8 : 0,
                    transform: 'translateX(-50%)'
                }}
            />
        </>
    )
}
