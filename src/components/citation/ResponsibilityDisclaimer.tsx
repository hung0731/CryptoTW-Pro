'use client';

import Link from 'next/link';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsibilityDisclaimerProps {
    indicatorName: string;
    indicatorSlug: string;
    className?: string;
}

export function ResponsibilityDisclaimer({ indicatorName, indicatorSlug, className }: ResponsibilityDisclaimerProps) {
    return (
        <div className={cn("mt-4 mb-2 mx-1", className)}>
            <div className="bg-[#0A0A0A] rounded-lg border border-white/5 p-4 relative overflow-hidden group hover:border-white/10 transition-colors">
                {/* Background Decoration */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col gap-4 relative z-10">
                    {/* Left: Explanation */}
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 rounded-full bg-neutral-700" />
                            <h3 className="text-xs font-bold text-neutral-400">為什麼不這這裡解釋指標？</h3>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed pl-3">
                            這一頁只回答「發生時會怎麼走」，而不是「為什麼會走」。深入理解背後成因與邏輯，請切換視角。
                        </p>
                    </div>

                    {/* Right: CTA Button */}
                    <Link
                        href={`/indicators/${indicatorSlug}`}
                        className="w-full"
                    >
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-md transition-all group-hover:border-white/20">
                            <BrainCircuit className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs font-medium text-neutral-300 group-hover:text-white">
                                用「{indicatorName}視角」看這類事件
                            </span>
                            <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
