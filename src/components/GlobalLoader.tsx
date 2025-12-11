import { Loader2 } from 'lucide-react'

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <img src="/logo.svg" alt="CryptoTW" className="w-16 h-16 relative z-10 animate-pulse" />
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs font-mono tracking-widest uppercase">System Loading...</span>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.95); }
                }
            `}</style>
        </div>
    )
}
