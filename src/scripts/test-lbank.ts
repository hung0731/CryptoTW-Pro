import { syncAllLBankInvitees } from '@/lib/lbank-affiliate'
import { logger } from '@/lib/logger'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

async function main() {
    console.log('🧪 Starting LBank Affiliate API Test...')
    console.log('Checking credentials...')

    if (!process.env.LBANK_API_KEY || !process.env.LBANK_SECRET_KEY) {
        console.error('❌ Missing LBANK_API_KEY or LBANK_SECRET_KEY in .env.local')
        process.exit(1)
    }

    console.log('✅ Credentials found. Attempting to sync invitees...')

    try {
        const results = await syncAllLBankInvitees()
        console.log(`✅ Success! Fetched ${results.size} invitees.`)

        if (results.size > 0) {
            console.log('--- Random Sample Data ---')
            const sample = Array.from(results.values())[0]
            console.log(JSON.stringify(sample, null, 2))
        } else {
            console.log('⚠️ No invitees found (this might be expected if the account is new).')
        }

    } catch (error) {
        console.error('❌ Test Failed:', error)
    }
}

main()
