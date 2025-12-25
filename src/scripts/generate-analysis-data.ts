
import fs from 'fs';
import path from 'path';
import { REVIEWS_DATA } from '../lib/reviews-data';

// --- Types ---
interface PricePoint {
    date: string;
    timestamp: number;
    price: number;
}
interface OIPoint {
    t: number;
    o: number; // Open Interest
}
interface FundingPoint {
    t: number;
    r: number; // Funding Rate
}

interface EventHistory {
    price: PricePoint[];
    oi: OIPoint[];
    funding: FundingPoint[];
}

interface DnaMetrics {
    damage: number;     // Max Drawdown (0-100)
    panic: number;      // Max Single Day Drop (0-100)
    speed: number;      // Speed of crash (Drawdown / Days) (0-100)
    resilience: number; // Recovery strength (D+30 Return) (0-100)
    leverage: number;   // Max Abs Funding or OI wipeout (0-100)
}

interface AnalysisResult {
    slug: string; // composite slug-year
    dna: DnaMetrics;
    similarEvents: {
        slug: string;
        score: number; // 0-100
    }[];
}

// --- Configuration ---
const DATA_PATH = path.join(process.cwd(), 'src/data/reviews-history.json');
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/analysis-derived.json');

// --- Helpers ---
function calculateMaxDrawdown(prices: number[]): number {
    let maxDd = 0;
    let peak = prices[0];
    for (const p of prices) {
        if (p > peak) peak = p;
        const dd = (peak - p) / peak;
        if (dd > maxDd) maxDd = dd;
    }
    return maxDd;
}

function calculateMaxSingleDayDrop(prices: number[]): number {
    let maxDrop = 0;
    for (let i = 1; i < prices.length; i++) {
        const drop = (prices[i - 1] - prices[i]) / prices[i - 1];
        if (drop > maxDrop) maxDrop = drop;
    }
    return maxDrop;
}

function calculateRecovery(prices: number[]): number {
    if (prices.length < 30) return 0;
    // Return at D+30 relative to D+0
    const start = prices[0];
    const end = prices[Math.min(prices.length - 1, 30)];
    return (end - start) / start;
}

function calculateFundingStress(fundings: FundingPoint[]): number {
    if (!fundings || fundings.length === 0) return 0;
    // Max absolute funding rate deviation from 0.01% baseline
    let maxStress = 0;
    for (const f of fundings) {
        const stress = Math.abs(f.r);
        if (stress > maxStress) maxStress = stress;
    }
    return maxStress;
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
}

function normalizeSeries(prices: number[]): number[] {
    if (prices.length === 0) return [];
    const base = prices[0];
    return prices.map(p => (p - base) / base);
}

