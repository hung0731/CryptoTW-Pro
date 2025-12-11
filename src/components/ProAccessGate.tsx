import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, UserPlus, Link as LinkIcon, CheckCircle, ChevronRight } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'

export function ProAccessGate() {
    return (
        <main className="min-h-screen font-sans bg-black text-white flex flex-col pb-20">
            {/* Header */}
            <header className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" fill="currentColor" />
                    <span className="font-bold tracking-tight">Access Restricted</span>
                </div>
            </header>

            <div className="flex-1 px-6 pb-12 flex flex-col justify-center max-w-md mx-auto w-full space-y-10">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tighter">
                        解鎖 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600">Pro 會員</span>
                    </h1>
                    <p className="text-neutral-400 text-base leading-relaxed">
                        您目前尚無瀏覽權限。<br />
                        請完成以下步驟加入全台最高淨值社群。
                    </p>
                </div>
                <div className="space-y-4 relative">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-neutral-800 -z-10" />
                    {[
                        {
                            icon: <UserPlus className="w-5 h-5" />,
                            title: "註冊交易所",
                            desc: "使用我們的推薦連結註冊指定交易所。",
                            action: "前往註冊",
                            link: "/vip"
                        },
                        {
                            icon: <LinkIcon className="w-5 h-5" />,
                            title: "綁定 UID",
                            desc: "提交您的交易所 UID 進行驗證。",
                            action: "前往綁定",
                            link: "/profile"
                        },
                        {
                            icon: <CheckCircle className="w-5 h-5" />,
                            title: "等待審核",
                            desc: "管理員將於 24 小時內開通您的權限。",
                            action: null,
                            link: null
                        }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-black ${i === 2 ? 'bg-neutral-800 text-neutral-500' : 'bg-yellow-500 text-black'}`}>
                                {step.icon}
                            </div>
                            <div className="pb-6">
                                <h3 className="font-bold text-lg">{step.title}</h3>
                                <p className="text-sm text-neutral-400 mt-1 mb-3">{step.desc}</p>
                                {step.action && (
                                    <Link href={step.link!}>
                                        <Button size="sm" variant="outline" className="h-8 rounded-full border-white/20 bg-transparent hover:bg-white/10 text-xs">
                                            {step.action} <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <BottomNav />
        </main>
    )
}
