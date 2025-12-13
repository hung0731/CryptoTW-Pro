import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Check, ChevronRight } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'

export function ProAccessGate() {
    return (
        <main className="min-h-screen font-sans bg-black text-white flex flex-col pb-20">
            {/* Header */}
            <header className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-white" />
                    <span className="font-bold tracking-tight">Pro 專屬內容</span>
                </div>
            </header>

            <div className="flex-1 px-6 pb-12 flex flex-col justify-center max-w-md mx-auto w-full space-y-10">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tighter">
                        解鎖 <span className="text-white">Pro 會員</span>
                    </h1>
                    <p className="text-neutral-400 text-base leading-relaxed">
                        您目前尚無瀏覽權限。<br />
                        透過 OKX 推薦碼註冊即可永久免費解鎖。
                    </p>
                </div>

                {/* Benefits Preview */}
                <div className="space-y-3">
                    {[
                        '即時市場快訊',
                        'AI 市場分析',
                        '鏈上數據追蹤',
                        'VIP 交流群'
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 text-neutral-400">
                            <Check className="h-4 w-4 text-white shrink-0" />
                            <span className="text-sm">{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <Link href="/join" className="block">
                    <Button className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold text-base">
                        立即加入 Pro
                        <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                </Link>

                <p className="text-center text-xs text-neutral-600">
                    只需 3 分鐘即可完成
                </p>
            </div>

            <BottomNav />
        </main>
    )
}