// --- Main ---
async function main() {
    console.log('🧬 Generating Event DNA & Similarity Matrix...');

    // 1. Load Data
    const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
    const historyData: Record<string, EventHistory> = JSON.parse(rawData);

    const results: Record<string, AnalysisResult> = {};
    const processedEvents: { slug: string; prices: number[]; funding: FundingPoint[] }[] = [];

    // 2. Pre-process each event
    for (const event of REVIEWS_DATA) {
        const compositeSlug = `${event.slug}-${event.year}`;
        const data = historyData[compositeSlug]; // Try exact match first

        // Fallback or exact match
        const eventHistory = data || historyData[event.slug];

        if (!eventHistory || !eventHistory.price || eventHistory.price.length === 0) {
            console.warn(`⚠️ No history data for ${compositeSlug}`);
            continue;
        }

        // We focus on the window [ReactionStart, +60 days] for comparison
        // Or if reactionStart not strictly defined in history index, we take the provided array directly?
        // The fetch script saved centered window.
        // Let's assume the saved array IS the relevant window (D0 is roughly centered or start).
        // Actually fetch script saved D-90 to D+180.
        // We really want the pattern STARTING from the event trigger.
        // REVIEWS_DATA has `reactionStartAt`.
        // We need to find the index of `reactionStartAt` in `eventHistory.data`.

        let startIndex = 0;
        const reactionDate = event.reactionStartAt;
        if (reactionDate) {
            const idx = eventHistory.price.findIndex(p => p.date === reactionDate);
            if (idx !== -1) startIndex = idx;
        }

        // Extract 60-day window for pattern (or less if not available)
        const windowLength = 60;
        const prices = eventHistory.price.slice(startIndex, startIndex + windowLength).map(p => p.price);
        const funding = eventHistory.funding ? eventHistory.funding.slice(startIndex, startIndex + windowLength) : [];

        processedEvents.push({
            slug: compositeSlug,
            prices,
            funding
        });
    }

    // 3. Calculate Metrics & Similarity
    const metricsRaw: Record<string, { damage: number, panic: number, speed: number, resilience: number, leverage: number }> = {};

    // First pass: Calculate RAW metrics
    for (const evt of processedEvents) {
        metricsRaw[evt.slug] = {
            damage: calculateMaxDrawdown(evt.prices),
            panic: calculateMaxSingleDayDrop(evt.prices),
            speed: calculateMaxDrawdown(evt.prices) / 30, // Simplified speed
            resilience: calculateRecovery(evt.prices),
            leverage: calculateFundingStress(evt.funding)
        };
    }

    // Find Max/Min for Normalization
    const maxVals = { damage: 0, panic: 0, speed: 0, resilience: 0, leverage: 0 };
    for (const k in metricsRaw) {
        const m = metricsRaw[k];
        maxVals.damage = Math.max(maxVals.damage, m.damage);
        maxVals.panic = Math.max(maxVals.panic, m.panic);
        maxVals.speed = Math.max(maxVals.speed, m.speed);
        maxVals.resilience = Math.max(maxVals.resilience, Math.abs(m.resilience)); // Abs for magnitude
        maxVals.leverage = Math.max(maxVals.leverage, m.leverage);
    }

    // Second pass: Finalize DNA & Similarity
    for (const target of processedEvents) {
        // A. DNA Normalization (0-100)
        const raw = metricsRaw[target.slug];
        const dna: DnaMetrics = {
            damage: Math.min(100, Math.round((raw.damage / (maxVals.damage || 1)) * 100)),
            panic: Math.min(100, Math.round((raw.panic / (maxVals.panic || 1)) * 100)),
            speed: Math.min(100, Math.round((raw.speed / (maxVals.speed || 1)) * 100)),
            resilience: Math.min(100, Math.round(((raw.resilience + 0.5) / (maxVals.resilience + 0.5)) * 100)), // Shift/Scale roughly
            leverage: Math.min(100, Math.round((raw.leverage / (maxVals.leverage || 1)) * 100))
        };
        // Fix resilience: normalize to 50 = 0%, >50 positive, <50 negative? Or just strength?
        // Let's simplified: 0-100 relative to max positive recovery.
        // Actually, resilience usually means "how much it bounced back".
        // Let's use (Recovery + MaxDD) / MaxDD?
        // Let's stick to simple scalar mapping for now.

        // B. Similarity
        const scores: { slug: string; score: number }[] = [];
        const normTarget = normalizeSeries(target.prices);

        for (const candidate of processedEvents) {
            if (candidate.slug === target.slug) continue;

            // Match lengths
            const len = Math.min(normTarget.length, candidate.prices.length);
            if (len < 10) continue; // Too short

            const normCandidate = normalizeSeries(candidate.prices);
            const corr = calculatePearsonCorrelation(
                normTarget.slice(0, len),
                normCandidate.slice(0, len)
            );

            // Map -1..1 to 0..100
            const score = Math.round(((corr + 1) / 2) * 100);
            scores.push({ slug: candidate.slug, score });
        }

        // Top 3
        scores.sort((a, b) => b.score - a.score);
        const top3 = scores.slice(0, 3);

        results[target.slug] = {
            slug: target.slug,
            dna,
            similarEvents: top3
        };
    }

    // 4. Save
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
    console.log(`✅ Analysis derived for ${Object.keys(results).length} events.`);
}

main().catch(console.error);
