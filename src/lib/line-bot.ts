
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET

import crypto from 'crypto'
import { logger } from '@/lib/logger'

export async function pushMessage(userId: string, messages: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        logger.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping push message.', { feature: 'line-bot' })
        return false
    }

    try {
        const res = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: userId,
                messages: messages
            })
        })

        if (!res.ok) {
            const error = await res.text()
            logger.error('Failed to send LINE push message:', { error }, { feature: 'line-bot' })
            return false
        }

        return true
    } catch (e) {
        logger.error('Error sending LINE push message:', e, { feature: 'line-bot' })
        return false
    }
}

export async function multicastMessage(userIds: string[], messages: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        logger.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping multicast message.', { feature: 'line-bot' })
        return false
    }

    try {
        const res = await fetch('https://api.line.me/v2/bot/message/multicast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: userIds,
                messages: messages
            })
        })

        if (!res.ok) {
            const error = await res.text()
            logger.error('Failed to send LINE multicast message:', { error }, { feature: 'line-bot' })
            return false
        }

        return true
    } catch (e) {
        logger.error('Error sending LINE multicast message:', e, { feature: 'line-bot' })
        return false
    }
}

export async function replyMessage(replyToken: string, messages: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        logger.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping reply message.', { feature: 'line-bot' })
        return false
    }

    try {
        const res = await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                replyToken: replyToken,
                messages: messages
            })
        })

        if (!res.ok) {
            const error = await res.text()
            logger.error('Failed to send LINE reply message:', { error }, { feature: 'line-bot' })
            return false
        }

        return true
    } catch (e) {
        logger.error('Error sending LINE reply message:', e, { feature: 'line-bot' })
        return false
    }
}

export function verifyLineSignature(body: string, signature: string | null): boolean {
    if (!CHANNEL_SECRET || !signature) return false

    // LINE signature algorithm: HMAC-SHA256
    const hash = crypto
        .createHmac('sha256', CHANNEL_SECRET)
        .update(body)
        .digest('base64')

    return hash === signature
}
