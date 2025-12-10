
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

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
