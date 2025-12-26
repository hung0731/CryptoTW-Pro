import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const tagVariants = cva(
    "inline-flex items-center justify-center rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-[#2A2A2A] bg-[#111] text-neutral-400 hover:bg-[#1A1A1A] hover:text-neutral-300",
                brand:
                    "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
                success:
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
                warning:
                    "border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
                error:
                    "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20",
                info:
                    "border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
                purple:
                    "border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
                outline:
                    "text-foreground border-input hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                sm: "px-1.5 py-0.5 text-[10px] gap-1",
                md: "px-2.5 py-0.5 text-xs gap-1.5",
                lg: "px-3 py-1 text-sm gap-2",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
)

export interface TagProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
    icon?: LucideIcon
}

function Tag({ className, variant, size, icon: Icon, children, ...props }: TagProps) {
    return (
        <div className={cn(tagVariants({ variant, size }), className)} {...props}>
            {Icon && <Icon className={cn("shrink-0", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />}
            {children}
        </div>
    )
}

export { Tag, tagVariants }
