// Debug script to test Coinglass News API
// Run with: node tools/test-news-api.js

require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.COINGLASS_API_KEY

console.log('=== Coinglass News API Test ===\n')
console.log('API Key:', apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : '❌ NOT FOUND')
console.log('')

if (!apiKey) {
    console.error('❌ COINGLASS_API_KEY is not set in .env.local')
    process.exit(1)
}

const url = 'https://open-api-v4.coinglass.com/api/newsflash/list'
const options = {
    method: 'GET',
    headers: { 'CG-API-KEY': apiKey }
}

console.log('Testing endpoint:', url)
console.log('')

fetch(url, options)
    .then(res => {
        console.log('Response Status:', res.status, res.statusText)
        return res.json()
    })
    .then(json => {
        console.log('Response Code:', json.code)
        console.log('Response Message:', json.msg || '(none)')
        console.log('')

        if (json.code === '0' && Array.isArray(json.data)) {
            console.log('✅ SUCCESS! Got', json.data.length, 'news items')
            console.log('')
            console.log('First item sample:')
            console.log(JSON.stringify(json.data[0], null, 2))
        } else {
            console.log('❌ API returned error or invalid data')
            console.log('Full response:', JSON.stringify(json, null, 2))
        }
    })
    .catch(err => {
        console.error('❌ Fetch failed:', err.message)
    })
