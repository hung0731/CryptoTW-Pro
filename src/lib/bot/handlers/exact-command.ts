
import { BotContext, BotHandler } from './base'
import {
    JOIN_MEMBER_FLEX_MESSAGE,
    HELP_COMMAND_FLEX_MESSAGE,
    WELCOME_FLEX_MESSAGE
} from '../ui/flex-generator'
import { normalizeInput } from '../utils/parsers'

export class ExactCommandHandler implements BotHandler {
    async handle(context: BotContext) {
        const input = normalizeInput(context.userMessage).toUpperCase()

        if (['加入會員', '註冊', '會員'].includes(input)) {
            return {
                message: { ...JOIN_MEMBER_FLEX_MESSAGE, type: 'flex' as const },
                metadata: { trigger: 'exact_command', intent: 'join' }
            }
        }

        if (['快速查詢', '指令', '幫助', 'HELP'].includes(input)) {
            return {
                message: { ...HELP_COMMAND_FLEX_MESSAGE, type: 'flex' as const },
                metadata: { trigger: 'exact_command', intent: 'help' }
            }
        }

        // Note: Welcome message logic (Follow Event) is usually handled separately in the pipeline entry
        // but if user types "WELCOME", we could show it too.

        return null
    }
}
