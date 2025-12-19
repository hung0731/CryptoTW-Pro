import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

// Layout Definition (Template: 6-grid, 3 Top + 3 Bottom)
const getRichMenuObject = (liffId: string, chatBarText: string = "開啟選單") => ({
    size: {
        width: 2500,
        height: 1686
    },
    selected: true,
    name: "加密台灣 Pro Menu v5",
    chatBarText: chatBarText,
    areas: [
        // A1+A2: Top Left & Center (0,0) - 1667x843 - Action: Open Home
        {
            bounds: { x: 0, y: 0, width: 1667, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${liffId}?path=/`
            }
        },
        // A3: Top Right (1667,0) - 833x843 - Action: Open Join Page (How to Pro)
        {
            bounds: { x: 1667, y: 0, width: 833, height: 843 },
            action: {
                type: "uri",
                uri: `https://liff.line.me/${liffId}?path=/join`
            }
        },
        // B1: Bottom Left (0,843) - 833x843 - Action: Send "快速查詢" message
        {
            bounds: { x: 0, y: 843, width: 833, height: 843 },
            action: {
                type: "message",
                text: "快速查詢"
            }
        },
        // B2: Bottom Center (833,843) - 834x843 - Action: Send "Pro 有什麼" message
        {
            bounds: { x: 833, y: 843, width: 834, height: 843 },
            action: {
                type: "message",
                text: "Pro 有什麼"
            }
        },
        // B3: Bottom Right (1667,843) - 833x843 - Action: Open Profile
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
    console.log('[RichMenu] Starting update process...')
    const admin = await verifyAdmin()
    if (!admin) {
        console.log('[RichMenu] Unauthorized')
        return unauthorizedResponse()
    }

    try {
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID

        if (!token) {
            console.error('[RichMenu] Missing LINE_CHANNEL_ACCESS_TOKEN')
            return NextResponse.json({ error: 'Missing LINE_CHANNEL_ACCESS_TOKEN' }, { status: 500 })
        }
        if (!liffId) {
            console.error('[RichMenu] Missing NEXT_PUBLIC_LIFF_ID')
            return NextResponse.json({ error: 'Missing NEXT_PUBLIC_LIFF_ID' }, { status: 500 })
        }

        const body = await req.json().catch(() => ({}))
        let { chatBarText } = body
        // Ensure max length 14
        if (chatBarText && chatBarText.length > 14) {
            console.warn('[RichMenu] chatBarText too long, truncating to 14 chars')
            chatBarText = chatBarText.substring(0, 14)
        }
        console.log('[RichMenu] Target Text:', chatBarText)

        // 1. Create Rich Menu
        console.log('[RichMenu] Creating menu object...')
        const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(getRichMenuObject(liffId, chatBarText || "選單"))
        })

        if (!createRes.ok) {
            const err = await createRes.text()
            console.error('[RichMenu] Create failed:', err)
            return NextResponse.json({ error: `Failed to create rich menu: ${err}` }, { status: 500 })
        }

        const { richMenuId } = await createRes.json()
        console.log('[RichMenu] Created ID:', richMenuId)

        // 2. Upload Image
        console.log('[RichMenu] Reading image file...')
        const imagePath = path.join(process.cwd(), 'public', 'richmenu.png')

        if (!fs.existsSync(imagePath)) {
            console.error('[RichMenu] Image not found at:', imagePath)
            console.log('[RichMenu] CWD contents:', fs.readdirSync(process.cwd()))
            // Try looking into .next/server or other places if specific to Vercel?
            // Usually public files are copied to root in standalone mode, but let's stick to standard first.
            return NextResponse.json({ error: `richmenu.png not found at ${imagePath}` }, { status: 404 })
        }

        const imageBuffer = fs.readFileSync(imagePath)
        console.log('[RichMenu] Image read success, size:', imageBuffer.length)

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
            console.error('[RichMenu] Upload failed:', err)
            return NextResponse.json({ error: `Failed to upload image: ${err}` }, { status: 500 })
        }
        console.log('[RichMenu] Image uploaded.')

        // 3. Set Default
        const defaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!defaultRes.ok) {
            const err = await defaultRes.text()
            console.error('[RichMenu] Set default failed:', err)
            return NextResponse.json({ error: `Failed to set default: ${err}` }, { status: 500 })
        }
        console.log('[RichMenu] Default set success.')

        return NextResponse.json({ success: true, richMenuId })

    } catch (e: any) {
        console.error('[RichMenu] Exception:', e)
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
    }
}
