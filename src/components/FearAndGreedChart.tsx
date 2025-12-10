import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    value: {
        label: "Index",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export async function FearAndGreedChart() {
    const res = await fetch('https://api.alternative.me/fng/?limit=30&date_format=us')
    const data = await res.json()

    // Data comes in reverse chronological order (newest first). Recharts needs chronological (oldest first).
    const chartData = data.data.slice().reverse().map((item: any) => ({
        date: item.timestamp, // API returns timestamp as string when date_format is used? No, "date_format" parameter... let's check docs.
        // The user provided instructions say: date_format='us' -> MM/DD/YYYY.
        // Let's use the formatted date for display.
        displayDate: item.timestamp,
        value: parseInt(item.value),
        classification: item.value_classification
    }))

    const currentValue = chartData[chartData.length - 1].value
    const currentLabel = chartData[chartData.length - 1].classification

    return (
        <Card className="flex flex-col border-white/5 bg-neutral-900 shadow-sm">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-white">Fear & Greed Index</CardTitle>
                <CardDescription className="text-neutral-400">Last 30 Days Trend</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white tracking-tighter">
                            {currentValue}
                        </div>
                        <div className={`text-sm font-medium ${currentValue >= 75 ? 'text-green-500' :
                                currentValue >= 50 ? 'text-green-400' :
                                    currentValue >= 25 ? 'text-yellow-500' :
                                        'text-red-500'
                            }`}>
                            {currentLabel}
                        </div>
                    </div>
                </div>
                <ChartContainer config={chartConfig} className="max-h-[150px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="displayDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            hide
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                            dataKey="value"
                            type="natural"
                            fill="url(#fillValue)"
                            fillOpacity={0.4}
                            stroke="var(--color-value)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4 border-t border-white/5 bg-neutral-950/30">
                <div className="flex items-center gap-2 font-medium leading-none text-neutral-400">
                    Data provided by <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" className="underline hover:text-white transition-colors">Alternative.me</a>
                </div>
            </CardFooter>
        </Card>
    )
}
