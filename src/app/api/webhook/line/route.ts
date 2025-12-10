import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'

const WELCOME_FLEX_MESSAGE = {
    type: "flex",
    altText: "歡迎加入 CryptoTW Alpha!",
    contents: {
        type: "bubble",
        hero: {
            type: "image",
            url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2664&auto=format&fit=crop",
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
            action: {
                type: "uri",
                uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/?path=/`
            }
        },
        body: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#FFFFFF",
            contents: [
                {
                    type: "text",
                    text: "Welcome to CryptoTW",
                    weight: "bold",
                    size: "xl",
                    color: "#000000"
                },
                {
                    type: "text",
                    text: "全台最高淨值加密貨幣社群",
                    size: "xs",
                    color: "#666666",
                    wrap: true
                },
                {
                    type: "separator",
                    margin: "md",
                    color: "#EEEEEE"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                {
                                    type: "text",
                                    text: "📊",
                                    size: "sm",
                                    flex: 1
                                },
                                {
                                    type: "text",
                                    text: "即時市場訊號與 Alpha",
                                    size: "sm",
                                    color: "#333333",
                                    flex: 9
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                {
                                    type: "text",
                                    text: "🔗",
                                    size: "sm",
                                    flex: 1
                                },
                                {
                                    type: "text",
                                    text: "交易所綁定優惠",
                                    size: "sm",
                                    color: "#333333",
                                    flex: 9
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                                {
                                    type: "text",
                                    text: "👑",
                                    size: "sm",
                                    flex: 1
                                },
                                {
                                    type: "text",
                                    text: "VIP 機構級服務",
                                    size: "sm",
                                    color: "#333333",
                                    flex: 9
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            backgroundColor: "#FFFFFF",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "開始使用 (Start)",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/feed`
                    },
                    color: "#000000"
                },
                {
                    type: "button",
                    style: "secondary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "綁定交易所 (Register)",
                        uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?path=/register`
                    },
                    color: "#F0F0F0"
                },
                {
                    type: "text",
                    text: "前往註冊並綁定 UID 以解鎖 Pro 權限",
                    size: "xxs",
                    color: "#aaaaaa",
                    align: "center",
                    margin: "md"
                }
            ]
        }
    }
}

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
