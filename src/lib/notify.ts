/**
 * System Notification Helper
 * Handles sending alerts to admins via LINE Notify or Email (Resend/SendGrid).
 * Currently stubbed to console.log for Development.
 */

import { logger } from '@/lib/logger'

export async function sendAdminNotification(message: string) {
    if (process.env.LINE_NOTIFY_TOKEN) {
        try {
            const params = new URLSearchParams()
            params.append('message', message)

            await fetch('https://notify-api.line.me/api/notify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`
                },
                body: params
            })
        } catch (error) {
            logger.error('Failed to send LINE Notify:', error as Error, { feature: 'notify' })
        }
    } else {
        // Fallback for Dev / Missing Config
        logger.info('🔔 [ADMIN NOTIFICATION]:', { feature: 'notify', message })
    }
}
