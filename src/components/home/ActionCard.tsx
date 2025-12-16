import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionCardProps {
    title: string
    href: string
    icon: React.ElementType
    variant?: 'primary' | 'secondary'
}

export function ActionCard({
    title,
    href,
    icon: Icon,
    variant = 'secondary'
}: ActionCardProps) {
    const isPrimary = variant === 'primary'

    return (
        <Link
            href={href}
            className={cn(
                "group relative flex flex-col justify-between p-4 rounded-xl border",
                "h-[100px] active:scale-[0.98]", // Compact height
                isPrimary && "bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]",
                !isPrimary && "bg-[#0A0A0A] border-[#1A1A1A] hover:bg-[#0E0E0F] hover:border-[#2A2A2A]"
            )}
        >
            {/* Top: Icon & Arrow */}
            <div className="flex items-start justify-between">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isPrimary ? "bg-white text-black" : "bg-[#1A1A1A] text-[#808080] group-hover:text-white"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#404040] group-hover:text-white" />
            </div>

            {/* Bottom: Title Only (No meta) */}
            <h3 className={cn(
                "text-sm font-bold tracking-tight",
                isPrimary ? "text-white" : "text-[#A0A0A0] group-hover:text-white"
            )}>
                {title}
            </h3>
        </Link>
    )
}
