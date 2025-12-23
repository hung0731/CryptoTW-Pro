/**
 * Gemini AI Response Schemas
 * 
 * Validates AI-generated content to prevent runtime errors
 * from malformed or hallucinated responses
 */

import { z } from 'zod'

// ================================================
// Market Summary Schema
// ================================================

export const MarketSummarySchema = z.object({
    emoji: z.string(),
    sentiment: z.enum(['偏多', '偏空', '震盪']),
    sentiment_score: z.number().min(-100).max(100),
    headline: z.string(),
    analysis: z.string(),
    whale_summary: z.string().optional(),
    market_structure: z.object({
        primary_driver: z.string(),
        risk_factors: z.array(z.string()),
        key_levels: z.object({
            support: z.number().optional(),
            resistance: z.number().optional()
        }).optional()
    }).optional(),
    summary: z.string(),
    highlights: z.array(z.object({
        theme: z.string(),
        impact: z.string()
    })).min(2).max(5),
    risk_note: z.string()
})

export type MarketSummary = z.infer<typeof MarketSummarySchema>

// ================================================
// AI Decision Schema
// ================================================

export const AIDecisionSchema = z.object({
    conclusion: z.string(),
    bias: z.enum(['偏多', '偏空', '震盪', '中性']),
    risk_level: z.enum(['低', '中', '中高', '高']),
    action: z.string(),
    reasoning: z.string(),
    tags: z.object({
        btc: z.string(),
        alt: z.string(),
        sentiment: z.string()
    })
})

export type AIDecision = z.infer<typeof AIDecisionSchema>

// ================================================
// Daily Broadcast Polish Result Schema
// ================================================

export const IndicatorCardSchema = z.object({
    icon: z.string(),
    name: z.string(),
    status: z.string(),
    note: z.string()
})

export const DailyBroadcastPolishSchema = z.object({
    oneLiner: z.string(),
    indicatorCards: z.array(IndicatorCardSchema).min(3).max(6),
    suggestion: z.string(),
    mindset: z.string().optional()
})

export type DailyBroadcastPolish = z.infer<typeof DailyBroadcastPolishSchema>

// ================================================
// Market Context Brief Schema
// ================================================

export const MarketContextBriefSchema = z.object({
    sentiment: z.enum(['樂觀', '保守', '恐慌', '中性']),
    summary: z.string(),
    highlights: z.array(z.object({
        title: z.string(),
        reason: z.string(),
        impact: z.enum(['高', '中', '低']),
        bias: z.enum(['偏多', '偏空', '中性']),
        impact_note: z.string()
    })).min(2).max(5)
})

export type MarketContextBrief = z.infer<typeof MarketContextBriefSchema>

// ================================================
// Indicator Summary Schema
// ================================================

export const IndicatorSummarySchema = z.object({
    current_position: z.string(),
    interpretation: z.string(),
    historical_context: z.string(),
    action_guidance: z.string(),
    risk_notice: z.string().optional()
})

export type IndicatorSummary = z.infer<typeof IndicatorSummarySchema>
