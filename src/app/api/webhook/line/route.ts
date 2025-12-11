import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'

const WELCOME_FLEX_MESSAGE = {
    type: "flex",
    altText: "CryptoTW 系統存取",
    contents: {
        type: "bubble",
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "CryptoTW 系統",
                    weight: "bold",
                    color: "#000000",
                    size: "xl"
                },
                {
                    type: "text",
                    text: "專業交易情報",
                    weight: "regular",
                    color: "#000000",
                    size: "xs",
                    margin: "sm"
                },
                {
                    type: "separator",
                    margin: "lg"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "服務項目：",
                            size: "xs",
                            color: "#aaaaaa",
                            margin: "sm"
                        },
                        {
                            type: "text",
                            text: "• 市場信號與分析",
                            size: "sm",
                            color: "#333333"
                        },
                        {
                            type: "text",
                            text: "• 交易所帳戶串接",
                            size: "sm",
                            color: "#333333"
                        },
                        {
                            type: "text",
                            text: "• VIP 與機構服務",
                            size: "sm",
                            color: "#333333"
                        }
                    ]
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "開啟控制台",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/feed`
                    },
                    color: "#000000"
                },
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "連結帳戶",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/register`
                    },
                    color: "#211FFF" // Using secondary style but overriding text color if supported, or background? 
                    // Wait, 'style: secondary' usually has fixed text colors in LINE. 
                    // Better validation: 'secondary' is usually grey/light button with dark text. 
                    // If we want specific colors, we often use PRIMARY style with custom color property.
                    // User asked for #211FFF button. Let's use primary with that color to be safe.
                }
            ]
        },
        styles: {
            footer: {
                separator: true
            }
        }
    }
    // Re-correcting the button strategy below.
}

// Updating the object to use PRIMARY for both but different colors to ensure visual requirements


export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-line-signature')

        if (!verifyLineSignature(body, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const data = JSON.parse(body)
        const events = data.events || []

        for (const event of events) {
            // Handle FOLLOW event
            if (event.type === 'follow') {
                const replyToken = event.replyToken
                await replyMessage(replyToken, [WELCOME_FLEX_MESSAGE])

                // Optional: You could also upsert the user here if you can get their profile immediately
                // However, LIFF login flow handles upsert better for full profile data.
            }
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('Webhook Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
