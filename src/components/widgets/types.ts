
export interface DashboardData {
    funding?: { rate: number; ratePercent: string; status: string }
    liquidation?: { longFormatted: string; shortFormatted: string; signal: { type: string; text: string } }
    longShort?: { global: { longRate: number; shortRate: number }; signal: { type: string; text: string } }
    openInterest?: { value: number; formatted: string; change24h: number }
}
