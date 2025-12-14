'use client'

import { HelpCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface HelpDrawerProps {
    title: string
    content: React.ReactNode
    className?: string
}

export function HelpDrawer({ title, content, className }: HelpDrawerProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className={cn(
                        "text-neutral-500 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering parent click (e.g. card link)
                >
                    <HelpCircle className="w-3 h-3" />
                    <span className="sr-only">說明</span>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-xs sm:max-w-md bg-neutral-900 border-white/10 text-white rounded-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-neutral-300 leading-relaxed space-y-2">
                    {content}
                </div>
            </DialogContent>
        </Dialog>
    )
}
