
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET

import crypto from 'crypto'

export async function pushMessage(userId: string, messages: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        console.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping push message.')
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
            console.error('Failed to send LINE push message:', error)
            return false
        }

        return true
    } catch (e) {
        console.error('Error sending LINE push message:', e)
        return false
    }
}

export async function multicastMessage(userIds: string[], messages: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        console.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping multicast message.')
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
            console.error('Failed to send LINE multicast message:', error)
            return false
        }

        return true
    } catch (e) {
        console.error('Error sending LINE multicast message:', e)
        return false
    }
}

export async function replyMessage(replyToken: string, messages: any[]) {
    if (!CHANNEL_ACCESS_TOKEN) {
        console.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Skipping reply message.')
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
            console.error('Failed to send LINE reply message:', error)
            return false
        }

        return true
    } catch (e) {
        console.error('Error sending LINE reply message:', e)
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
