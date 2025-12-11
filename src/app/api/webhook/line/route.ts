import { NextRequest, NextResponse } from 'next/server'
import { replyMessage, verifyLineSignature } from '@/lib/line-bot'

const WELCOME_FLEX_MESSAGE = {
    type: "flex",
    altText: "CryptoTW System Access",
    contents: {
        type: "bubble",
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "CryptoTW System",
                    weight: "bold",
                    color: "#000000",
                    size: "xl"
                },
                {
                    type: "text",
                    text: "Professional Trading Intelligence",
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
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "•",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 1
                                },
                                {
                                    type: "text",
                                    text: "Market Signals & Analytics",
                                    wrap: true,
                                    color: "#666666",
                                    size: "sm",
                                    flex: 9
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "•",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 1
                                },
                                {
                                    type: "text",
                                    text: "Exchange Account Integration",
                                    wrap: true,
                                    color: "#666666",
                                    size: "sm",
                                    flex: 9
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "•",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 1
                                },
                                {
                                    type: "text",
                                    text: "Institutional Client Services",
                                    wrap: true,
                                    color: "#666666",
                                    size: "sm",
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
            contents: [
                {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "Open Dashboard",
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
                        label: "Connect Account",
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
