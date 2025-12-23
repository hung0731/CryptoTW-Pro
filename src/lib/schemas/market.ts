import { z } from 'zod';

export const StatusItemSchema = z.object({
    label: z.string(),
    code: z.string(),
    value: z.string(),
});

export const ToolItemSchema = z.object({
    title: z.string(),
    status: z.string(),
    active: z.boolean(),
    href: z.string(),
});

export const ConclusionSchema = z.object({
    bias: z.enum(['偏多', '偏空', '觀望']),
    action: z.string(),
    emoji: z.string(),
    reasoning: z.string(),
    sentiment_score: z.number(),
});

export const MarketStatusDataSchema = z.object({
    regime: StatusItemSchema,
    leverage: StatusItemSchema,
    sentiment: StatusItemSchema,
    whale: StatusItemSchema,
    volatility: StatusItemSchema,
    market_structure: z.object({ bias: z.string() }).optional(),
    long_short: z.object({ ratio: z.number() }).optional(),
    funding_rates: z.object({ average: z.number() }).optional(),
    volatility_raw: z.object({ value: z.number() }).optional(),
});

export const MarketStatusResponseSchema = z.object({
    status: MarketStatusDataSchema,
    tools: z.array(ToolItemSchema).optional(),
    conclusion: ConclusionSchema,
    lastUpdated: z.number().optional()
});

export type MarketStatusData = z.infer<typeof MarketStatusDataSchema>;
export type MarketStatusResponse = z.infer<typeof MarketStatusResponseSchema>;
export type Conclusion = z.infer<typeof ConclusionSchema>;
