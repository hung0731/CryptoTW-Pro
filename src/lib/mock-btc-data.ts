export interface BtcCandle {
    date: string;
    price: number;
}

export interface TimelineMarker {
    id: string;
    date: string;
    price: number;
    label: string;
    type: 'crash' | 'surge' | 'neutral';
    year: number;
}

// Synthetic BTC History Generator (2014 - 2025)
// Simulates the 4-year cycle macro context
const generateHistory = (): BtcCandle[] => {
    const history: BtcCandle[] = [];
    let price = 800; // 2014 Start Base
    const startDate = new Date('2014-01-01');
    const endDate = new Date('2025-12-31');

    for (let d = startDate; d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const year = d.getFullYear();
        const month = d.getMonth();
        const dateStr = d.toISOString().split('T')[0].substring(0, 7); // YYYY-MM

        // --- Simplistic Cycle Simulation ---
        // 2014: Mt Gox Bear
        if (year === 2014) price = price * 0.9 + 100;
        // 2015: Bottom Formation
        else if (year === 2015) price = Math.max(200, price * 1.02);
        // 2016: Halving & Recovery
        else if (year === 2016) price *= 1.05;
        // 2017: Historic Bull Run
        else if (year === 2017) price *= 1.25;
        // 2018: Burst Bubble
        else if (year === 2018) price *= 0.85;
        // 2019: Echo Bubble
        else if (year === 2019) price *= (month < 6 ? 1.2 : 0.85);
        // 2020: Covid Crash & Halving
        else if (year === 2020) {
            if (month === 2) price *= 0.6; // March Crash
            else price *= 1.2;
        }
        // 2021: Double Peak
        else if (year === 2021) price *= (month === 4 || month === 10 ? 1.1 : 0.95);
        // 2022: Deleveraging (LUNA/FTX)
        else if (year === 2022) price *= 0.85;
        // 2023: Recovery
        else if (year === 2023) price *= 1.05;
        // 2024: ETF Era (Consolidation then breakout)
        else if (year === 2024) price *= (month > 3 && month < 10 ? 0.95 : 1.05);
        // 2025: Parabolic Run (Simulation)
        else price *= 1.08; // 8% monthly growth for parabolic effect

        // Add Logic Constraints & Noise
        if (year === 2017 && price > 20000) price = 19000;
        if (year === 2018 && price < 3000) price = 3200;
        if (year === 2021 && price > 69000) price = 68000;
        if (year === 2022 && price < 15000) price = 15500;
        // Cap 2025 at reasonable moon target for visual check
        if (year === 2025 && price > 250000) price = 250000;

        // Random Noise
        price = price * (0.98 + Math.random() * 0.04);

        history.push({
            date: dateStr,
            price: Math.max(100, Math.round(price))
        });
    }
    return history;
};

export const MOCK_BTC_HISTORY = generateHistory();

// Legacy export kept for type safety, but we use generator now
export const TIMELINE_MARKERS: TimelineMarker[] = [];
