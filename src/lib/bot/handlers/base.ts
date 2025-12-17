
import { FlexMessage, TextMessage } from '@line/bot-sdk'

export interface BotContext {
    userId: string
    userMessage: string
    replyToken: string
    isPro: boolean
}

export interface HandlerResult {
    message: FlexMessage | TextMessage | null
    metadata: {
        trigger: string          // e.g. 'exact_command', 'fx', 'crypto', 'llm'
        intent?: string          // e.g. 'price_query', 'join', 'help'
        symbol?: string          // e.g. 'BTC', 'TSLA'
        apiCalls?: string[]      // e.g. ['coinglass', 'yahoo']
        error?: string
    }
}

export interface BotHandler {
    handle(context: BotContext): Promise<HandlerResult | null>
}
