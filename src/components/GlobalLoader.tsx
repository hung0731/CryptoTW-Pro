import { Loader2 } from 'lucide-react';

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
            <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Minimalist Logo with Breathing Effect */}
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                    <img
                        src="/logo.svg"
                        alt="CryptoTW"
                        className="w-20 h-20 relative z-10 drop-shadow-2xl"
                    />
                </div>

                <div className="flex items-center gap-2 text-neutral-500 text-xs font-mono tracking-widest uppercase">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading Data
                </div>
            </div>
        </div>
    )
}
