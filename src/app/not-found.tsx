import Link from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto bg-neutral-900 rounded-full flex items-center justify-center border border-white/10">
                    <AlertTriangle className="w-10 h-10 text-yellow-500" />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">404</h1>
                    <p className="text-lg text-neutral-400">
                        找不到這個頁面
                    </p>
                    <p className="text-sm text-neutral-500">
                        您要尋找的頁面可能已被移除、名稱已變更，或暫時無法使用。
                    </p>
                </div>

                {/* Action */}
                <Link href="/">
                    <Button className="bg-white text-black hover:bg-neutral-200 rounded-full px-6">
                        <Home className="w-4 h-4 mr-2" />
                        返回首頁
                    </Button>
                </Link>
            </div>
        </main>
    )
}
