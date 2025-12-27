import OpenAI from 'openai'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const apiKey = process.env.GEMINI_API_KEY
console.log('🔑 GEMINI_API_KEY found:', apiKey ? `${apiKey.slice(0, 15)}...` : '❌ NOT FOUND')

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment')
    process.exit(1)
}

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
})

async function test() {
    try {
        console.log('\n🚀 Testing Gemini API connection...\n')
        console.log('Model: gemini-2.5-flash-lite-preview-09-2025')
        const completion = await openai.chat.completions.create({
            model: 'gemini-2.5-flash-lite-preview-09-2025',
            messages: [{ role: 'user', content: '用繁體中文說「測試成功，AI 連線正常」' }],
        })
        console.log('✅ AI Response:', completion.choices[0]?.message?.content)
        console.log('\n🎉 Gemini AI 連線測試成功！')
    } catch (e: any) {
        console.error('❌ Error:', e.message)
        if (e.status) console.error('   Status:', e.status)
        if (e.error) console.error('   Details:', JSON.stringify(e.error, null, 2))
    }
}
test()
