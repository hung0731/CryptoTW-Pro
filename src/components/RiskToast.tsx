"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function RiskToast() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const acknowledged = localStorage.getItem("risk_acknowledged_at");
        const now = Date.now();
        const sixMonths = 180 * 24 * 60 * 60 * 1000;

        if (!acknowledged || (now - parseInt(acknowledged) > sixMonths)) {
            // Short timeout to ensure hydration matches
            const timer = setTimeout(() => setIsOpen(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcknowledge = () => {
        setIsOpen(false);
        localStorage.setItem("risk_acknowledged_at", Date.now().toString());
    };

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center pointer-events-none p-4 pb-24 md:pb-6">
            <div className="w-full max-w-[480px] pointer-events-auto">
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-4 ring-1 ring-black/5">
                    <div className="flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="h-4 w-4" />
                            <h3 className="font-bold text-sm">風險提示</h3>
                        </div>

                        {/* Content */}
                        <div className="space-y-1 text-xs text-zinc-400 leading-relaxed font-normal">
                            <p>
                                本平台僅提供<strong className="text-white font-medium">市場數據整理與歷史復盤研究</strong>，
                                所有內容不構成投資建議。
                            </p>
                            <p>
                                投資具風險，請在充分理解風險後，自行做出交易決策。
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 items-center mt-1">
                            <Link
                                href="/disclosure"
                                className="flex-1 text-center text-xs text-[#666666] hover:text-[#A0A0A0]"
                            >
                                了解完整政策
                            </Link>
                            <button
                                onClick={handleAcknowledge}
                                className="flex-[2] bg-white hover:bg-[#E0E0E0] text-black font-bold py-2 px-4 rounded-lg active:scale-95 shadow-sm text-xs"
                            >
                                我已了解
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
