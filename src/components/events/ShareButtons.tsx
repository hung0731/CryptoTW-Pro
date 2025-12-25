'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
    title: string;
    url: string;
    className?: string;
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
    }, []);

    const fullUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${url}`
        : url;

    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(fullUrl);

    const shareLinks = {
        line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    url: fullUrl,
                });
            } catch {
                // User cancelled or error
            }
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* LINE */}
            <a
                href={shareLinks.line}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#06C755] flex items-center justify-center hover:opacity-80 transition-opacity"
                title="分享到 LINE"
            >
                <MessageCircle className="w-4 h-4 text-white" />
            </a>

            {/* Twitter/X */}
            <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="分享到 X"
            >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>

            {/* Copy Link */}
            <button
                onClick={handleCopy}
                className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                    copied
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[#1A1A1A] text-[#888] hover:text-white hover:bg-[#2A2A2A]"
                )}
                title={copied ? "已複製" : "複製連結"}
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Native Share (Mobile) */}
            {canShare && (
                <button
                    onClick={handleNativeShare}
                    className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                    title="更多分享選項"
                >
                    <Share2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
