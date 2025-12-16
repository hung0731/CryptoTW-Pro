'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, BarChart3, Anchor, Newspaper } from 'lucide-react'
import Link from 'next/link'

interface WelcomeModalProps {
    isOpen: boolean
    onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    if (!isOpen) return null

    const features = [
        { icon: Sparkles, label: 'AI 盤勢判斷', href: '/' },
        { icon: BarChart3, label: '合約數據', href: '/prediction' },
        { icon: Newspaper, label: '幣圈快訊', href: '/news' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal - Following design system */}
            <div className="relative w-full max-w-sm bg-[#0E0E0F]/95 border border-[#1A1A1A] rounded-xl p-6 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#666666] hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        歡迎成為 Pro 會員
                    </h2>
                    <p className="text-sm text-neutral-400">
                        你已解鎖全部功能，開始探索吧
                    </p>
                </div>

                {/* Feature Quick Links */}
                <div className="space-y-2 mb-6">
                    {features.map(({ icon: Icon, label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#0E0E0F] hover:bg-[#1A1A1A]"
                        >
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-neutral-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{label}</span>
                        </Link>
                    ))}
                </div>

                {/* Dismiss */}
                <button
                    onClick={onClose}
                    className="w-full py-3 text-sm text-[#666666] hover:text-[#A0A0A0]"
                >
                    之後再說
                </button>
            </div>
        </div>
    )
}

// Hook to manage welcome modal state
export function useWelcomeModal(isNewPro: boolean) {
    const [showWelcome, setShowWelcome] = useState(false)

    useEffect(() => {
        if (isNewPro) {
            // Check if already shown
            const hasShown = localStorage.getItem('ctw_welcome_shown')
            if (!hasShown) {
                setShowWelcome(true)
                localStorage.setItem('ctw_welcome_shown', 'true')
            }
        }
    }, [isNewPro])

    return {
        showWelcome,
        closeWelcome: () => setShowWelcome(false)
    }
}
