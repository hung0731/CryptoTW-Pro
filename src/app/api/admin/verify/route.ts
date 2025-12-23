import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    const supabase = createAdminClient()
    try {
        const { data: bindings, error } = await supabase
            .from('exchange_bindings')
            .select(`
                id,
                exchange_name,
                exchange_uid,
                status,
                created_at,
                user:users (
                    id,
                    line_user_id,
                    display_name,
                    picture_url
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ bindings })
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Verify GET Error', err, { feature: 'admin-api', endpoint: 'verify' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    const supabase = createAdminClient()
    try {
        const { bindingId, action } = await req.json()

        if (!bindingId || !['verify', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        if (action === 'verify') {
            // 1. Get the binding first to get exchange_uid
            const { data: bindingData, error: fetchError } = await supabase
                .from('exchange_bindings')
                .select('*')
                .eq('id', bindingId)
                .single()

            if (fetchError) throw fetchError

            // 2. Fetch OKX affiliate data if it's an OKX binding
            let okxUpdateData = {}
            if (bindingData.exchange_name.toLowerCase() === 'okx') {
                try {
                    const { getInviteeDetail, parseOkxData } = await import('@/lib/okx-affiliate')
                    const okxData = await getInviteeDetail(bindingData.exchange_uid)

                    if (okxData) {
                        okxUpdateData = parseOkxData(okxData)
                        logger.info('[Verify] OKX data fetched for UID', { feature: 'admin-api', uid: bindingData.exchange_uid })
                    } else {
                        logger.warn('[Verify] No OKX data returned for UID', { feature: 'admin-api', uid: bindingData.exchange_uid })
                    }
                } catch (okxError) {
                    const err = okxError instanceof Error ? okxError : new Error(String(okxError))
                    logger.error('[Verify] OKX API error (non-blocking)', err, { feature: 'admin-api', endpoint: 'verify' })
                    // Continue with verification even if OKX API fails
                }
            }

            // 3. Update Binding Status with OKX data
            const { data: binding, error: bindError } = await supabase
                .from('exchange_bindings')
                .update({
                    status: 'verified',
                    updated_at: new Date().toISOString(),
                    ...okxUpdateData
                })
                .eq('id', bindingId)
                .select()
                .single()

            if (bindError) throw bindError

            // 4. Update User Membership to PRO
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
                const BRAND_COLOR = '#211FFF'

                await pushMessage(updatedUser.line_user_id, [
                    {
                        type: "flex",
                        altText: "會員狀態更新",
                        contents: {
                            type: "bubble",
                            body: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "text",
                                        text: "會員資格已開通",
                                        weight: "bold",
                                        size: "xl",
                                        color: "#000000"
                                    },
                                    {
                                        type: "text",
                                        text: "已確認 Pro 權限",
                                        weight: "regular",
                                        size: "xs",
                                        color: BRAND_COLOR,
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
                                                        text: "帳戶",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 2
                                                    },
                                                    {
                                                        type: "text",
                                                        text: updatedUser.display_name || "User",
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
                                                        text: "已綁定 UID",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 2
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
                                                        text: "狀態",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 2
                                                    },
                                                    {
                                                        type: "text",
                                                        text: "Pro 會員 (生效中)",
                                                        wrap: true,
                                                        color: "#000000",
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
                                            label: "進入 Pro 控制台",
                                            uri: "https://liff.line.me/" + process.env.NEXT_PUBLIC_LIFF_ID + "?path=/feed"
                                        },
                                        color: "#000000"
                                    }
                                ]
                            }
                        }
                    }
                ])
            }

            return NextResponse.json({ success: true })
        }

        if (action === 'reject') {
            // 1. Get the binding to find user_id
            const { data: bindingData, error: fetchError } = await supabase
                .from('exchange_bindings')
                .select('user_id')
                .eq('id', bindingId)
                .single()

            if (fetchError) throw fetchError

            // 2. Update binding status to rejected
            const { error } = await supabase
                .from('exchange_bindings')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', bindingId)

            if (error) throw error

            // 3. Check if user has any other verified bindings
            const { data: otherBindings } = await supabase
                .from('exchange_bindings')
                .select('id')
                .eq('user_id', bindingData.user_id)
                .eq('status', 'verified')
                .limit(1)

            // 4. If no verified bindings, rollback membership to 'free'
            if (!otherBindings || otherBindings.length === 0) {
                await supabase
                    .from('users')
                    .update({ membership_status: 'free', updated_at: new Date().toISOString() })
                    .eq('id', bindingData.user_id)
                    .in('membership_status', ['pending']) // Only rollback if still pending
            }

            return NextResponse.json({ success: true })
        }

    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Verify API Error', err, { feature: 'admin-api', endpoint: 'verify' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
