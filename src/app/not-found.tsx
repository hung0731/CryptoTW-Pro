import Link from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black z-0 pointer-events-none" />

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-md bg-[#0F0F10]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto bg-neutral-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
                    <AlertTriangle className="w-10 h-10 text-yellow-500 drop-shadow-md" />
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
                        404
                    </h1>
                    <p className="text-lg text-white font-medium">
                        迷路了嗎？
                    </p>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                        您要尋找的頁面似乎已經消失在鏈上數據的洪流之中。
                    </p>
                </div>

                {/* Action */}
                <Link href="/">
                    <Button className="w-full bg-white text-black hover:bg-neutral-200 rounded-xl h-12 font-bold text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        <Home className="w-4 h-4 mr-2" />
                        返回 CryptoTW 首頁
                    </Button>
                </Link>
            </div>
        </main>
    )
}
