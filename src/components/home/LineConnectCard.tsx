'use client';

import React, { useEffect, useState } from 'react';
import { useLiff } from '@/components/LiffProvider';
import { UniversalCard } from '@/components/ui/UniversalCard';
import { Smartphone, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LineConnectCard() {
    const { liffObject, isLoading } = useLiff();
    const [isClient, setIsClient] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Don't render during SSR to avoid hydration mismatch
    // Don't render if LIFF is loading or user dismissed it
    if (!isClient || isLoading || !isVisible) return null;

    // Logic: check if we are inside LINE App
    // liff.isInClient() returns true if inside LINE App
    const isInLine = liffObject?.isInClient() ?? false;

    // If already in LINE, don't show this card
    if (isInLine) return null;

    const LINE_OA_LINK = 'https://line.me/R/ti/p/@850ucugl';

    return (
        <div className="fixed bottom-[5.5rem] left-4 right-4 z-[999] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <UniversalCard
                variant="default"
                className="bg-[#06C755]/10 border-[#06C755]/30 p-4 relative overflow-hidden backdrop-blur-xl shadow-[0_0_40px_-5px_rgba(6,199,85,0.4)]"
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-400 hover:bg-black/20 hover:text-white transition-colors z-20"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Background Decor */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#06C755]/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-4 relative z-10 pr-6">
                    <div className="w-10 h-10 rounded-xl bg-[#06C755] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#06C755]/20 animate-pulse">
                        <Smartphone className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                使用 LINE 開啟，體驗更完整
                            </h3>
                            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                                支援自動登入、接收即時訊號通知。
                            </p>
                        </div>

                        <a
                            href={LINE_OA_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                        >
                            <Button
                                size="sm"
                                className="h-8 bg-[#06C755] hover:bg-[#05B34C] text-white border-0 font-bold text-xs gap-1.5 px-4 rounded-lg shadow-sm"
                            >
                                在 LINE App 中開啟
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </a>
                    </div>
                </div>
            </UniversalCard>
        </div>
    );
}
