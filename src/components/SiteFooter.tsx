import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="w-full py-8 px-5 mt-auto border-t border-[#1A1A1A] bg-[#050505]">
            <div className="flex flex-col gap-6 text-center sm:text-left">
                {/* Disclaimer */}
                <div className="space-y-2">
                    <p className="text-xs text-[#666] leading-relaxed">
                        加密台灣 Pro 提供市場判斷輔助，不構成任何投資建議。
                    </p>
                    <p className="text-[10px] text-[#444] font-mono">
                        Data sources: Public APIs · On-chain data
                    </p>
                </div>

                {/* Links & Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#111]">
                    <Link
                        href="/disclosure"
                        className="text-[10px] text-[#666] hover:text-[#888] transition-colors underline decoration-[#333] hover:decoration-[#666] underline-offset-2"
                    >
                        查看 加密台灣 Pro 網站政策
                    </Link>

                    <span className="text-[10px] text-[#333] font-mono font-medium">
                        © 2025 CryptoTW
                    </span>
                </div>
            </div>
        </footer>
    );
}
