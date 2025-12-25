import Link from "next/link";
import { UniversalCard } from "@/components/ui/UniversalCard"; // Assuming path
import { FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteFooter() {
    return (
        <footer className="w-full mt-auto border-t border-white/5 bg-[#050505]/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col gap-6">
                    {/* Disclaimer */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 rounded-full bg-[#333]" />
                            <h4 className="text-xs font-bold text-[#666]">風險聲明</h4>
                        </div>
                        <p className="text-xs text-[#666] leading-relaxed max-w-2xl">
                            加密台灣 Pro 提供市場判斷輔助，所有內容僅供參考，不構成任何投資建議。
                            <span className="block mt-1 text-[10px] text-[#444] font-mono">
                                Data sources: Public APIs · On-chain data
                            </span>
                        </p>
                    </div>

                    {/* Actions & Copyright */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
                        <Link href="/disclosure" className="group">
                            <UniversalCard
                                variant="ghost"
                                size="S"
                                className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10 transition-all w-auto"
                            >
                                <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <FileText className="w-3.5 h-3.5 text-[#888] group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-[#888] group-hover:text-white transition-colors">
                                        查看加密台灣 Pro 網站政策
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-[#555] group-hover:text-[#888] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </UniversalCard>
                        </Link>

                        <span className="text-[10px] text-[#333] font-mono font-medium px-2">
                            © 2025 CryptoTW
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
