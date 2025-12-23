import { logger } from '@/lib/logger'
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
    logger.info('[RichMenu] Starting update process...', { feature: 'rich-menu' })
    const admin = await verifyAdmin()
    if (!admin) {
        logger.warn('[RichMenu] Unauthorized', { feature: 'rich-menu' })
        return unauthorizedResponse()
    }

    try {
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID

        if (!token) {
            logger.error('[RichMenu] Missing LINE_CHANNEL_ACCESS_TOKEN', { feature: 'rich-menu' })
            return NextResponse.json({ error: 'Missing LINE_CHANNEL_ACCESS_TOKEN' }, { status: 500 })
        }
        if (!liffId) {
            logger.error('[RichMenu] Missing NEXT_PUBLIC_LIFF_ID', { feature: 'rich-menu' })
            return NextResponse.json({ error: 'Missing NEXT_PUBLIC_LIFF_ID' }, { status: 500 })
        }

        const body = await req.json().catch(() => ({}))
        let { chatBarText } = body
        // Ensure max length 14
        if (chatBarText && chatBarText.length > 14) {
            logger.warn('[RichMenu] chatBarText too long, truncating to 14 chars', { feature: 'rich-menu' })
            chatBarText = chatBarText.substring(0, 14)
        }
        logger.debug('[RichMenu] Target Text', { feature: 'rich-menu', chatBarText })

        // 1. Create Rich Menu
        logger.debug('[RichMenu] Creating menu object...', { feature: 'rich-menu' })
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
            logger.error('[RichMenu] Create failed', new Error(err), { feature: 'rich-menu' })
            return NextResponse.json({ error: `Failed to create rich menu: ${err}` }, { status: 500 })
        }

        const { richMenuId } = await createRes.json()
        logger.info('[RichMenu] Created ID', { feature: 'rich-menu', richMenuId })

        // 2. Upload Image
        logger.debug('[RichMenu] Reading image file...', { feature: 'rich-menu' })
        const imagePath = path.join(process.cwd(), 'public', 'richmenu.png')

        if (!fs.existsSync(imagePath)) {
            logger.error('[RichMenu] Image not found', new Error(`Path: ${imagePath}`), { feature: 'rich-menu' })
            logger.debug('[RichMenu] CWD contents', { feature: 'rich-menu', cwd: fs.readdirSync(process.cwd()) })
            // Try looking into .next/server or other places if specific to Vercel?
            // Usually public files are copied to root in standalone mode, but let's stick to standard first.
            return NextResponse.json({ error: `richmenu.png not found at ${imagePath}` }, { status: 404 })
        }

        const imageBuffer = fs.readFileSync(imagePath)
        logger.debug('[RichMenu] Image read success', { feature: 'rich-menu', size: imageBuffer.length })

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
            logger.error('[RichMenu] Upload failed', new Error(err), { feature: 'rich-menu' })
            return NextResponse.json({ error: `Failed to upload image: ${err}` }, { status: 500 })
        }
        logger.info('[RichMenu] Image uploaded.', { feature: 'rich-menu' })

        // 3. Set Default
        const defaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!defaultRes.ok) {
            const err = await defaultRes.text()
            logger.error('[RichMenu] Set default failed', new Error(err), { feature: 'rich-menu' })
            return NextResponse.json({ error: `Failed to set default: ${err}` }, { status: 500 })
        }
        logger.info('[RichMenu] Default set success.', { feature: 'rich-menu' })

        return NextResponse.json({ success: true, richMenuId })

    } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('[RichMenu] Exception', err, { feature: 'admin-api', endpoint: 'rich-menu' })
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
    }
}
