/**
 * Result Type - Unified Error Contract
 * 
 * All domain functions should return Result<T, E> instead of throwing
 * This makes error handling explicit and type-safe
 * 
 * Usage:
 *   function fetchData(): Result<Data, ApiError> {
 *     if (success) return ok(data)
 *     return err('FETCH_FAILED', 'Network error', { url })
 *   }
 */

// ================================================
// Result Type
// ================================================

export type Result<T, E = AppError> =
    | { ok: true; value: T }
    | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
    return { ok: true, value }
}

export function err<E = AppError>(error: E): Result<never, E> {
    return { ok: false, error }
}

// ================================================
// Error Types (區分不同失敗原因)
// ================================================

export type ErrorCode =
    | 'VALIDATION_ERROR'      // 輸入資料格式錯誤
    | 'DATA_NOT_FOUND'        // 資料不存在（正常情況，例如 cache miss）
    | 'UPSTREAM_ERROR'        // 上游 API 壞掉
    | 'RATE_LIMIT'            // 觸發限流
    | 'AUTH_ERROR'            // 認證失敗
    | 'INTERNAL_ERROR'        // 內部邏輯錯誤
    | 'SCHEMA_ERROR'          // Schema validation 失敗

export interface AppError {
    code: ErrorCode
    message: string
    meta?: Record<string, unknown>
    timestamp?: string
}

export function createError(
    code: ErrorCode,
    message: string,
    meta?: Record<string, unknown>
): AppError {
    return {
        code,
        message,
        meta,
        timestamp: new Date().toISOString()
    }
}

// ================================================
// Helpers
// ================================================

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
    return result.ok === true
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
    return result.ok === false
}

export function unwrap<T>(result: Result<T>): T {
    if (result.ok) return result.value
    throw new Error(`Unwrap failed: ${result.error.code} - ${result.error.message}`)
}

export function unwrapOr<T>(result: Result<T>, fallback: T): T {
    return result.ok ? result.value : fallback
}

// ================================================
// API Response Wrapper (for route handlers)
// ================================================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: {
        code: string
        message: string
        meta?: Record<string, unknown>
    }
    timestamp: string
}

export function toApiResponse<T>(result: Result<T>): ApiResponse<T> {
    if (result.ok) {
        return {
            success: true,
            data: result.value,
            timestamp: new Date().toISOString()
        }
    }

    return {
        success: false,
        error: {
            code: result.error.code,
            message: result.error.message,
            meta: result.error.meta
        },
        timestamp: new Date().toISOString()
    }
}

// Convert HTTP status from error code
export function getStatusCode(error: AppError): number {
    switch (error.code) {
        case 'VALIDATION_ERROR': return 400
        case 'AUTH_ERROR': return 401
        case 'DATA_NOT_FOUND': return 404
        case 'RATE_LIMIT': return 429
        case 'UPSTREAM_ERROR': return 502
        case 'SCHEMA_ERROR': return 422
        default: return 500
    }
}
