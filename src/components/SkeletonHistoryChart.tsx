import { Skeleton } from "@/components/ui/skeleton"

const bars = [45, 32, 60, 42, 75, 50, 28, 65, 40, 55, 35, 70, 48, 58, 30, 62, 45, 52, 38, 68];

export function SkeletonHistoryChart() {
    return (
        <div className="relative w-full h-[300px] bg-[#0A0A0A] rounded-lg p-4 overflow-hidden border border-white/[0.05]">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-white/5" />
                <Skeleton className="h-4 w-24 bg-white/5" />
            </div>

            {/* Chart Area */}
            <div className="relative h-[240px] w-full">
                {/* Y-Axis */}
                <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between py-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-3 w-8 bg-white/5" />
                    ))}
                </div>

                {/* Grid Lines */}
                <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between py-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-full h-px bg-white/[0.03]" />
                    ))}
                </div>

                {/* X-Axis */}
                <div className="absolute left-10 right-0 bottom-0 h-6 flex justify-between items-center px-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-3 w-12 bg-white/5" />
                    ))}
                </div>

                {/* Graph Shape Mock */}
                <div className="absolute left-10 right-0 top-4 bottom-8 flex items-end px-1 gap-1">
                    {/* Random bars to simulate data */}
                    {bars.map((height, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-white/[0.03] rounded-sm"
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Watermark Mock */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-24 h-24 rounded-full bg-white/5 blur-2xl" />
            </div>
        </div>
    )
}
