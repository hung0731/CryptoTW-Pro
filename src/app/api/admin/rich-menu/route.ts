import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

// Layout Definition (Template: Large, 2 Top + 3 Bottom)
const getRichMenuObject = (liffId: string) => ({
    size: {
        width: 2500,
        height: 1686
    },
    selected: true,
    name: "CryptoTW Pro Menu v4",
    chatBarText: "開啟選單",
    areas: [
        // A1: Top Left (0,0) - 1250x843 - Action: Open Feed (Entering System)
        {
            bounds: { x: 0, y: 0, width: 1250, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${liffId}?path=/feed`
            }
        },
        // A2: Top Right (1250,0) - 1250x843 - Action: Open Join Page (How to Pro)
        {
            bounds: { x: 1250, y: 0, width: 1250, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${liffId}?path=/join`
            }
        },
        // B: Bottom Left (0,843) - 833x843 - Action: Send "指令" message
        {
            bounds: { x: 0, y: 843, width: 833, height: 843 },
            action: {
                type: "message",
                text: "指令"
            }
        },
        // C: Bottom Center (833,843) - 834x843 - Action: Open Prediction
        {
            bounds: { x: 833, y: 843, width: 834, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${liffId}?path=/vip`
            }
        },
        // D: Bottom Right (1667,843) - 833x843 - Action: Open Profile (User Settings)
        {
            bounds: { x: 1667, y: 843, width: 833, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${liffId}?path=/profile`
            }
        }
    ]
})

export async function POST(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID

        if (!token) return NextResponse.json({ error: 'Missing LINE_CHANNEL_ACCESS_TOKEN' }, { status: 500 })
        if (!liffId) return NextResponse.json({ error: 'Missing NEXT_PUBLIC_LIFF_ID' }, { status: 500 })

        // 1. Create Rich Menu
        const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(getRichMenuObject(liffId))
        })

        if (!createRes.ok) {
            const err = await createRes.text()
            return NextResponse.json({ error: `Failed to create rich menu: ${err}` }, { status: 500 })
        }

        const { richMenuId } = await createRes.json()
        console.log('Created Rich Menu ID:', richMenuId)

        // 2. Upload Image
        const imagePath = path.join(process.cwd(), 'public', 'richmenu.png')
        if (!fs.existsSync(imagePath)) {
            return NextResponse.json({ error: 'richmenu.png not found in public folder' }, { status: 404 })
        }
        const imageBuffer = fs.readFileSync(imagePath)

        const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'image/png',
                'Authorization': `Bearer ${token}`
            },
            body: imageBuffer
        })

        if (!uploadRes.ok) {
            const err = await uploadRes.text()
            return NextResponse.json({ error: `Failed to upload image: ${err}` }, { status: 500 })
        }

        // 3. Set Default
        const defaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!defaultRes.ok) {
            const err = await defaultRes.text()
            return NextResponse.json({ error: `Failed to set default: ${err}` }, { status: 500 })
        }

        return NextResponse.json({ success: true, richMenuId })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
