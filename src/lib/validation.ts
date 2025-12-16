/**
 * API Input Validation Schemas
 * 
 * Centralized validation schemas for all public APIs.
 * Use these schemas to validate request bodies before processing.
 */

import { z } from 'zod'

// === Common Field Schemas ===

/** LINE User ID format (10-50 characters) */
export const lineUserIdSchema = z
    .string()
    .min(10, 'LINE User ID too short')
    .max(50, 'LINE User ID too long')

/** Exchange UID format (5-20 digits) */
export const exchangeUidSchema = z
    .string()
    .regex(/^\d{5,20}$/, 'UID must be 5-20 digits')

/** Allowed exchange names */
export const exchangeNameSchema = z
    .enum(['okx', 'binance', 'bybit'] as const)

// === API Schemas ===

/** /api/binding - POST */
export const bindingRequestSchema = z.object({
    lineUserId: lineUserIdSchema,
    exchange: z.string().transform(v => v.toLowerCase().trim()),
    uid: z.string().transform(v => v.trim())
}).refine(
    data => ['okx', 'binance', 'bybit'].includes(data.exchange),
    { message: 'Invalid exchange', path: ['exchange'] }
).refine(
    data => /^\d{5,20}$/.test(data.uid),
    { message: 'UID must be 5-20 digits', path: ['uid'] }
)

/** /api/analytics/track - POST */
export const analyticsEventSchema = z.object({
    userId: z.string().optional().nullable(),
    eventType: z.string().min(1).max(50),
    eventName: z.enum([
        'page_view',
        'join_view',
        'join_click',
        'pro_complete',
        'feature_click',
        'share_click',
        'widget_view',
        'tab_switch',
        'menu_open'
    ] as const),
    metadata: z.record(z.string(), z.unknown()).optional().default({})
}).refine(
    data => JSON.stringify(data.metadata || {}).length <= 4096,
    { message: 'Metadata too large (max 4KB)', path: ['metadata'] }
)

/** /api/auth/line - POST */
export const authLineSchema = z.object({
    accessToken: z.string().min(10, 'Invalid access token')
})

/** /api/user/bindings - POST */
export const userBindingsSchema = z.object({
    lineUserId: lineUserIdSchema
})

// === Utility Functions ===

/**
 * Safely parse and validate request body
 * Returns { success: true, data } or { success: false, error }
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    body: unknown
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(body)
    if (result.success) {
        return { success: true, data: result.data }
    }
    // Get first error message
    const firstError = result.error.issues[0]
    const message = firstError?.path?.length
        ? `${firstError.path.join('.')}: ${firstError.message}`
        : firstError?.message || 'Validation failed'
    return { success: false, error: message }
}

/**
 * Max request body size (for middleware or early rejection)
 */
export const MAX_BODY_SIZE = 8 * 1024 // 8KB
