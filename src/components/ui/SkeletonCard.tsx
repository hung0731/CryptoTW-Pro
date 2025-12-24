
import { cn } from "@/lib/utils"
import { SURFACE, BORDER, RADIUS } from "@/lib/design-tokens"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn(SURFACE.cardPrimary, BORDER.primary, RADIUS.xl, "p-4 flex items-center gap-4", className)}>
            <Skeleton className="h-10 w-10 rounded-full shrink-0 bg-neutral-800" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-1/3 bg-neutral-800" />
                <Skeleton className="h-2 w-2/3 bg-neutral-900" />
            </div>
        </div>
    )
}

export function SkeletonParagraph({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2 w-full">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-3 bg-neutral-800 rounded",
                        i === lines - 1 ? "w-2/3" : "w-full"
                    )}
                />
            ))}
        </div>
    )
}
