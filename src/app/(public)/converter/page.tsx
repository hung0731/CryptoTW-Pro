'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MobileOptimizedLayout } from '@/components/layout/PageLayout';
import { CurrencyConverter } from '@/components/home/CurrencyConverter';
import { SPACING } from '@/lib/design-tokens';

export default function ConverterPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader
                title="匯率換算"
                showLogo={false}
                backHref="/"
                backLabel="返回"
            />

            <MobileOptimizedLayout className={SPACING.classes.mtHeader}>
                <CurrencyConverter />

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-[#0A0A0A] rounded-xl border border-[#1A1A1A]">
                    <h3 className="text-sm font-bold text-white mb-2">關於匯率</h3>
                    <ul className="text-xs text-[#888] space-y-1">
                        <li>• USDT/TWD 報價來自 MAX、BitoPro、HoyaBit 三家台灣交易所</li>
                        <li>• BTC、ETH 報價來自 Binance</li>
                        <li>• 匯率每分鐘自動更新</li>
                        <li>• 實際成交價格可能因市場波動而有所不同</li>
                    </ul>
                </div>
            </MobileOptimizedLayout>
        </main>
    );
}
