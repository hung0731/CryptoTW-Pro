/**
 * Audit Log Service
 * 
 * Records important security-related events for monitoring and debugging.
 * In production, consider using a dedicated logging service (e.g., Datadog, Sentry).
 */

import { createAdminClient } from '@/lib/supabase'

export type AuditAction =
    | 'binding.create'
    | 'binding.verify'
    | 'binding.reject'
    | 'user.upgrade'
    | 'user.downgrade'
    | 'admin.login'
    | 'admin.action'
    | 'auth.success'
    | 'auth.failure'
    | 'security.rate_limit'
    | 'security.replay_attempt'

interface AuditLogEntry {
    action: AuditAction
    userId?: string | null
    resourceType?: string
    resourceId?: string
    metadata?: Record<string, unknown>
    ip?: string | null
    userAgent?: string | null
}

/**
 * Log an audit event to the database
 * 
 * Usage:
 * await auditLog({
 *   action: 'binding.create',
 *   userId: user.id,
 *   resourceType: 'exchange_binding',
 *   resourceId: binding.id,
 *   metadata: { exchange: 'okx' },
 *   ip: req.headers.get('x-forwarded-for')
 * })
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
    try {
        const supabase = createAdminClient()

        await supabase
            .from('audit_logs')
            .insert({
                action: entry.action,
                user_id: entry.userId || null,
                resource_type: entry.resourceType || null,
                resource_id: entry.resourceId || null,
                metadata: entry.metadata || {},
                ip_address: entry.ip || null,
                user_agent: entry.userAgent || null,
                created_at: new Date().toISOString()
            })
    } catch (e) {
        // Don't throw - audit logging should never break the main flow
        console.error('[AuditLog] Failed to log:', entry.action, e)
    }
}

/**
 * Log a security event (convenience wrapper)
 */
export async function securityLog(
    action: 'rate_limit' | 'replay_attempt' | 'invalid_token',
    ip: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    const actionMap: Record<string, AuditAction> = {
        'rate_limit': 'security.rate_limit',
        'replay_attempt': 'security.replay_attempt',
        'invalid_token': 'auth.failure'
    }

    await auditLog({
        action: actionMap[action] || 'security.rate_limit',
        ip,
        metadata
    })
}
