'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import {
    UniversalCard,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/UniversalCard';

export default function DisclosurePage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <PageHeader title="網站政策" backHref="/" backLabel="返回" />

            <main className="p-4 pb-20 max-w-2xl mx-auto space-y-4">
                {/* Page Intro */}
                <div className="px-1 mb-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        法律聲明與隱私政策
                    </h1>
                    <p className="text-xs text-neutral-500 font-mono mt-2">
                        Last Updated: {new Date().toLocaleDateString('zh-TW')}
                    </p>
                </div>

                {/* 1. 服務性質與免責聲明 (Consolidated 1 & 2) */}
                <UniversalCard variant="subtle" size="M">
                    <CardHeader>
                        <CardTitle>1. 服務性質與免責聲明</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm leading-relaxed text-neutral-300">
                            <p>
                                <strong className="text-white">非投資建議：</strong>
                                加密台灣 Pro 僅提供市場資訊整理、數據圖表與歷史回測研究，
                                <span className="text-red-400 font-medium">不構成任何形式之投資建議、買賣推薦或資產配置建議</span>。
                            </p>
                            <p className="text-xs text-neutral-400">
                                <strong className="text-neutral-300">非金融機構：</strong>
                                本平台並非銀行、證券商或投信投顧機構，亦未取得投資顧問執照。我們不針對個別使用者之財務狀況提供量身建議。
                            </p>
                        </div>
                    </CardContent>
                </UniversalCard>

                {/* 2. 數據風險與回測聲明 (Consolidated 3 + Data Context) */}
                <UniversalCard variant="subtle" size="M">
                    <CardHeader>
                        <CardTitle>2. 數據風險與回測聲明</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-4 space-y-2 text-xs text-neutral-400 leading-relaxed marker:text-neutral-600">
                            <li>
                                <strong className="text-neutral-300">過去績效不代表未來：</strong>
                                所有歷史回測、策略勝率與情境模擬僅供說明用途，不保證未來市場表現或收益。
                            </li>
                            <li>
                                <strong className="text-neutral-300">數據來源：</strong>
                                本平台數據源自第三方交易所 API 與鏈上數據，雖盡力確保準確，但不保證其即時性或無誤，使用者應自行查核。
                            </li>
                        </ul>
                    </CardContent>
                </UniversalCard>

                {/* 3. 責任限制 (Original 4) */}
                <UniversalCard variant="subtle" size="M">
                    <CardHeader>
                        <CardTitle>3. 責任限制 (Limitation of Liability)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                            在法律許可之最大範圍內，本平台對於因下列情形所生之任何直接或間接損失，均不負賠償責任：
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-400 leading-relaxed marker:text-neutral-600">
                            <li>市場價格波動、清算、爆倉或任何投資損失。</li>
                            <li>第三方數據源中斷、系統維護、網路故障或不可抗力因素（如天災、戰爭）。</li>
                            <li>使用者自身帳號保管不當或違法使用所致之損失。</li>
                        </ul>
                    </CardContent>
                </UniversalCard>

                {/* 4. 隱私權政策 (Original 7 + Cookie/LINE) */}
                <UniversalCard variant="subtle" size="M">
                    <CardHeader>
                        <CardTitle>4. 隱私權與資料使用</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-xs text-neutral-400 leading-relaxed">
                            <p>
                                <strong className="text-neutral-300 block mb-1">資料蒐集：</strong>
                                我們使用 Cookie 優化瀏覽體驗，並可能在您授權下蒐集 LINE ID 以提供身分識別與通知功能。
                            </p>
                            <p>
                                <strong className="text-neutral-300 block mb-1">使用承諾：</strong>
                                您的個資僅用於平台服務運作，未經同意不會用於第三方行銷。資料將保留至您終止服務或依法律規定之保存年限為止。
                            </p>
                        </div>
                    </CardContent>
                </UniversalCard>

                {/* 5. 一般條款 (Consolidated 5, 6, 9, 10) */}
                <UniversalCard variant="subtle" size="M">
                    <CardHeader>
                        <CardTitle>5. 一般條款與聯繫方式</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-4 space-y-2 text-xs text-neutral-400 leading-relaxed marker:text-neutral-600">
                            <li>
                                <strong className="text-neutral-300">變更權利：</strong>
                                本平台保留隨時修改服務內容、條款與隱私政策之權利。重大變更將於網站公告，繼續使用即視為同意。
                            </li>
                            <li>
                                <strong className="text-neutral-300">行為規範：</strong>
                                禁止利用本平台從事洗錢、詐騙或任何非法活動，違者將終止服務並配合調查。
                            </li>
                            <li>
                                <strong className="text-neutral-300">準據法：</strong>
                                本聲明以中華民國法律為準據法，並以臺灣臺北地方法院為第一審管轄法院。
                            </li>
                        </ul>
                        <div className="pt-3 mt-3 border-t border-white/5 text-xs text-neutral-500">
                            聯繫我們：
                            <a href="mailto:hi@cryptotw.io" className="text-blue-400 hover:text-blue-300 ml-1 transition-colors">
                                hi@cryptotw.io
                            </a>
                        </div>
                    </CardContent>
                </UniversalCard>

            </main>
        </div>
    );
}
