
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { Client, MiddlewareConfig, WebhookEvent, FlexMessage, TextMessage } from '@line/bot-sdk'
import { BotPipeline } from '@/lib/bot/pipeline'
import { createHmac } from 'crypto'

// LINE Config
const config: MiddlewareConfig = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
}

const client = new Client(config as any) // suppress strict check for now, logic is safe
const pipeline = new BotPipeline()

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-line-signature') || ''

        // Signature Verification
        const hash = createHmac('sha256', config.channelSecret)
            .update(body)
            .digest('base64')

        if (hash !== signature) {
            logger.error('Invalid signature', new Error('Invalid signature'), { feature: 'webhook' })
            return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
        }

        const events: WebhookEvent[] = JSON.parse(body).events

        await Promise.all(events.map(async (event) => {
            if (event.type === 'message' && event.message.type === 'text') {
                const userId = event.source.userId || 'anonymous'
                const userMessage = event.message.text
                const replyToken = event.replyToken

                // Pipeline Execution
                const reply = await pipeline.execute({
                    userId,
                    userMessage,
                    replyToken,
                    isPro: false // TODO: integrate user pro check
                })

                if (reply) {
                    await client.replyMessage(replyToken, reply)
                }
            }
            else if (event.type === 'follow') {
                // Handle follow event (Welcome Message)
                // We can import WELCOME directly or make a handler.
                // For simplicity, let's keep it here or move to pipeline?
                // Pipeline is currently message-focused.
                // Let's just import the WELCOME message.
                const { WELCOME_FLEX_MESSAGE } = require('@/lib/bot/ui/flex-generator')
                await client.replyMessage(event.replyToken, WELCOME_FLEX_MESSAGE)
            }
        }))

        return NextResponse.json({ message: 'OK' })

    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Webhook Error', err, { feature: 'webhook' })
        return NextResponse.json({ message: 'Error' }, { status: 500 })
    }
}
