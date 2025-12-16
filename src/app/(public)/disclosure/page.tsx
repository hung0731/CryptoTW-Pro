"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";

export default function DisclosurePage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <PageHeader title="網站政策" backHref="/" backLabel="返回" />

            <main className="p-4 pb-20 max-w-lg mx-auto">
                {/* Header */}
                <div className="mb-6 px-1">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        法律聲明與隱私政策
                    </h1>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">
                        Last Updated: {new Date().toLocaleDateString('zh-TW')}
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Section 1: Non-investment advice */}
                    <section className="bg-neutral-900/50 border border-white/10 rounded-lg p-4">
                        <h2 className="font-bold text-sm text-white mb-2">
                            非投資建議聲明
                        </h2>
                        <div className="space-y-3 text-xs leading-relaxed text-neutral-400">
                            <p>
                                <strong className="text-white">不構成投資建議</strong><br />
                                加密台灣 Pro 所提供之所有內容，包括但不限於市場數據、圖表、歷史事件回顧、AI 生成摘要、風險狀態標示與研究觀點，
                                僅作為市場資訊整理與研究用途，
                                不構成任何形式之投資建議、買賣推薦、資產配置建議或投資顧問服務。
                            </p>
                            <p>
                                本平台不保證任何資訊之即時性、完整性或準確性，使用者應自行評估風險，並對其投資決策與結果自行負責。
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Data Source & AI */}
                    <section className="bg-neutral-900/30 border border-white/5 rounded-lg p-4">
                        <h2 className="font-bold text-sm text-white mb-2">資料來源與分析</h2>
                        <div className="space-y-3 text-xs leading-relaxed text-neutral-400">
                            <div>
                                <h3 className="text-neutral-300 font-medium mb-1">數據來源說明</h3>
                                <p>
                                    本平台所顯示之市場數據，主要來自第三方公開資料來源（例如交易所 API、市場數據供應商、區塊鏈分析平台等），
                                    包括但不限於價格、資金費率、持倉量、清算數據與市場新聞。
                                </p>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <h3 className="text-neutral-300 font-medium mb-1">
                                    AI 與分析說明
                                </h3>
                                <p>
                                    平台部分內容由人工智慧模型輔助生成，其用途為協助整理資訊、歸納市場狀態與歷史脈絡，
                                    <span className="text-white">不代表對未來價格或市場走勢之預測</span>。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Affiliate Marketing */}
                    <section className="bg-neutral-900/30 border border-white/5 rounded-lg p-4">
                        <h2 className="font-bold text-sm text-white mb-2">聯盟行銷揭露</h2>
                        <div className="text-xs leading-relaxed text-neutral-400 space-y-2">
                            <p>
                                本平台部分連結可能包含聯盟行銷（Affiliate Marketing）合作。
                                當使用者透過特定連結註冊或使用第三方服務時，本平台可能獲得一定形式之推廣回饋。
                            </p>
                            <p className="opacity-70">
                                該等合作不影響平台內容之獨立性與研究立場，平台不會因聯盟合作而提供特定投資建議或保證任何投資結果。
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Cookie & LINE */}
                    <section className="bg-neutral-900/30 border border-white/5 rounded-lg p-4">
                        <h2 className="font-bold text-sm text-white mb-2">Cookie 與隱私</h2>
                        <div className="grid grid-cols-1 gap-3 text-xs text-neutral-400 leading-relaxed">
                            <div>
                                <h3 className="text-neutral-300 font-medium mb-1">Cookie 使用</h3>
                                <p>為提供更佳的使用體驗，本平台可能使用 Cookie 或類似技術，以記錄使用者偏好、風險提示確認狀態與功能使用狀況。</p>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <h3 className="text-neutral-300 font-medium mb-1">LINE 帳號連動</h3>
                                <p>若使用者透過 LINE 進行互動，本平台僅會依照功能需求使用必要的帳號識別資訊，不會未經同意蒐集或揭露個人隱私資料。</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Server & Data */}
                    <section className="bg-neutral-900/30 border border-white/5 rounded-lg p-4">
                        <h2 className="font-bold text-sm text-white mb-2">資料儲存</h2>
                        <div className="text-xs leading-relaxed text-neutral-400">
                            <p>
                                本平台之主要伺服器與資料處理服務，託管於 <span className="text-white">Amazon Web Services (AWS) 台灣區域</span>，
                                並採取合理之資訊安全措施，以保護系統穩定性與資料安全。
                            </p>
                        </div>
                    </section>

                    {/* Section 6: Responsibility */}
                    <section className="border border-white/10 rounded-lg p-4">
                        <h2 className="font-bold text-sm text-white mb-2">使用者責任與風險承擔</h2>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            使用本平台即表示您已理解並同意：
                            加密資產市場具高度波動與風險，任何基於本平台資訊所做出的交易決策，
                            <span className="text-white border-b border-neutral-600 pb-0.5">其風險與結果均由使用者自行承擔</span>。
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
