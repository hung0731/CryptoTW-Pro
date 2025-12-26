'use client'

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050507]">
            {/* Minimal ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-purple-500/10 blur-[100px] pointer-events-none" />

            {/* Simple centered content */}
            <div className="flex flex-col items-center gap-4">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                    <img src="/logo.svg" alt="" className="w-7 h-7" />
                </div>

                {/* Simple loading indicator */}
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
