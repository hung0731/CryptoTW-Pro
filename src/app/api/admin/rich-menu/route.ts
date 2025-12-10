import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Layout Definition (Template 4: Large, 1 Top + 3 Bottom)
const richMenuObject = {
    size: {
        width: 2500,
        height: 1686
    },
    selected: true,
    name: "CryptoTW Pro Menu",
    chatBarText: "開啟選單",
    areas: [
        // A: Top Main (0,0) - 2500x843 - Action: Open LIFF Home
        {
            bounds: { x: 0, y: 0, width: 2500, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}` // Direct to Home
            }
        },
        // B: Bottom Left (0,843) - 833x843 - Action: Open VIP
        {
            bounds: { x: 0, y: 843, width: 833, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/vip` // Direct to VIP (Assuming Client Router handles path or separate LIFF)
                // Note: Standard LIFF ID usually ignores path unless configured. 
                // Better strategy: Use query param ?path=/vip if client supports it (LiffProvider logic)
                // Let's assume ?path=/vip for now to be safe if LiffProvider handles routing.
            }
        },
        // C: Bottom Center (833,843) - 834x843 - Action: Open Register
        {
            bounds: { x: 833, y: 843, width: 834, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/register`
            }
        },
        // D: Bottom Right (1667,843) - 833x843 - Action: Open Profile
        {
            bounds: { x: 1667, y: 843, width: 833, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/profile`
            }
        }
    ]
}

export async function POST(req: NextRequest) {
    try {
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
        if (!token) return NextResponse.json({ error: 'Missing LINE_CHANNEL_ACCESS_TOKEN' }, { status: 500 })

        // 1. Create Rich Menu
        const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(richMenuObject)
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
            body: imageBuffer // Node-fetch supports buffer, verify Next.js native fetch support
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
