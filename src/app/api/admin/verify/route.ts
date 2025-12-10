import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { bindingId, action } = await req.json()

        if (!bindingId || !['verify', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        if (action === 'verify') {
            // 1. Update Binding Status
            const { data: binding, error: bindError } = await supabase
                .from('exchange_bindings')
                .update({ status: 'verified', updated_at: new Date().toISOString() })
                .eq('id', bindingId)
                .select()
                .single()

            if (bindError) throw bindError

            // 2. Update User Membership to PRO
            const { data: updatedUser, error: userError } = await supabase
                .from('users')
                .update({ membership_status: 'pro', updated_at: new Date().toISOString() })
                .eq('id', binding.user_id)
                .select()
                .single()

            if (userError) throw userError

            // 3. Send Push Notification
            if (updatedUser?.line_user_id) {
                const { pushMessage } = await import('@/lib/line-bot')

                // Flex Message: Verification Success
                // Primary Color approx: #7544FC (Manual conversion or use hardcoded hex matching the vibe)
                // The Oklch oklch(0.488 0.243 264.376) is a strong Purple/Violet. 
                // Let's use #7c3aed (Violet 600) as a safe fallback or specific hex if needed.
                const BRAND_COLOR = '#7C3AED'

                await pushMessage(updatedUser.line_user_id, [
                    {
                        type: "flex",
                        altText: "恭喜！您的 Alpha 會員資格已開通",
                        contents: {
                            type: "bubble",
                            hero: {
                                type: "image",
                                url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
                                size: "full",
                                aspectRatio: "20:13",
                                aspectMode: "cover",
                                action: {
                                    type: "uri",
                                    uri: "https://cryptotw-alpha.vercel.app/profile"
                                }
                            },
                            body: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "text",
                                        text: "Verification Approved",
                                        weight: "bold",
                                        size: "xl",
                                        color: BRAND_COLOR
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
                                                        text: "UID",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 1
                                                    },
                                                    {
                                                        type: "text",
                                                        text: binding.exchange_uid,
                                                        wrap: true,
                                                        color: "#666666",
                                                        size: "sm",
                                                        flex: 4
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
                                                        text: "Tier",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 1
                                                    },
                                                    {
                                                        type: "text",
                                                        text: "ALPHA PRO",
                                                        wrap: true,
                                                        color: "#666666",
                                                        size: "sm",
                                                        flex: 4,
                                                        weight: "bold"
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
                                            label: "進入 Alpha 專區",
                                            uri: "https://liff.line.me/" + process.env.NEXT_PUBLIC_LIFF_ID
                                        },
                                        color: BRAND_COLOR
                                    }
                                ],
                                flex: 0
                            }
                        }
                    }
                ])
            }

            return NextResponse.json({ success: true })
        }

        if (action === 'reject') {
            const { error } = await supabase
                .from('exchange_bindings')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', bindingId)

            if (error) throw error
            return NextResponse.json({ success: true })
        }

    } catch (e) {
        console.error('Verify API Error', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
