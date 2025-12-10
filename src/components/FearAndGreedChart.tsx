import { TrendingUp, Info } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const chartConfig = {
    value: {
        label: "Index",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export async function FearAndGreedChart() {
    const res = await fetch('https://api.alternative.me/fng/?limit=30&date_format=us')
    const data = await res.json()

    const chartData = data.data.slice().reverse().map((item: any) => ({
        displayDate: item.timestamp,
        value: parseInt(item.value),
        classification: item.value_classification
    }))

    const currentValue = chartData[chartData.length - 1].value
    const currentLabel = chartData[chartData.length - 1].classification

    return (
        <Card className="flex flex-col border-white/5 bg-neutral-900 shadow-sm h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-white">Fear & Greed Index</CardTitle>
                <CardDescription className="text-neutral-400">市場情緒指數 (近 30 天)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 min-h-0">
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
                <ChartContainer config={chartConfig} className="h-[100px] w-full">
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
                <Dialog>
                    <DialogTrigger className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer">
                        <Info className="h-3 w-3" />
                        <span>指數組成說明</span>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-white/10 text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle>恐懼與貪婪指數組成</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                資料來源：Alternative.me
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4 text-sm text-neutral-300">
                                <section>
                                    <h4 className="font-bold text-white mb-1 flex justify-between">
                                        波動性 (Volatility) <span className="text-neutral-500">25%</span>
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        比較比特幣當前的波動率與最大跌幅 (與過去 30/90 天平均值對比)。波動率異常上升通常是市場恐懼的訊號。
                                    </p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-white mb-1 flex justify-between">
                                        市場動能與交易量 (Momentum/Volume) <span className="text-neutral-500">25%</span>
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        衡量當前交易量與市場動能。當在高漲的市場中出現大量買盤，通常代表市場過於貪婪 (Bullish)。
                                    </p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-white mb-1 flex justify-between">
                                        社群媒體熱度 (Social Media) <span className="text-neutral-500">15%</span>
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        監測 Twitter 等平台的 Hashtag 互動速率。互動率異常飆升代表公眾興趣極高，通常對應貪婪的市場行為。
                                    </p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-white mb-1 flex justify-between">
                                        市場調查 (Surveys) <span className="text-neutral-500">15%</span>
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        (目前暫停) 透過每週大規模民調了解投資人主觀情緒。
                                    </p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-white mb-1 flex justify-between">
                                        比特幣優勢 (Dominance) <span className="text-neutral-500">10%</span>
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        比特幣市佔率上升通常代表資金避險 (恐懼)；反之，市佔率下降代表資金流向高風險山寨幣 (貪婪)。
                                    </p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-white mb-1 flex justify-between">
                                        搜尋趨勢 (Trends) <span className="text-neutral-500">10%</span>
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">
                                        分析 Google Trends 相關關鍵字。例如「比特幣價格操縱」等負面詞彙搜尋量大增，是市場恐懼的明顯訊號。
                                    </p>
                                </section>
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}
