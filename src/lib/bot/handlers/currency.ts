
import { BotContext, BotHandler } from './base'
import { parseCurrencyAmount } from '../utils/parsers'
import { createCurrencyCard } from '../ui/flex-generator'
import { getHoyabitPrices } from '@/lib/hoyabit'

// Mocking getPrice function for now, or importing real one if possible. 
// Ideally we should import from a service. 
// For now let's assume we can fetch prices here or pass them in.
// To keep it clean, let's fetch inside.

async function fetchExchangeRates() {
    // Parallel fetch logic (simplified from route.ts)
    // In a real refactor, this should be in a Service
    const [hoyaPrices, bitoRes] = await Promise.all([
        getHoyabitPrices(),
        fetch('https://api.bitopro.com/v3/tickers/usdt_twd').then(r => r.json()).catch(() => null)
    ])

    // MAX API
    const maxRes = await fetch('https://max-api.maicoin.com/api/v2/tickers/usdttwd').then(r => r.json()).catch(() => null)

    return {
        hoya: hoyaPrices?.buy || null,
        bito: bitoRes?.data?.lastPrice ? parseFloat(bitoRes.data.lastPrice) : null,
        max: maxRes?.last ? parseFloat(maxRes.last) : null
    }
}

export class CurrencyHandler implements BotHandler {
    async handle(context: BotContext) {
        const currencyResult = parseCurrencyAmount(context.userMessage)
        if (!currencyResult) return null

        const rates = await fetchExchangeRates()
        const maxPrice = rates.max || 32.5 // Fallback
        const bitoPrice = rates.bito || 32.5
        const hoyaPrice = rates.hoya

        const message = createCurrencyCard(
            currencyResult.amount,
            currencyResult.type,
            maxPrice,
            bitoPrice,
            hoyaPrice
        )

        return {
            message: { ...message, type: 'flex' as const },
            metadata: {
                trigger: 'fx',
                intent: 'currency_conversion',
                apiCalls: ['hoya', 'bito', 'max']
            }
        }
    }
}
